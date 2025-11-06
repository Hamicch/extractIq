#!/bin/bash
# Database Restore Script for ExtractIQ

set -e  # Exit on error

# Configuration
CONTAINER_NAME="extractiq-db"
DB_NAME="extractiq"
DB_USER="postgres"

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "❌ Error: No backup file specified"
    echo "Usage: ./restore-db.sh <backup-file.sql>"
    echo "Example: ./restore-db.sh /opt/extractiq/backups/backup_20241019_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  WARNING: This will replace all data in the database!"
echo "Backup file: $BACKUP_FILE"
read -p "Are you sure you want to continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Restore cancelled"
    exit 0
fi

echo "🔄 Starting database restore..."

# If file is compressed, decompress first
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "📦 Decompressing backup..."
    TEMP_FILE="/tmp/restore_temp.sql"
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    RESTORE_FILE="$TEMP_FILE"
else
    RESTORE_FILE="$BACKUP_FILE"
fi

# Restore database
echo "📥 Restoring database..."
docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" "$DB_NAME" < "$RESTORE_FILE"

# Clean up temp file if created
if [ ! -z "$TEMP_FILE" ]; then
    rm -f "$TEMP_FILE"
fi

echo "✅ Database restored successfully!"
echo "🔄 Restart your application for changes to take effect"
