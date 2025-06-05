#!/bin/bash
# Quick diagnostic script to identify issues before full validation

echo "🔍 Quick Git-Rclone Diagnostic"
echo "=============================="

# Check basic setup
echo "1. Current directory and Git status:"
pwd
git status --porcelain | head -5
echo ""

# Check rclone config
echo "2. Rclone remote test:"
echo "Testing basic rclone connectivity..."
timeout 10s rclone lsd askme: 2>&1 | head -5
echo ""

# Check repository size
echo "3. Repository size analysis:"
echo "Git repository size:"
du -sh .git 2>/dev/null || echo "Cannot access .git directory"
echo "Total directory size (excluding .git):"
du -sh --exclude='.git' . 2>/dev/null || echo "Cannot calculate size"
echo "File count (excluding .git):"
find . -not -path './.git*' -type f | wc -l
echo ""

# Test exclude patterns quickly
echo "4. Testing exclude patterns:"
GIT_EXCLUDES="--exclude .git/** --exclude .gitignore --exclude .gitattributes --exclude .gitmodules --exclude .github/** --exclude .git"

echo "Files that would be synced (first 10):"
timeout 10s rclone lsf . $GIT_EXCLUDES 2>/dev/null | head -10 || {
    echo "❌ Cannot list files with exclude patterns"
    echo "This might indicate:"
    echo "  - Rclone configuration issues"
    echo "  - Very large repository"
    echo "  - Network connectivity problems"
    exit 1
}

echo ""
echo "Checking for Git files in sync list:"
timeout 10s rclone lsf . $GIT_EXCLUDES 2>/dev/null | grep -E "(\.git|\.github)" && {
    echo "❌ Git files found in sync list!"
    echo "Exclude patterns may not be working correctly"
} || {
    echo "✅ No Git files found in sync list"
}

echo ""
echo "5. Resource usage:"
echo "Available memory:"
free -h | grep "Mem:"
echo "Available disk space:"
df -h . | tail -1

echo ""
echo "🏁 Diagnostic complete!"
echo "If all looks good, run the full validation script."
