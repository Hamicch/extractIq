#!/bin/bash
# Database Migration Script for ExtractIQ

set -e  # Exit on error

echo "🔄 Running database migrations..."

# Run migrations using drizzle-kit
cd packages/db
npx drizzle-kit push:pg

echo "✅ Database migrations completed successfully!"
