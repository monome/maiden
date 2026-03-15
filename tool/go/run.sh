#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

CACHE_DIR="$SCRIPT_DIR/go"

if [ ! -f "$CACHE_DIR/bin/go" ]; then
  mkdir -p "$CACHE_DIR"

  HOST_OS=$(uname -s | tr "[:upper:]" "[:lower:]")
  HOST_ARCH=$(uname -m)

  case "$HOST_ARCH" in
    arm64|aarch64) HOST_ARCH="arm64" ;;
    x86_64|amd64) HOST_ARCH="amd64" ;;
    *)
      echo "Unsupported architecture: $HOST_ARCH"
      exit 1
      ;;
  esac

  GO_VERSION="go1.16.15"
  GO_FILE="${GO_VERSION}.${HOST_OS}-${HOST_ARCH}.tar.gz"
  GO_URL="https://go.dev/dl/${GO_FILE}"

  echo "Downloading Go from $GO_URL..."

  TEMP_TAR=/tmp/go-download.tar.gz
  curl -sL "$GO_URL" -o "$TEMP_TAR"

  TEMP_EXTRACT=/tmp/go-extract
  rm -rf "$TEMP_EXTRACT"
  mkdir -p "$TEMP_EXTRACT"
  tar -C "$TEMP_EXTRACT" -xzf "$TEMP_TAR"

  if [ -d "$TEMP_EXTRACT/go" ]; then
    cp -R "$TEMP_EXTRACT/go"/* "$CACHE_DIR/"
  fi

  rm -rf "$TEMP_TAR" "$TEMP_EXTRACT"
fi

export GOROOT="$CACHE_DIR"
export GOPATH="$REPO_ROOT/.gopath"
export PATH="$CACHE_DIR/bin:$PATH"

exec "$@"
