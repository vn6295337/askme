package com.askme.test

import com.askme.providers.DirectGoogleGemini
import com.askme.providers.DirectMistralAI
import com.askme.providers.DirectLlamaAI
import com.askme.providers.DirectAPIKeys
import kotlinx.coroutines.runBlocking

fun main() {
    println("🔍 Testing Direct API Implementations (Pre-Backend)")
    println("=".repeat(50))
    
    runBlocking {
        // Test Google Gemini Direct API
        println("\n🤖 Testing Google Gemini Direct API:")
        val googleKey = DirectAPIKeys.getGoogleKey()
        if (googleKey != null) {
            println("✅ Google API key found")
            try {
                val googleResult = DirectGoogleGemini.chat("What is 2+2?", googleKey)
                println("📝 Google Response: $googleResult")
            } catch (e: Exception) {
                println("❌ Google Error: ${e.message}")
            }
        } else {
            println("⚠️ Google API key not found in environment")
            println("💡 Set GOOGLE_API_KEY environment variable to test")
        }
        
        // Test Mistral Direct API
        println("\n🤖 Testing Mistral AI Direct API:")
        val mistralKey = DirectAPIKeys.getMistralKey()
        if (mistralKey != null) {
            println("✅ Mistral API key found")
            try {
                val mistralResult = DirectMistralAI.chat("What is 2+2?", mistralKey)
                println("📝 Mistral Response: $mistralResult")
            } catch (e: Exception) {
                println("❌ Mistral Error: ${e.message}")
            }
        } else {
            println("⚠️ Mistral API key not found in environment")
            println("💡 Set MISTRAL_API_KEY environment variable to test")
        }
        
        // Test Llama Direct API
        println("\n🤖 Testing Llama AI Direct API:")
        val llamaKey = DirectAPIKeys.getLlamaKey()
        if (llamaKey != null) {
            println("✅ Llama API key found")
            try {
                val llamaResult = DirectLlamaAI.chat("What is 2+2?", llamaKey)
                println("📝 Llama Response: $llamaResult")
            } catch (e: Exception) {
                println("❌ Llama Error: ${e.message}")
            }
        } else {
            println("⚠️ Llama API key not found in environment")
            println("💡 Set LLAMA_API_KEY environment variable to test")
        }
        
        println("\n" + "=".repeat(50))
        println("🎯 Test completed. Compare these results with backend behavior.")
    }
}