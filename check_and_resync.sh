#!/bin/bash
# Health Check & Auto-Restablish Script for Codespace <-> Google Drive
# Checks if Google Drive and Codespace are in sync, and re-syncs if not.
REMOTE="askme"
DRIVE_FOLDER="askme-sync"
LOCAL_FOLDER="/workspaces/askme"

# Check for differences (one-way: Codespace -> Drive)
rclone check "$LOCAL_FOLDER" "$REMOTE:$DRIVE_FOLDER" --one-way --quiet
if [ $? -ne 0 ]; then
  echo "Sync out of date. Re-syncing..."
  ./sync_scripts/codespace_sync_with_gdrive.sh
else
  echo "Sync is healthy!"
fi
