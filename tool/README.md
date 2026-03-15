# tool build environment

this directory contains self-contained build tools:

- go: golang 1.12.17
- node: node.js 14.21.3 with nvm

## setup

no manual setup needed. the `tool/*/run.sh` scripts will:

1. detect your build host os/architecture
2. download the appropriate toolchain (cached locally)
3. execute the command

## usage

### go

```bash
./tool/go/run.sh go build
./tool/go/run.sh go test
```

### node

```bash
./tool/node/run.sh node --version
./tool/node/run.sh yarn install
./tool/node/run.sh yarn build
```

### make

```bash
make build
make release      # build for linux arm (raspberry pi)
make clean-tools  # remove downloaded tools
```

## cache location

tools are cached in:

- `tool/go/` - golang binary
- `tool/node/nvm/` - nvm installation

both are gitignored. delete to force refresh.
