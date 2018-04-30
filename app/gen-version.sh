#!/bin/bash

version=$(git describe --tags | cut -c 2- | cut -d '-' -f 1)
commit=$(git describe --always --dirty)

cat > src/version.js << EOF
export const VERSION = "${version}";
export const COMMIT = "${commit}";
EOF
