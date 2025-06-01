# Architecture Overview

## High-Level Architecture

```
┌───────────────────────────────────────────────────────────┐
│                    AskMe Lite Application                 │
├───────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌────────────────┐   ┌─────────────┐  │
│  │    UI       │    │                │   │             │  │
│  │  (Android/  │◄──►│   Core Logic   │◄─►│  LLM        │  │
│  │   CLI)      │    │                │   │  Providers  │  │
│  └─────────────┘    └────────────────┘   └─────────────┘  │
└───────────────────────────────────────────────────────────┘
```

## Key Components

### 1. UI Layer
- **Android App**: Jetpack Compose-based UI
- **CLI**: Command-line interface for Linux
- **Shared Components**: Common UI logic and components

### 2. Core Logic
- **Query Processor**: Handles user input and routes to appropriate provider
- **Provider Manager**: Manages different LLM providers
- **Settings Manager**: Handles app configuration
- **Local Model Manager**: Manages local model files and execution

### 3. LLM Providers
- **Local Providers**: On-device models (e.g., via Ollama, LocalAI)
- **Cloud Providers**: Remote API connections (with privacy considerations)
- **Provider Interface**: Standard interface for adding new providers

## Data Flow

1. **User Input**
   - User enters query via Android UI or CLI
   - Input is validated and sanitized

2. **Query Processing**
   - Query is passed to the selected provider
   - Local/cloud routing decision is made
   - Appropriate API calls or model executions are triggered

3. **Response Handling**
   - Raw response is processed and formatted
   - Any necessary post-processing is applied
   - Response is displayed to the user

4. **Storage**
   - Minimal local storage for settings
   - Optional conversation history (user-configurable)
   - Local model files (when using offline mode)

## Security Considerations
- No network calls unless explicitly configured
- All sensitive data (API keys) stored in Android Keystore/SecurePreferences
- Local storage uses encrypted database
- No analytics or telemetry
