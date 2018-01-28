# norns-web

self contained web based editor for norns

## setup

development can either be done directly on the device or on a linux/macos machine by installing the toolchain

* install [go](https://golang.org)
* install [glide](https://glide.sh/)

on macos (for development) this is easily done with brew:
```
brew install go
brew install glide
```

(TODO: insert details on setting up $GOPATH)
## building

to build first use glide to pull in all the dependencies then run go build as normal

```
glide install
go build
```

if developing on a linux or macos it is trivial to cross compile for arm
```
GOOS=linux GOARCH=arm go build -o norns-web.arm
```
**tip:** _install FUSE on your linux/macos machine and then mount the device filesystem using sshfs - the build results can then be written directly to the device._

...one also needs to build the [**ui**](app/README.md) as well.

## testing

```
./norns-web -debug -site app/build/ -data <norns_repo>/lua
```




