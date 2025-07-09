# CLI Integration Plan - Phase 2

## Overview
Plan for integrating the scout agent's discovered LLM models into the askme-cli for dynamic model selection.

## Current CLI Architecture

### Existing Structure
- **Language**: Kotlin/JVM
- **Location**: `300_implementation/askme-cli/`
- **Main Components**:
  - `Main.kt` - CLI entry point
  - `Providers.kt` - Provider management
  - `AIProvider.kt` - Provider interface
  - `IntelligentProvider.kt` - Smart provider selection

### Current Model Configuration
```kotlin
// Current hardcoded approach in Providers.kt
val PROVIDERS = mapOf(
    "google" to GoogleProvider(),
    "mistral" to MistralProvider(), 
    "llama" to LlamaProvider()
)
```

## Integration Strategy

### Phase 2.1: API Integration
**Timeline**: 1-2 weeks after MVP deployment

#### New Components
1. **LLMDiscoveryService.kt**
   - Fetch models from backend `/api/llms`
   - Cache model data locally
   - Handle API failures gracefully

2. **DynamicProviderRegistry.kt**
   - Load discovered models at runtime
   - Maintain backward compatibility
   - Support model filtering/selection

3. **ConfigurationManager.kt**
   - Manage dynamic vs static providers
   - Handle feature flags
   - Store user preferences

#### API Integration
```kotlin
class LLMDiscoveryService {
    private val backendUrl = "https://your-backend.onrender.com"
    
    suspend fun fetchDiscoveredModels(): List<DiscoveredLLM> {
        // GET /api/llms with error handling
        // Parse response into DiscoveredLLM objects
        // Cache results locally
    }
    
    fun getCachedModels(): List<DiscoveredLLM> {
        // Return cached models if API unavailable
    }
}
```

### Phase 2.2: Dynamic Provider System
**Timeline**: 2-3 weeks after Phase 2.1

#### Enhanced Provider Interface
```kotlin
interface DynamicProvider : AIProvider {
    val discoveryMetadata: DiscoveryMetadata
    val availability: ProviderAvailability
    val capabilities: Set<ModelCapability>
}

data class DiscoveredLLM(
    val name: String,
    val publisher: String,
    val country: String,
    val accessType: String,
    val apiEndpoint: String?,
    val capabilities: Set<ModelCapability>,
    val discoveryTimestamp: String
)
```

#### Model Selection Logic
```kotlin
class IntelligentProviderV2 {
    fun selectBestProvider(
        prompt: String,
        discoveredModels: List<DiscoveredLLM>,
        userPreferences: UserPreferences
    ): AIProvider {
        // Enhanced selection with discovered models
        // Consider capabilities, availability, user preferences
        // Fallback to hardcoded providers if needed
    }
}
```

### Phase 2.3: User Experience
**Timeline**: 1 week after Phase 2.2

#### CLI Commands
```bash
# List available models (static + discovered)
askme list-models

# Use specific discovered model
askme query --model "Llama-2-7B-Chat" "What is AI?"

# Smart selection with discovered models
askme smart "Write a Python function"

# Show model details
askme model-info "GPT-3.5-Turbo"

# Refresh model cache
askme refresh-models
```

#### Configuration Options
```kotlin
data class CLIConfig(
    val enableDiscoveredModels: Boolean = true,
    val preferredRegions: Set<String> = setOf("US", "Europe"),
    val preferredAccessTypes: Set<String> = setOf("Open Source", "Free Tier"),
    val cacheExpiryHours: Int = 24,
    val fallbackToStatic: Boolean = true
)
```

## Technical Implementation

### Data Flow
```
Scout Agent → Backend → CLI Discovery Service → Provider Registry → User
     ↓           ↓              ↓                    ↓             ↓
  Weekly      JSON Store    HTTP GET           Load Models   Dynamic
 Discovery   /api/llms     + Caching          + Filter      Selection
```

### Error Handling Strategy
1. **API Unavailable**: Use cached data, fallback to static providers
2. **Invalid Model Data**: Skip invalid entries, log warnings
3. **Authentication Issues**: Graceful degradation to static mode
4. **Network Timeout**: Retry with exponential backoff

### Caching Strategy
```kotlin
class ModelCache {
    private val cacheFile = "~/.askme/discovered-models.json"
    private val cacheExpiry = 24.hours
    
    fun getCachedModels(): List<DiscoveredLLM>? {
        // Check cache age and validity
        // Return cached models if fresh
    }
    
    fun updateCache(models: List<DiscoveredLLM>) {
        // Write models to cache file
        // Include timestamp and metadata
    }
}
```

## Integration Points

### Backend API Contract
```json
{
  "models": [
    {
      "name": "string",
      "publisher": "string", 
      "country": "string",
      "accessType": "string",
      "capabilities": ["text-generation", "conversation"],
      "apiEndpoint": "string (optional)",
      "authRequired": "boolean",
      "rateLimits": {
        "requestsPerMinute": "number",
        "tokensPerRequest": "number"
      }
    }
  ],
  "metadata": {
    "lastUpdated": "ISO8601",
    "totalModels": "number"
  }
}
```

### CLI Configuration File
```json
{
  "dynamicModels": {
    "enabled": true,
    "backendUrl": "https://your-backend.onrender.com",
    "cacheExpiryHours": 24,
    "fallbackToStatic": true,
    "filters": {
      "regions": ["US", "Europe"],
      "accessTypes": ["Open Source", "Free Tier"],
      "minCapabilities": ["text-generation"]
    }
  },
  "userPreferences": {
    "preferredModels": ["GPT-3.5", "Llama-2"],
    "avoidModels": [],
    "maxResponseTime": 30
  }
}
```

## Testing Strategy

### Unit Tests
- Model fetching and parsing
- Provider registry management
- Cache operations
- Fallback mechanisms

### Integration Tests
- End-to-end model discovery
- CLI command execution
- Error scenarios
- Performance benchmarks

### User Acceptance Tests
- Model selection accuracy
- Response quality comparison
- Performance impact measurement
- User workflow validation

## Migration Plan

### Backward Compatibility
1. **Feature Flag**: Dynamic models disabled by default initially
2. **Gradual Rollout**: Enable for beta users first
3. **Fallback**: Always maintain static provider support
4. **User Choice**: Allow users to opt-in/out

### Deployment Strategy
1. **Phase 2.1**: Backend integration only (no UI changes)
2. **Phase 2.2**: Internal model registry (no user exposure)
3. **Phase 2.3**: CLI commands and user features
4. **Phase 2.4**: Default enable with monitoring

## Success Metrics

### Technical Metrics
- API response time < 2 seconds
- Cache hit rate > 80%
- Error rate < 5%
- Model discovery accuracy > 95%

### User Metrics
- User adoption rate of discovered models
- Response quality ratings
- CLI usage patterns
- Support ticket reduction

## Risk Mitigation

### High-Risk Items
1. **Backend Dependency**: CLI becomes dependent on external service
   - *Mitigation*: Robust caching and fallback to static providers

2. **Model Quality**: Discovered models may be lower quality
   - *Mitigation*: Quality scoring, user feedback, manual curation

3. **Performance Impact**: Additional network calls slow CLI
   - *Mitigation*: Async loading, background updates, local caching

4. **Security Concerns**: External model endpoints
   - *Mitigation*: Validate endpoints, rate limiting, user warnings

### Contingency Plans
- **Rollback Capability**: Disable dynamic models via config
- **Emergency Fallback**: Revert to static-only mode
- **Manual Override**: Allow users to force static providers
- **Monitoring**: Real-time alerts for integration issues

## Future Enhancements

### Phase 3: Advanced Features
- Model performance analytics
- User rating system
- Community model submissions
- Custom model integrations
- Multi-modal support (vision, audio)

### Phase 4: Ecosystem Integration
- Plugin system for custom providers
- Third-party model marketplaces  
- Enterprise model catalogs
- Model recommendation engine
- Usage analytics and optimization