package com.askme.cli
import kotlinx.cli.*
import kotlinx.coroutines.runBlocking
import com.askme.providers.GoogleGemini
import com.askme.providers.MistralAI
import java.io.File

fun main(args: Array<String>) {
    val parser = ArgParser("askme")
    
    val model by parser.option(ArgType.String, shortName = "m", description = "LLM model provider").default("google")
    val promptFile by parser.option(ArgType.String, shortName = "f", description = "File containing prompt text")
    val interactive by parser.option(ArgType.Boolean, shortName = "i", description = "Interactive mode").default(false)
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
                    "❌ Mistral API key required. Get key at: https://makersuite.google.com/"
                } else {
                    MistralAI.chat(prompt, apiKey)
                }
            }
            else -> "❌ Provider $provider not implemented yet"
        }
    }
    
    runBlocking {
        when {
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
                println("🤖 askme CLI - LLM Client v1.0")
                println("✅ LIVE: Google Gemini + Mistral AI")
                println()
                println("Usage:")
                println("  askme \"your question here\"")
                println("  askme -f <file> -m <provider>")
                println("  askme -i -m <provider>")
                println()
                println("Providers: google, mistral")
            }
        }
    }
}
