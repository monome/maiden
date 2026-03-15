# building

## using the self-contained build environment (recommended)

`maiden` includes a self-contained build environment that automatically manages node.js and yarn versions.

### to build

from the `web/` directory within the `maiden` source tree:

```bash
../tool/node/run.sh yarn install
../tool/node/run.sh yarn build
```

running `../tool/node/run.sh yarn build` will output static, bundled, and minified js, css, and html files suitable for release in the `build` directory. the built results are self contained and do not depend on node or any of the associated react toolchain.

### development

running `../tool/node/run.sh yarn start` starts a local development server which automatically recompiles (and reloads) the application when a file is saved.

the development server runs on port 3000 and forwards any unhandled request to the `"proxy"` defined in the `package.json` file. starting the `maiden` server in a separate shell allows api calls to be handled during development.

installing both the `reactjs` and `redux` devtools browser extensions is highly recommended.

## manual installation (not recommended)

building the editor requires installing `node` and `yarn`.

known compatible versions:

tool | version
-----|--------
node.js | 16.20.2
npm | 8.19.4 (included with node)
yarn | 1.22.22 (included with npm)

you can use your package manager:

- macOS Homebrew: `brew install node`
- Arch Linux: `pacman -Sy nodejs npm`
- Debian / Ubuntu: `apt install nodejs npm`

or install node manually from [nodejs.org](https://nodejs.org/)

note: using a different version of node may result in incompatible dependencies. the self-contained build environment ensures compatibility.

## testing in development mode

```bash
cd web
../tool/node/run.sh yarn start
```

the development server runs on port 3000.

## typical workflow

a very quick/iterative development configuration can be achieved by:

* enabling wifi on norns
* using `sshfs` to mount the `we` home directory locally - `sshfs we@norns.local: ~/norns`
* editing `repl-endpoints.json` to point at the norns device
* starting the backend locally - `./tool/go/run.sh go build && ./maiden server --app web/build/ --data ~/norns/dust --doc ~/norns/norns/doc --debug`
* starting the yarns development server `cd web; ../tool/node/run.sh yarn start`
