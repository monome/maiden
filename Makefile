default: build

GO_LDFLAGS += -X github.com/monome/maiden/cmd.version=$(shell git describe --tags)
GO_LDFLAGS += -X github.com/monome/maiden/cmd.compileTime=$(shell date -u +%Y-%m-%dT%H:%M)
export GO_LDFLAGS

build:
	go build -ldflags="${GO_LDFLAGS}"

release:
	tool/release.sh -o linux -a arm

release-local:
	tool/release.sh

clean:
	rm -rf dist
	rm -f maiden maiden.arm
	rm -rf web/build

.PHONY: clean release build default
