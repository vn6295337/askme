#!/bin/bash
# Chromebook/USB sync script: keeps your USB drive and Google Drive folder 'askme-sync' in sync!
# Run this on your Chromebook (with rclone installed and configured for Google Drive)
# Make sure your USB is mounted at /mnt/chromeos/removable/USBdrive/askme

REMOTE="askme"
DRIVE_FOLDER="askme-sync"
USB_FOLDER="/mnt/chromeos/removable/USBdrive/askme"

# Sync USB to Google Drive (upload new/changed files)
echo "Uploading from USB to Google Drive..."
rclone sync "$USB_FOLDER" "$REMOTE:$DRIVE_FOLDER" --progress --exclude ".Trash-*/**"

# Sync Google Drive to USB (download new files)
echo "Downloading from Google Drive to USB..."
rclone sync "$REMOTE:$DRIVE_FOLDER" "$USB_FOLDER" --progress --exclude ".Trash-*/**"

echo "Sync complete! Your USB drive and Google Drive are now in sync."
