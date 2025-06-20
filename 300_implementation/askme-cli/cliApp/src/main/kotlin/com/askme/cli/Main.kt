package com.askme.cli
import kotlinx.cli.*
import kotlinx.coroutines.runBlocking
import com.askme.providers.GoogleGemini
import com.askme.providers.MistralAI
import com.askme.providers.XAI
import com.askme.providers.LlamaAI
import com.askme.providers.IntelligentProviderManager
import java.io.File

fun main(args: Array<String>) {
    val parser = ArgParser("askme")
    
    val model by parser.option(ArgType.String, shortName = "m", description = "LLM model provider").default("google")
    val promptFile by parser.option(ArgType.String, shortName = "f", description = "File containing prompt text")
    val nonInteractive by parser.option(ArgType.Boolean, shortName = "n", description = "Non-interactive mode (single query)").default(false)
    val smartMode by parser.option(ArgType.Boolean, shortName = "s", description = "Smart provider selection").default(false)
    val stats by parser.option(ArgType.Boolean, description = "Show provider performance stats").default(false)
    val question by parser.argument(ArgType.String, description = "Direct question to ask").optional()
    
    parser.parse(args)
    
    suspend fun processQuery(prompt: String, provider: String): String {
        return when (provider.lowercase()) {
            "google", "gemini" -> {
                val apiKey = System.getenv("GOOGLE_API_KEY")
                if (apiKey.isNullOrBlank()) {
                    "❌ Google API key required. Get free key at: https://makersuite.google.com/app/apikey"
                } else {
                    GoogleGemini.chat(prompt, apiKey)
                }
            }
            "mistral" -> {
                val apiKey = System.getenv("MISTRAL_API_KEY")
                if (apiKey.isNullOrBlank()) {
                    "❌ Mistral API key required. Get key at: https://console.mistral.ai/"
                } else {
                    MistralAI.chat(prompt, apiKey)
                }
            }
            "xai", "grok" -> {
                val apiKey = System.getenv("XAI_API_KEY")
                if (apiKey.isNullOrBlank()) {
                    "❌ XAI API key required. Get key at: https://console.x.ai/"
                } else {
                    XAI.chat(prompt, apiKey)
                }
            }
            "llama", "together" -> {
                val apiKey = System.getenv("LLAMA_API_KEY")
                if (apiKey.isNullOrBlank()) {
                    "❌ Llama API key required. Get free key at: https://api.together.xyz/"
                } else {
                    LlamaAI.chat(prompt, apiKey)
                }
            }
            else -> "❌ Provider $provider not implemented yet"
        }
    }
    
    suspend fun runInteractiveMode(provider: String, isSmartMode: Boolean = false) {
        if (isSmartMode) {
            println("🤖 askme CLI - Smart Interactive Mode")
            println("🧠 Intelligent provider selection enabled")
        } else {
            println("🤖 askme CLI - Interactive Mode")
            println("🎯 Selected model: $provider")
        }
        println("💡 Type 'exit' or 'quit' to end session")
        println("💡 Type 'help' for available commands")
        println("💡 Type 'switch <provider>' to change providers")
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
                    • switch <provider> - Change AI provider (google, mistral, xai, llama)
                    • stats - Show provider performance statistics
                    • help - Show this help message
                    • exit/quit/q - End session
                    
                    🤖 Available Providers:
                    • google (Gemini) - Free tier available
                    • mistral - Free tier available  
                    • xai (Grok) - API key required
                    • llama - Free tier available
                    """.trimIndent())
                }
                input.lowercase().startsWith("switch ") -> {
                    val newProvider = input.substring(7).trim().lowercase()
                    if (newProvider in listOf("google", "gemini", "mistral", "xai", "grok", "llama", "together")) {
                        currentProvider = when (newProvider) {
                            "gemini" -> "google"
                            "grok" -> "xai"
                            "together" -> "llama"
                            else -> newProvider
                        }
                        println("🔄 Switched to provider: $currentProvider")
                    } else {
                        println("❌ Unknown provider. Available: google, mistral, xai, llama")
                    }
                }
                input.lowercase() == "stats" -> {
                    println(IntelligentProviderManager.getProviderStats())
                }
                else -> {
                    val response = if (isSmartMode) {
                        IntelligentProviderManager.getSmartResponse(input)
                    } else {
                        processQuery(input, currentProvider)
                    }
                    println("💬 $response")
                    println()
                }
            }
        }
    }
    
    runBlocking {
        when {
            stats -> {
                println(IntelligentProviderManager.getProviderStats())
            }
            promptFile != null -> {
                val prompt = File(promptFile!!).readText()
                if (smartMode) {
                    println("🤖 askme CLI - Smart Mode (File Input)")
                    println("📄 File: $promptFile")
                    println(IntelligentProviderManager.getSmartResponse(prompt))
                } else {
                    println("🤖 askme CLI - Processing prompt from file: $promptFile")
                    println("🎯 Selected model: $model")
                    println("💬 Response: ${processQuery(prompt, model)}")
                }
            }
            question != null && nonInteractive -> {
                // Single query mode
                if (smartMode) {
                    println("🤖 askme CLI - Smart Mode")
                    println(IntelligentProviderManager.getSmartResponse(question!!))
                } else {
                    println("🤖 askme CLI - Direct Question")
                    println("🎯 Selected model: $model")
                    println("💬 Response: ${processQuery(question!!, model)}")
                }
            }
            question != null -> {
                // Question provided but interactive mode is default
                if (smartMode) {
                    println("🤖 askme CLI - Smart Interactive Mode")
                    println("🧠 Intelligent provider selection enabled")
                    println("💬 ${IntelligentProviderManager.getSmartResponse(question!!)}")
                } else {
                    println("🤖 askme CLI - Interactive Mode")
                    println("🎯 Selected model: $model")
                    println("💬 Response: ${processQuery(question!!, model)}")
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
    }
}