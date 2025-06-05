#!/bin/bash
# Simplified sync script: USB Drive ↔ Google Drive only
# Manual step: You sync Codespace ↔ Google Drive from within the Codespace
# This script handles: USB ↔ Google Drive from Chromebook

set -e  # Exit on any error

# Configuration
REMOTE="askme"                                           # Google Drive remote name
DRIVE_FOLDER="askme-sync"                               # Folder in Google Drive
USB_FOLDER="/mnt/chromeos/removable/USBdrive/askme"     # USB mount point

# Define exclusion patterns
EXCLUDES=(
    "--exclude" ".git/**"
    "--exclude" ".Trash-*/**"
    "--exclude" "node_modules/**"
    "--exclude" ".DS_Store"
    "--exclude" "*.tmp"
    "--exclude" ".rclone/**"
)

# Function to check prerequisites
check_prerequisites() {
    echo "Checking prerequisites..."
    
    # Check if rclone is configured
    if ! rclone listremotes | grep -q "^${REMOTE}:$"; then
        echo "Error: rclone remote '${REMOTE}' not found. Please run 'rclone config' first."
        exit 1
    fi
    
    # Check if USB is mounted
    if [ ! -d "$USB_FOLDER" ]; then
        echo "Error: USB folder $USB_FOLDER not found. Please ensure USB drive is mounted."
        exit 1
    fi
    
    echo "✓ Prerequisites met"
}

# Function to show current status
show_status() {
    echo "=== Current Sync Status ==="
    echo "Google Drive: $REMOTE:$DRIVE_FOLDER"
    echo "USB Drive: $USB_FOLDER"
    echo ""
    
    echo "Files in Google Drive:"
    rclone ls "$REMOTE:$DRIVE_FOLDER" | head -10
    echo ""
    
    echo "Files on USB Drive:"
    ls -la "$USB_FOLDER" | head -10
    echo ""
}

# Function to sync USB to Google Drive
sync_usb_to_drive() {
    echo "📤 Uploading changes from USB to Google Drive..."
    rclone sync "$USB_FOLDER" "$REMOTE:$DRIVE_FOLDER" --progress "${EXCLUDES[@]}" --dry-run
    
    echo ""
    read -p "Proceed with upload? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rclone sync "$USB_FOLDER" "$REMOTE:$DRIVE_FOLDER" --progress "${EXCLUDES[@]}"
        echo "✅ Upload completed"
    else
        echo "Upload cancelled"
    fi
}

# Function to sync Google Drive to USB
sync_drive_to_usb() {
    echo "📥 Downloading changes from Google Drive to USB..."
    rclone sync "$REMOTE:$DRIVE_FOLDER" "$USB_FOLDER" --progress "${EXCLUDES[@]}" --dry-run
    
    echo ""
    read -p "Proceed with download? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rclone sync "$REMOTE:$DRIVE_FOLDER" "$USB_FOLDER" --progress "${EXCLUDES[@]}"
        echo "✅ Download completed"
    else
        echo "Download cancelled"
    fi
}

# Function to perform bidirectional sync
bidirectional_sync() {
    echo "🔄 Performing bidirectional sync..."
    echo "This will:"
    echo "1. Upload USB changes to Google Drive"
    echo "2. Download Google Drive changes to USB"
    echo ""
    
    # First show what would change
    echo "=== Changes that would be uploaded to Google Drive ==="
    rclone sync "$USB_FOLDER" "$REMOTE:$DRIVE_FOLDER" --progress "${EXCLUDES[@]}" --dry-run
    
    echo ""
    echo "=== Changes that would be downloaded from Google Drive ==="
    rclone sync "$REMOTE:$DRIVE_FOLDER" "$USB_FOLDER" --progress "${EXCLUDES[@]}" --dry-run
    
    echo ""
    read -p "Proceed with bidirectional sync? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Step 1: Uploading USB changes..."
        rclone sync "$USB_FOLDER" "$REMOTE:$DRIVE_FOLDER" --progress "${EXCLUDES[@]}"
        
        echo "Step 2: Downloading Google Drive changes..."
        rclone sync "$REMOTE:$DRIVE_FOLDER" "$USB_FOLDER" --progress "${EXCLUDES[@]}"
        
        echo "✅ Bidirectional sync completed"
    else
        echo "Sync cancelled"
    fi
}

# Main menu
show_menu() {
    echo "=== USB ↔ Google Drive Sync ==="
    echo "1. Show status"
    echo "2. Upload USB → Google Drive"
    echo "3. Download Google Drive → USB"
    echo "4. Bidirectional sync (recommended)"
    echo "5. Exit"
    echo ""
    read -p "Choose option (1-5): " -n 1 -r
    echo
    
    case $REPLY in
        1) show_status ;;
        2) sync_usb_to_drive ;;
        3) sync_drive_to_usb ;;
        4) bidirectional_sync ;;
        5) echo "Goodbye!"; exit 0 ;;
        *) echo "Invalid option" ;;
    esac
}

# Script entry point
check_prerequisites

if [ $# -eq 0 ]; then
    # Interactive mode
    while true; do
        show_menu
        echo ""
    done
else
    # Command line mode
    case "$1" in
        "status") show_status ;;
        "upload") sync_usb_to_drive ;;
        "download") sync_drive_to_usb ;;
        "sync") bidirectional_sync ;;
        *) 
            echo "Usage: $0 [status|upload|download|sync]"
            echo "Or run without arguments for interactive mode"
            ;;
    esac
fi
