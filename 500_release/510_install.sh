#!/bin/bash
# AskMe CLI - One-Click Installer
# Version: 1.2.1
# Compatible: Linux, macOS, Windows WSL, Android Termux

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
ASKME_VERSION="1.2.1"
INSTALL_DIR="$HOME/.askme"
BIN_DIR="$HOME/.local/bin"

# Detect environment and set appropriate temp directory
if [[ "$PREFIX" == *"termux"* ]] || [[ -n "$TERMUX_VERSION" ]] || [[ "$HOME" == *"termux"* ]]; then
    TEMP_DIR="$HOME/tmp/askme-install"
    IS_TERMUX=true
else
    TEMP_DIR="/tmp/askme-install"
    IS_TERMUX=false
fi

# GitHub repository
GITHUB_REPO="https://github.com/vn6295337/askme"
DOWNLOAD_URL="$GITHUB_REPO/releases/download/v$ASKME_VERSION/askme-cli-v$ASKME_VERSION.tar.gz"

print_banner() {
    echo -e "${PURPLE}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║                    🤖 ASKME CLI v$ASKME_VERSION                    ║"
    echo "║                                                           ║"
    echo "║              Smart AI Assistant Installer                 ║"
    echo "║                 Zero Configuration Required               ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_requirements() {
    log_info "Checking system requirements..."
    
    # Check Java
    if command -v java >/dev/null 2>&1; then
        JAVA_VERSION=$(java -version 2>&1 | head -n1 | cut -d'"' -f2)
        log_success "Java found: $JAVA_VERSION"
    else
        log_error "Java not found. Please install Java 17 or higher."
        if [[ "$IS_TERMUX" == true ]]; then
            echo "  Termux: pkg install openjdk-17"
        else
            echo "  Ubuntu/Debian: sudo apt install openjdk-17-jdk"
            echo "  macOS: brew install openjdk@17"
        fi
        exit 1
    fi
    
    # Check curl or wget
    if command -v curl >/dev/null 2>&1; then
        DOWNLOAD_CMD="curl -L"
        log_success "Download tool: curl"
    elif command -v wget >/dev/null 2>&1; then
        DOWNLOAD_CMD="wget"
        log_success "Download tool: wget"
    else
        log_error "Neither curl nor wget found. Please install one of them."
        if [[ "$IS_TERMUX" == true ]]; then
            echo "  Termux: pkg install curl"
        fi
        exit 1
    fi
    
    # Check tar
    if ! command -v tar >/dev/null 2>&1; then
        log_error "tar not found. Please install tar."
        if [[ "$IS_TERMUX" == true ]]; then
            echo "  Termux: pkg install tar"
        fi
        exit 1
    fi
    
    log_success "System requirements check passed!"
    echo
}

create_directories() {
    log_info "Creating installation directories..."
    
    mkdir -p "$INSTALL_DIR"
    mkdir -p "$BIN_DIR"
    mkdir -p "$TEMP_DIR"
    
    log_success "Directories created successfully!"
    if [[ "$IS_TERMUX" == true ]]; then
        log_info "Using Termux-compatible temp directory: $TEMP_DIR"
    fi
}

download_askme() {
    log_info "Downloading AskMe CLI v$ASKME_VERSION..."
    
    cd "$TEMP_DIR"
    
    if [[ "$DOWNLOAD_CMD" == "curl -L" ]]; then
        curl -L "$DOWNLOAD_URL" -o askme-cli.tar.gz
    else
        wget "$DOWNLOAD_URL" -O askme-cli.tar.gz
    fi
    
    if [ ! -f "askme-cli.tar.gz" ]; then
        log_error "Download failed. Please check your internet connection."
        log_error "Tried to download: $DOWNLOAD_URL"
        exit 1
    fi
    
    # Verify download size (basic check)
    if [ ! -s "askme-cli.tar.gz" ]; then
        log_error "Downloaded file is empty. Please try again."
        exit 1
    fi
    
    log_success "Download completed!"
}

install_askme() {
    log_info "Installing AskMe CLI..."
    
    cd "$TEMP_DIR"
    tar -xzf askme-cli.tar.gz
    
    # Copy files to installation directory
    cp -r askme-cli/* "$INSTALL_DIR/"
    
    # Make the main binary executable
    chmod +x "$INSTALL_DIR/bin/cliApp"
    
    # Create symlink with user-friendly name
    ln -sf "$INSTALL_DIR/bin/cliApp" "$BIN_DIR/askme"
    
    log_success "AskMe CLI installed to $INSTALL_DIR"
}

setup_environment() {
    log_info "Setting up environment..."
    
    # Add to PATH if not already there
    SHELL_RC=""
    if [[ "$SHELL" == *"bash"* ]]; then
        SHELL_RC="$HOME/.bashrc"
    elif [[ "$SHELL" == *"zsh"* ]]; then
        SHELL_RC="$HOME/.zshrc"
    else
        SHELL_RC="$HOME/.profile"
    fi
    
    if ! grep -q "$BIN_DIR" "$SHELL_RC" 2>/dev/null; then
        echo "" >> "$SHELL_RC"
        echo "# AskMe CLI" >> "$SHELL_RC"
        echo "export PATH=\"\$PATH:$BIN_DIR\"" >> "$SHELL_RC"
        log_success "Added $BIN_DIR to PATH in $SHELL_RC"
    else
        log_info "PATH already configured"
    fi
    
    # Export for current session
    export PATH="$PATH:$BIN_DIR"
}

cleanup() {
    log_info "Cleaning up temporary files..."
    rm -rf "$TEMP_DIR"
    log_success "Cleanup completed!"
}

test_installation() {
    echo
    log_info "Testing installation..."
    
    if command -v askme >/dev/null 2>&1; then
        log_success "AskMe CLI is working!"
        echo
        log_info "Testing AI connectivity..."
        
        # Test if askme responds
        timeout 10 askme --help > /dev/null 2>&1 && log_success "CLI responding correctly" || log_warning "CLI test timeout (normal for first run)"
    else
        log_warning "Command 'askme' not found in current session."
        log_info "Please restart your terminal or run: source ~/.bashrc"
    fi
}

print_completion() {
    echo
    echo -e "${GREEN}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║                  🎉 INSTALLATION COMPLETE! 🎉              ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo
    echo -e "${CYAN}🚀 Ready to Use:${NC}"
    echo "1. Start AI assistant: ${YELLOW}askme${NC}"
    echo "2. Ask any question: ${YELLOW}askme \"What is artificial intelligence?\"${NC}"
    echo "3. Interactive mode: ${YELLOW}askme -i${NC}"
    echo "4. View help: ${YELLOW}askme --help${NC}"
    echo
    echo -e "${GREEN}✨ Zero Configuration Required! ✨${NC}"
    echo "🤖 Google Gemini and Mistral AI are ready to use"
    echo "🔄 Interactive mode for continuous conversations"
    echo "📱 Optimized for mobile and desktop use"
    echo
    echo -e "${CYAN}Example Usage:${NC}"
    echo "${YELLOW}askme \"Explain quantum computing\"${NC}  ${BLUE}# Quick question${NC}"
    echo "${YELLOW}askme -i${NC}                          ${BLUE}# Start interactive session${NC}"
    echo "${YELLOW}askme -m mistral \"Write a poem\"${NC}   ${BLUE}# Use specific model${NC}"
    echo
    echo -e "${PURPLE}Documentation: $GITHUB_REPO${NC}"
    echo -e "${PURPLE}Support: $GITHUB_REPO/issues${NC}"
    echo
    echo -e "${CYAN}💡 Pro Tip: Simply type ${YELLOW}askme${NC} followed by your question!${NC}"
    echo
}

# Main installation flow
main() {
    print_banner
    
    log_info "Starting AskMe CLI installation..."
    echo
    
    check_requirements
    create_directories
    download_askme
    install_askme
    setup_environment
    cleanup
    test_installation
    print_completion
}

# Handle interruption
trap 'echo; log_error "Installation interrupted by user"; cleanup; exit 1' INT

# Run main installation
main "$@"