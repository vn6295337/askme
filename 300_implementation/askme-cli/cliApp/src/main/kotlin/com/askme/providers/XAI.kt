package com.askme.providers

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import kotlinx.serialization.json.*

object XAI {
    private val client = HttpClient(CIO)
    
    suspend fun chat(prompt: String, apiKey: String): String {
        return try {
            // XAI uses OpenAI-compatible API format
            val requestJson = """
            {
                "model": "grok-beta",
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
            
            val httpResponse: HttpResponse = client.post("https://api.x.ai/v1/chat/completions") {
                header("Authorization", "Bearer $apiKey")
                header("Content-Type", "application/json")
                setBody(requestJson)
            }
            
            val responseText = httpResponse.bodyAsText()
            
            println("DEBUG XAI Response: $responseText")
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
                println("DEBUG Error object: $errorObj")
                val errorMessage = when {
                    errorObj is JsonObject -> {
                        val msg = errorObj["message"]?.jsonPrimitive?.content
                        val type = errorObj["type"]?.jsonPrimitive?.content
                        val code = errorObj["code"]?.jsonPrimitive?.content
                        "Type: $type, Code: $code, Message: $msg"
                    }
                    errorObj is JsonPrimitive -> errorObj.content
                    else -> "Unknown error format: $errorObj"
                }
                return "❌ XAI API Error: $errorMessage"
            }
            
            // Extract response with better error handling
            val choices = jsonObject["choices"]?.jsonArray
            if (choices == null || choices.isEmpty()) {
                return "❌ XAI API Error: No choices in response"
            }
            
            val firstChoice = choices.firstOrNull()?.jsonObject
            val message = firstChoice?.get("message")?.jsonObject
            val content = message?.get("content")?.jsonPrimitive?.content
            
            content ?: "No response from XAI Grok"
                
        } catch (e: Exception) {
            "❌ XAI API Error: ${e.message}"
        }
    }
}
