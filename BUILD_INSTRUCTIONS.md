# AskMe CLI 9-Provider Build Instructions

## 🚀 Build & Test Commands

### Prerequisites
- Kotlin/JVM installed
- Gradle wrapper (gradlew) available
- Network access for backend connectivity

### Build Commands

```bash
# Navigate to CLI directory
cd /home/km_project/300_implementation/askme-cli

# Make gradlew executable (if needed)
chmod +x gradlew

# Clean build
./gradlew clean

# Compile and build
./gradlew build

# Run with specific provider
./gradlew run --args="-m google 'What is 2+2?'"

# Run in interactive mode
./gradlew run

# Run with smart mode
./gradlew run --args="-s 'Write a Python function'"

# Test all providers
./gradlew run --args="--help"
```

### Provider Testing

```bash
# Test each provider individually:
./gradlew run --args="-m google 'Calculate 15 * 23'"
./gradlew run --args="-m mistral 'Write a Python class'"
./gradlew run --args="-m llama 'Tell me a story'"
./gradlew run --args="-m cohere 'Analyze this data'"
./gradlew run --args="-m groq 'Quick question'"
./gradlew run --args="-m huggingface 'Hello, how are you?'"
./gradlew run --args="-m openrouter 'Complex analysis task'"
./gradlew run --args="-m ai21 'Research this topic'"
./gradlew run --args="-m replicate 'Debug this code'"
```

### Interactive Mode Commands

```
# Start interactive mode
./gradlew run

# Available commands in interactive mode:
help                    # Show all providers and commands
stats                   # Show provider performance stats
switch cohere          # Switch to Cohere provider
switch auto            # Switch to intelligent selection
Your question here     # Ask any question
exit                   # Exit the application
```

### Validation

```bash
# Check provider stats
./gradlew run --args="--stats"

# Verify all 9 providers are available
./gradlew run --args="--help" | grep -i provider
```

## ✅ Expected Output

The CLI should now support:
- **9 providers**: google, mistral, llama, cohere, groq, huggingface, openrouter, ai21, replicate
- **41 total models** across all providers
- **Intelligent selection** based on query analysis
- **6 analysis dimensions**: code, creative, analytical, math, long-form, conversational
- **Provider aliases**: hf, or, gemini, together

## 🔧 Troubleshooting

If build fails:
1. Check Java/Kotlin installation: `java -version`
2. Verify gradlew permissions: `ls -la gradlew`
3. Clean and rebuild: `./gradlew clean build`
4. Check network connectivity for dependencies

If providers fail:
1. Verify backend URL is accessible
2. Check provider API keys in backend
3. Test with simple queries first
4. Review provider stats: `./gradlew run --args="--stats"`