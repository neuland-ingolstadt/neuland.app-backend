#!/bin/sh
set -e

echo "Running database migrations..."
bun run migrate

echo "Starting application..."
exec bun run index.ts
