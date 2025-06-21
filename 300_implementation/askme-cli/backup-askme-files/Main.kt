package com.askme.cli

import kotlinx.cli.*
import kotlinx.coroutines.runBlocking
import com.askme.providers.IntelligentProviderManager
import java.io.File

fun main(args: Array<String>) {
    val parser = ArgParser("askme")
    
    // Command line arguments
    val provider by parser.option(
        ArgType.String, 
        shortName = "m", 
        description = "Preferred provider: google, mistral, llama, or auto for intelligent selection"
    ).default("auto")
    
    val promptFile by parser.option(
        ArgType.String, 
        shortName = "f", 
        description = "File containing prompt text"
    )
    
    val interactive by parser.option(
        ArgType.Boolean, 
        shortName = "i", 
        description = "Interactive mode"
    ).default(false)
    
    val status by parser.option(
        ArgType.Boolean, 
        shortName = "s", 
        description = "Show system status"
    ).default(false)
    
    val help by parser.option(
        ArgType.Boolean, 
        shortName = "h", 
        description = "Show help"
    ).default(false)
    
    val question by parser.argument(
        ArgType.String, 
        description = "Direct question to ask"
    ).optional()
    
    try {
        parser.parse(args)
    } catch (e: Exception) {
        println("❌ Argument error: ${e.message}")
        println("💡 Use --help for usage information")
        return
    }
    
    if (help) {
        showHelp()
        return
    }
    
    if (status) {
        println(IntelligentProviderManager.getSystemStatus())
        return
    }
    
    runBlocking {
        try {
            when {
                interactive -> runInteractiveMode()
                promptFile != null -> processFile(promptFile!!, provider)
                question != null -> processQuestion(question!!, provider)
                else -> {
                    println("❌ Please provide a question, file, or use interactive mode")
                    println("💡 Examples:")
                    println("   askme \"What is AI?\"")
                    println("   askme -f myfile.txt")
                    println("   askme -i")
                    println("   askme --help")
                }
            }
        } catch (e: Exception) {
            println("❌ Unexpected error: ${e.message}")
            println("💡 Please try again or check your internet connection")
        }
    }
}

private fun showHelp() {
    println("""
🤖 AskMe CLI - Intelligent AI Assistant

USAGE:
  askme [OPTIONS] [QUESTION]

EXAMPLES:
  askme "Explain quantum computing"                    # Auto-select best model
  askme -m google "What is 2+2?"                     # Prefer Google models  
  askme -f questions.txt -m mistral                  # Process file with Mistral preference
  askme -i                                           # Interactive mode
  askme -s                                           # Show system status

OPTIONS:
  -m, --provider <PROVIDER>    Preferred provider (google, mistral, llama, auto)
  -f, --file <FILE>           Read prompt from file
  -i, --interactive           Interactive mode  
  -s, --status                Show system status and model availability
  -h, --help                  Show this help

PROVIDERS:
  auto     🧠 Intelligent selection (analyzes query and picks best model)
  google   🔍 Google Gemini (fast, reliable, good for general queries)
  mistral  ⚡ Mistral AI (excellent for code and detailed analysis)
  llama    🦙 Llama AI (powerful reasoning, good for complex tasks)

INTELLIGENT FEATURES:
  • Automatically analyzes your query type and complexity
  • Selects the best model based on query requirements  
  • Falls back to alternative models if primary choice fails
  • Tracks model performance for improved selection
  • Optimizes for speed vs quality based on query needs

The system will always try multiple models/providers to ensure you get a response!
    """.trimIndent())
}

private suspend fun processQuestion(question: String, preferredProvider: String) {
    if (question.isBlank()) {
        println("❌ Empty question provided")
        return
    }
    
    println("🤖 AskMe CLI - Intelligent AI Assistant")
    
    if (preferredProvider == "auto") {
        println("🧠 Using intelligent model selection")
    } else {
        println("🎯 Preferred provider: $preferredProvider (with intelligent fallbacks)")
    }
    
    println("📝 Question: ${question.take(100)}${if (question.length > 100) "..." else ""}")
    println()
    
    val response = IntelligentProviderManager.query(
        prompt = question, 
        preferredProvider = if (preferredProvider == "auto") null else preferredProvider
    )
    
    println(response)
}

private suspend fun processFile(filepath: String, preferredProvider: String) {
    val file = File(filepath)
    
    if (!file.exists()) {
        println("❌ File not found: $filepath")
        return
    }
    
    val content = try {
        file.readText().trim()
    } catch (e: Exception) {
        println("❌ Error reading file: ${e.message}")
        return
    }
    
    if (content.isBlank()) {
        println("❌ File is empty: $filepath")
        return
    }
    
    println("🤖 AskMe CLI - Processing File")
    println("📄 File: $filepath")
    
    if (preferredProvider == "auto") {
        println("🧠 Using intelligent model selection")
    } else {
        println("🎯 Preferred provider: $preferredProvider (with intelligent fallbacks)")
    }
    
    println("📝 Content: ${content.take(100)}${if (content.length > 100) "..." else ""}")
    println()
    
    val response = IntelligentProviderManager.query(
        prompt = content,
        preferredProvider = if (preferredProvider == "auto") null else preferredProvider
    )
    
    println(response)
}

private suspend fun runInteractiveMode() {
    println("🤖 AskMe CLI - Interactive Mode")
    println("🧠 Intelligent model selection enabled")
    println("💡 Type 'exit' to quit, 'status' for system info, 'help' for commands")
    println("💡 Each question will be analyzed to select the optimal model")
    println()
    
    while (true) {
        print("❓ askme> ")
        val input = readlnOrNull()?.trim() ?: break
        
        when {
            input.isEmpty() -> continue
            input.lowercase() in listOf("exit", "quit", "q") -> {
                println("👋 Goodbye!")
                break
            }
            input.lowercase() == "help" -> {
                println("""
📚 Interactive Commands:
  • Simply type your question and press Enter
  • status  - Show system status and model performance
  • clear   - Clear screen
  • exit    - Exit interactive mode
  
🧠 The system automatically:
  • Analyzes your question type and complexity
  • Selects the best available model
  • Falls back to alternatives if needed
  • Learns from performance to improve future selections
                """.trimIndent())
            }
            input.lowercase() == "status" -> {
                println(IntelligentProviderManager.getSystemStatus())
            }
            input.lowercase() == "clear" -> {
                // Clear screen (ANSI escape sequence)
                print("\u001b[2J\u001b[H")
                println("🤖 AskMe CLI - Interactive Mode")
                println("🧠 Intelligent model selection enabled")
            }
            else -> {
                println()
                val response = IntelligentProviderManager.query(input, null)
                println(response)
                println()
            }
        }
    }
}
