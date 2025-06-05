# Tech Stack

> **Traceability:** Each atomic checklist item in [planning/105_checklist.md](planning/105_checklist.md) is mapped to its corresponding reference in [planning/107_project_plan.md](planning/107_project_plan.md) for full traceability.

## Core Technologies

- **Kotlin Multiplatform**: Shared business logic for Android and CLI
- **Jetpack Compose**: Modern Android UI (versioned via Compose BOM)
- **Ktor**: Networking (API calls, multiplatform)
- **gRPC**: Local model server communication
- **Koin**: Dependency injection
- **SQLDelight**: Local database
- **AndroidX**: Core Android libraries
- **JUnit, MockK, Kotest, Turbine**: Testing
- **Detekt, ktlint**: Code quality
- **Dokka**: Documentation

## Versioning & Rationale

All dependencies and tools are version-pinned in the [Gradle version catalog](../../gradle/libs.versions.toml) for maximum compatibility, reproducibility, and ease of maintenance. The rationale for each major tech choice and version alignment is documented at the top of that file.

For a concise summary of modules and dependencies, see [HighLevelModules.md](../planning/HighLevelModules.md).
