package com.askme.api

import com.askme.model.Answer
import io.ktor.client.request.headers
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import kotlinx.serialization.Serializable

class MistralProvider(private val apiKey: String) : AiProvider {

    override val providerName = "Mistral AI"

    private val baseUrl = "https://api.mistral.ai/v1/chat/completions"
    private val model = "mistral-small-latest"

    @Serializable
    private data class MistralRequest(
        val model: String,
        val messages: List<Message>,
        val max_tokens: Int,
        val temperature: Double = 0.7
    )

    @Serializable
    private data class Message(
        val role: String,
        val content: String
    )

    @Serializable
    private data class MistralResponse(
        val choices: List<Choice>,
        val model: String,
        val usage: Usage? = null
    )

    @Serializable
    private data class Choice(
        val message: Message,
        val finish_reason: String? = null
    )

    @Serializable
    private data class Usage(
        val prompt_tokens: Int,
        val completion_tokens: Int,
        val total_tokens: Int
    )

    override suspend fun askQuestion(question: String): Answer {
        return try {
            val request = MistralRequest(
                model = model,
                max_tokens = 1000,
                messages = listOf(
                    Message(role = "user", content = question)
                )
            )

            val response = httpClient.post(baseUrl) {
                headers {
                    append("Authorization", "Bearer $apiKey")
                    append("Content-Type", "application/json")
                }
                setBody(request)
            }

            if (response.status.isSuccess()) {
                val mistralResponse = Json.decodeFromString<MistralResponse>(response.bodyAsText())
                val content = mistralResponse.choices.firstOrNull()?.message?.content ?: "No response content"

                Answer(
                    id = generateId(),
                    content = content,
                    provider = providerName,
                    timestamp = getCurrentTimestamp()
                )
            } else {
                Answer(
                    id = generateId(),
                    content = "Error: Failed to get response from Mistral (${response.status})",
                    provider = providerName,
                    timestamp = getCurrentTimestamp()
                )
            }
        } catch (e: Exception) {
            Answer(
                id = generateId(),
                content = "Error: ${e.message}",
                provider = providerName,
                timestamp = getCurrentTimestamp()
            )
        }
    }
}
