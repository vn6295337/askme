# Project Structure

## Overview

AskMe CLI is a multi-provider AI command-line interface that provides access to 5 different AI providers through a unified interface. This document outlines the project structure and organization.

## 🏗️ Repository Structure

```
askme/
├── 📁 .github/                    # GitHub workflows and templates
│   ├── workflows/                 # CI/CD workflows
│   │   ├── ci.yml                # Basic CI/CD pipeline
│   │   ├── issue-labeler.yml     # Issue labeling automation
│   │   └── release.yaml          # Release automation
│   └── ISSUE_TEMPLATE/           # Issue templates
├── 📁 300_implementation/         # Core implementation
│   └── askme-cli/                # Main CLI project
│       ├── cliApp/               # CLI application module
│       │   ├── src/main/kotlin/  # Source code
│       │   │   └── com/askme/    
│       │   │       ├── cli/      # CLI interface
│       │   │       │   └── Main.kt
│       │   │       └── providers/ # Provider implementations
│       │   │           └── Providers.kt
│       │   └── build.gradle.kts  # Application build config
│       ├── gradle/               # Gradle wrapper
│       ├── gradlew              # Gradle wrapper script
│       └── build.gradle.kts     # Root build config
├── 📁 releases/                  # Release assets
│   ├── v1.3.0/                  # Version 1.3.0 release
│   │   ├── askme-cli-5-providers-v1.3.0-complete.zip
│   │   ├── askme-cli-5-providers-v1.3.0.tar.gz
│   │   ├── install.sh           # Installation script
│   │   ├── CHECKSUMS.txt        # SHA256 checksums
│   │   └── RELEASE_NOTES.md     # Release notes
│   └── DISTRIBUTION_GUIDE.md    # Distribution guide
├── 📁 deployment-test/          # Test distributions
│   └── askme-cli-5-providers-v1.3.0/
├── 📁 dist/                     # Distribution files
├── 📁 docs/                     # Documentation index
├── 📁 100_planning/             # Project planning (archived)
├── 📁 200_development/          # Development docs (archived)
├── 📁 400_testing/              # Testing docs (archived)
├── 📁 500_release/              # Release docs (archived)
├── 📁 700_scripts/              # Build and deployment scripts
├── 📁 800_misc_docs/            # Miscellaneous documentation
├── 📁 900_archive/              # Archived files
├── 📁 scout-agent/              # Model validation agent
├── 📄 README.md                 # Main project documentation
├── 📄 INSTALL.md                # Installation guide
├── 📄 USER_GUIDE.md             # User manual
├── 📄 CONTRIBUTING.md           # Development guide
├── 📄 CHANGELOG.md              # Version history
├── 📄 Dockerfile               # Docker container
└── 📄 .dockerignore            # Docker ignore rules
```

## 🎯 Core Components

### CLI Application (`300_implementation/askme-cli/`)
- **Main.kt**: Entry point, argument parsing, interactive mode
- **Providers.kt**: Provider implementations and intelligent selection
- **Build System**: Gradle with Kotlin DSL
- **Dependencies**: Kotlin, Ktor, Kotlinx libraries

### Provider System
- **5 Active Providers**: Google, Mistral, Cohere, Groq, OpenRouter
- **Intelligent Selection**: Query analysis and provider optimization
- **Fallback System**: Automatic provider switching on failures
- **Performance Tracking**: Success rates and response times

### Distribution System
- **Release Assets**: Complete distributions with all dependencies
- **Installation Script**: One-line installer for easy setup
- **Docker Support**: Containerized deployment option
- **Checksums**: SHA256 verification for security

## 📊 Provider Architecture

```
BaseProvider (Abstract)
├── GoogleProvider     (Gemini models)
├── MistralProvider    (Code generation)
├── CohereProvider     (Conversational AI)
├── GroqProvider       (Ultra-fast inference)
└── OpenRouterProvider (Unified access)
```

### Provider Features
- **Model Selection**: Automatic best model selection per query
- **Query Analysis**: Content-based provider optimization
- **Error Handling**: Graceful failure handling and fallbacks
- **Performance Metrics**: Response time and success tracking

## 🔧 Build System

### Gradle Configuration
- **Multi-module**: Root project with cliApp module
- **Kotlin DSL**: Modern Gradle configuration
- **Dependencies**: Managed through version catalogs
- **Distribution**: Automated JAR packaging with dependencies

### Build Targets
```bash
./gradlew clean                    # Clean build artifacts
./gradlew build                    # Build project
./gradlew test                     # Run tests
./gradlew cliApp:installDist      # Create distribution
./gradlew cliApp:run --args="..."  # Run CLI directly
```

## 🚀 Deployment Pipeline

### CI/CD Workflow
1. **Code Push** → Trigger CI pipeline
2. **Build & Test** → Gradle build and unit tests
3. **CLI Testing** → Functional testing of CLI commands
4. **Artifact Upload** → Build artifacts stored

### Release Process
1. **Tag Creation** → `v1.3.0` tag triggers release
2. **Distribution Build** → Create ZIP/TAR.GZ with all dependencies
3. **Checksum Generation** → SHA256 verification files
4. **GitHub Release** → Automated release with assets

## 📁 Directory Purposes

### Active Directories
- **`.github/`**: GitHub workflows and templates
- **`300_implementation/`**: Core CLI implementation
- **`releases/`**: Release assets and distribution files
- **`deployment-test/`**: Test distributions for validation
- **`docs/`**: Documentation index and navigation

### Archived Directories
- **`100_planning/`**: Initial project planning (historical)
- **`200_development/`**: Development documentation (historical)
- **`400_testing/`**: Testing documentation (historical)
- **`500_release/`**: Release documentation (historical)
- **`700_scripts/`**: Build and deployment scripts
- **`800_misc_docs/`**: Miscellaneous documentation
- **`900_archive/`**: Archived files and old distributions

## 🔐 Security & Configuration

### Security Features
- **No Local API Keys**: All keys managed server-side
- **Input Validation**: Prevents injection attacks
- **HTTPS Only**: Encrypted connections to backend
- **Checksum Verification**: Ensures download integrity

### Configuration
- **Zero Config**: No local configuration required
- **Backend Proxy**: `https://askme-backend-proxy.onrender.com`
- **Provider Management**: Server-side provider configuration
- **Performance Tuning**: Automatic optimization based on usage

## 🔄 Data Flow

```
User Input → CLI Parser → Provider Selection → Backend Proxy → AI Provider → Response
     ↑                                                                            ↓
     └─────────────────────── Formatted Output ←──────────────────────────────────┘
```

### Processing Steps
1. **Input Processing**: Parse command-line arguments or interactive input
2. **Provider Selection**: Choose optimal provider based on query analysis
3. **Backend Communication**: Send request through proxy with provider routing
4. **Response Processing**: Format and display AI provider response
5. **Performance Tracking**: Update provider statistics and metrics

## 🧪 Testing Strategy

### Test Categories
- **Unit Tests**: Provider logic and utility functions
- **Integration Tests**: CLI functionality and backend communication
- **Performance Tests**: Response time and throughput testing
- **Security Tests**: Input validation and injection prevention

### Test Structure
```
src/commonTest/kotlin/com/askme/
├── security/                    # Security validation tests
├── providers/                   # Provider logic tests
└── cli/                        # CLI interface tests
```

## 📈 Version History

- **v1.3.0**: 5-provider distribution with complete release assets
- **v1.2.1**: Fixed distribution with updated wrapper scripts
- **v1.2.0**: Multi-provider support with intelligent selection
- **v1.1.0**: Enhanced multi-provider implementation
- **v1.0.0**: Initial release with basic functionality

## 🎯 Future Considerations

### Scalability
- **Provider Expansion**: Framework supports additional providers
- **Performance Optimization**: Continuous performance monitoring
- **Feature Enhancement**: User-requested functionality additions
- **Platform Support**: Windows native support consideration

### Maintenance
- **Documentation Updates**: Keep docs current with releases
- **Dependency Management**: Regular security updates
- **Backend Monitoring**: Ensure high availability
- **User Feedback**: Continuous improvement based on usage