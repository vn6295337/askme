package com.askme.cli

import kotlinx.cli.*
import kotlinx.coroutines.runBlocking
import com.askme.providers.*
import java.io.File

fun main(args: Array<String>) {
    val parser = ArgParser("askme")
    
    val model by parser.option(ArgType.String, shortName = "m", description = "Provider: auto, google, mistral, llama, cohere, openrouter, groq").default("auto")
    val explicitModel by parser.option(ArgType.String, shortName = "e", description = "Explicit model to use (bypasses smart selection)")
    val promptFile by parser.option(ArgType.String, shortName = "f", description = "File containing prompt text")
    val smartMode by parser.option(ArgType.Boolean, shortName = "s", description = "Smart provider selection").default(false)
    val stats by parser.option(ArgType.Boolean, description = "Show provider stats").default(false)
    val question by parser.argument(ArgType.String, description = "Direct question").optional()
    
    parser.parse(args)
    
    runBlocking {
        try {
            when {
                stats -> {
                    println(IntelligentProvider.getProviderStats())
                }
                promptFile != null -> {
                    val prompt = File(promptFile!!).readText().trim()
                    println("🤖 askme CLI - Processing file: $promptFile")
                    val response = getResponse(prompt, model, smartMode, explicitModel)
                    println(response)
                }
                question != null -> {
                    println("🤖 askme CLI - Direct Question")
                    val response = getResponse(question!!, model, smartMode, explicitModel)
                    println(response)
                }
                else -> {
                    // Interactive mode
                    runInteractiveMode(model, smartMode, explicitModel)
                }
            }
        } catch (e: Exception) {
            println("❌ Error: ${e.message}")
            println("💡 Please check your connection and try again")
        }
    }
}

fun getSpecificAIProvider(providerName: String): AIProvider? {
    return when (providerName.lowercase()) {
        "google", "gemini" -> GoogleProvider()
        "mistral" -> MistralProvider()
        "llama", "together" -> LlamaProvider()
        "cohere" -> CohereProvider()
        "openrouter" -> OpenRouterProvider()
        "groq" -> GroqProvider()
        else -> null
    }
}

suspend fun getResponse(prompt: String, provider: String, smartMode: Boolean, explicitModel: String?): String {
    return if (explicitModel != null) {
        val selectedProvider = getSpecificAIProvider(provider)
            ?: throw IllegalArgumentException("Unknown provider for explicit model: $provider")
        "🎯 Provider: $provider, Model: $explicitModel\n" + selectedProvider.chat(prompt, explicitModel)
    } else if (smartMode || provider == "auto") {
        IntelligentProvider.processQuery(prompt)
    } else {
        val selectedProvider = getSpecificAIProvider(provider)
        if (selectedProvider != null) {
            "🎯 Provider: $provider\n" + selectedProvider.chat(prompt)
        } else {
            // Fallback to intelligent provider if a specific one isn't found or "auto" is used
            IntelligentProvider.processQuery(prompt)
        }
    }
}

suspend fun runInteractiveMode(provider: String, smartMode: Boolean, explicitModel: String?) {
    println("🤖 AskMe CLI - Interactive Mode")
    if (smartMode || provider == "auto") {
        println("🧠 Intelligent provider selection enabled")
    } else {
        println("🎯 Provider: $provider")
    }
    println("🌐 Connected to backend proxy")
    println("💡 Type 'exit', 'quit', or 'q' to end")
    println("💡 Type 'help' for commands")
    println("💡 Type 'switch <provider>' to change providers")
    println("💡 Type 'stats' for provider statistics")
    println()
    
    var currentProvider = provider
    var currentSmartMode = smartMode
    
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
                • switch <provider> - Change provider (auto, google, mistral, llama, cohere, openrouter, groq)
                • stats - Show provider statistics and performance
                • help - Show this help message
                • exit/quit/q - End session
                
                🤖 Available Providers:
                • auto - Intelligent provider selection based on query
                • google - Google Gemini models
                • mistral - Mistral AI models
                • llama - Llama models via Together.ai
                • cohere - Cohere command models
                • openrouter - OpenRouter unified API
                • groq - Ultra-fast Groq inference
                """.trimIndent())
            }
            input.lowercase() == "stats" -> {
                println(IntelligentProvider.getProviderStats())
            }
            input.lowercase().startsWith("switch ") -> {
                val newProvider = input.substring(7).trim().lowercase()
                if (newProvider in listOf("auto", "google", "gemini", "mistral", "llama", "together", "cohere", "openrouter", "groq")) {
                    currentProvider = when (newProvider) {
                        "gemini" -> "google"
                        "together" -> "llama"
                        else -> newProvider
                    }
                    currentSmartMode = (currentProvider == "auto")
                    println("🔄 Switched to provider: $currentProvider")
                } else {
                    println("❌ Unknown provider. Available: auto, google, mistral, llama, cohere, openrouter, groq")
                }
            }
            else -> {
                val response = getResponse(input, currentProvider, currentSmartMode, explicitModel)
                println(response)
                println()
            }
        }
    }
}
