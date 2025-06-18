# askme CLI

**Version**: 1.0.0  
**Status**: Production Ready ✅  
**Repository**: https://github.com/vn6295337/askme

A privacy-first AI assistant that connects to multiple LLM providers without collecting any user data. Get instant answers from Google Gemini, Mistral AI, OpenAI, and Anthropic through a simple command-line interface.

## Quick Start

1. Download the latest release from GitHub
2. Extract and make executable: `chmod +x askme`
3. Start asking questions: `./askme "What is machine learning?"`

No API keys required for basic functionality with free providers.

## Key Features

1. **Zero Data Collection**: Questions and responses never stored or transmitted
2. **Multiple AI Providers**: Google Gemini, Mistral AI, OpenAI, Anthropic support
3. **Free Tier Available**: Works immediately with Google Gemini and Mistral AI
4. **Privacy First**: All processing local, API keys encrypted with AES-256
5. **Cross Platform**: Linux, macOS, Windows with WSL support
6. **Fast Response**: Under 2 seconds average response time
7. **File Processing**: Process questions from files for batch operations
8. **Interactive Mode**: Command history and session management

## Installation

### System Requirements

1. **Operating System**: Linux, macOS, or Windows with WSL
2. **Java**: OpenJDK 17 or higher
3. **Memory**: 512MB RAM minimum
4. **Storage**: 50MB free space
5. **Network**: Internet connection for AI provider APIs

### Download Options

**Option 1: Direct Download**
```bash
wget https://github.com/vn6295337/askme/releases/latest/askme-cli.tar.gz
tar -xzf askme-cli.tar.gz
cd askme-cli
chmod +x askme
```

**Option 2: Build from Source**
```bash
git clone https://github.com/vn6295337/askme.git
cd askme/300_implementation/askme-cli
./gradlew cliApp:installDist
```

### Verification
```bash
./askme --version
# Expected: askme CLI v1.0.0
```

## Usage

### Basic Commands

```bash
./askme "What is artificial intelligence?"
./askme -p google "Explain quantum computing"
./askme -f questions.txt -o answers.txt
./askme -i  # Interactive mode
```

### Supported Providers

1. **Google Gemini** (Free tier available)
2. **Mistral AI** (Free tier available)  
3. **OpenAI** (API key required)
4. **Anthropic** (API key required)

### Configuration

Create `~/.askme/config.json` for API key storage:
```json
{
  "providers": {
    "google": {"api_key": "your-gemini-key"},
    "mistral": {"api_key": "your-mistral-key"}
  },
  "default_provider": "google"
}
```

## Documentation

1. **User Guide**: Complete usage instructions and examples
2. **Setup Guide**: Detailed installation and configuration  
3. **API Documentation**: Provider integration details
4. **Contributing Guide**: Development and contribution guidelines
5. **Release Notes**: Version history and feature updates
6. **Known Issues**: Current limitations and workarounds

## Support

1. **GitHub Issues**: Bug reports and feature requests
2. **Discussions**: Community Q&A and tips
3. **Documentation**: Comprehensive guides in `/600_documentation`
4. **Professional Support**: Enterprise integration assistance

## License

Released under the MIT License. See LICENSE file for complete terms.

## Built With

1. **Kotlin Multiplatform**: Cross-platform development framework
2. **Kotlinx.CLI**: Command-line argument parsing library
3. **JLine**: Interactive terminal features and command history
4. **Ktor**: HTTP client for secure API communication

---

**Ready to start?** Try: `./askme "What can you help me with?"`