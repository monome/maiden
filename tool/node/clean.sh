#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -d "$SCRIPT_DIR/nvm" ]; then
  NVM_DIR="$SCRIPT_DIR/nvm"
  export NVM_DIR="$NVM_DIR"
  
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh"
    NODE_VERSION=$(cat "$SCRIPT_DIR/.nvmrc")
    nvm uninstall "$NODE_VERSION" 2>/dev/null || true
  fi
  
  rm -rf "$NVM_DIR"
fi

echo "Node.js tools cleaned"
