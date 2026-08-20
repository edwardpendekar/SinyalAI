#!/bin/bash

# Configuration
BACKUP_DIR="./backups"
DB_CONTAINER="sinyal_db"
DB_USER="quant_user"
DB_NAME="sinyal_ai"
DATE=$(date +%Y-%m-%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql"

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

echo "Starting database backup for $DB_NAME..."

# Execute pg_dump inside the docker container
docker exec -t $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "Backup completed successfully: $BACKUP_FILE"
    # Gzip the backup to save space
    gzip $BACKUP_FILE
    echo "Backup compressed: ${BACKUP_FILE}.gz"
else
    echo "Error: Database backup failed!"
    exit 1
fi

# Housekeeping: Delete backups older than 7 days
echo "Cleaning up backups older than 7 days..."
find $BACKUP_DIR -type f -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Cleanup completed."
