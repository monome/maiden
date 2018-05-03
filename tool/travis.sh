#!/bin/bash

# Fast fail.
set -e

# Check Go formatting.
UNFORMATTED_FILES="$(gofmt -l *.go)"
if [ -n "$UNFORMATTED_FILES" ]; then
	echo "Failed gofmt check: run \`gofmt -w $UNFORMATTED_FILES\`"
	exit 1
fi

# Lint JS.
(cd app && ./node_modules/.bin/eslint src/)
