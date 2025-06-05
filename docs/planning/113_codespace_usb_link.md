# How Codespace and USB Drive Work Together: A Simple Guide

## What is the Codespace-USB Link?

Your project uses two main workspaces:
- **Codespace**: A cloud-based development environment (like a virtual computer in the cloud).
- **USB Drive**: A physical storage device plugged into your Chromebook, located at `/mnt/chromeos/removable/USBdrive/askme`.

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
- Script: `sync_with_gdrive.sh`
- Place in `/workspaces/askme/` in Codespace.
- Usage:
  ```bash
  ./sync_with_gdrive.sh
  ```
- What it does: Uploads new/changed files from Codespace to Google Drive, then downloads new files from Google Drive to Codespace.

##### **2. Chromebook USB <-> Google Drive**
- Script: `sync_usb_with_gdrive.sh`
- Place on your Chromebook USB at `/mnt/chromeos/removable/USBdrive/askme/`.
- Usage:
  ```bash
  chmod +x /mnt/chromeos/removable/USBdrive/askme/sync_usb_with_gdrive.sh
  /mnt/chromeos/removable/USBdrive/askme/sync_usb_with_gdrive.sh
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

### 1. Codespace <-> Google Drive Sync Script (`sync_with_gdrive.sh`)
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

### 2. Chromebook USB <-> Google Drive Sync Script (`sync_usb_with_gdrive.sh`)
```bash
#!/bin/bash
# Chromebook/USB sync script: keeps your USB drive and Google Drive folder 'askme-sync' in sync!
REMOTE="askme"
DRIVE_FOLDER="askme-sync"
USB_FOLDER="/mnt/chromeos/removable/USBdrive/askme"
echo "Uploading from USB to Google Drive..."
rclone sync "$USB_FOLDER" "$REMOTE:$DRIVE_FOLDER" --progress --exclude ".Trash-*/**"
echo "Downloading from Google Drive to USB..."
rclone sync "$REMOTE:$DRIVE_FOLDER" "$USB_FOLDER" --progress --exclude ".Trash-*/**"
echo "Sync complete! Your USB drive and Google Drive are now in sync."
```

### 3. Health Check & Auto-Restablish Script (`check_and_resync.sh`)
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
  ./sync_with_gdrive.sh
else
  echo "Sync is healthy!"
fi
```
- Place this script in your Codespace and run it to check and auto-fix sync issues.

---

## Summary
- **Codespace** = fast, flexible, cloud coding
- **USB Drive** = safe, portable, persistent storage
- **Google Drive** = your bridge for persistent, automated sharing!
- **Scripts** = your hands-off, reliable workflow

---

## You Did It!
You now have a robust, automated, and documented workflow for keeping your Codespace, Google Drive, and USB drive in sync—no manual file moving required. If you ever get stuck, just re-run the scripts or check the FAQ above. Happy building!
