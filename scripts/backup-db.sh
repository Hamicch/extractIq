#!/bin/bash
# Automated Database Backup Script for ExtractIQ

set -e  # Exit on error

# Configuration
BACKUP_DIR="/opt/extractiq/backups"
CONTAINER_NAME="extractiq-db"
DB_NAME="extractiq"
DB_USER="postgres"
RETENTION_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"

echo "📦 Starting database backup..."
echo "Backup file: $BACKUP_FILE"

# Create backup
docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"
echo "✅ Backup created: ${BACKUP_FILE}.gz"

# Remove old backups (keep only last N days)
echo "🧹 Cleaning up old backups (keeping last $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

# Show remaining backups
echo "📊 Current backups:"
ls -lh "$BACKUP_DIR"

echo "✅ Backup completed successfully!"
