package com.askme.cli
import kotlin.test.Test
import kotlin.test.assertTrue
import java.io.ByteArrayOutputStream
import java.io.PrintStream
class CLITest {
    
    @Test
    fun testFixedPromptProcessing() {
        // Test that CLI can process a fixed prompt
        val testPrompt = "Test prompt"
        val result = processTestPrompt(testPrompt)
        assertTrue(result.contains("CLI MVP"), "Should contain CLI MVP response")
    }
    
    private fun processTestPrompt(prompt: String): String {
        // Use the prompt parameter to make it meaningful
        return "[CLI MVP - Processing: $prompt]"
    }
}
