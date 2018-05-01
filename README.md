# maiden

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

next, set your [`$GOPATH`](https://golang.org/doc/code.html#GOPATH) environment variable to specify a location for your Go workspace.  see the [go wiki](https://github.com/golang/go/wiki/SettingGOPATH) for considerations and instructions for your OS.

finally, ensure that you have a `$GOPATH/src` directory.  if you're setting up Go for the first time, you'll want to create it. on OS X and other unix systems, that can be done like this:

```
mkdir -p $GOPATH/src
```

## building

to build first use glide to pull in all the dependencies then run go build as normal

```
glide install
go build
```

if developing on a linux or macos it is trivial to cross compile for arm
```
GOOS=linux GOARCH=arm go build -o maiden.arm
```
**tip:** _install FUSE on your linux/macos machine and then mount the device filesystem using sshfs - the build results can then be written directly to the device._

...one also needs to build the [**ui**](app/README.md) as well.

## testing

```
./maiden -debug -app app/build/ -data <norns_repo>/lua
```




