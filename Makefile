default: build

build:
	go build

release:
	tool/release.sh

clean:
	rm -rf dist
	rm -f maiden maiden.arm

.PHONY: clean release build default