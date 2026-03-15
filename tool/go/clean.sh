#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -d "$SCRIPT_DIR/go" ]; then
  rm -rf "$SCRIPT_DIR/go"
fi

echo "Go tools cleaned"
