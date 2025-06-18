package com.askme.api

import com.askme.model.Answer
import com.askme.model.Question

/**
* Configuration for AI provider management
*/
data class ProviderConfig(
    val openAiApiKey: String? = null,
    val anthropicApiKey: String? = null,
    val mistralApiKey: String? = null,
    val primaryProvider: String = "openai",
    val enableFailover: Boolean = true,
    val maxRetryAttempts: Int = 2
)

/**
* Manages multiple AI providers with failover and load balancing
*/
class ProviderManager(private val config: ProviderConfig) {

    private val providers: Map<String, AiProvider> by lazy {
        buildMap {
            config.openAiApiKey?.let {
                put("openai", OpenAiProvider(it))
            }
            config.anthropicApiKey?.let {
                put("anthropic", AnthropicProvider(it)) // Supports both Sonnet and Haiku models
                put("gemini", GeminiProvider(it))
            }
            config.mistralApiKey?.let {
                put("mistral", MistralProvider(it))
            }
        }
    }

    private val providerPriority = listOf(
        config.primaryProvider,
        providers.getOrElse(index) {
            throw IllegalStateException(
                "No provider available at index $index"
            )
        }
    ).distinct()

    /**
     * Ask question with automatic provider failover
     */
    suspend fun askQuestion(question: Question): Answer {
        val availableProviders = providerPriority.filter { providers.containsKey(it) }

        if (availableProviders.isEmpty()) {
            throw IllegalStateException("No AI providers configured. Please set API keys.")
        }

        var lastException: Exception? = null
        var attemptCount = 0

        for (providerName in availableProviders) {
            if (attemptCount >= config.maxRetryAttempts) break

            try {
                val provider = providers[providerName]!!
                println("Attempting provider: $providerName")
                return provider.askQuestion(question)
            } catch (e: Exception) {
                println("Provider $providerName failed: ${e.message}")
                lastException = e
                attemptCount++

                if (!config.enableFailover) {
                    throw e
                }
            }
        }

        throw Exception("All providers failed. Last error: ${lastException?.message}")
    }

    /**
     * Get list of available providers
     */
    fun getAvailableProviders(): List<String> {
        return providers.keys.toList()
    }

    /**
     * Check if a specific provider is available
     */
    fun isProviderAvailable(providerName: String): Boolean {
        return providers.containsKey(providerName)
    }

    /**
     * Get provider statistics (for monitoring)
     */
    fun getProviderStats(): Map<String, String> {
        return providers.mapValues { (name, _) ->
            "Available: ${isProviderAvailable(name)}"
        }
    }
}
