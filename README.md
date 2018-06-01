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

IMPORTANT – set your [`$GOPATH`](https://golang.org/doc/code.html#GOPATH) environment variable to specify a location for your Go workspace.  see the [go wiki](https://github.com/golang/go/wiki/SettingGOPATH) for considerations and instructions for your OS.


finally, download the source using `go get`. if one is building/developing directly against the main git repository:

```
go get -d github.com/monome/maiden
```

if the repository has been forked on github first then one can download the fork:

```
go get -d github.com/<your_github_id>/maiden
```

the `-d` flag is passed to `go get` to ensure it simply downloads the code and does not attempt to immediately build it. in order to build `maiden` it is important to use `glide` to download specific versions of each dependency.

## building

to build first use `glide` to pull in all the dependencies then run go build as normal. `glide` should be run from the top of the `maiden` source tree which should be in `$GOPATH/src/github.com/monome/maiden` or `$GOPATH/src/github.com/<your_github_id>/maiden` depending on whether or not the repository was first forked.

```
glide install
go build
```

_if you forked the repository `glide install` will emit a warning (which is safe to ignore) that looks like this:_

```
[WARN]	The name listed in the config file (github.com/monome/maiden) does not match the current location (.)
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




