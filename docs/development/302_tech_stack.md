# Tech Stack

## Core Technologies

### Application
- **Language**: Kotlin (100% Kotlin Multiplatform)
  - **Why**: Native support for Android, excellent for CLI tools, and modern language features
- **UI Framework**: Jetpack Compose (Android) + Kotlinx.CLI (CLI)
  - **Why**: Modern declarative UI, shared business logic
- **Dependency Injection**: Koin
  - **Why**: Lightweight, easy to use with KMM

### Local LLM Integration
- **Ollama**: For local model execution
  - **Why**: Lightweight, supports multiple models, cross-platform
- **LocalAI**: Alternative local inference engine
  - **Why**: Self-hosted, OpenAI-compatible API

### Networking
- **Ktor Client**: For API calls to cloud providers
  - **Why**: Coroutine support, multiplatform
- **gRPC**: For efficient local communication with model servers
  - **Why**: Performance-critical for local model inference

## Dependencies

### Core
- `kotlinx.coroutines`: For async operations
- `kotlinx.serialization`: For JSON processing
- `Koin`: For dependency injection
- `SQLDelight`: For local storage (if needed)

### Android
- `androidx.compose.*`: For modern UI
- `androidx.security`: For secure storage
- `androidx.lifecycle`: For ViewModel support

### CLI
- `kotlinx-cli`: For command-line argument parsing
- `jline`: For better CLI experience (optional)

## Development Tools

### Build & Package
- **Gradle with KTS**: For build automation
  - **Why**: Better IDE support, type-safe DSL
- **Docker**: For local development environment
  - **Why**: Consistent environment setup

### Testing
- **JUnit 5**: For unit tests
- **MockK**: For mocking in tests
- **AndroidX Test**: For Android instrumentation tests
- **Kotest**: For property-based testing

### Code Quality
- **Detekt**: For static code analysis
- **ktlint**: For code style enforcement
- **GitHub Actions**: For CI/CD

### Documentation
- **Dokka**: For API documentation
- **MkDocs**: For project documentation

## Version Control
- **Git**: For version control
- **Conventional Commits**: For commit messages
- **Semantic Versioning**: For version numbers

## Development Environment
- **Android Studio**: For Android development
- **IntelliJ IDEA**: For multiplatform development
- **Visual Studio Code**: For lightweight editing

## Performance Considerations
- **ProGuard/R8**: For code shrinking and obfuscation
- **Benchmarking**: Using Jetpack Benchmark for performance testing
