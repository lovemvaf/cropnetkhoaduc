#!/bin/bash

# Configuration
BACKUP_DIR="./backups"
DB_URL=${DATABASE_URL}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/cropnet_backup_${TIMESTAMP}.sql"

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

echo "Starting PostgreSQL database backup..."
if [ -n "$DB_URL" ]; then
  pg_dump "$DB_URL" > "$BACKUP_FILE"
  if [ $? -eq 0 ]; then
    echo "Backup completed successfully! Saved to: ${BACKUP_FILE}"
    # Delete backups older than 7 days
    find "$BACKUP_DIR" -type f -name "cropnet_backup_*.sql" -mtime +7 -delete
    echo "Old backups cleaned up."
  else
    echo "Error: pg_dump backup execution failed."
    exit 1
  fi
else
  echo "Error: DATABASE_URL environment variable is not set."
  exit 1
fi
