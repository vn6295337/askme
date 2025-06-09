# AskMe Lite: Complete Installation & Configuration Guide v3.1
**Senior DevOps System Architecture - 4-Tier Storage Configuration**

## 🎯 Executive Summary
This guide provides a **validated, step-by-step installation process** for the AskMe Lite multi-environment development setup, fully aligned with the **Hybrid 4-Tier Sync Architecture** and incorporating all manager feedback improvements.

**Architecture Overview:**
- **TIER 1 (USB)**: Full development environment (50GB capacity)
- **TIER 2 (Google Drive)**: Essential files only (14GB capacity)
- **TIER 3 (Box.com)**: Backup and overflow (10GB capacity)
- **TIER 4 (Mega.nz)**: Archive and large files (20GB capacity)

**Removed**: TIER 5 (Codespace) - No longer part of architecture

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] 64GB+ USB drive (for TIER 1)
- [ ] Google Drive account (15GB free)
- [ ] Box.com account (10GB free)
- [ ] Mega.nz account (20GB free)
- [ ] GitHub account (for repository hosting only)
- [ ] Chromebook with Crostini Linux enabled

---

## 🔧 PHASE 1: Foundation Setup

### 1. **JDK 17 Installation & Configuration**
**What**: OpenJDK 17.0.10+ (LTS) - Validated for all Android development
**Where**: All tiers with environment-specific configurations
**How**:

```bash
# Crostini/Linux Installation
sudo apt update && sudo apt install openjdk-17-jdk

# USB Portable Installation (TIER 1)
export USB_PATH="/mnt/chromeos/removable/USBdrive/askme"
mkdir -p $USB_PATH/tools/jdk17
# Download OpenJDK 17 portable to $USB_PATH/tools/jdk17/

# Environment Configuration
echo 'export JAVA_HOME="$USB_PATH/tools/jdk17"' >> ~/.bashrc
echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Validation
java -version  # Must show 17.0.10+
```

**Storage Tier Mapping**:
- Binaries: TIER 1 (USB)
- Configuration: TIER 2 (Google Drive)

### 2. **Kotlin 1.9.10 Installation (Version-Corrected)**
**What**: Kotlin 1.9.10 (corrected from 1.9.22 for Compose compatibility)
**Where**: All development environments
**How**:

```bash
# Install SDKMAN
curl -s "https://get.sdkman.io" | bash
source ~/.sdkman/bin/sdkman-init.sh

# Install Specific Kotlin Version (CRITICAL: 1.9.10)
sdk install kotlin 1.9.10
sdk use kotlin 1.9.10
sdk default kotlin 1.9.10

# Validation
kotlin -version  # Must show exactly 1.9.10
```

**Storage Tier Mapping**:
- SDK binaries: TIER 1 (USB)
- SDK cache: Excluded from cloud sync
- Configuration: TIER 2 (Google Drive)

### 3. **Gradle 8.4 Setup (Compatibility-Aligned)**
**What**: Gradle 8.4 (aligned with Kotlin 1.9.10 compatibility matrix)
**Where**: Primary development environments
**How**:

```bash
# Via SDKMAN
sdk install gradle 8.4
sdk use gradle 8.4
sdk default gradle 8.4

# Validation
gradle --version  # Must show 8.4
gradle --version | grep "Kotlin version"  # Verify compatibility
```

**Storage Tier Mapping**:
- Gradle binaries: TIER 1 (USB)
- Gradle cache: TIER 1 (USB) - Excluded from cloud
- Wrapper files: TIER 2 (Google Drive)

### 4. **Android Studio & SDK Setup**
**What**: Android Studio (latest stable) + Android SDK 34 + Build Tools
**Where**: Primarily TIER 1 (USB) with config backup
**How**:

```bash
# Create Android environment structure
mkdir -p $USB_PATH/tools/{android-studio,android-sdk}

# Set Android environment variables
echo 'export ANDROID_HOME="$USB_PATH/tools/android-sdk"' >> ~/.bashrc
echo 'export PATH="$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools"' >> ~/.bashrc
source ~/.bashrc

# Download and extract Android Studio to $USB_PATH/tools/android-studio/

# Install required SDK components
$ANDROID_HOME/tools/bin/sdkmanager "platforms;android-34"
$ANDROID_HOME/tools/bin/sdkmanager "build-tools;34.0.0"
$ANDROID_HOME/tools/bin/sdkmanager "platform-tools"

# Validation
$ANDROID_HOME/tools/bin/sdkmanager --list | grep "platforms;android-34"
```

**Storage Tier Mapping**:
- IDE binaries: TIER 1 (USB) only
- SDK: TIER 1 (USB) only
- IDE settings: TIER 2 (Google Drive)
- Build cache: Excluded from sync

---

## 🔧 PHASE 2: Version Control & Cloud Setup

### 5. **Git Multi-Remote Configuration**
**What**: Git 2.40+ with multi-remote setup aligned with sync script
**Where**: All environments
**How**:

```bash
# Install Git (if needed)
sudo apt install git

# Global Git configuration
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
git config --global pull.rebase false

# Project-specific multi-remote setup
cd $USB_PATH/src/askme-lite
git remote add origin https://github.com/yourusername/askme-lite.git
git remote add backup https://github.com/yourusername/askme-lite-backup.git

# Validation
git remote -v  # Must show both remotes
git config --list | grep user
```

**Storage Tier Mapping**:
- Git binaries: All tiers
- .gitconfig: TIER 2 (Google Drive)
- Repositories: TIER 1 (USB) primary
- .git objects: Filtered per tier (large packs excluded from cloud)

### 6. **rclone Installation & Remote Configuration**
**What**: rclone (latest stable) for orchestrating tiered sync
**Where**: All environments with cloud access
**How**:

```bash
# Install rclone
curl https://rclone.org/install.sh | sudo bash

# Configure cloud remotes (EXACT names match master_sync.sh)
rclone config

# Configure these remotes:
# 1. Name: askme (Google Drive)
# 2. Name: askme-box (Box.com)
# 3. Name: askme-mega (Mega.nz)

# Test each remote
rclone about askme:
rclone about askme-box:
rclone about askme-mega:

# Validation
rclone listremotes  # Must show: askme:, askme-box:, askme-mega:
```

**Storage Tier Mapping**:
- rclone binary: All tiers
- rclone config: TIER 2 (Google Drive)
- Cache: TIER 1 (USB) only

### 7. **USB Drive Structure Setup**
**What**: Organized directory structure matching 4-tier sync expectations
**Where**: TIER 1 (USB Primary)
**How**:

```bash
# Create complete USB structure
export USB_PATH="/mnt/chromeos/removable/USBdrive/askme"
mkdir -p $USB_PATH/{src,tools,docs,backups,logs}
mkdir -p $USB_PATH/tools/{jdk17,android-studio,android-sdk,localai}
mkdir -p $USB_PATH/src/askme-lite

# Copy and configure sync script (updated for 4-tier)
cp master_sync.sh $USB_PATH/
chmod +x $USB_PATH/master_sync.sh

# Set proper permissions
chmod 755 $USB_PATH
find $USB_PATH -type d -exec chmod 755 {} \;

# Create environment configuration
echo 'export USB_PATH="/mnt/chromeos/removable/USBdrive/askme"' >> ~/.bashrc
echo 'export ASKME_ENV="chromebook"' >> ~/.bashrc
echo 'alias sync-tiers="$USB_PATH/master_sync.sh"' >> ~/.bashrc
source ~/.bashrc

# Validation
ls -la $USB_PATH  # Must show all expected directories
sync-tiers  # Should display 4-tier sync menu
```

**Storage Tier Mapping**:
- Structure: TIER 1 (USB) - Master copy
- Backup structure: TIER 2 (Google Drive)

---

## 🔧 PHASE 3: Project Initialization

### 8. **Kotlin Multiplatform Project Setup**
**What**: KMP project with corrected version alignment
**Where**: TIER 1 (USB) primary, TIER 2 (Google Drive) essential sync
**How**:

```bash
cd $USB_PATH/src
mkdir -p askme-lite/{gradle,app,shared,cli}
cd askme-lite

# Create CORRECTED libs.versions.toml
mkdir -p gradle
cat > gradle/libs.versions.toml << 'EOF'
[versions]
kotlin = "1.9.10"  # CORRECTED from 1.9.22
gradle = "8.4"     # CORRECTED alignment
agp = "8.1.4"      # Stable version
compose-bom = "2023.10.01"  # BOM approach
compose-compiler = "1.5.4"   # Aligned with Kotlin 1.9.10
detekt = "1.23.4"
ktlint = "0.50.0"

# Security libraries (corrected versions)
security-crypto = "1.0.0"  # CORRECTED from alpha06 to stable

[libraries]
# Compose BOM approach (CORRECTED)
compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "compose-bom" }
compose-ui = { group = "androidx.compose.ui", name = "ui" }
compose-material3 = { group = "androidx.compose.material3", name = "material3" }

# Security (CORRECTED to stable)
security-crypto = { group = "androidx.security", name = "security-crypto", version.ref = "security-crypto" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-multiplatform = { id = "org.jetbrains.kotlin.multiplatform", version.ref = "kotlin" }
EOF

# Initialize Gradle wrapper with exact version
gradle wrapper --gradle-version 8.4

# Validation
./gradlew --version  # Must show Gradle 8.4
./gradlew projects  # Should list project structure
```

**Storage Tier Mapping**:
- Source code: TIER 1 (USB), TIER 2 (Google Drive)
- Build outputs: TIER 1 (USB) only - Excluded from cloud
- Gradle cache: TIER 1 (USB) only - Excluded from cloud

### 9. **Dependency Resolution & Caching**
**What**: Pre-load and validate all project dependencies
**Where**: TIER 1 (USB) for offline development capability
**How**:

```bash
cd $USB_PATH/src/askme-lite

# Pre-download dependencies with version validation
./gradlew dependencies --refresh-dependencies

# Verify critical dependencies match versions
./gradlew dependencyInsight --dependency kotlin-stdlib
./gradlew dependencyInsight --dependency compose-bom

# Build project to validate configuration
./gradlew build

# Validation
./gradlew tasks --group="build"  # Should show all available tasks
find ~/.gradle/caches -name "*.jar" | wc -l  # Should show cached JARs
```

**Storage Tier Mapping**:
- Gradle cache: TIER 1 (USB) only
- Downloaded dependencies: TIER 1 (USB) only
- Build reports: TIER 1 (USB) only

---

## 🔧 PHASE 4: LLM Provider Setup (3+ Providers)

### 10. **Ollama Installation & Configuration**
**What**: Ollama for local LLM inference (Provider #1)
**Where**: TIER 1 (USB) binaries, TIER 4 (Mega) models
**How**:

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Download and test a model
ollama pull llama2:7b-chat

# Test functionality
ollama list  # Should show downloaded models
echo "Hello, how are you?" | ollama run llama2:7b-chat

# Configure for USB storage
mkdir -p $USB_PATH/tools/ollama/models
export OLLAMA_MODELS="$USB_PATH/tools/ollama/models"
echo 'export OLLAMA_MODELS="$USB_PATH/tools/ollama/models"' >> ~/.bashrc
```

**Storage Tier Mapping**:
- Ollama binary: TIER 1 (USB), All environments
- Models: TIER 4 (Mega) - Archive tier
- Configuration: TIER 2 (Google Drive)

### 11. **LocalAI Installation (Provider #2)**
**What**: LocalAI as alternative/backup LLM provider
**Where**: TIER 1 (USB) portable installation
**How**:

```bash
# Download LocalAI binary
mkdir -p $USB_PATH/tools/localai
cd $USB_PATH/tools/localai

# Download latest LocalAI
wget https://github.com/go-skynet/LocalAI/releases/download/v1.40.0/local-ai-Linux-x86_64
mv local-ai-Linux-x86_64 localai
chmod +x localai

# Test installation
./localai --help  # Should show help output

# Add to PATH
echo 'export PATH="$USB_PATH/tools/localai:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

**Storage Tier Mapping**:
- Binary: TIER 1 (USB) only
- Configuration: TIER 2 (Google Drive)
- Models: TIER 4 (Mega) - Archive tier

### 12. **Hugging Face Transformers Setup (Provider #3)**
**What**: Python-based transformer models (completes 3+ provider requirement)
**Where**: TIER 1 (USB) and local Python environment
**How**:

```bash
# Install Python dependencies
pip install --user transformers torch torchvision torchaudio

# Test installation
python -c "
from transformers import pipeline
classifier = pipeline('sentiment-analysis')
result = classifier('Hello world!')
print('HF Transformers working:', result)
"

# Create model cache on USB
mkdir -p $USB_PATH/tools/huggingface/cache
export HF_HOME="$USB_PATH/tools/huggingface/cache"
echo 'export HF_HOME="$USB_PATH/tools/huggingface/cache"' >> ~/.bashrc

# Validation
python -c "import transformers; print('Transformers version:', transformers.__version__)"
```

**Storage Tier Mapping**:
- Python packages: Local user installation
- Model cache: TIER 1 (USB)
- Large models: TIER 4 (Mega) - Archive tier

---

## 🔧 PHASE 5: Environment-Specific Configuration

### 13. **Chromebook/Crostini Optimization**
**What**: Chrome OS specific configurations with exact path alignment
**Where**: Crostini Linux container
**How**:

```bash
# Enable USB access in Chrome OS
# Settings > Linux > USB devices > Enable your USB drive

# Configure mount points (EXACT match with 4-tier sync)
echo '# AskMe Environment Configuration' >> ~/.bashrc
echo 'export USB_PATH="/mnt/chromeos/removable/USBdrive/askme"' >> ~/.bashrc
echo 'export ASKME_ENV="chromebook"' >> ~/.bashrc
echo 'alias sync-tiers="$USB_PATH/master_sync.sh"' >> ~/.bashrc

# Create desktop shortcut for sync
mkdir -p ~/.local/share/applications
cat > ~/.local/share/applications/askme-sync.desktop << 'EOF'
[Desktop Entry]
Name=AskMe 4-Tier Sync
Comment=Launch 4-tier synchronization
Exec=/mnt/chromeos/removable/USBdrive/askme/master_sync.sh
Icon=folder-sync
Terminal=true
Type=Application
EOF

# Reload configuration
source ~/.bashrc

# Validation
echo $USB_PATH  # Must show /mnt/chromeos/removable/USBdrive/askme
sync-tiers      # Should display 4-tier sync menu
```

**Storage Tier Mapping**:
- Configuration: TIER 2 (Google Drive)
- Desktop shortcuts: Local only
- Environment variables: TIER 2 (Google Drive)

### 14. **Alternative Development Environment Setup**
**What**: Local development environment configuration (instead of Codespace)
**Where**: Chromebook/Linux native environment
**How**:

```bash
# Create local development workspace
mkdir -p ~/askme-dev
cd ~/askme-dev

# Create symbolic links to USB for faster access
ln -s $USB_PATH/src/askme-lite ./askme-lite
ln -s $USB_PATH/tools ./tools

# Set up local environment variables
echo '# Local AskMe Development Environment' >> ~/.bashrc
echo 'export ASKME_LOCAL_DEV="$HOME/askme-dev"' >> ~/.bashrc
echo 'export ASKME_ENV="local"' >> ~/.bashrc
echo 'alias askme-dev="cd $ASKME_LOCAL_DEV/askme-lite"' >> ~/.bashrc

# Create local IDE configuration directory
mkdir -p ~/.config/askme-lite

# Validation
askme-dev  # Should navigate to project
ls -la     # Should show project structure via symlink
```

**Storage Tier Mapping**:
- Local workspace: Not synced (symlinks only)
- IDE settings: TIER 2 (Google Drive)
- Development cache: Local only

### 15. **Code Quality Tools Setup**
**What**: Detekt 1.23.4 + ktlint 0.50.0 (versions from libs.versions.toml)
**Where**: All development environments
**How**:

```bash
cd $USB_PATH/src/askme-lite

# Add to build.gradle.kts
cat >> build.gradle.kts << 'EOF'

plugins {
    id("io.gitlab.arturbosch.detekt") version "1.23.4"
    id("org.jlleitschuh.gradle.ktlint") version "11.6.1"
}

detekt {
    config = files("$projectDir/detekt.yml")
    buildUponDefaultConfig = true
}
EOF

# Generate Detekt configuration
./gradlew detektGenerateConfig

# Run initial checks
./gradlew detekt
./gradlew ktlintCheck

# Validation
./gradlew tasks | grep -E "(detekt|ktlint)"  # Should show quality tasks
```

**Storage Tier Mapping**:
- Configuration files: TIER 2 (Google Drive)
- Reports: TIER 1 (USB) only
- Cache: TIER 1 (USB) only

---

## 🔧 PHASE 6: Sync Architecture Activation

### 16. **Security Filter Validation & Testing**
**What**: Comprehensive security testing before any cloud sync
**Where**: All environments before first sync
**How**:

```bash
# Test security filters with dry run
cd $USB_PATH
./master_sync.sh

# Select option 7: Test Sync (Dry Run)
# Test each tier individually:
# 1. Google Drive Essential
# 2. Box.com Backup  
# 3. Mega Archive

# Verify no credentials would sync
find $USB_PATH -name "*.keystore" -o -name "*.jks" -o -name ".env" -o -name "local.properties" -o -name "*secret*"

# Check filter files exclude credentials
ls -la $USB_PATH/.TIER*_filter
grep -E "(keystore|\.env|local\.properties|secret|key)" $USB_PATH/.TIER*_filter

# Validation - these should return no matches:
rclone lsf askme:askme-sync --dry-run | grep -E "(keystore|\.env|secret|key)"
```

**Storage Tier Mapping**:
- Security filters: All tiers
- Test logs: TIER 1 (USB) only
- Credential files: NEVER synced to cloud

### 17. **Initial Project Sync (Secure)**
**What**: First full project synchronization with validation
**Where**: From TIER 1 (USB) to all configured cloud tiers
**How**:

```bash
# Final pre-sync security check
find $USB_PATH -name "local.properties" -exec rm {} \;
find $USB_PATH -name "*.keystore" -exec ls -la {} \;  # Should be empty

# Run initial full backup
$USB_PATH/master_sync.sh
# Select option 4: Full Backup: USB → All Tiers

# Monitor sync progress
tail -f $USB_PATH/tiered_sync.log

# Post-sync validation
rclone ls askme:askme-sync | head -20
rclone ls askme-box:askme-sync | head -20
rclone ls askme-mega:askme-sync | head -20

# Verify no credentials synced
rclone ls askme:askme-sync | grep -E "(keystore|\.env|local\.properties|secret|key)"
# Should return no results

# Check tier sizes
$USB_PATH/master_sync.sh
# Select option 5: Tier Status Dashboard
```

**Storage Tier Mapping**:
- Full project: TIER 1 → TIER 2, TIER 3, TIER 4
- Security-filtered: All cloud tiers
- Complete logs: TIER 1 (USB) only

---

## 🚨 CRITICAL Misalignment Report & Corrections Applied

### **HIGH SEVERITY - CORRECTED**

#### ✅ **Issue #1: Kotlin Version Compatibility Crisis**
- **Original Problem**: libs.versions.toml specified Kotlin 1.9.22, causing Compose build failures
- **Root Cause**: Kotlin 1.9.22 incompatible with Compose Compiler 1.5.4
- **CORRECTION APPLIED**: Downgraded to Kotlin 1.9.10 throughout entire stack
- **Validation Required**: `kotlin -version` must show exactly 1.9.10

#### ✅ **Issue #2: Gradle Version Misalignment**  
- **Original Problem**: Multiple Gradle versions (8.2, 8.4, 8.6) causing build inconsistencies
- **Root Cause**: Version drift across environments
- **CORRECTION APPLIED**: Standardized on Gradle 8.4 across all environments
- **Validation Required**: `gradle --version` must show exactly 8.4

#### ✅ **Issue #3: Compose BOM Missing Implementation**
- **Original Problem**: Individual Compose library versions causing version conflicts
- **Root Cause**: No BOM (Bill of Materials) approach implemented
- **CORRECTION APPLIED**: Implemented Compose BOM 2023.10.01 with derived versions
- **Validation Required**: No compose version conflicts in dependency resolution

#### ✅ **Issue #4: Critical Security Vulnerability**
- **Original Problem**: Credential files could sync to cloud storage tiers
- **Root Cause**: Insufficient exclusion patterns in rclone filters
- **CORRECTION APPLIED**: Enhanced security filters with comprehensive credential exclusion
- **Validation Required**: Zero credential files in any cloud tier

#### ✅ **Issue #5: Incomplete LLM Provider Setup**
- **Original Problem**: Only 2 LLM providers, MVP requires 3+
- **Root Cause**: Missing third provider integration
- **CORRECTION APPLIED**: Added Hugging Face Transformers as third provider
- **Validation Required**: All 3 providers functional

#### ✅ **Issue #6: Codespace Dependency Removal**
- **Original Problem**: Codespace (TIER 5) no longer needed in architecture
- **Root Cause**: Architecture simplification required
- **CORRECTION APPLIED**: Removed all Codespace references, updated to 4-tier system
- **Validation Required**: Local development environment functional without Codespace

### **MEDIUM SEVERITY - CORRECTED**

#### ✅ **Issue #7: Storage Tier Size Miscalculations**
- **Original Problem**: .git exclusion too aggressive, breaking development workflow
- **Root Cause**: Filter logic excluded essential Git files
- **CORRECTION APPLIED**: Refined filters to exclude only large pack files while preserving Git functionality
- **Validation Required**: Git operations work across all tiers

#### ✅ **Issue #8: Android SDK Path Conflicts**
- **Original Problem**: ANDROID_HOME inconsistent across environments
- **Root Cause**: Environment-specific path handling missing
- **CORRECTION APPLIED**: Environment detection with consistent path validation
- **Validation Required**: Single ANDROID_HOME path across all environments

#### ✅ **Issue #9: Unstable Alpha Dependencies**
- **Original Problem**: androidx.security:security-crypto:1.1.0-alpha06 too unstable
- **Root Cause**: Latest alpha prioritized over stability
- **CORRECTION APPLIED**: Downgraded to stable 1.0.0 release
- **Validation Required**: Security crypto must be stable version

### **NEW IMPLEMENTATIONS ADDED**

#### ✅ **Enhancement #1: 4-Tier Architecture Optimization**
- **Implementation**: Removed Codespace tier, optimized for 4-tier system
- **Benefit**: Simplified architecture, reduced complexity, maintains full functionality
- **Validation Required**: All functionality works without Codespace dependency

#### ✅ **Enhancement #2: Local Development Environment**
- **Implementation**: Enhanced local development setup with symlinks and workspace
- **Benefit**: Fast local development without Codespace overhead
- **Validation Required**: Local environment provides full development capability

#### ✅ **Enhancement #3: Comprehensive Version Validation**
- **Implementation**: Added validation commands for each critical component
- **Benefit**: Prevents version conflicts before they cause build failures  
- **Validation Required**: All versions match compatibility matrix exactly

#### ✅ **Enhancement #4: Security-First Sync Architecture**
- **Implementation**: Multi-layer security validation before any sync operation
- **Benefit**: Zero risk of credential exposure to cloud storage
- **Validation Required**: No sensitive files in any cloud tier

---

## ✅ FINAL VALIDATION CHECKLIST

### **Core System Validation**
- [ ] JDK version shows exactly 17.0.10+ (`java -version`)
- [ ] Kotlin version shows exactly 1.9.10 (`kotlin -version`)  
- [ ] Gradle version shows exactly 8.4 (`gradle --version`)
- [ ] All environment variables properly set and persistent

### **Project Build Validation**
- [ ] libs.versions.toml matches compatibility matrix exactly
- [ ] Compose BOM approach implemented (no individual versions)
- [ ] Project builds successfully in all environments (`./gradlew build`)
- [ ] All dependency versions resolve without conflicts
- [ ] Code quality tools run without errors

### **LLM Provider Validation (3+ Required)**
- [ ] Ollama responds correctly (`ollama list`)
- [ ] LocalAI functional (`localai --help`)
- [ ] Hugging Face Transformers installed (`python -c "import transformers"`)
- [ ] All providers can perform basic inference

### **Sync Architecture Validation**
- [ ] All 3 rclone remotes configured (`rclone listremotes`)
- [ ] master_sync.sh displays 4-tier menu (not 5-tier)
- [ ] Dry-run completes successfully for all tiers
- [ ] Environment detection works correctly (`echo $ASKME_ENV`)
- [ ] USB_PATH matches script expectations exactly

### **Security Validation (CRITICAL)**
- [ ] No credential files exist in project (`find . -name "*.keystore"`)
- [ ] Security filters exclude all sensitive patterns
- [ ] Dry-run shows no credentials would sync
- [ ] Cloud tiers contain zero credential files
- [ ] All .env and local.properties excluded

### **Storage Tier Compliance (4-Tier)**
- [ ] TIER 1 (USB): Full development environment < 50GB
- [ ] TIER 2 (Google Drive): Essential files < 14GB  
- [ ] TIER 3 (Box.com): Backup < 10GB
- [ ] TIER 4 (Mega): Archive < 20GB

### **Multi-Environment Validation**
- [ ] Chromebook environment properly detected
- [ ] Local development environment properly configured
- [ ] USB path consistency across all environments
- [ ] Git multi-remote setup functional
- [ ] Environment switching works seamlessly

---

## 📊 Setup Metrics

**Total Setup Time**: 3-4 hours (complete 4-tier setup, reduced from 5-tier)
**Storage Requirements**: 
- USB Drive: 64GB+ recommended
- Total Cloud: ~44GB across 3 providers

**Maintenance Schedule**:
- **Weekly**: Sync validation, tier status check
- **Monthly**: Dependency updates, security audit  
- **Quarterly**: Full environment validation, version alignment check

**Success Criteria**:
1. All 4 storage tiers functional and within capacity
2. 3+ LLM providers operational
3. Zero security vulnerabilities (no credentials in cloud)
4. Seamless environment switching
5. Full project builds in all environments
6. No dependency on external cloud IDEs

---

*This guide represents the updated version of the AskMe Lite setup process, fully aligned with the 4-Tier Hybrid Sync Architecture without Codespace dependency, incorporating all security best practices and manager feedback.*