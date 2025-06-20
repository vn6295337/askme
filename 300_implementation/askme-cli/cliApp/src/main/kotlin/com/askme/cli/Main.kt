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
    val interactive by parser.option(ArgType.Boolean, shortName = "i", description = "Interactive mode").default(false)
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
    
    runBlocking {
        when {
            stats -> {
                println(IntelligentProviderManager.getProviderStats())
            }
            smartMode && promptFile != null -> {
                val prompt = File(promptFile!!).readText()
                println("🤖 askme CLI - Smart Mode (File Input)")
                println("📄 File: $promptFile")
                println(IntelligentProviderManager.getSmartResponse(prompt))
            }
            smartMode && interactive -> {
                println("🤖 askme CLI - Smart Interactive Mode")
                print("📝 Enter prompt: ")
                val prompt = readlnOrNull() ?: ""
                if (prompt.isNotEmpty()) {
                    println(IntelligentProviderManager.getSmartResponse(prompt))
                }
            }
            smartMode && question != null -> {
                println("🤖 askme CLI - Smart Mode")
                println(IntelligentProviderManager.getSmartResponse(question!!))
            }
            smartMode -> {
                println("🤖 askme CLI - Smart Mode")
                print("📝 Enter prompt: ")
                val prompt = readlnOrNull() ?: ""
                if (prompt.isNotEmpty()) {
                    println(IntelligentProviderManager.getSmartResponse(prompt))
                }
            }
            promptFile != null -> {
                val prompt = File(promptFile!!).readText()
                println("🤖 askme CLI - Processing prompt from file: $promptFile")
                println("🎯 Selected model: $model")
                println("💬 Response: ${processQuery(prompt, model)}")
            }
            interactive -> {
                println("🤖 askme CLI - Interactive Mode")
                println("🎯 Selected model: $model")
                print("📝 Enter prompt: ")
                val prompt = readlnOrNull() ?: ""
                if (prompt.isNotEmpty()) {
                    println("💬 Response: ${processQuery(prompt, model)}")
                }
            }
            question != null -> {
                println("🤖 askme CLI - Direct Question")
                println("🎯 Selected model: $model")
                println("💬 Response: ${processQuery(question!!, model)}")
            }
            else -> {
                println("🤖 askme CLI - LLM Client v1.1")
                println("✅ LIVE: Google Gemini + Mistral AI + Llama")
                println("🧠 NEW: Smart Provider Selection")
                println()
                println("Usage:")
                println("  askme \"your question here\"")
                println("  askme -s \"smart question\"      # Auto-select best provider")
                println("  askme -f <file> -m <provider>")
                println("  askme -i -m <provider>")
                println("  askme --stats                   # Show provider performance")
                println()
                println("Providers: google, mistral, llama")
                println("Smart Mode: Use -s for automatic provider selection")
            }
        }
    }
}
