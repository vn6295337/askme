package com.askme.api

import com.askme.model.Answer

interface AiProvider {
    val name: String
    suspend fun askQuestion(question: String): Answer
}
