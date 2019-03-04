default: build

build:
	go build

release:
	tool/release.sh

clean:
	rm -rf dist
	rm -f maiden maiden.arm
	rm -rf web/build

.PHONY: clean release build default