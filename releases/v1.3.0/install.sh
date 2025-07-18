#!/bin/bash

# AskMe CLI 5-Provider Distribution v1.3.0 Installation Script
# This script downloads and installs the AskMe CLI tool

set -e

VERSION="v1.3.0"
REPO_URL="https://github.com/vn6295337/askme"
DOWNLOAD_URL="$REPO_URL/releases/download/$VERSION/askme-cli-5-providers-v1.3.0.tar.gz"
INSTALL_DIR="$HOME/.askme"
BIN_DIR="$HOME/.local/bin"

echo "🤖 AskMe CLI 5-Provider Distribution $VERSION"
echo "==============================================="

# Check Java installation
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install Java 8+ first."
    echo "   Ubuntu/Debian: sudo apt install openjdk-17-jdk"
    echo "   macOS: brew install openjdk@17"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 8 ]; then
    echo "❌ Java 8+ is required. Current version: $JAVA_VERSION"
    exit 1
fi

echo "✅ Java version: $(java -version 2>&1 | head -n1)"

# Create directories
mkdir -p "$INSTALL_DIR" "$BIN_DIR"

# Download distribution
echo "⬇️  Downloading AskMe CLI..."
if command -v curl &> /dev/null; then
    curl -L -o "$INSTALL_DIR/askme-cli.tar.gz" "$DOWNLOAD_URL"
elif command -v wget &> /dev/null; then
    wget -O "$INSTALL_DIR/askme-cli.tar.gz" "$DOWNLOAD_URL"
else
    echo "❌ Neither curl nor wget is available. Please install one of them."
    exit 1
fi

# Extract distribution
echo "📦 Extracting..."
cd "$INSTALL_DIR"
tar -xzf askme-cli.tar.gz
rm askme-cli.tar.gz

# Make executable
chmod +x askme-cli-5-providers-v1.3.0/cliApp/bin/cliApp

# Create symlink in PATH
ln -sf "$INSTALL_DIR/askme-cli-5-providers-v1.3.0/cliApp/bin/cliApp" "$BIN_DIR/askme"

# Test installation
echo "🧪 Testing installation..."
if "$BIN_DIR/askme" --help > /dev/null 2>&1; then
    echo "✅ Installation successful!"
    echo ""
    echo "🎯 Usage:"
    echo "   askme \"What is machine learning?\""
    echo "   askme \"Write Python code\" --model mistral"
    echo "   askme --stats"
    echo "   askme --help"
    echo ""
    echo "📁 Installed to: $INSTALL_DIR"
    echo "🔗 Symlink created: $BIN_DIR/askme"
    echo ""
    echo "⚠️  Make sure $BIN_DIR is in your PATH:"
    echo "   export PATH=\"$BIN_DIR:\$PATH\""
    echo "   Add this to your ~/.bashrc or ~/.zshrc"
else
    echo "❌ Installation test failed"
    exit 1
fi