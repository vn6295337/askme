#!/bin/bash
# Git Workflow Validation Test Suite
# Run this to validate your Git setup is safe and working correctly

set -e  # Exit on any error

LOG_FILE="/tmp/git_validation_$(date +%Y%m%d_%H%M%S).log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "🧪 Starting Git Workflow Validation Tests..."
echo "============================================"

# Test 1: Repository Integrity Check
echo "Test 1: Repository Integrity"
echo "----------------------------"
cd /workspaces/askme
if git fsck --full --strict > /dev/null 2>&1; then
    echo "✅ Git repository is healthy"
else
    echo "❌ Git repository has integrity issues!"
    git fsck --full --strict
    exit 1
fi

# Test 2: Remote Connectivity
echo -e "\nTest 2: Remote Connectivity"
echo "---------------------------"
if git ls-remote origin > /dev/null 2>&1; then
    echo "✅ Can connect to remote repository"
else
    echo "❌ Cannot connect to remote repository"
    exit 1
fi

# Test 3: File Sync Exclusion Test
echo -e "\nTest 3: File Sync Safety (Git Exclusion)"
echo "----------------------------------------"
# Create test file that should NOT be synced
mkdir -p .git/test_dir
echo "test" > .git/test_file

# Run sync command (dry run)
rclone sync /workspaces/askme askme:askme-sync --dry-run --exclude ".git/**" > sync_test.log 2>&1

if grep -q "\.git" sync_test.log; then
    echo "❌ WARNING: Git files might be synced!"
    grep "\.git" sync_test.log
    exit 1
else
    echo "✅ Git files properly excluded from sync"
fi

# Cleanup
rm -rf .git/test_dir .git/test_file sync_test.log

# Test 4: Concurrent Operation Safety
echo -e "\nTest 4: Concurrent Operation Safety"
echo "-----------------------------------"
# Create a test commit
echo "Test file $(date)" > test_concurrent.txt
git add test_concurrent.txt
git commit -m "Test concurrent operations - $(date)" > /dev/null

# Start background sync (non-Git files only)
rclone sync /workspaces/askme askme:askme-sync --exclude ".git/**" > /dev/null 2>&1 &
SYNC_PID=$!

# Perform Git operations while sync is running
echo "Another test $(date)" > test_concurrent2.txt
git add test_concurrent2.txt
if git commit -m "Second concurrent test - $(date)" > /dev/null 2>&1; then
    echo "✅ Git operations work during file sync"
else
    echo "❌ Git operations failed during sync"
    kill $SYNC_PID 2>/dev/null || true
    exit 1
fi

# Wait for sync to complete
wait $SYNC_PID

# Cleanup test files
git rm test_concurrent.txt test_concurrent2.txt > /dev/null 2>&1
git commit -m "Cleanup test files" > /dev/null 2>&1

# Test 5: Backup Creation
echo -e "\nTest 5: Git Bundle Backup"
echo "-------------------------"
BACKUP_DIR="/tmp/askme_test_backup"
mkdir -p "$BACKUP_DIR"
BUNDLE_FILE="$BACKUP_DIR/test_backup_$(date +%Y%m%d_%H%M%S).bundle"

if git bundle create "$BUNDLE_FILE" --all > /dev/null 2>&1; then
    echo "✅ Git bundle backup created successfully"
    # Verify bundle
    if git bundle verify "$BUNDLE_FILE" > /dev/null 2>&1; then
        echo "✅ Bundle verification passed"
    else
        echo "❌ Bundle verification failed"
        exit 1
    fi
else
    echo "❌ Failed to create Git bundle"
    exit 1
fi

# Cleanup
rm -rf "$BACKUP_DIR"

# Test 6: Recovery Simulation
echo -e "\nTest 6: Recovery Simulation"
echo "---------------------------"
# Save current state
CURRENT_COMMIT=$(git rev-parse HEAD)

# Create recovery test directory
RECOVERY_DIR="/tmp/recovery_test"
rm -rf "$RECOVERY_DIR"
mkdir -p "$RECOVERY_DIR"

# Simulate cloning from remote
cd "$RECOVERY_DIR"
if git clone "$(cd /workspaces/askme && git remote get-url origin)" recovery_repo > /dev/null 2>&1; then
    echo "✅ Repository can be recovered from remote"
    cd recovery_repo
    RECOVERED_COMMIT=$(git rev-parse HEAD)
    
    if [ "$CURRENT_COMMIT" = "$RECOVERED_COMMIT" ]; then
        echo "✅ Recovered repository matches current state"
    else
        echo "⚠️  Recovered repository differs from current state"
        echo "   Current:  $CURRENT_COMMIT"
        echo "   Recovered: $RECOVERED_COMMIT"
    fi
else
    echo "❌ Failed to recover repository from remote"
    exit 1
fi

# Cleanup
cd /workspaces/askme
rm -rf "$RECOVERY_DIR"

# Test 7: Sync Status Check
echo -e "\nTest 7: File Sync Status"
echo "------------------------"
# Check if files are in sync (excluding .git)
if rclone check /workspaces/askme askme:askme-sync --exclude ".git/**" --quiet > /dev/null 2>&1; then
    echo "✅ Files are in sync with Google Drive"
else
    echo "⚠️  Some files may be out of sync"
    echo "   Run: rclone check /workspaces/askme askme:askme-sync --exclude \".git/**\""
fi

# Test 8: Disk Space and Performance
echo -e "\nTest 8: Performance Check"
echo "-------------------------"
# Check available space
AVAILABLE_SPACE=$(df /workspaces/askme | tail -1 | awk '{print $4}')
echo "Available space: ${AVAILABLE_SPACE}KB"

# Time a Git operation
START_TIME=$(date +%s%N)
git status > /dev/null
END_TIME=$(date +%s%N)
DURATION=$((($END_TIME - $START_TIME) / 1000000))  # Convert to milliseconds

echo "Git status time: ${DURATION}ms"
if [ $DURATION -lt 1000 ]; then
    echo "✅ Git performance is good"
else
    echo "⚠️  Git operations are slow (${DURATION}ms)"
fi

# Final Summary
echo -e "\n🎉 Validation Complete!"
echo "======================="
echo "All critical tests passed. Your Git workflow is configured safely."
echo ""
echo "Recommendations:"
echo "- Run 'git push' frequently to keep remote backup current"
echo "- Create Git bundles weekly for additional backup"
echo "- Monitor sync logs for any conflicts or errors"
echo "- Never run Git commands on synced .git folders"
echo ""
echo "To run ongoing health checks:"
echo "  ./validate_setup.sh"
echo ""
echo "For emergency recovery:"
echo "  1. git clone <your-remote-url>"
echo "  2. rclone sync askme:askme-sync . --exclude \".git/**\""
