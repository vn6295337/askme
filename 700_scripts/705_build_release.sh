#!/bin/bash
# AskMe CLI Release Builder

set -e

VERSION=${1:-"1.0.0"}
BUILD_DIR="build-release"
DIST_DIR="dist"

echo "🚀 Building AskMe CLI v$VERSION for release..."

# Clean previous builds
rm -rf $BUILD_DIR $DIST_DIR
mkdir -p $BUILD_DIR $DIST_DIR

# Navigate to CLI project
cd 300_implementation/askme-cli

echo "📦 Building CLI application..."
./gradlew clean cliApp:installDist

echo "📁 Preparing distribution..."
cd ../../

# Copy CLI distribution
cp -r 300_implementation/askme-cli/cliApp/build/install/cliApp $BUILD_DIR/askme-cli

# Create additional files for distribution
cat > $BUILD_DIR/askme-cli/README.md << EOF
# AskMe CLI v$VERSION

## Quick Start
1. Make executable: chmod +x bin/askme
2. Add to PATH or run directly: ./bin/askme "your question"
3. Configure API keys: ./bin/askme --setup

## Documentation
Visit: https://github.com/vn6295337/askme
EOF

cat > $BUILD_DIR/askme-cli/VERSION << EOF
$VERSION
EOF

# Create tarball
echo "📦 Creating release archive..."
cd $BUILD_DIR
tar -czf ../dist/askme-cli-v$VERSION.tar.gz askme-cli/
cd ..

# Create checksums
echo "🔐 Generating checksums..."
cd dist
sha256sum askme-cli-v$VERSION.tar.gz > askme-cli-v$VERSION.sha256
cd ..

echo "✅ Release build complete!"
echo "📄 Files created:"
echo "   dist/askme-cli-v$VERSION.tar.gz"
echo "   dist/askme-cli-v$VERSION.sha256"