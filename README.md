# norns-web

self contained web based editor for norns

## setup

* install [go](https://golang.org)
* install [glide](https://glide.sh/)

on macos (for development) this is easily done with brew:
```
brew install go
brew install glide
```

## building

to build first use glide to pull in all the dependencies then run go build as normal

```
glide install
go build
```

...one also needs to build the [**ui**](app/README.md) as well.

## testing

```
./norns-web -debug -site app/build/ -data <norns_repo>/lua
```




