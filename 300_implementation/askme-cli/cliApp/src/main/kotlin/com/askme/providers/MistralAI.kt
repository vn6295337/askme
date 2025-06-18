package com.askme.providers

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import kotlinx.serialization.json.*

object MistralAI {
    private val client = HttpClient(CIO)
    
    suspend fun chat(prompt: String, apiKey: String): String {
        return try {
            // Escape the prompt properly
            val escapedPrompt = prompt.trim().replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r")
            
            // Create raw JSON request with escaped prompt
            val requestJson = """
            {
                "model": "mistral-small-latest",
                "messages": [
                    {
                        "role": "user",
                        "content": "$escapedPrompt"
                    }
                ],
                "max_tokens": 500
            }
            """.trimIndent()
            
            val httpResponse: HttpResponse = client.post("https://api.mistral.ai/v1/chat/completions") {
                header("Authorization", "Bearer $apiKey")
                header("Content-Type", "application/json")
                setBody(requestJson)
            }
            
            val responseText = httpResponse.bodyAsText()
            
            // Parse response manually
            val jsonElement = Json.parseToJsonElement(responseText)
            val jsonObject = jsonElement.jsonObject
            
            // Check for error
            if (jsonObject.containsKey("error")) {
                val errorMessage = jsonObject["error"]?.jsonObject?.get("message")?.jsonPrimitive?.content
                return "❌ Mistral API Error: $errorMessage"
            }
            
            // Check for detail (validation error)
            if (jsonObject.containsKey("detail")) {
                return "❌ Mistral API Error: Invalid request format"
            }
            
            // Extract response
            val choices = jsonObject["choices"]?.jsonArray
            val firstChoice = choices?.firstOrNull()?.jsonObject
            val message = firstChoice?.get("message")?.jsonObject
            val content = message?.get("content")?.jsonPrimitive?.content
            
            content ?: "No response from Mistral"
                
        } catch (e: Exception) {
            "❌ Mistral API Error: ${e.message}"
        }
    }
}
