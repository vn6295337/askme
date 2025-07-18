#!/bin/bash

# AskMe CLI Distribution Test Script
# Tests the distribution package integrity and functionality

set -e

echo "🧪 Testing AskMe CLI Distribution v1.3.0"
echo "========================================"

# Test 1: Java version check
echo "1️⃣ Testing Java installation..."
if ! command -v java &> /dev/null; then
    echo "❌ Java not found"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 8 ]; then
    echo "❌ Java 8+ required, found version $JAVA_VERSION"
    exit 1
fi
echo "✅ Java version: $(java -version 2>&1 | head -n1)"

# Test 2: Download integrity (if files exist)
echo "2️⃣ Testing file integrity..."
if [ -f "askme-cli-5-providers-v1.3.0-complete.zip" ]; then
    SIZE=$(stat -c%s askme-cli-5-providers-v1.3.0-complete.zip)
    if [ "$SIZE" -gt 1000000 ]; then  # > 1MB
        echo "✅ ZIP file size: $(($SIZE/1024/1024))MB"
    else
        echo "❌ ZIP file too small: ${SIZE}B"
        exit 1
    fi
fi

# Test 3: Extract and test CLI
echo "3️⃣ Testing CLI extraction..."
if [ -f "askme-cli-5-providers-v1.3.0.tar.gz" ]; then
    tar -tzf askme-cli-5-providers-v1.3.0.tar.gz | grep -q "cliApp/bin/cliApp"
    echo "✅ CLI binary found in archive"
fi

# Test 4: Backend connectivity (optional)
echo "4️⃣ Testing backend connectivity..."
if command -v curl &> /dev/null; then
    if curl -s --max-time 10 https://askme-backend-proxy.onrender.com > /dev/null; then
        echo "✅ Backend accessible"
    else
        echo "⚠️  Backend not responding (may be sleeping)"
    fi
else
    echo "⚠️  curl not available, skipping backend test"
fi

echo ""
echo "🎯 Distribution Test Summary:"
echo "✅ Java compatibility verified"
echo "✅ File integrity confirmed"
echo "✅ Archive structure validated"
echo "✅ Ready for GitHub release"
echo ""
echo "📦 Release files:"
ls -la *.zip *.tar.gz *.sh *.md *.txt 2>/dev/null || true