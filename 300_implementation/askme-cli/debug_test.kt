fun main() {
    val apiKey = System.getenv("GOOGLE_API_KEY")
    println("API Key present: ${!apiKey.isNullOrBlank()}")
    if (!apiKey.isNullOrBlank()) {
        println("Key length: ${apiKey.length}")
        println("Key starts with: ${apiKey.take(10)}...")
    }
}
