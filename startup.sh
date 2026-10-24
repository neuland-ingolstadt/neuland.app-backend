#!/bin/sh
set -e

echo "Starting application..."
exec bun run index.ts
