#!/bin/bash
# This script syncs your Codespace project with your Google Drive folder 'askme-sync'.
# It uploads new/changed files from Codespace to Drive, and downloads new files from Drive to Codespace.
# You can run this manually or schedule it for automation!

# Set your remote and folder names
REMOTE="askme"
DRIVE_FOLDER="askme-sync"
LOCAL_FOLDER="/workspaces/askme"

# Sync Codespace to Google Drive (upload new/changed files)
echo "Uploading from Codespace to Google Drive..."
rclone sync "$LOCAL_FOLDER" "$REMOTE:$DRIVE_FOLDER" --progress --exclude ".git/**" --exclude "usbdrive/**"

# Sync Google Drive to Codespace (download new files)
echo "Downloading from Google Drive to Codespace..."
rclone sync "$REMOTE:$DRIVE_FOLDER" "$LOCAL_FOLDER" --progress --exclude ".git/**" --exclude "usbdrive/**"

echo "Sync complete! Your Codespace and Google Drive are now in sync."
