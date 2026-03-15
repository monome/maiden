default: build

GO_LDFLAGS += -X github.com/monome/maiden/cmd.version=$(shell git describe --tags)
GO_LDFLAGS += -X github.com/monome/maiden/cmd.compileTime=$(shell date -u +%Y-%m-%dT%H:%M)
export GO_LDFLAGS

build:
	./tool/go/run.sh go build -ldflags="${GO_LDFLAGS}"

release:
	./tool/release.sh

release-local:
	./tool/go/run.sh go build -ldflags="${GO_LDFLAGS}"

clean:
	rm -rf dist
	rm -f maiden maiden.arm
	rm -rf web/build

clean-tools:
	./tool/go/clean.sh
	./tool/node/clean.sh
	rm -rf .gopath 2>/dev/null || true

help:
	@echo "Available targets:"
	@echo "  build         - Build the project"
	@echo "  release       - Build release for Linux ARM and package"
	@echo "  release-local - Build locally (no packaging)"
	@echo "  clean         - Remove build artifacts"
	@echo "  clean-tools   - Remove downloaded build tools"
	@echo "  help          - Show this help"

.PHONY: clean release build default clean-tools help
