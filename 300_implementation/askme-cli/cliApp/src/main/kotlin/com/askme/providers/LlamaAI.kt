package com.askme.providers

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import kotlinx.serialization.json.*

object LlamaAI {
    private val client = HttpClient(CIO)
    
    // List of free Llama models to try in order
    private val freeModels = listOf(
        "meta-llama/Meta-Llama-3-8B-Instruct-Turbo",
        "meta-llama/Llama-3-8b-chat-hf", 
        "meta-llama/Meta-Llama-3-70B-Instruct-Turbo",
        "meta-llama/Llama-2-7b-chat-hf",
        "meta-llama/Llama-2-13b-chat-hf"
    )
    
    suspend fun chat(prompt: String, apiKey: String): String {
        // Try each model until one works
        for ((index, model) in freeModels.withIndex()) {
            val result = tryModel(prompt, apiKey, model)
            
            when {
                result.startsWith("❌") && result.contains("non-serverless") -> {
                    // This model requires paid tier, try next one
                    continue
                }
                result.startsWith("❌") && index == freeModels.size - 1 -> {
                    // Last model failed, return the error
                    return result
                }
                result.startsWith("❌") -> {
                    // Other error, try next model
                    continue
                }
                else -> {
                    // Success! Return the response
                    return result
                }
            }
        }
        
        return "❌ Llama API Error: All free models unavailable. Please check your API key or try again later."
    }
    
    private suspend fun tryModel(prompt: String, apiKey: String, model: String): String {
        return try {
            val requestJson = """
            {
                "model": "$model",
                "messages": [
                    {
                        "role": "user",
                        "content": "${prompt.trim().replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r")}"
                    }
                ],
                "max_tokens": 500,
                "temperature": 0.7
            }
            """.trimIndent()
            
            val httpResponse: HttpResponse = client.post("https://api.together.xyz/v1/chat/completions") {
                header("Authorization", "Bearer $apiKey")
                header("Content-Type", "application/json")
                setBody(requestJson)
            }
            
            val responseText = httpResponse.bodyAsText()
            
            // Improved JSON parsing with error handling
            val json = Json { 
                ignoreUnknownKeys = true
                isLenient = true
                coerceInputValues = true
            }
            
            val jsonElement = json.parseToJsonElement(responseText)
            val jsonObject = jsonElement.jsonObject
            
            // Check for error first
            if (jsonObject.containsKey("error")) {
                val errorObj = jsonObject["error"]
                val errorMessage = when {
                    errorObj is JsonObject -> errorObj["message"]?.jsonPrimitive?.content
                    else -> "Unknown error format"
                }
                return "❌ Llama API Error: $errorMessage"
            }
            
            // Check for detail (validation error)
            if (jsonObject.containsKey("detail")) {
                val detail = jsonObject["detail"]?.toString() ?: "Invalid request format"
                return "❌ Llama API Error: $detail"
            }
            
            // Extract response with better error handling
            val choices = jsonObject["choices"]?.jsonArray
            if (choices == null || choices.isEmpty()) {
                return "❌ Llama API Error: No choices in response from model $model"
            }
            
            val firstChoice = choices.firstOrNull()?.jsonObject
            val message = firstChoice?.get("message")?.jsonObject
            val content = message?.get("content")?.jsonPrimitive?.content
            
            content ?: "No response from Llama model $model"
                
        } catch (e: Exception) {
            "❌ Llama API Error: ${e.message}"
        }
    }
}
