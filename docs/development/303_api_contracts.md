# API Contracts

> **Traceability:** Each atomic checklist item in [planning/105_checklist.md](planning/105_checklist.md) is mapped to its corresponding reference in [planning/107_project_plan.md](planning/107_project_plan.md) for full traceability.

## Provider Interface

### Base Request
```kotlin
interface LLMRequest {
    val model: String
    val prompt: String
    val maxTokens: Int
    val temperature: Float
    val topP: Float
    val stream: Boolean
}
```

### Base Response
```kotlin
interface LLMResponse {
    val id: String
    val model: String
    val choices: List<Choice>
    val usage: Usage
}

data class Choice(
    val text: String,
    val index: Int,
    val finishReason: String?
)

data class Usage(
    val promptTokens: Int,
    val completionTokens: Int,
    val totalTokens: Int
)
```

## Supported Providers

### 1. Local Ollama Provider
**Endpoint**: `http://localhost:11434/api/generate` (local)

**Request**
```kotlin
data class OllamaRequest(
    override val model: String,
    override val prompt: String,
    override val maxTokens: Int = 2000,
    override val temperature: Float = 0.7f,
    override val topP: Float = 0.9f,
    override val stream: Boolean = false,
    val context: List<Int>? = null
) : LLMRequest
```

**Response**
```kotlin
data class OllamaResponse(
    override val model: String,
    val createdAt: String,
    val response: String,
    val done: Boolean,
    val context: List<Int>?,
    val totalDuration: Long?,
    val loadDuration: Long?,
    val promptEvalCount: Int?,
    val evalCount: Int?,
    val evalDuration: Long?
) {
    override val id: String = UUID.randomUUID().toString()
    override val choices: List<Choice> = listOf(Choice(response, 0, if (done) "stop" else null))
    override val usage: Usage = Usage(
        promptEvalCount ?: 0,
        evalCount ?: 0,
        (promptEvalCount ?: 0) + (evalCount ?: 0)
    )
}
```

### 2. LocalAI Provider
**Endpoint**: `http://localhost:8080/v1/completions` (configurable)

**Request**
```kotlin
data class LocalAIRequest(
    override val model: String,
    override val prompt: String,
    override val maxTokens: Int = 2000,
    override val temperature: Float = 0.7f,
    override val topP: Float = 0.9f,
    override val stream: Boolean = false,
    val stop: List<String> = listOf("\n", "###")
) : LLMRequest
```

**Response**
```kotlin
data class LocalAIResponse(
    override val id: String,
    override val model: String,
    override val choices: List<Choice>,
    override val usage: Usage
) : LLMResponse
```

## Error Handling

### Error Response
```kotlin
data class ErrorResponse(
    val error: ErrorDetail
)

data class ErrorDetail(
    val message: String,
    val type: String,
    val code: Int?
)
```

## Authentication

### API Key Authentication
For providers requiring API keys:
```http
Authorization: Bearer YOUR_API_KEY
```

### Local Authentication
For local providers, authentication is handled via:
- Local network restrictions (localhost only)
- Optional API key verification for additional security

## Rate Limiting
- Local providers: No rate limiting
- Cloud providers: Follow provider-specific rate limits
- Implemented via `RateLimiter` in the client

## Versioning
- API version: `v1`
- Version included in URL path (e.g., `/v1/...`)
- Backward compatibility maintained for at least 2 major versions
