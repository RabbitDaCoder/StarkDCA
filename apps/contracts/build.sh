#!/bin/bash
export PATH="/home/linuxbrew/.linuxbrew/bin:$PATH"
cd "$(dirname "$0")"
echo "=== Scarb Version ==="
scarb --version
echo ""
echo "=== Building ==="
scarb build 2>&1
echo ""
echo "=== Exit Code: $? ==="
