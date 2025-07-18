# AskMe CLI - GitHub Release Distribution Guide

## 📦 Streamlined Distribution Process

This guide explains how to create and maintain proper GitHub releases for the AskMe CLI distribution.

## 🎯 Problem Solved

**Before**: GitHub dist/ folder contained only placeholder files (1.3KB)
**After**: Complete distribution with all dependencies (7.2MB)

## 📁 Release Structure

```
releases/v1.3.0/
├── askme-cli-5-providers-v1.3.0-complete.zip    # Complete distribution (7.2MB)
├── askme-cli-5-providers-v1.3.0.tar.gz          # TAR.GZ format (6.8MB)
├── install.sh                                    # One-line installer
├── test-distribution.sh                          # Distribution tester
├── CHECKSUMS.txt                                 # SHA256 checksums
└── RELEASE_NOTES.md                              # Release documentation
```

## 🚀 Creating a New Release

### 1. Build Distribution
```bash
# From project root
./gradlew build
./gradlew installDist

# Create distribution archive
cd cliApp/build/install
tar -czf askme-cli-5-providers-v1.3.0.tar.gz cliApp/
zip -r askme-cli-5-providers-v1.3.0-complete.zip cliApp/
```

### 2. Prepare Release Assets
```bash
mkdir -p releases/v1.3.0
cp distributions/* releases/v1.3.0/
```

### 3. Generate Checksums
```bash
cd releases/v1.3.0
sha256sum *.zip *.tar.gz > CHECKSUMS.txt
```

### 4. Test Distribution
```bash
./test-distribution.sh
```

### 5. Create GitHub Release
```bash
# Using GitHub CLI
gh release create v1.3.0 \
  --title "AskMe CLI 5-Provider Distribution v1.3.0" \
  --notes-file RELEASE_NOTES.md \
  releases/v1.3.0/*
```

## 📋 Release Checklist

### Pre-Release
- [ ] All 5 providers tested and working
- [ ] Backend connectivity verified
- [ ] Java compatibility tested (8+)
- [ ] Distribution size > 5MB (full package)
- [ ] CLI executable permissions set
- [ ] Dependencies included in lib/ folder

### Release Assets
- [ ] Complete ZIP file (7+ MB)
- [ ] TAR.GZ alternative
- [ ] Installation script
- [ ] SHA256 checksums
- [ ] Release notes
- [ ] Test script

### Post-Release
- [ ] Install script tested
- [ ] Download links verified
- [ ] Documentation updated
- [ ] Docker image updated (if applicable)

## 🔧 Installation Methods

### Method 1: One-Line Install
```bash
curl -fsSL https://github.com/vn6295337/askme/releases/download/v1.3.0/install.sh | bash
```

### Method 2: Manual Download
```bash
# Download and extract
wget https://github.com/vn6295337/askme/releases/download/v1.3.0/askme-cli-5-providers-v1.3.0.tar.gz
tar -xzf askme-cli-5-providers-v1.3.0.tar.gz
chmod +x askme-cli-5-providers-v1.3.0/cliApp/bin/cliApp
```

### Method 3: Docker
```bash
# Build from source
docker build -t askme-cli .
docker run askme-cli "What is machine learning?"
```

## 🔍 Verification

### File Integrity
```bash
# Download checksums
curl -O https://github.com/vn6295337/askme/releases/download/v1.3.0/CHECKSUMS.txt

# Verify
sha256sum -c CHECKSUMS.txt
```

### Functionality Test
```bash
# Basic test
askme --help

# Provider test
askme "Test question" --model google

# Stats check
askme --stats
```

## 🐛 Common Issues & Solutions

### Issue: Small ZIP file (1-2KB)
**Problem**: Only README/test files included
**Solution**: Use complete distribution from build/install

### Issue: "Command not found: askme"
**Problem**: Not in PATH or permissions
**Solution**: Check $HOME/.local/bin in PATH, verify executable permissions

### Issue: Java not found
**Problem**: Java not installed or wrong version
**Solution**: Install Java 8+ before running

### Issue: Backend timeout
**Problem**: Backend sleeping or unreachable
**Solution**: Wait 30-60 seconds, try different provider

## 📈 Release Metrics

Track these metrics for each release:
- Download count
- Installation success rate
- Provider connectivity
- User feedback
- Backend performance

## 🔄 Automated Pipeline (Future)

```yaml
# .github/workflows/release.yml
name: Create Release
on:
  push:
    tags: ['v*']
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Distribution
        run: ./gradlew build installDist
      - name: Create Release
        run: gh release create ${{ github.ref_name }} dist/*
```

## 📝 Notes

- Always test on fresh system before release
- Keep distribution under 10MB when possible
- Include clear installation instructions
- Maintain backward compatibility
- Document breaking changes clearly