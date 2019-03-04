# maiden

self contained web based editor for norns

`maiden` consists of two parts - a backend http server and a frontend single page web app.

## setup

development can either be done directly on the device or on a linux/macos machine by installing the toolchain.

* install [go](https://golang.org)

known compatible versions:

tool | version
-----|---------
go   | 1.12+

on macos (for development) this is easily done with brew:
```
brew install go
```

## building

`maiden` uses the go module system to manage dependencies. in order for the go module system work the `maiden` source tree must *not* be in a directory below `$GOPATH/src`, if you've previously cloned/build `maiden` you'll likely need to move the source tree outside of your existing go workspace before the build will work.

to build, `cd` into the source directory and run:
```
go build
```

if developing on a linux or macos it is trivial to cross compile for arm
```
GOOS=linux GOARCH=arm go build -o maiden.arm
```
**tip:** _install FUSE on your linux/macos machine and then mount the device filesystem using sshfs - the build results can then be written directly to the device._


...one also needs to build the [**ui**](web/README.md) as well.

## testing

```
./maiden -debug -app web/build/ -data <norns_repo>/lua
```




