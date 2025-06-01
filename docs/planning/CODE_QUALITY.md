# Code Quality Standards

This document outlines the code quality standards and static analysis setup for the AskMe Lite project.

## Detekt Configuration

The project uses [Detekt](https://detekt.dev/) for static code analysis of Kotlin code. The configuration is located at `config/detekt/detekt.yml`.

### Key Rules and Thresholds

#### Complexity
- Maximum method length: 60 lines
- Maximum nesting depth: 4
- Maximum number of parameters: 5
- Maximum number of return statements: 3
- Maximum cyclomatic complexity: 15

#### Style
- Forbidden comments (e.g., TODO, FIXME) are flagged
- Magic numbers are not allowed (with exceptions for common values)
- Newline requirements for class declarations and functions
- String templates should be used instead of string concatenation

#### Documentation
- Public classes and functions must be documented
- KDoc must be present for public APIs
- Undocumented members are flagged

#### Potential Bugs
- Unreachable code detection
- Unused private members
- Unnecessary safe calls
- Unused return values

#### Performance
- Avoid using `forEach` on ranges
- Prefer `firstOrNull` over `first`
- Avoid unnecessary temporary object creation

## Running Detekt

To run Detekt locally:

```bash
# Run detekt with all rules
./gradlew detekt

# Run detekt with auto-correct for fixable issues
./gradlew detektFormat

# Generate HTML report
./gradlew detektHtmlReport
```

Reports will be generated in `build/reports/detekt/`.

## IDE Integration

### IntelliJ IDEA / Android Studio
1. Install the Detekt plugin:
   - Go to `Preferences/Settings` > `Plugins`
   - Search for "Detekt"
   - Install and restart the IDE

2. The plugin will automatically use the project's `detekt.yml` configuration.

## Continuous Integration

Detekt is integrated into the CI/CD pipeline. The build will fail if any of the following conditions are met:
- Code complexity exceeds defined thresholds
- New style violations are introduced
- Public APIs are not properly documented
- Potential bugs are detected

## Suppressing Rules

In rare cases where a rule needs to be suppressed:

```kotlin
@Suppress("TooManyFunctions", "LongMethod")
class ExampleClass {
    // ...
}
```

Always add a comment explaining why the suppression is necessary.

## Code Style

This project follows the [Kotlin Code Conventions](https://kotlinlang.org/docs/coding-conventions.html). Use the provided `detekt` configuration to enforce these conventions automatically.
