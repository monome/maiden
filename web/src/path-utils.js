// Minimal POSIX path parse for API resource URLs. Avoids parse-filepath, which
// imports Node's path module that Vite externalizes in the browser.
export default function parsePath(filepath) {
  const path = String(filepath || '');
  const lastSlash = path.lastIndexOf('/');
  let dir;
  let base;
  if (lastSlash < 0) {
    dir = '';
    base = path;
  } else if (lastSlash === 0) {
    dir = '/';
    base = path.slice(1);
  } else {
    dir = path.slice(0, lastSlash);
    base = path.slice(lastSlash + 1);
  }

  const lastDot = base.lastIndexOf('.');
  const hasExt = lastDot > 0;
  const name = hasExt ? base.slice(0, lastDot) : base;
  const ext = hasExt ? base.slice(lastDot) : '';

  return {
    root: path.startsWith('/') ? '/' : '',
    dir,
    dirname: dir,
    base,
    basename: base,
    name,
    stem: name,
    ext,
    extname: ext,
    path,
  };
}
