package com.askme.providers

import kotlinx.coroutines.withTimeoutOrNull
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.builtins.MapSerializer
import kotlinx.serialization.builtins.serializer
import java.io.File

@Serializable
data class ProviderPerformance(
    val name: String,
    val averageResponseTime: Long = 0L,
    val successCount: Int = 0,
    val failureCount: Int = 0,
    val lastUsed: Long = 0L,
    val isAvailable: Boolean = true
) {
    val successRate: Double = if (successCount + failureCount == 0) 1.0 
                            else successCount.toDouble() / (successCount + failureCount)
    
    val score: Double = when {
        !isAvailable -> 0.0
        successCount == 0 -> 0.5 // Give new providers a chance
        else -> (successRate * 0.6) + ((10000.0 / (averageResponseTime + 1)) * 0.4)
    }
}

object IntelligentProviderManager {
    private val statsFile = File(System.getProperty("user.home"), ".askme-stats.json")
    
    private val providers = mutableMapOf(
        "google" to ProviderPerformance("google"),
        "mistral" to ProviderPerformance("mistral"), 
        "llama" to ProviderPerformance("llama")
    )
    
    private var lastUsedProvider = ""
    
    init {
        loadStats()
    }
    
    private fun loadStats() {
        try {
            if (statsFile.exists()) {
                val json = Json { ignoreUnknownKeys = true }
                val statsText = statsFile.readText()
                val mapSerializer = MapSerializer(String.serializer(), ProviderPerformance.serializer())
                val savedStats = json.decodeFromString(mapSerializer, statsText)
                providers.putAll(savedStats)
                println("📈 Loaded performance history: ${providers.values.sumOf { it.successCount + it.failureCount }} total requests")
            }
        } catch (e: Exception) {
            println("⚠️ Could not load stats: ${e.message}")
        }
    }
    
    private fun saveStats() {
        try {
            val json = Json { prettyPrint = true }
            val mapSerializer = MapSerializer(String.serializer(), ProviderPerformance.serializer())
            val statsText = json.encodeToString(mapSerializer, providers.toMap())
            statsFile.writeText(statsText)
        } catch (e: Exception) {
            println("⚠️ Could not save stats: ${e.message}")
        }
    }
    
    suspend fun getSmartResponse(prompt: String): String {
        val apiKeys = mapOf(
            "google" to System.getenv("GOOGLE_API_KEY"),
            "mistral" to System.getenv("MISTRAL_API_KEY"),
            "llama" to System.getenv("LLAMA_API_KEY")
        )
        
        // Get ranked providers by performance
        val rankedProviders = getRankedProviders()
        
        println("🤖 Smart Provider Selection:")
        rankedProviders.take(3).forEach { provider ->
            println("   ${provider.name}: Score ${String.format("%.2f", provider.score)} | " +
                   "Success ${String.format("%.1f", provider.successRate * 100)}% | " +
                   "Avg ${provider.averageResponseTime}ms")
        }
        
        // Try providers in order of preference
        for (providerName in rankedProviders.map { it.name }) {
            val apiKey = apiKeys[providerName]
            if (apiKey.isNullOrBlank()) {
                println("⚠️  Skipping $providerName: No API key")
                continue
            }
            
            println("🎯 Trying $providerName...")
            
            val result = tryProviderWithMetrics(providerName, prompt, apiKey)
            if (!result.startsWith("❌")) {
                println("✅ Success with $providerName")
                lastUsedProvider = providerName
                return "🎯 Selected provider: $providerName\n💬 Response: $result"
            } else {
                println("❌ Failed with $providerName: ${result.take(50)}...")
            }
        }
        
        return "❌ All providers failed. Please check your API keys and try again."
    }
    
    private suspend fun tryProviderWithMetrics(providerName: String, prompt: String, apiKey: String): String {
        val startTime = System.currentTimeMillis()
        
        return try {
            val result = withTimeoutOrNull(30000) { // 30 second timeout
                when (providerName) {
                    "google" -> GoogleGemini.chat(prompt, apiKey)
                    "mistral" -> MistralAI.chat(prompt, apiKey)
                    "llama" -> LlamaAI.chat(prompt, apiKey)
                    else -> "❌ Unknown provider: $providerName"
                }
            } ?: "❌ Timeout: Provider took too long to respond"
            
            val responseTime = System.currentTimeMillis() - startTime
            
            if (result.startsWith("❌")) {
                recordFailure(providerName, responseTime)
            } else {
                recordSuccess(providerName, responseTime)
            }
            
            result
        } catch (e: Exception) {
            val responseTime = System.currentTimeMillis() - startTime
            recordFailure(providerName, responseTime)
            "❌ Exception: ${e.message}"
        }
    }
    
    private fun recordSuccess(providerName: String, responseTime: Long) {
        val current = providers[providerName] ?: return
        val newAvgTime = if (current.successCount == 0) responseTime 
                        else (current.averageResponseTime * current.successCount + responseTime) / (current.successCount + 1)
        
        providers[providerName] = current.copy(
            averageResponseTime = newAvgTime,
            successCount = current.successCount + 1,
            lastUsed = System.currentTimeMillis(),
            isAvailable = true
        )
        saveStats() // Save after recording success
    }
    
    private fun recordFailure(providerName: String, responseTime: Long) {
        val current = providers[providerName] ?: return
        providers[providerName] = current.copy(
            failureCount = current.failureCount + 1,
            isAvailable = current.failureCount < 3 // Mark unavailable after 3 failures
        )
        saveStats() // Save after recording failure
    }
    
    private fun getRankedProviders(): List<ProviderPerformance> {
        return providers.values
            .filter { it.isAvailable }
            .sortedWith(compareByDescending<ProviderPerformance> { it.score }
                .thenBy { if (it.name == lastUsedProvider) 1 else 0 }) // Prefer different provider than last used
    }
    
    fun getProviderStats(): String {
        return buildString {
            appendLine("📊 Provider Performance Stats:")
            providers.values.sortedByDescending { it.score }.forEach { provider ->
                appendLine("${provider.name.uppercase()}:")
                appendLine("  Score: ${String.format("%.2f", provider.score)}")
                appendLine("  Success Rate: ${String.format("%.1f", provider.successRate * 100)}%")
                appendLine("  Avg Response: ${provider.averageResponseTime}ms")
                appendLine("  Total Requests: ${provider.successCount + provider.failureCount}")
                appendLine("  Available: ${if (provider.isAvailable) "✅" else "❌"}")
                appendLine()
            }
        }
    }
    
    fun resetStats(): String {
        providers.replaceAll { name, _ -> ProviderPerformance(name) }
        saveStats()
        return "🔄 Performance stats reset successfully!"
    }
}