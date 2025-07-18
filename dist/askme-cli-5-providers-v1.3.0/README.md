# AskMe CLI - 5 Provider Edition v1.3.0

🤖 **Multi-Provider AI CLI Tool**

## Quick Start

```bash
# Ask a question
./cliApp/bin/cliApp "What is machine learning?"

# Interactive mode  
./cliApp/bin/cliApp

# Show provider statistics
./cliApp/bin/cliApp --stats

# Use specific provider
./cliApp/bin/cliApp "Write Python code" -m mistral
```

## ✅ Supported Providers (5)

- **Google** - Gemini models (general, math, analysis)
- **Mistral** - Code generation, technical queries  
- **Cohere** - Conversational AI, reasoning
- **Groq** - Ultra-fast inference
- **OpenRouter** - Unified model access

## 🌐 Backend

Connects to: `https://askme-backend-proxy.onrender.com`
- All 5 providers active with live API keys
- Latest model configurations
- Automatic fallback system

## 🔧 Requirements

- Java 8+ (for Kotlin runtime)
- Internet connection

---
*Built with ❤️ using Kotlin + Ktor*
