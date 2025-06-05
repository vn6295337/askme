#!/bin/bash
# Master sync script - executes both USB and Codespace sync sequentially
# This runs on your Chromebook and coordinates the entire sync process

set -e  # Exit on any error

# Configuration
CODESPACE_NAME="shiny-space-invention-q795gv7jxv992x7g5"  # Replace with your codespace name
USB_SYNC_SCRIPT="./usb_sync.sh"
CODESPACE_SYNC_SCRIPT="./codespace_sync.sh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Master Sync Script ===${NC}"
echo "This will sync: USB ↔ Google Drive ↔ Codespace"
echo

# Function to run command in codespace
run_in_codespace() {
    local command="$1"
    echo -e "${YELLOW}Running in codespace: $command${NC}"
    timeout 30 gh cs ssh -c "$CODESPACE_NAME" -- "$command"
}

# Function to check if codespace is running
check_codespace() {
    echo -e "${BLUE}Checking codespace status...${NC}"
    if ! gh cs list | grep -q "$CODESPACE_NAME.*Available"; then
        echo -e "${YELLOW}Starting codespace...${NC}"
        gh cs code -c "$CODESPACE_NAME" --web &
        echo "Waiting for codespace to start (30 seconds)..."
        sleep 30
    fi
}

# Main sync function
sync_all() {
    local direction="$1"  # "to_codespace" or "from_codespace"
    
    case "$direction" in
        "to_codespace")
            echo -e "${GREEN}=== Syncing: USB → Google Drive → Codespace ===${NC}"
            
            # Step 1: USB to Google Drive (on Chromebook)
            echo -e "${BLUE}Step 1: Syncing USB to Google Drive...${NC}"
            if [ -f "$USB_SYNC_SCRIPT" ]; then
                $USB_SYNC_SCRIPT sync
            else
                echo -e "${RED}Error: $USB_SYNC_SCRIPT not found${NC}"
                exit 1
            fi
            
            # Step 2: Google Drive to Codespace (via SSH)
            echo -e "${BLUE}Step 2: Syncing Google Drive to Codespace...${NC}"
            check_codespace
            run_in_codespace "cd /workspaces && ./codespace_sync.sh sync"
            ;;
            
        "from_codespace")
            echo -e "${GREEN}=== Syncing: Codespace → Google Drive → USB ===${NC}"
            
            # Step 1: Codespace to Google Drive (via SSH)
            echo -e "${BLUE}Step 1: Syncing Codespace to Google Drive...${NC}"
            check_codespace
            run_in_codespace "cd /workspaces && ./codespace_sync.sh sync"
            
            # Step 2: Google Drive to USB (on Chromebook)
            echo -e "${BLUE}Step 2: Syncing Google Drive to USB...${NC}"
            if [ -f "$USB_SYNC_SCRIPT" ]; then
                $USB_SYNC_SCRIPT sync
            else
                echo -e "${RED}Error: $USB_SYNC_SCRIPT not found${NC}"
                exit 1
            fi
            ;;
            
        *)
            echo "Usage: $0 {to_codespace|from_codespace|setup}"
            echo "  to_codespace   - Sync USB → Google Drive → Codespace"
            echo "  from_codespace - Sync Codespace → Google Drive → USB"
            echo "  setup          - Setup scripts in codespace"
            exit 1
            ;;
    esac
    
    echo -e "${GREEN}✅ Sync complete!${NC}"
}

# Setup function to copy script to codespace
setup_codespace() {
    echo -e "${BLUE}=== Setting up Codespace ===${NC}"
    check_codespace
    
    # Check if script exists in codespace
    if run_in_codespace "test -f /workspaces/codespace_sync.sh"; then
        echo -e "${GREEN}Codespace sync script already exists${NC}"
    else
        echo -e "${YELLOW}Copying sync script to codespace...${NC}"
        if [ -f "$CODESPACE_SYNC_SCRIPT" ]; then
            # Copy the script to codespace
            gh cs ssh -c "$CODESPACE_NAME" -- "cat > /workspaces/codespace_sync.sh" < "$CODESPACE_SYNC_SCRIPT"
            run_in_codespace "chmod +x /workspaces/codespace_sync.sh"
            echo -e "${GREEN}✅ Codespace setup complete${NC}"
        else
            echo -e "${RED}Error: $CODESPACE_SYNC_SCRIPT not found locally${NC}"
            exit 1
        fi
    fi
}

# Main execution
case "${1:-}" in
    "to_codespace"|"from_codespace")
        sync_all "$1"
        ;;
    "setup")
        setup_codespace
        ;;
    "")
        echo "Master Sync Script"
        echo "=================="
        echo
        echo "Usage: $0 {to_codespace|from_codespace|setup}"
        echo
        echo "Commands:"
        echo "  setup          - One-time setup: copy scripts to codespace"
        echo "  to_codespace   - Sync USB → Google Drive → Codespace"
        echo "  from_codespace - Sync Codespace → Google Drive → USB"
        echo
        echo "Examples:"
        echo "  $0 setup                # First time setup"
        echo "  $0 to_codespace        # Upload your USB changes"
        echo "  $0 from_codespace      # Download codespace changes"
        ;;
    *)
        echo "Unknown command: $1"
        echo "Use '$0' to see usage instructions"
        exit 1
        ;;
esac
