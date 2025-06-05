# Architecture & Modules Overview

## Module Descriptions
- **Core**: Shared business logic, including query processing, provider management, and settings. The heart of the app's intelligence and privacy features.
- **AndroidApp**: Modern, user-friendly interface for Android devices using Jetpack Compose. Connects to Core for all logic and model management.
- **CLI**: Simple command-line interface for Linux users, making it easy to interact with LLMs from the terminal. Also connects to Core for all processing.

## Dependencies & Versioning

All dependencies and tools are version-pinned in the [Gradle version catalog](../../gradle/libs.versions.toml) for maximum compatibility and reproducibility. The rationale for each major tech choice and version alignment is documented at the top of that file.

**Key technologies:**
- Kotlin Multiplatform (shared logic)
- Jetpack Compose (Android UI, via Compose BOM)
- Ktor (networking)
- gRPC (remote procedure calls)
- Koin (dependency injection)
- SQLDelight (local database)
- AndroidX (core Android libraries)
- JUnit, MockK, Kotest, Turbine (testing)
- Detekt, ktlint (code quality)
- Dokka (documentation)

For a concise summary, see this document. For full versioning and rationale, see `gradle/libs.versions.toml`.
