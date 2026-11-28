const std = @import("std");
const httpz = @import("httpz");
const fsx = @import("../common/fsx.zig");
const respond = @import("respond.zig");
const server = @import("server.zig");

const App = server.App;

/// Responses at or below this size are copied into the request arena.
/// Larger bodies are streamed with Content-Length using a buffer of the
/// same size so resident memory stays bounded on norns.
const transfer_buffer_size: usize = 64 * 1024;

/// Inclusive byte range within a resource of `total` bytes.
const ByteRange = struct {
    start: u64,
    end: u64, // inclusive
};

/// GET / → 302 /maiden/
pub fn redirectRoot(_: *App, _: *httpz.Request, res: *httpz.Response) !void {
    res.setStatus(.found);
    res.header("Location", "/maiden/");
}

/// GET /maiden (no trailing slash) → 302 /maiden/; otherwise serve web_path.
pub fn maiden(app: *App, req: *httpz.Request, res: *httpz.Response) !void {
    if (std.mem.eql(u8, req.url.path, "/maiden")) {
        res.setStatus(.found);
        res.header("Location", "/maiden/");
        return;
    }
    try serveStatic(app, req, res, app.cfg.web_path, "/maiden");
}

/// GET /doc/* → serve doc_path.
pub fn doc(app: *App, req: *httpz.Request, res: *httpz.Response) !void {
    try serveStatic(app, req, res, app.cfg.doc_path, "/doc");
}

fn serveStatic(app: *App, req: *httpz.Request, res: *httpz.Response, root: []const u8, prefix: []const u8) !void {
    _ = app;
    const path = req.url.path;
    var rel = path[prefix.len..];
    if (rel.len > 0 and rel[0] == '/') rel = rel[1..];
    if (rel.len == 0) rel = "index.html";
    rel = fsx.relativeInside(rel) catch {
        try respond.notFound(req, res, "not found");
        return;
    };
    if (rel.len == 0) rel = "index.html";

    const full = try std.fs.path.join(res.arena, &.{ root, rel });
    if (fsx.statFile(full)) |st| {
        if (st.kind == .directory) {
            const index = try std.fs.path.join(res.arena, &.{ full, "index.html" });
            try sendPath(req, res, index, false);
            return;
        }
    } else |_| {}
    try sendPath(req, res, full, false);
}

/// Send a filesystem path as the response body (or headers-only for HEAD).
/// Supports a single `Range: bytes=` request so media elements can seek.
pub fn sendPath(req: *httpz.Request, res: *httpz.Response, path: []const u8, sniff: bool) !void {
    const file = fsx.openFile(path) catch {
        try respond.notFound(req, res, "not found");
        return;
    };
    defer fsx.closeFile(file);

    const st = try file.stat(fsx.io);
    const ctype = contentType(file, path, sniff);
    var lm_buf: [respond.http_date_len]u8 = undefined;
    const last_modified = respond.formatHttpDateFromStat(&lm_buf, st);

    res.header("Content-Type", ctype);
    try res.headerOpts("Last-Modified", last_modified, .{ .dupe_value = true });
    res.header("Cache-Control", "no-store");
    res.header("Accept-Ranges", "bytes");

    const range_result = parseBytesRange(req.header("Range"), st.size);
    const range: ?ByteRange = switch (range_result) {
        .none => null,
        .one => |r| r,
        .unsatisfiable => {
            res.setStatus(.range_not_satisfiable);
            const cr = try std.fmt.allocPrint(res.arena, "bytes */{d}", .{st.size});
            res.header("Content-Range", cr);
            // Empty body; httpz will emit Content-Length: 0.
            return;
        },
    };

    if (range) |r| {
        res.setStatus(.partial_content);
        const cr = try std.fmt.allocPrint(res.arena, "bytes {d}-{d}/{d}", .{ r.start, r.end, st.size });
        res.header("Content-Range", cr);
    } else {
        res.setStatus(.ok);
    }

    const start: u64 = if (range) |r| r.start else 0;
    const end: u64 = if (range) |r| r.end else if (st.size == 0) 0 else st.size - 1;
    const length: u64 = if (st.size == 0) 0 else end - start + 1;

    if (req.method == .HEAD) {
        const len = try std.fmt.allocPrint(res.arena, "{d}", .{length});
        res.header("Content-Length", len);
        return;
    }

    if (length == 0) {
        res.body = "";
        return;
    }

    // Prefer Content-Length over Transfer-Encoding: chunked so media elements
    // can seek. Keep the arena allocation small; stream anything larger.
    if (length <= transfer_buffer_size) {
        const data = try res.arena.alloc(u8, @intCast(length));
        const n = file.readPositionalAll(fsx.io, data, start) catch 0;
        res.body = data[0..n];
        return;
    }

    try streamFileBody(res, file, start, length);
}

/// Write response headers with Content-Length, then copy `length` bytes from
/// `file` starting at `start` using a fixed stack buffer.
fn streamFileBody(res: *httpz.Response, file: std.Io.File, start: u64, length: u64) !void {
    const len = try std.fmt.allocPrint(res.arena, "{d}", .{length});
    res.header("Content-Length", len);

    // Empty body + Content-Length header → prepareHeader ends headers without
    // chunked encoding. Mark written so httpz does not send a second response.
    try res.writeHeader();
    res.written = true;

    var offset = start;
    var remaining = length;
    var buf: [transfer_buffer_size]u8 = undefined;
    while (remaining > 0) {
        const want: usize = @intCast(@min(remaining, buf.len));
        const n = file.readPositionalAll(fsx.io, buf[0..want], offset) catch 0;
        if (n == 0) break;
        try res.conn.writeAll(buf[0..n]);
        offset += n;
        remaining -= n;
    }
}

const RangeParse = union(enum) {
    none,
    one: ByteRange,
    unsatisfiable,
};

/// Parse `Range: bytes=...` for a single contiguous range. Multiple ranges and
/// non-bytes units are ignored (full response).
fn parseBytesRange(header: ?[]const u8, total: u64) RangeParse {
    const raw = header orelse return .none;
    if (!std.mem.startsWith(u8, raw, "bytes=")) return .none;
    const spec = raw["bytes=".len..];
    if (std.mem.indexOfScalar(u8, spec, ',') != null) return .none; // multi-range unsupported

    const dash = std.mem.indexOfScalar(u8, spec, '-') orelse return .none;
    const start_s = spec[0..dash];
    const end_s = spec[dash + 1 ..];

    if (total == 0) {
        if (start_s.len == 0) return .unsatisfiable;
        return .unsatisfiable;
    }

    if (start_s.len == 0) {
        // suffix: bytes=-N → last N bytes
        const suffix = std.fmt.parseInt(u64, end_s, 10) catch return .none;
        if (suffix == 0) return .unsatisfiable;
        const n = @min(suffix, total);
        return .{ .one = .{ .start = total - n, .end = total - 1 } };
    }

    const start = std.fmt.parseInt(u64, start_s, 10) catch return .none;
    if (start >= total) return .unsatisfiable;

    const end = if (end_s.len == 0)
        total - 1
    else blk: {
        const e = std.fmt.parseInt(u64, end_s, 10) catch return .none;
        break :blk @min(e, total - 1);
    };
    if (end < start) return .unsatisfiable;
    return .{ .one = .{ .start = start, .end = end } };
}

fn contentType(file: std.Io.File, path: []const u8, sniff: bool) []const u8 {
    if (extType(path)) |t| return t;
    if (!sniff) return "application/octet-stream";
    var buf: [512]u8 = undefined;
    const n = file.readPositionalAll(fsx.io, &buf, 0) catch 0;
    if (looksLikeText(buf[0..n])) return "text/plain; charset=utf-8";
    return "application/octet-stream";
}

/// MIME type from file extension, or null when unknown.
pub fn extType(path: []const u8) ?[]const u8 {
    if (std.mem.endsWith(u8, path, ".html")) return "text/html; charset=utf-8";
    if (std.mem.endsWith(u8, path, ".js")) return "application/javascript";
    if (std.mem.endsWith(u8, path, ".css")) return "text/css";
    if (std.mem.endsWith(u8, path, ".json")) return "application/json";
    if (std.mem.endsWith(u8, path, ".png")) return "image/png";
    if (std.mem.endsWith(u8, path, ".jpg") or std.mem.endsWith(u8, path, ".jpeg")) return "image/jpeg";
    if (std.mem.endsWith(u8, path, ".gif")) return "image/gif";
    if (std.mem.endsWith(u8, path, ".svg")) return "image/svg+xml";
    if (std.mem.endsWith(u8, path, ".ico")) return "image/x-icon";
    if (std.mem.endsWith(u8, path, ".woff")) return "font/woff";
    if (std.mem.endsWith(u8, path, ".woff2")) return "font/woff2";
    if (std.mem.endsWith(u8, path, ".map")) return "application/json";
    if (std.mem.endsWith(u8, path, ".txt")) return "text/plain; charset=utf-8";
    if (std.mem.endsWith(u8, path, ".wasm")) return "application/wasm";
    if (std.mem.endsWith(u8, path, ".sc") or std.mem.endsWith(u8, path, ".scd")) return "text/plain; charset=utf-8";
    if (std.mem.endsWith(u8, path, ".lua") or
        std.mem.endsWith(u8, path, ".md") or
        std.mem.endsWith(u8, path, ".csv") or
        std.mem.endsWith(u8, path, ".yml") or
        std.mem.endsWith(u8, path, ".yaml") or
        std.mem.endsWith(u8, path, ".toml") or
        std.mem.endsWith(u8, path, ".xml"))
    {
        return "text/plain; charset=utf-8";
    }
    if (std.mem.endsWith(u8, path, ".wav")) return "audio/wav";
    if (std.mem.endsWith(u8, path, ".mp3")) return "audio/mpeg";
    if (std.mem.endsWith(u8, path, ".ogg")) return "audio/ogg";
    if (std.mem.endsWith(u8, path, ".aif") or std.mem.endsWith(u8, path, ".aiff")) return "audio/aiff";
    return null;
}

fn looksLikeText(data: []const u8) bool {
    if (data.len == 0) return true;
    for (data) |c| {
        if (c == 0) return false;
        if (c < 0x09) return false;
        if (c > 0x0d and c < 0x20 and c != 0x1b) return false;
    }
    return true;
}

test "parseBytesRange open end" {
    const r = parseBytesRange("bytes=0-1", 100);
    try std.testing.expectEqual(RangeParse{ .one = .{ .start = 0, .end = 1 } }, r);
}

test "parseBytesRange to end" {
    const r = parseBytesRange("bytes=10-", 100);
    try std.testing.expectEqual(RangeParse{ .one = .{ .start = 10, .end = 99 } }, r);
}

test "parseBytesRange suffix" {
    const r = parseBytesRange("bytes=-20", 100);
    try std.testing.expectEqual(RangeParse{ .one = .{ .start = 80, .end = 99 } }, r);
}

test "parseBytesRange unsatisfiable" {
    const r = parseBytesRange("bytes=100-", 100);
    try std.testing.expect(r == .unsatisfiable);
}

test "parseBytesRange absent" {
    try std.testing.expect(parseBytesRange(null, 100) == .none);
}
