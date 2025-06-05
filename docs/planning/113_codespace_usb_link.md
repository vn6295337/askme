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
- **Seamless Workflow**: You can install tools or libraries on the USB and use them in Codespace, or move files between the two easily.

---

## How Does the Link Work?

- **Shared Folders**: Certain folders (like `/mnt/chromeos/removable/USBdrive/askme`) are made accessible to both your Chromebook and the Codespace.
- **Symlinks or Mounts**: Sometimes, a "shortcut" (symlink) or a special mount is created so Codespace can see and use files on the USB as if they were local.
    - **Example:** In this project, a symlink was created in Codespace:
      ```bash
      ln -s /mnt/chromeos/removable/USBdrive/askme /workspaces/askme/usbdrive
      ```
      Now, you can access your USB files from `/workspaces/askme/usbdrive` in Codespace. This makes file sharing and persistent storage seamless between your cloud workspace and your Chromebook USB.
- **Scripts/Automation**: You may use scripts to sync files, install packages to the USB, or back up important data from Codespace to the USB.

---

## When Should You Use Each?

| Use Codespace for...         | Use USB Drive for...                |
|-----------------------------|-------------------------------------|
| Writing and testing code    | Storing large files or backups      |
| Running builds/compiling    | Keeping installed tools/libraries   |
| Quick experiments           | Anything you want to keep safe      |
| Collaboration (cloud)       | Moving files between devices        |

---

## Prerequisites

- **USB drive must be plugged in and mounted** on your Chromebook (usually at `/mnt/chromeos/removable/USBdrive/askme`).
- **Codespace must be set up** and have access to the USB path (sometimes via symlink or mount).
- **Permissions**: Codespace and your Chromebook user must have permission to read/write to the USB folder.

---

## Simple Diagram

```
+-------------------+         +-----------------------------+
|   Codespace       | <-----> |  USB Drive on Chromebook    |
| (Cloud workspace) |         | /mnt/chromeos/removable/... |
+-------------------+         +-----------------------------+
         |                                 |
         |  (Symlink, mount, or script)    |
         +---------------------------------+
```

---

## Common Questions

**Q: What happens if Codespace is deleted?**
- Your files on the USB drive are safe and unchanged.

**Q: Can I use the USB drive on another computer?**
- Yes! Just plug it in and access your files.

**Q: How do I move files between Codespace and USB?**
- Use the file explorer, terminal commands, or scripts to copy/move files as needed.

**Q: Why not just use Codespace for everything?**
- Codespace is temporary and cloud-based. The USB drive is for anything you want to keep safe, portable, or use outside the cloud.

---

## Summary
- **Codespace** = fast, flexible, cloud coding
- **USB Drive** = safe, portable, persistent storage
- **The link** lets you get the best of both worlds!
