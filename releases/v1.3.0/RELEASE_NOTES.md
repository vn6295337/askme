# AskMe CLI 5-Provider Distribution v1.3.0

🤖 **Multi-Provider AI CLI Tool - Complete Distribution**

## 🎯 What's New
- **Complete Distribution**: Full JAR dependencies included (7.2MB)
- **Streamlined Installation**: One-line install script
- **Multiple Formats**: ZIP and TAR.GZ options
- **Checksum Verification**: SHA256 checksums for security

## ✅ Supported Providers (5 Active)
- **Google** - Gemini models (general, math, analysis)
- **Mistral** - Code generation, technical queries  
- **Cohere** - Conversational AI, reasoning
- **Groq** - Ultra-fast inference
- **OpenRouter** - Unified model access

## 🚀 Installation Options

### Option 1: One-Line Install (Recommended)
```bash
curl -fsSL https://github.com/vn6295337/askme/releases/download/v1.3.0/install.sh | bash
```

### Option 2: Manual Download
- **ZIP**: `askme-cli-5-providers-v1.3.0-complete.zip` (7.2MB)
- **TAR.GZ**: `askme-cli-5-providers-v1.3.0.tar.gz` (6.8MB)

### Option 3: Docker
```bash
docker run -it askme-cli "What is machine learning?"
```

## 🔧 Requirements
- **Java 8+** (tested with Java 17)
- **Internet connection** (for backend connectivity)
- **~50MB disk space** (extracted)

## 🎯 Quick Start
```bash
# Simple question
askme "What is machine learning?"

# Use specific provider
askme "Write Python code" --model mistral

# Interactive mode
askme

# Show statistics
askme --stats
```

## 🌐 Backend
- **Endpoint**: `https://askme-backend-proxy.onrender.com`
- **Status**: All 5 providers active with live API keys
- **Features**: Intelligent fallback, auto-selection, performance tracking

## 🔐 Verification
```bash
# Verify download integrity
sha256sum -c CHECKSUMS.txt
```

## 📁 Distribution Contents
```
askme-cli-5-providers-v1.3.0/
├── README.md
├── test.sh
└── cliApp/
    ├── bin/
    │   └── cliApp (executable)
    └── lib/
        ├── cliApp.jar
        ├── kotlin-stdlib-*.jar
        ├── ktor-*.jar
        └── [20+ dependency JARs]
```

## 🐛 Known Issues
- Backend may take 30-60 seconds to wake up on first request
- Some providers may have occasional downtime
- Llama provider currently experiencing connectivity issues

## 🔄 Upgrade from Previous Versions
1. Remove old installation: `rm -rf ~/.askme`
2. Run new installer: `curl -fsSL .../install.sh | bash`

---
*Built with ❤️ using Kotlin + Ktor*