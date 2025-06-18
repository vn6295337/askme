package com.askme.api

import com.askme.model.Answer
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import kotlinx.serialization.Serializable
import java.util.UUID

@Serializable
data class OpenAiRequest(
    val model: String = "gpt-3.5-turbo",
    val messages: List<OpenAiMessage>,
    val max_tokens: Int = 150
)

@Serializable
data class OpenAiMessage(
    val role: String,
    val content: String
)

@Serializable
data class OpenAiResponse(
    val choices: List<OpenAiChoice>
)

@Serializable
data class OpenAiChoice(
    val message: OpenAiMessage
)

class OpenAiProvider(private val apiKey: String) : AiProvider {
    override val name = "OpenAI"

    override suspend fun askQuestion(question: String): Answer {
        try {
            val request = OpenAiRequest(
                messages = listOf(
                    OpenAiMessage(role = "user", content = question)
                )
            )

            val response = ApiClient.httpClient.post("https://api.openai.com/v1/chat/completions") {
                header("Authorization", "Bearer $apiKey")
                header("Content-Type", "application/json")
                setBody(request)
            }

            val responseBody = response.bodyAsText()
            val openAiResponse = Json.decodeFromString<OpenAiResponse>(responseBody)
            val answerText = openAiResponse.choices.firstOrNull()?.message?.content ?: "No response received"

            return Answer(
                id = UUID.randomUUID().toString(),
                questionId = UUID.randomUUID().toString(), // In real app, pass from question
                text = answerText,
                provider = name
            )
        } catch (e: Exception) {
            return Answer(
                id = UUID.randomUUID().toString(),
                questionId = UUID.randomUUID().toString(),
                text = "Error: ${e.message}",
                provider = name
            )
        }
    }
}
