# Build & Setup Guide

## Prerequisites

### For All Platforms
- Java Development Kit (JDK) 17 or later
- Git
- Docker (for local LLM setup)

### For Android Development
- Android Studio (latest stable version)
- Android SDK (API 33+)
- Android NDK (if building native code)

### For Linux CLI Development
- GCC/G++ or Clang
- CMake 3.22+

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/askme-lite.git
cd askme-lite
```

### 2. Install Dependencies
#### Android
```bash
# Install Android SDK components
sdkmanager --install "platforms;android-33" "build-tools;33.0.0"

# Install NDK (if needed)
sdkmanager --install "ndk;25.1.8937393"
```

#### Linux
```bash
# Install Kotlin compiler
sdk install kotlin

# Install build tools
sudo apt update
sudo apt install -y build-essential cmake
```

### 3. Build the Project
#### Android
```bash
./gradlew :androidApp:assembleDebug
```

#### Linux CLI
```bash
./gradlew :cli:installDist
```

### 4. Run Local LLM (Optional)
```bash
# Using Ollama
docker run -d --name ollama -p 11434:11434 ollama/ollama

# Pull a model
docker exec ollama ollama pull llama2
```

## Configuration

### Android
1. Open the project in Android Studio
2. Wait for Gradle sync to complete
3. Connect an Android device or start an emulator
4. Click 'Run' to build and install the app

### CLI
1. Build the project
2. Run the CLI tool:
   ```bash
   ./cli/build/install/cli/bin/cli --model llama2 --prompt "Hello, world!"
   ```

## Common Issues

### Android Build Failures
- **Error**: Missing SDK components
  **Solution**: Install the required SDK platforms and build tools via Android Studio SDK Manager

- **Error**: Gradle sync failed
  **Solution**:
  ```bash
  ./gradlew --stop
  rm -rf ~/.gradle/caches/
  ./gradlew clean
  ```

### LLM Connection Issues
- **Error**: Cannot connect to local LLM
  **Solution**:
  1. Verify Docker is running
  2. Check if the LLM service is up: `docker ps`
  3. Test the endpoint: `curl http://localhost:11434/api/tags`

### Performance Issues
- **Issue**: Slow response times
  **Solution**:
  - Use smaller models for development
  - Allocate more resources to Docker (if using local LLM)
  - Enable model quantization for faster inference

## Development Workflow

1. Make code changes
2. Run tests:
   ```bash
   ./gradlew test
   ```
3. Format code:
   ```bash
   ./gradlew ktlintFormat
   ```
4. Check code quality:
   ```bash
   ./gradlew detekt
   ```
5. Commit changes using conventional commits

## Debugging

### Android
- Use Android Studio's built-in debugger
- Check Logcat for application logs
- Enable verbose logging in `BuildConfig.DEBUG`

### CLI
- Run with `--verbose` flag for detailed logs
- Use `jstack` for thread dumps
- Enable remote debugging:
  ```bash
  ./gradlew :cli:run --debug-jvm
  ```

## Testing

### Unit Tests
```bash
./gradlew test
```

### Integration Tests
```bash
./gradlew connectedAndroidTest
```

### Linting
```bash
./gradlew ktlintCheck
```

## Deployment

### Android
1. Update version in `androidApp/build.gradle.kts`
2. Create a signed APK/AAB
3. Upload to Google Play Console

### Linux
1. Build native distribution:
   ```bash
   ./gradlew :cli:distTar
   ```
2. Upload to package repositories (PPA, AUR, etc.)
