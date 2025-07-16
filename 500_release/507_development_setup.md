# Development Setup Guide

**Version**: 1.0.0  
**Target Audience**: Developers and Contributors  
**Repository**: https://github.com/vn6295337/askme  
**Last Updated**: June 17, 2025

This guide covers setting up the development environment for contributing to askme CLI.

---

## Prerequisites

### System Requirements

**Minimum Development Environment**
1. **Operating System**: Linux (Ubuntu 20.04+), macOS (11.0+), or Windows with WSL2
2. **Memory**: 8GB RAM minimum, 16GB recommended
3. **Storage**: 10GB free space for development tools and dependencies
4. **Network**: Stable internet connection for dependency downloads

**Required Accounts**
1. **GitHub Account**: For repository access and contributions
2. **AI Provider APIs**: For testing (at least Google Gemini free tier)

---

## Development Tools Installation

### Java Development Kit

**Install OpenJDK 17**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-17-jdk openjdk-17-source

# macOS (using Homebrew)
brew install openjdk@17

# Verify installation
java -version
javac -version
```

**Configure JAVA_HOME**
```bash
# Linux
export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"
echo 'export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"' >> ~/.bashrc

# macOS
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
echo 'export JAVA_HOME="/opt/homebrew/opt/openjdk@17"' >> ~/.zshrc

# Verify
echo $JAVA_HOME
```

### SDKMAN Installation

**Install SDKMAN for SDK Management**
```bash
# Install SDKMAN
curl -s "https://get.sdkman.io" | bash
source ~/.sdkman/bin/sdkman-init.sh

# Verify installation
sdk version
```

### Kotlin and Gradle Setup

**Install Kotlin**
```bash
# Using SDKMAN (recommended)
sdk install kotlin 1.9.10
sdk default kotlin 1.9.10

# Verify installation
kotlin -version
```

**Install Gradle**
```bash
# Using SDKMAN (recommended)
sdk install gradle 8.4
sdk default gradle 8.4

# Verify installation
gradle --version
```

### Git Configuration

**Configure Git for Development**
```bash
# Set user information
git config --global user.name "Your Full Name"
git config --global user.email "your.email@example.com"

# Set default branch
git config --global init.defaultBranch main

# Configure line endings (important for cross-platform development)
git config --global core.autocrlf input   # Linux/macOS
git config --global core.autocrlf true    # Windows

# Verify configuration
git config --list --global
```

---

## Project Setup

### Repository Clone

**Clone the Repository**
```bash
# Create development directory
mkdir -p ~/development
cd ~/development

# Clone repository
git clone https://github.com/vn6295337/askme.git
cd askme

# Verify project structure
ls -la
```

**Navigate to CLI Implementation**
```bash
# Change to CLI development directory
cd 300_implementation/askme-cli

# Verify Gradle wrapper
ls -la gradlew*
./gradlew --version
```

### Development Environment Setup

**Initialize Gradle Wrapper**
```bash
# Ensure Gradle wrapper is up to date
gradle wrapper --gradle-version 8.4

# Make wrapper executable
chmod +x gradlew

# Test wrapper
./gradlew --version
```

**Configure IDE (Optional)**

For IntelliJ IDEA:
```bash
# Generate IDEA project files
./gradlew idea

# Open project in IntelliJ IDEA
idea .
```

For VS Code:
```bash
# Install Kotlin extension
code --install-extension mathiasfrohlich.Kotlin

# Open project
code .
```

### API Keys for Development

**Create Development Configuration**
```bash
# Create config directory
mkdir -p ~/.askme

# Create development configuration
cat > ~/.askme/config.json << 'EOF'
{
  "providers": {
    "google": {
      "api_key": "your-development-gemini-key",
      "model": "gemini-pro",
      "enabled": true
    },
    "mistral": {
      "api_key": "your-development-mistral-key",
      "model": "mistral-medium",
      "enabled": true
    },
    "llama": {
      "api_key": "your-development-llama-key",
      "model": "meta-llama/Llama-3-8b-chat-hf",
      "enabled": true
    }
  },
  "default_provider": "google",
  "timeout": 30,
  "max_retries": 3
}
EOF

# Secure configuration
chmod 600 ~/.askme/config.json
```

---

## Build and Test

### Initial Build

**Clean Build**
```bash
# Clean previous builds
./gradlew clean

# Build all modules
./gradlew build

# Build CLI distribution
./gradlew :cliApp:installDist
```

**Verify Build**
```bash
# Check build artifacts
ls -la cliApp/build/install/cliApp/bin/

# Test CLI application
./cliApp/build/install/cliApp/bin/cliApp --version
./cliApp/build/install/cliApp/bin/cliApp --help
```

### Running Tests

**Execute Test Suite**
```bash
# Run all tests
./gradlew test

# Run specific module tests
./gradlew :cliApp:test
```

**Integration Tests**
```bash
# Run integration tests (requires API keys)
./gradlew integrationTest

# Run specific provider tests
./gradlew test --tests "*GoogleGeminiTest*"
./gradlew test --tests "*MistralAITest*"
```

### Code Quality

**Static Analysis**
```bash
# Run Detekt for code analysis
./gradlew detekt

# View Detekt report
open build/reports/detekt/detekt.html
```

**Code Formatting**
```bash
# Check code formatting
./gradlew ktlintCheck

# Auto-format code
./gradlew ktlintFormat

# Verify formatting
git diff
```

**Dependency Analysis**
```bash
# Check for outdated dependencies
./gradlew dependencyUpdates

# Analyze dependency tree
./gradlew dependencies
```

---

## Development Workflow

### Feature Development

**1. Create Feature Branch**
```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Verify branch
git branch
```

**2. Development Cycle**
```bash
# Make changes and test frequently
./gradlew build
./gradlew test

# Test CLI functionality
./gradlew :cliApp:run --args="test query"

# Run in interactive mode
./gradlew :cliApp:run --args=""

# Check code quality
./gradlew ktlintCheck detekt
```

**3. Commit Changes**
```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "Add feature: description of changes"

# Push to origin
git push origin feature/your-feature-name
```

### Testing Your Changes

**Manual Testing**
```bash
# Build fresh distribution
./gradlew clean cliApp:installDist

# Test basic functionality
./cliApp/build/install/cliApp/bin/cliApp "What is 2+2?"

# Test with different providers
./cliApp/build/install/cliApp/bin/cliApp -p google "Test question"
./cliApp/build/install/cliApp/bin/cliApp -p mistral "Test question"

# Test file input
echo "Test question from file" > test.txt
./cliApp/build/install/cliApp/bin/cliApp -f test.txt
```

**Automated Testing**
```bash
# Run full test suite
./gradlew clean test

# Run specific tests
./gradlew test --tests "*CLITest*"

# Run with verbose output
./gradlew test --info
```

### Performance Testing

**Response Time Testing**
```bash
# Create performance test script
cat > performance_test.sh << 'EOF'
#!/bin/bash
echo "Testing response times..."
for i in {1..5}; do
    echo "Test $i:"
    time ./cliApp/build/install/cliApp/bin/cliApp "What is artificial intelligence?"
    echo "---"
done
EOF

chmod +x performance_test.sh
./performance_test.sh
```

**Memory Usage Testing**
```bash
# Monitor memory usage during operation
./gradlew cliApp:run --args="complex query about machine learning" &
PID=$!
while kill -0 $PID 2>/dev/null; do
    ps -o pid,vsz,rss,comm $PID
    sleep 1
done
```

---

## Debugging

### Development Debugging

**Enable Debug Logging**
```bash
# Set debug environment
export DEBUG=true
export LOG_LEVEL=DEBUG

# Run with verbose output
./gradlew cliApp:run --args="-v 'debug question'"
```

**IDE Debugging**

For IntelliJ IDEA:
1. Set breakpoints in source code
2. Run/Debug configuration for `cliApp:run`
3. Add program arguments in run configuration
4. Debug with F5 or debug button

**Network Debugging**
```bash
# Monitor network traffic (Linux)
sudo tcpdump -i any -s 0 -X port 443

# Check API connectivity
curl -v https://generativelanguage.googleapis.com/v1/models
```

### Common Development Issues

**Build Failures**
```bash
# Clean and rebuild
./gradlew clean build --refresh-dependencies

# Check Java version
java -version

# Verify Gradle daemon
./gradlew --stop
./gradlew build
```

**Test Failures**
```bash
# Run specific failing test
./gradlew test --tests "FailingTestClass.testMethod" --info

# Clean test cache
./gradlew cleanTest test

# Check test dependencies
./gradlew dependencies --configuration testRuntimeClasspath
```

**API Integration Issues**
```bash
# Test API connectivity manually
curl -H "Authorization: Bearer $GOOGLE_API_KEY" \
     https://generativelanguage.googleapis.com/v1/models

# Verify configuration
cat ~/.askme/config.json

# Test with minimal request
./cliApp/build/install/cliApp/bin/cliApp --test-providers
```

---

## Contributing Guidelines

### Code Standards

**Kotlin Style Guide**
1. Follow official Kotlin coding conventions
2. Use ktlint for automatic formatting
3. Maximum line length: 120 characters
4. Use meaningful variable and function names
5. Add KDoc comments for public APIs

**Commit Message Format**
```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Scope: cliApp, providers, config, docs
Example: feat(providers): add Anthropic Claude integration
```

### Pull Request Process

**1. Pre-submission Checklist**
```bash
# Ensure code quality
./gradlew ktlintCheck detekt test

# Update documentation if needed
# Test on multiple providers
# Verify no sensitive data in commits
```

**2. Create Pull Request**
1. Push feature branch to GitHub
2. Create pull request with detailed description
3. Reference any related issues
4. Request review from maintainers

**3. Review Process**
1. Automated CI checks must pass
2. Code review by maintainers
3. Manual testing verification
4. Documentation review if applicable

### Release Process

**Local Release Build**
```bash
# Create release build
./gradlew clean build cliApp:installDist

# Package for distribution
cd cliApp/build/install
tar -czf askme-cli.tar.gz cliApp/

# Test release package
tar -xzf askme-cli.tar.gz
cd cliApp && chmod +x bin/cliApp
./bin/cliApp --version
```

---

## Troubleshooting Development Environment

### Java Issues
```bash
# Multiple Java versions
sudo update-alternatives --config java

# JAVA_HOME not set
echo $JAVA_HOME
export JAVA_HOME=$(readlink -f /usr/bin/java | sed "s:bin/java::")
```

### Gradle Issues
```bash
# Gradle daemon issues
./gradlew --stop
./gradlew clean build

# Dependency conflicts
./gradlew dependencies --configuration compileClasspath
```

### Git Issues
```bash
# Branch sync issues
git fetch origin
git reset --hard origin/main

# Large file issues
git lfs track "*.jar"
git add .gitattributes
```

---

## Additional Resources

### Documentation
1. **API Documentation**: `/600_documentation/API_DOCS.md`
2. **Architecture Guide**: `/200_development/system_architecture.md`
3. **Project Structure**: `/600_documentation/602_directory_structure.md`

### External Resources
1. **Kotlin Documentation**: https://kotlinlang.org/docs/
2. **Gradle User Manual**: https://docs.gradle.org/current/userguide/
3. **GitHub Flow**: https://guides.github.com/introduction/flow/

### Getting Help
1. **GitHub Issues**: Report bugs and ask questions
2. **Discussions**: Development Q&A and best practices
3. **Code Review**: Learn from pull request feedback

---

**Ready to contribute?** Start with a simple bug fix or documentation improvement to familiarize yourself with the codebase and development workflow.