# How Codespace and USB Drive Work Together: A Simple Guide

## What is the Codespace-USB Link?

Your project uses two main workspaces:
- **Codespace**: A cloud-based development environment (like a virtual computer in the cloud).
- **USB Drive**: A physical storage device plugged into your Chromebook, located at `/mnt/chromeos/removable/usbdrive/askme`.

These two workspaces are linked so you can:
- Develop and test code in the Codespace (fast, flexible, always available)
- Store large files, persistent data, and installed tools on the USB drive (safe, portable, and accessible from your Chromebook)

---

## Why Link Codespace and USB?

- **Persistence**: Codespace storage is temporary. The USB drive keeps your files safe even if the Codespace is deleted or reset.
- **Portability**: You can unplug the USB and use it on another Chromebook or computer.
- **Performance**: Codespace is great for coding and running builds. The USB is ideal for storing big files, libraries, or anything you want to keep long-term.
- **Seamless Workflow**: 
    - *Cloud Codespace Limitation*: In a cloud Codespace, you **cannot directly access your Chromebook's USB drive** due to security and cloud isolation. But you can still move files between Codespace and your USB using cloud-friendly methods!
    - *Two great options for persistent sharing:*
        1. **File Sync Scripts**: Use scripts to upload/download files between Codespace and your Chromebook (and USB) via a shared cloud folder.
        2. **Google Drive**: Use Google Drive (or another cloud storage service) as a bridge—upload files from Codespace, then download to your Chromebook and USB, and vice versa.

---

## How Does the Link Work? (Step-by-Step)

### 1. The Challenge
- **Cloud Codespace cannot directly access your Chromebook's USB drive** due to security and cloud isolation.
- But you can keep everything in sync using Google Drive as a bridge!

### 2. The Solution: Automated Sync via Google Drive

#### **A. Set Up rclone in Codespace**
1. **Install rclone** (already done):
   ```bash
   curl https://rclone.org/install.sh | sudo bash
   ```
2. **Configure rclone for Google Drive**:
   ```bash
   rclone config
   ```
   - n (New remote)
   - Name: askme
   - Storage: 20 (Google Drive)
   - Press Enter for client_id and client_secret
   - Scope: 1 (Full access)
   - Enter for root_folder_id and service_account_file
   - n (No advanced config)
   - y (Use auto config)
   - Log in to Google when prompted
   - y (Confirm)
   - q (Quit)

#### **B. Set Up rclone on Your Chromebook**
1. **Install rclone**:
   ```bash
   sudo apt-get update
   sudo apt-get install rclone
   ```
2. **Configure rclone for Google Drive** (same as above):
   ```bash
   rclone config
   ```
   (Follow the same steps as in Codespace)

#### **C. Use the Provided Sync Scripts**

##### **1. Codespace <-> Google Drive**
- Script: `codespace_sync_with_gdrive.sh`
- Place in `/workspaces/askme/` in Codespace.
- Usage:
  ```bash
  ./sync_scripts/codespace_sync_with_gdrive.sh
  ```
- What it does: Uploads new/changed files from Codespace to Google Drive, then downloads new files from Google Drive to Codespace.

##### **2. Chromebook USB <-> Google Drive**
- Script: `usb_sync_with_gdrive.sh`
- Place on your Chromebook USB at `/mnt/chromeos/removable/usbdrive/askme/`.
- Usage:
  ```bash
  chmod +x /mnt/chromeos/removable/usbdrive/askme/sync_scripts/usb_sync_with_gdrive.sh
  /mnt/chromeos/removable/usbdrive/askme/sync_scripts/usb_sync_with_gdrive.sh
  ```
- What it does: Uploads new/changed files from USB to Google Drive, then downloads new files from Google Drive to USB.

##### **3. (Optional) Schedule for Automation**
- Use `cron` on either system to run the sync script at regular intervals for hands-off syncing.

---

## FAQ & Troubleshooting

**Q: Why can't Codespace see my USB drive directly?**
- Codespace runs in the cloud and cannot access local hardware for security reasons.

**Q: What if my sync breaks or files are missing?**
- Run the sync script again! It will re-establish the link and ensure both sides are up-to-date.

**Q: How do I know if sync is working?**
- Check Google Drive for your files, or use the health check script below.

**Q: Can I automate everything?**
- Yes! Use cron jobs to run the sync scripts on a schedule.

**Q: What if I get a 'config file not found' error?**
- Make sure you've run `rclone config` on both Codespace and Chromebook, and that the remote is named `askme`.

---

## Example Scripts

### 1. Codespace <-> Google Drive Sync Script (`codespace_sync_with_gdrive.sh`)
```bash
#!/bin/bash
# This script syncs your Codespace project with your Google Drive folder 'askme-sync'.
REMOTE="askme"
DRIVE_FOLDER="askme-sync"
LOCAL_FOLDER="/workspaces/askme"
echo "Uploading from Codespace to Google Drive..."
rclone sync "$LOCAL_FOLDER" "$REMOTE:$DRIVE_FOLDER" --progress --exclude ".git/**" --exclude "usbdrive/**"
echo "Downloading from Google Drive to Codespace..."
rclone sync "$REMOTE:$DRIVE_FOLDER" "$LOCAL_FOLDER" --progress --exclude ".git/**" --exclude "usbdrive/**"
echo "Sync complete! Your Codespace and Google Drive are now in sync."
```

### 2. Chromebook USB <-> Google Drive Sync Script (`usb_sync_with_gdrive.sh`)
```bash
#!/bin/bash
# Chromebook/USB sync script: keeps your USB drive and Google Drive folder 'askme-sync' in sync!
REMOTE="askme"
DRIVE_FOLDER="askme-sync"
USB_FOLDER="/mnt/chromeos/removable/usbdrive/askme"
echo "Uploading from USB to Google Drive..."
rclone sync "$USB_FOLDER" "$REMOTE:$DRIVE_FOLDER" --progress --exclude ".Trash-*/**"
echo "Downloading from Google Drive to USB..."
rclone sync "$REMOTE:$DRIVE_FOLDER" "$USB_FOLDER" --progress --exclude ".Trash-*/**"
echo "Sync complete! Your USB drive and Google Drive are now in sync."
```

### 3. Health Check & Auto-Restablish Script (`codespace_check_and_resync.sh`)
```bash
#!/bin/bash
# Checks if Google Drive and Codespace are in sync, and re-syncs if not.
REMOTE="askme"
DRIVE_FOLDER="askme-sync"
LOCAL_FOLDER="/workspaces/askme"
# Check for differences
rclone check "$LOCAL_FOLDER" "$REMOTE:$DRIVE_FOLDER" --one-way --quiet
if [ $? -ne 0 ]; then
  echo "Sync out of date. Re-syncing..."
  ./sync_scripts/codespace_sync_with_gdrive.sh
else
  echo "Sync is healthy!"
fi
```
- Place this script in your Codespace and run it to check and auto-fix sync issues.

---

# Hybrid Codespace-USB Architecture for Git Safety

## Core Principle: Separate Git from Dependencies

The key insight is to create a **clear separation** between:
- **Git Repository**: Lives in Codespace (fast, cloud-native)
- **Heavy Dependencies**: Live on USB (persistent, large storage)
- **Source Code Sync**: Via Google Drive (safe, excludes .git)

## Recommended Architecture

```
📁 CODESPACE (/workspaces/askme)
├── .git/                           # Git repository (NEVER synced)
├── src/                           # Source code (synced)
├── docs/                          # Documentation (synced)
├── package.json                   # Dependency manifests (synced)
├── requirements.txt               # Python deps (synced)
└── symlinks/                      # Symlinks to USB resources
    ├── node_modules -> /mnt/.../node_modules
    ├── venv -> /mnt/.../venv
    ├── .cache -> /mnt/.../cache
    └── build -> /mnt/.../build

📁 USB DRIVE (/mnt/chromeos/removable/USBdrive/askme)
├── dependencies/
│   ├── node_modules/              # Heavy Node.js packages
│   ├── venv/                      # Python virtual environment
│   ├── .cache/                    # Package caches
│   └── sdks/                      # SDKs, toolchains
├── build/                         # Build outputs
├── data/                          # Large datasets
└── sync/                          # File sync staging area
    ├── src/                       # Synced source (no .git)
    ├── docs/                      # Synced documentation
    └── configs/                   # Synced configurations

📁 GOOGLE DRIVE (askme-sync)
├── src/                           # Source code only
├── docs/                          # Documentation
├── package.json                   # Manifests
└── configs/                       # Configurations
```

## Implementation Strategy

### 1. **Git Repository Setup (Codespace Only)**
```bash
# Keep Git ONLY in Codespace
cd /workspaces/askme
git init  # or git clone from existing repo
git remote add origin <your-github-repo>

# Critical: Add .gitignore to exclude USB paths
cat >> .gitignore <<EOF
# USB drive paths (don't commit these)
/mnt/
symlinks/
node_modules/
venv/
.cache/
build/
*.log
EOF
```

### 2. **USB Directory Structure Setup**
```bash
# Create organized structure on USB
USB_ROOT="/mnt/chromeos/removable/USBdrive/askme"
mkdir -p "$USB_ROOT"/{dependencies/{node_modules,venv,.cache,sdks},build,data,sync}

# Create symlink management script
cat > "$USB_ROOT/setup_symlinks.sh" <<'EOF'
#!/bin/bash
# Setup symlinks from Codespace to USB resources
CODESPACE_ROOT="/workspaces/askme"
USB_ROOT="/mnt/chromeos/removable/USBdrive/askme"

# Ensure USB is mounted
if [ ! -d "$USB_ROOT" ]; then
    echo "❌ USB drive not found at $USB_ROOT"
    exit 1
fi

# Create symlink directory in Codespace
mkdir -p "$CODESPACE_ROOT/symlinks"

# Heavy dependencies symlinks
ln -sfn "$USB_ROOT/dependencies/node_modules" "$CODESPACE_ROOT/node_modules"
ln -sfn "$USB_ROOT/dependencies/venv" "$CODESPACE_ROOT/venv"
ln -sfn "$USB_ROOT/dependencies/.cache" "$CODESPACE_ROOT/.cache"
ln -sfn "$USB_ROOT/build" "$CODESPACE_ROOT/build"

# Environment setup
export PATH="$USB_ROOT/dependencies/venv/bin:$PATH"
export NODE_PATH="$USB_ROOT/dependencies/node_modules"
export npm_config_prefix="$USB_ROOT/dependencies"

echo "✅ Symlinks established successfully"
EOF

chmod +x "$USB_ROOT/setup_symlinks.sh"
```

### 3. **Safe Sync Scripts (Excluding .git)**

#### Codespace → Google Drive (Source Code Only)
```bash
#!/bin/bash
# sync_code_to_drive.sh
REMOTE="askme"
DRIVE_FOLDER="askme-sync"
LOCAL_FOLDER="/workspaces/askme"

echo "🔄 Syncing source code to Google Drive..."
rclone sync "$LOCAL_FOLDER" "$REMOTE:$DRIVE_FOLDER" \
  --progress \
  --exclude ".git/**" \
  --exclude "node_modules/**" \
  --exclude "venv/**" \
  --exclude ".cache/**" \
  --exclude "build/**" \
  --exclude "symlinks/**" \
  --exclude "*.log" \
  --exclude ".DS_Store" \
  --exclude "*.tmp"

echo "✅ Source code sync complete!"
```

#### Google Drive → USB Staging Area
```bash
#!/bin/bash
# sync_code_from_drive.sh (run on Chromebook)
REMOTE="askme"
DRIVE_FOLDER="askme-sync"
USB_SYNC_FOLDER="/mnt/chromeos/removable/USBdrive/askme/sync"

echo "🔄 Syncing code from Google Drive to USB..."
rclone sync "$REMOTE:$DRIVE_FOLDER" "$USB_SYNC_FOLDER" --progress

echo "✅ Code synced to USB staging area!"
```

### 4. **Development Environment Setup**

#### Codespace Initialization Script
```bash
#!/bin/bash
# initialize_codespace.sh
set -e

echo "🚀 Initializing Codespace environment..."

# 1. Check USB connection
USB_ROOT="/mnt/chromeos/removable/USBdrive/askme"
if [ ! -d "$USB_ROOT" ]; then
    echo "❌ USB drive not mounted. Please ensure USB is connected."
    exit 1
fi

# 2. Setup symlinks to USB dependencies
echo "🔗 Setting up symlinks..."
source "$USB_ROOT/setup_symlinks.sh"

# 3. Verify Git repository
if [ ! -d "/workspaces/askme/.git" ]; then
    echo "📦 No Git repository found. Cloning..."
    cd /workspaces/askme
    git clone <your-repo-url> .
fi

# 4. Install lightweight dependencies in Codespace
echo "📦 Installing lightweight packages..."
# Only install essential, lightweight tools in Codespace
pip install --user rclone-python  # Lightweight sync tools
npm install -g nodemon            # Lightweight dev tools

# 5. Setup environment variables
cat >> ~/.bashrc <<EOF
# Project environment
export PROJECT_ROOT="/workspaces/askme"
export USB_ROOT="/mnt/chromeos/removable/USBdrive/askme"
export PATH="\$USB_ROOT/dependencies/venv/bin:\$PATH"
export NODE_PATH="\$USB_ROOT/dependencies/node_modules"

# Aliases for common tasks
alias install-node="npm install --prefix \$USB_ROOT/dependencies"
alias install-python="pip install --target \$USB_ROOT/dependencies/venv/lib/python3.*/site-packages"
alias sync-up="./sync_code_to_drive.sh"
alias sync-down="./sync_code_from_drive.sh"
EOF

echo "✅ Codespace initialized successfully!"
echo "Run 'source ~/.bashrc' to load environment variables"
```

---

## Benefits of This Architecture

1. **Git Safety**: Repository only exists in Codespace, no cloud sync corruption
2. **Performance**: Heavy dependencies on USB, lightweight Codespace
3. **Persistence**: Dependencies survive Codespace resets
4. **Flexibility**: Can work offline or online
5. **Backup**: Multiple backup strategies (Git remote, bundles, file sync)
6. **Recovery**: Easy to rebuild from any component failure

---

## Edge Case Handling

### USB Disconnection
- Codespace continues to work with cached/lightweight dependencies
- Graceful degradation with helpful error messages
- Easy reconnection and symlink restoration

### Codespace Reset
- Git repository restored from remote
- Dependencies immediately available via USB symlinks
- Source code restored via Google Drive sync

### Sync Conflicts
- Only affect source files, never Git history
- Easy to resolve since Git operations are isolated
- Clear separation of concerns

---

## Summary
- **Codespace** = fast, flexible, cloud coding
- **USB Drive** = safe, portable, persistent storage
- **Google Drive** = your bridge for persistent, automated sharing!
- **Scripts** = your hands-off, reliable workflow

---

## You Did It!
You now have a robust, automated, and documented workflow for keeping your Codespace, Google Drive, and USB drive in sync—no manual file moving required. If you ever get stuck, just re-run the scripts or check the FAQ above. Happy building!
