#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
NODE_VERSION=$(cat "$SCRIPT_DIR/.nvmrc" 2>/dev/null || echo "16.20.2")
NVM_DIR="$SCRIPT_DIR/nvm"

# Install nvm to tool directory if not available
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  mkdir -p "$NVM_DIR"
  echo "Installing nvm to $NVM_DIR..."
  # Clone nvm.git directly without running the full install script
  # This avoids modifying ~/.zshrc
  if [ ! -d "$NVM_DIR/.git" ]; then
    git clone --depth 1 --branch v0.39.7 https://github.com/nvm-sh/nvm.git "$NVM_DIR" 2>/dev/null || \
    (cd "$NVM_DIR" && git fetch origin v0.39.7 && git checkout v0.39.7)
  fi
fi

# Source nvm and set up environment
export NVM_DIR="$NVM_DIR"
. "$NVM_DIR/nvm.sh"

if ! nvm ls 2>/dev/null | grep -q "$NODE_VERSION"; then
  echo "Installing Node.js $NODE_VERSION..."
  nvm install "$NODE_VERSION" >/dev/null 2>&1
fi

nvm use "$NODE_VERSION" >/dev/null 2>&1

# Get the current active version from nvm
ACTUAL_VERSION=$(nvm current)
NVM_BIN_DIR="$NVM_DIR/versions/node/$ACTUAL_VERSION/bin"

# Ensure PATH includes the correct node/yarn
export PATH="$NVM_BIN_DIR:$PATH"

# Install yarn if not present (only once)
if [ ! -f "$NVM_BIN_DIR/yarn" ]; then
  echo "Installing yarn..."
  npm install -g yarn@1.22.22 >/dev/null 2>&1
fi

exec "$@"
