package com.askme.api

import com.askme.model.Answer
import io.ktor.client.request.headers
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.contentType
import kotlinx.serialization.Serializable

enum class ClaudeModel(val modelName: String) {
    SONNET("claude-3-sonnet-20240229"),
    HAIKU("claude-3-haiku-20240307")
}

class AnthropicProvider(
    private val apiKey: String,
    private val model: ClaudeModel = ClaudeModel.SONNET
) : AiProvider {

    @Serializable
    private data class AnthropicRequest(
        val model: String,
        val max_tokens: Int,
        val messages: List<Message>
    )

    @Serializable
    private data class Message(
        val role: String,
        val content: String
    )

    @Serializable
    private data class AnthropicResponse(
        val content: List<ContentBlock>,
        val model: String,
        val usage: Usage
    )

    @Serializable
    private data class ContentBlock(
        val text: String,
        val type: String
    )

    @Serializable
    private data class Usage(
        val input_tokens: Int,
        val output_tokens: Int
    )

    override suspend fun askQuestion(question: String): Answer {
        try {
            val client = ApiClient.client

            val request = AnthropicRequest(
                model = model.modelName,
                max_tokens = if (model == ClaudeModel.HAIKU) 1024 else 2048,
                messages = listOf(
                    Message(role = "user", content = question)
                )
            )

            val response = client.post("https://api.anthropic.com/v1/messages") {
                headers {
                    append("x-api-key", apiKey)
                    append("anthropic-version", "2023-06-01")
                }
                contentType(ContentType.Application.Json)
                setBody(request)
            }

            if (response.status.value in 200..299) {
                val anthropicResponse = kotlinx.serialization.json.Json.decodeFromString<AnthropicResponse>(
                    response.bodyAsText()
                )
                val content = anthropicResponse.content.firstOrNull()?.text ?: "No response"
                return Answer(
                    content = content,
                    provider = "Anthropic ${model.modelName}",
                    timestamp = System.currentTimeMillis()
                )
            } else {
                return Answer(
                    content = "Error: ${response.status}",
                    provider = "Anthropic ${model.modelName}",
                    timestamp = System.currentTimeMillis()
                )
            }
        } catch (e: Exception) {
            return Answer(
                content = "Network error: ${e.message}",
                provider = "Anthropic ${model.modelName}",
                timestamp = System.currentTimeMillis()
            )
        }
    }
}
