# Development Setup Guide

This guide will help you set up the development environment for AskMe Lite.

## Prerequisites

- JDK 17 or later
- Android Studio Flamingo (2022.2.1) or later
- Android SDK 34
- Git

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/askme-lite.git
cd askme-lite
```

### 2. Configure Android SDK
Make sure you have the following installed via Android Studio SDK Manager:
- Android SDK Platform 34
- Android SDK Build-Tools 34.0.0
- Android SDK Command-line Tools
- Android Emulator (if needed)

### 3. Set up Environment Variables
Add the following to your shell configuration file (`.bashrc`, `.zshrc`, etc.):

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 4. Install Dependencies
```bash
# Install Kotlin Multiplatform Mobile plugin in Android Studio
# (Android Studio → Preferences → Plugins → Marketplace → Search for "Kotlin Multiplatform Mobile")

# Install KSP (Kotlin Symbol Processing)
./gradlew --refresh-dependencies
```

### 5. Build the Project
```bash
# Build the project
./gradlew build

# Run tests
./gradlew test

# Run lint checks
./gradlew ktlintCheck detekt
```

### 6. Run the Android App
1. Open the project in Android Studio
2. Select the `androidApp` run configuration
3. Click the Run button (or press Shift+F10)

### 7. Run the CLI
```bash
# Build the CLI
./gradlew :cli:installDist

# Run the CLI
./cli/build/install/cli/bin/cli
```

## Code Style

This project uses:
- KtLint for code style enforcement
- Detekt for static code analysis
- Pre-commit hooks (optional)

To set up pre-commit hooks:
```bash
# Install pre-commit
pip install pre-commit

# Install git hooks
pre-commit install
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run tests and lint checks
4. Submit a pull request

## Troubleshooting

### Common Issues
- **Gradle sync fails**: Try `./gradlew --stop` and sync again
- **Missing SDK**: Make sure you have the correct Android SDK installed
- **Kotlin version conflicts**: Ensure all Kotlin dependencies use the same version

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
