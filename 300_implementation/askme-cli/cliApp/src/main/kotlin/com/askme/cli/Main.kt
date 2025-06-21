package com.askme.cli
import kotlinx.cli.*
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import java.io.File

// Backend proxy configuration
const val BACKEND_URL = "https://askmecli-production.up.railway.app"

@Serializable
data class ChatRequest(
    val prompt: String,
    val provider: String = "auto"
)

@Serializable
data class ChatResponse(
    val response: String,
    val provider: String,
    val responseTime: Int,
    val timestamp: String
)

@Serializable
data class ErrorResponse(
    val error: String
)

@Serializable
data class ProviderInfo(
    val name: String,
    val available: Boolean,
    val status: String
)

@Serializable
data class ProvidersResponse(
    val providers: List<ProviderInfo>,
    val timestamp: String
)

fun main(args: Array<String>) {
    val parser = ArgParser("askme")
    
    val model by parser.option(ArgType.String, shortName = "m", description = "LLM model provider").default("auto")
    val promptFile by parser.option(ArgType.String, shortName = "f", description = "File containing prompt text")
    val nonInteractive by parser.option(ArgType.Boolean, shortName = "n", description = "Non-interactive mode (single query)").default(false)
    val smartMode by parser.option(ArgType.Boolean, shortName = "s", description = "Smart provider selection").default(false)
    val stats by parser.option(ArgType.Boolean, description = "Show provider performance stats").default(false)
    val question by parser.argument(ArgType.String, description = "Direct question to ask").optional()
    
    parser.parse(args)
    
    // HTTP client for backend communication
    val httpClient = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                coerceInputValues = true
            })
        }
    }
    
    suspend fun processQuery(prompt: String, provider: String): String {
        return try {
            val response = httpClient.post("$BACKEND_URL/api/chat") {
                contentType(ContentType.Application.Json)
                setBody(ChatRequest(prompt, provider))
            }
            
            when (response.status) {
                HttpStatusCode.OK -> {
                    val chatResponse = response.body<ChatResponse>()
                    "💬 ${chatResponse.response}\n\n🎯 Provider: ${chatResponse.provider} | ⏱️ ${chatResponse.responseTime}ms"
                }
                else -> {
                    try {
                        val errorResponse = response.body<ErrorResponse>()
                        "❌ Error: ${errorResponse.error}"
                    } catch (e: Exception) {
                        "❌ Network error: ${response.status}"
                    }
                }
            }
        } catch (e: Exception) {
            "❌ Connection error: ${e.message}\n💡 Please check your internet connection"
        }
    }
    
    suspend fun getProviderStats(): String {
        return try {
            val response = httpClient.get("$BACKEND_URL/api/providers")
            
            when (response.status) {
                HttpStatusCode.OK -> {
                    val providersResponse = response.body<ProvidersResponse>()
                    buildString {
                        appendLine("📊 Provider Status:")
                        appendLine()
                        providersResponse.providers.forEach { provider ->
                            val status = if (provider.available) "✅ Active" else "❌ Unavailable"
                            val name = provider.name.replaceFirstChar { it.uppercase() }
                            appendLine("  $name: $status")
                        }
                        appendLine()
                        appendLine("🌐 Backend: $BACKEND_URL")
                        appendLine("🕒 Updated: ${providersResponse.timestamp}")
                    }
                }
                else -> "❌ Unable to fetch provider statistics"
            }
        } catch (e: Exception) {
            "❌ Connection error: ${e.message}"
        }
    }
    
    suspend fun runInteractiveMode(provider: String, isSmartMode: Boolean = false) {
        println("🤖 AskMe CLI - Interactive Mode")
        if (isSmartMode) {
            println("🧠 Smart provider selection enabled")
        } else {
            println("🎯 Provider: $provider")
        }
        
        println("🌐 Connected to secure backend proxy")
        println("🔐 Zero API key configuration required")
        println("💡 Type 'exit' or 'quit' to end session")
        println("💡 Type 'help' for available commands")
        println("💡 Type 'switch <provider>' to change providers")
        println("💡 Type 'status' to check provider availability")
        println()
        
        var currentProvider = provider
        
        while (true) {
            print("📝 askme> ")
            val input = readlnOrNull()?.trim() ?: break
            
            when {
                input.isEmpty() -> continue
                input.lowercase() in listOf("exit", "quit", "q") -> {
                    println("👋 Goodbye!")
                    break
                }
                input.lowercase() == "help" -> {
                    println("""
                    📚 Available Commands:
                    • Simply type your question and press Enter
                    • switch <provider> - Change AI provider (auto, google, mistral, llama)
                    • status - Check provider availability and performance
                    • help - Show this help message
                    • exit/quit/q - End session
                    
                    🤖 Available Providers:
                    • auto - Automatically choose best available provider
                    • google - Google Gemini
                    • mistral - Mistral AI
                    • llama - Together AI / Llama
                    
                    🌐 Backend: $BACKEND_URL
                    """.trimIndent())
                }
                input.lowercase() == "status" -> {
                    println(getProviderStats())
                }
                input.lowercase().startsWith("switch ") -> {
                    val newProvider = input.substring(7).trim().lowercase()
                    if (newProvider in listOf("auto", "google", "gemini", "mistral", "llama", "together")) {
                        currentProvider = when (newProvider) {
                            "gemini" -> "google"
                            "together" -> "llama"
                            else -> newProvider
                        }
                        println("🔄 Switched to provider: $currentProvider")
                    } else {
                        println("❌ Unknown provider. Available: auto, google, mistral, llama")
                    }
                }
                else -> {
                    val response = if (isSmartMode) {
                        processQuery(input, "auto")
                    } else {
                        processQuery(input, currentProvider)
                    }
                    println(response)
                    println()
                }
            }
        }
    }
    
    runBlocking {
        try {
            when {
                stats -> {
                    println(getProviderStats())
                }
                promptFile != null -> {
                    val prompt = File(promptFile!!).readText()
                    println("🤖 askme CLI - Processing file: $promptFile")
                    if (smartMode) {
                        println("🧠 Using smart provider selection")
                        println(processQuery(prompt, "auto"))
                    } else {
                        println("🎯 Using provider: $model")
                        println(processQuery(prompt, model))
                    }
                }
                question != null && nonInteractive -> {
                    // Single query mode
                    if (smartMode) {
                        println("🤖 askme CLI - Smart Mode")
                        println(processQuery(question!!, "auto"))
                    } else {
                        println("🤖 askme CLI - Direct Question")
                        println("🎯 Provider: $model")
                        println(processQuery(question!!, model))
                    }
                }
                question != null -> {
                    // Question provided but interactive mode is default
                    if (smartMode) {
                        println("🤖 askme CLI - Smart Interactive Mode")
                        println("🧠 Intelligent provider selection enabled")
                        println(processQuery(question!!, "auto"))
                    } else {
                        println("🤖 askme CLI - Interactive Mode")
                        println("🎯 Provider: $model")
                        println(processQuery(question!!, model))
                    }
                    println()
                    println("🔄 Continuing in interactive mode...")
                    runInteractiveMode(model, smartMode)
                }
                else -> {
                    // Default: Interactive mode
                    runInteractiveMode(model, smartMode)
                }
            }
        } catch (e: Exception) {
            println("❌ Application error: ${e.message}")
            println("💡 Please check your internet connection and try again")
        } finally {
            httpClient.close()
        }
    }
}