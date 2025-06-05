# High-Level Modules

These are the main modules for the AskMe Lite project:

- **Core**: Handles all shared business logic, including query processing, provider management, and settings. This is the heart of the app's intelligence and privacy features.
- **AndroidApp**: Provides a modern, user-friendly interface on Android devices using Jetpack Compose. Connects to the Core for all logic and model management.
- **CLI**: Offers a simple command-line interface for Linux users, making it easy to interact with LLMs from the terminal. Also connects to the Core for all processing.

## Dependencies
The following third-party libraries are used across modules. See the version catalog (`gradle/libs.versions.toml`) for rationale and exact version pins:

- Ktor (networking)
- gRPC (remote procedure calls)
- Koin (dependency injection)
- SQLDelight (local database)
- Detekt (code quality/linting)
- Jetpack Compose (Android UI)
- Kotlin Multiplatform (shared logic)
- AndroidX (core Android libraries)
- JUnit, MockK, Kotest, Turbine (testing)
- Dokka (documentation)
- ktlint (code formatting)

**Versioning and rationale:**
All versions are pinned and justified in `gradle/libs.versions.toml` to ensure maximum compatibility, reproducibility, and ease of maintenance. See the rationale section at the top of that file for details on each major tech choice and version alignment.

(Referenced from the architecture overview in `301_architecture.md`)
