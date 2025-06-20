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
    
    suspend fun chat(prompt: String, apiKey: String): String {
        return try {
            val requestJson = """
            {
                "model": "meta-llama/Llama-2-7b-chat-hf",
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
            
            // Parse response manually
            val jsonElement = Json.parseToJsonElement(responseText)
            val jsonObject = jsonElement.jsonObject
            
            // Check for error
            if (jsonObject.containsKey("error")) {
                val errorMessage = jsonObject["error"]?.jsonObject?.get("message")?.jsonPrimitive?.content
                return "❌ Llama API Error: $errorMessage"
            }
            
            // Extract response
            val choices = jsonObject["choices"]?.jsonArray
            val firstChoice = choices?.firstOrNull()?.jsonObject
            val message = firstChoice?.get("message")?.jsonObject
            val content = message?.get("content")?.jsonPrimitive?.content
            
            content ?: "No response from Llama"
                
        } catch (e: Exception) {
            "❌ Llama API Error: ${e.message}"
        }
    }
}
