#!/bin/bash
# Codespace sync script: Sync with Google Drive
# Run this from within your GitHub Codespace terminal

set -e  # Exit on any error

# Configuration
REMOTE="askme:askme-sync"                    # Google Drive remote:folder
LOCAL_FOLDER="/workspaces/askme"             # Local codespace folder

# Define exclusion patterns
EXCLUDES=(
    "--exclude" ".git/**"
    "--exclude" ".Trash-*/**"
    "--exclude" "node_modules/**"
    "--exclude" ".DS_Store"
    "--exclude" "*.tmp"
    "--exclude" ".devcontainer/**"
    "--exclude" ".vscode/**"
)

# Function to check if rclone is configured
check_rclone() {
    if ! command -v rclone &> /dev/null; then
        echo "Installing rclone..."
        curl https://rclone.org/install.sh | sudo bash
    fi
    
    if ! rclone listremotes | grep -q "^askme:$"; then
        echo "Error: rclone not configured for Google Drive."
        echo "Please run: rclone config"
        echo "And set up a remote named 'askme' for Google Drive"
        exit 1
    fi
    
    echo "✓ rclone configured"
}

# Function to show status
show_status() {
    echo "=== Codespace Sync Status ==="
    echo "Local folder: $LOCAL_FOLDER"
    echo "Remote: $REMOTE"
    echo ""
    
    echo "Recent local files:"
    find "$LOCAL_FOLDER" -type f -not -path "*/.git/*" -not -path "*/node_modules/*" | head -10
    echo ""
    
    echo "Files in Google Drive:"
    rclone ls "$REMOTE" | head -10
    echo ""
}

# Function to upload to Google Drive
upload_to_drive() {
    echo "📤 Uploading Codespace files to Google Drive..."
    rclone sync "$LOCAL_FOLDER" "$REMOTE" --progress "${EXCLUDES[@]}" --dry-run
    
    echo ""
    read -p "Proceed with upload? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rclone sync "$LOCAL_FOLDER" "$REMOTE" --progress "${EXCLUDES[@]}"
        echo "✅ Upload completed"
    else
        echo "Upload cancelled"
    fi
}

# Function to download from Google Drive
download_from_drive() {
    echo "📥 Downloading files from Google Drive to Codespace..."
    rclone sync "$REMOTE" "$LOCAL_FOLDER" --progress "${EXCLUDES[@]}" --dry-run
    
    echo ""
    read -p "Proceed with download? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rclone sync "$REMOTE" "$LOCAL_FOLDER" --progress "${EXCLUDES[@]}"
        echo "✅ Download completed"
    else
        echo "Download cancelled"
    fi
}

# Function to perform bidirectional sync
bidirectional_sync() {
    echo "🔄 Performing bidirectional sync..."
    
    # Show what would change
    echo "=== Changes that would be uploaded ==="
    rclone sync "$LOCAL_FOLDER" "$REMOTE" --progress "${EXCLUDES[@]}" --dry-run
    
    echo ""
    echo "=== Changes that would be downloaded ==="
    rclone sync "$REMOTE" "$LOCAL_FOLDER" --progress "${EXCLUDES[@]}" --dry-run
    
    echo ""
    read -p "Proceed with bidirectional sync? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Step 1: Uploading local changes..."
        rclone sync "$LOCAL_FOLDER" "$REMOTE" --progress "${EXCLUDES[@]}"
        
        echo "Step 2: Downloading remote changes..."
        rclone sync "$REMOTE" "$LOCAL_FOLDER" --progress "${EXCLUDES[@]}"
        
        echo "✅ Bidirectional sync completed"
    else
        echo "Sync cancelled"
    fi
}

# Main menu
show_menu() {
    echo "=== Codespace ↔ Google Drive Sync ==="
    echo "1. Show status"
    echo "2. Upload Codespace → Google Drive"
    echo "3. Download Google Drive → Codespace"  
    echo "4. Bidirectional sync (recommended)"
    echo "5. Exit"
    echo ""
    read -p "Choose option (1-5): " -n 1 -r
    echo
    
    case $REPLY in
        1) show_status ;;
        2) upload_to_drive ;;
        3) download_from_drive ;;
        4) bidirectional_sync ;;
        5) echo "Goodbye!"; exit 0 ;;
        *) echo "Invalid option" ;;
    esac
}

# Script entry point
check_rclone

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
        "upload") upload_to_drive ;;
        "download") download_from_drive ;;
        "sync") bidirectional_sync ;;
        *) 
            echo "Usage: $0 [status|upload|download|sync]"
            echo "Or run without arguments for interactive mode"
            ;;
    esac
fi
