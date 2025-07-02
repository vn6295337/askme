# Contributing to askme - CLI MVP

**Version**: 1.0.0  
**Status**: Production Ready - Accepting Contributions  
**Focus**: Command-Line Interface with Live AI Integration  
**Last Updated**: June 17, 2025

## 🎯 CLI MVP Contribution Status

### ✅ READY FOR CONTRIBUTIONS

**Current Achievements:**
1. **CLI MVP DELIVERED**: Production-ready command-line interface
2. **Live AI Integration**: Google Gemini + Mistral AI operational
3. **Performance Target**: 1.92s response time (exceeded <2s goal)
4. **Security Implementation**: AES-256 encryption, zero data collection
5. **Quality Standards**: Zero code violations across 800+ files
6. **Comprehensive Testing**: Security tests implemented and passing

### 🔧 Priority Contribution Areas

**1. CLI Enhancement (High Priority)**
- Interactive mode improvements
- Advanced command-line features
- Configuration management enhancements
- User experience optimizations

**2. Provider Expansion (Medium Priority)**  
- Additional LLM provider integrations
- Provider-specific optimizations
- Error handling improvements
- Failover logic enhancements

**3. Performance Optimization (Medium Priority)**
- Response caching improvements
- Memory usage optimization
- Startup time reduction
- Network efficiency

**4. Documentation & Examples (Medium Priority)**
- Usage examples and tutorials
- Best practices documentation
- Troubleshooting guides
- Performance benchmarking

**5. Testing & Quality (Ongoing)**
- Extended test coverage
- Integration test automation
- Performance regression testing
- Security audit enhancements

### ❌ TEMPORARILY BLOCKED AREAS

**Android Development**: Currently blocked due to SDK infrastructure issues. CLI MVP provides complete functionality.

---

## 🎯 Welcome Contributors

Thank you for your interest in contributing to askme! This guide will help you get started with contributing to our privacy-focused CLI application for AI language model interactions.

## 📋 Code of Conduct

1. **Be respectful** and inclusive to all contributors
2. **Focus on constructive feedback** and collaborative problem-solving
3. **Maintain professional communication** in all interactions
4. **Respect privacy and security** principles that guide this project
5. **Follow established coding standards** and documentation practices

## 🐛 Bug Reporting Process

### How to Report Bugs

**1. Check Existing Issues**
- Search at https://github.com/vn6295337/askme/issues
- Look for similar reports or known issues
- Check the Known Issues documentation

**2. Gather Required Information**
- CLI version: `./askme --version`
- Operating system and version
- Java version: `java -version`
- Steps to reproduce the issue
- Complete error messages
- Expected vs actual behavior
- Configuration details (sanitized, no API keys)

**3. Create Detailed Bug Report**
- Use our bug report template
- Include all gathered information
- Provide minimal reproduction steps
- Attach relevant logs or screenshots

### Bug Report Template

```markdown
**Bug Description**
Clear and concise description of the issue.

**Steps to Reproduce**
1. Navigate to directory X
2. Run command Y with parameters Z
3. Observe error or unexpected behavior

**Expected Result**
What should have happened.

**Actual Result**  
What actually happened instead.

**Environment**
- OS: [Ubuntu 22.04 / macOS 13.0 / Windows 11 WSL]
- CLI Version: [./askme --version output]
- Java Version: [java -version output]
- Provider: [google/mistral/openai/anthropic]

**Configuration**
```json
{
  "providers": {
    "google": {"enabled": true},
    "mistral": {"enabled": false}
  },
  "default_provider": "google"
}
```

**Additional Context**
Any other relevant information, logs, or context.
```

### Bug Priority Levels

**Critical (Response: 24-48 hours)**
- CLI crashes or becomes unusable
- Security vulnerabilities or data exposure
- Complete loss of functionality

**High (Response: 3-5 business days)**
- Core functionality broken or severely impacted
- Provider integration failures
- Performance regression > 50%

**Medium (Response: 1-2 weeks)**
- Features not working as expected
- Minor functionality issues
- Documentation gaps

**Low (Response: 2-4 weeks)**
- Minor UI/UX improvements
- Enhancement requests
- Non-critical optimizations

## 💡 Feature Request Process

### How to Request Features

**1. Search Existing Requests**
- Check GitHub issues for similar requests
- Review project roadmap for planned features
- Avoid duplicate requests

**2. Provide Comprehensive Details**
- Clear problem statement
- Proposed solution approach
- Concrete use case examples
- Alternative approaches considered
- Implementation complexity assessment

**3. Use Feature Request Template**

```markdown
**Feature Description**
Clear description of the proposed feature.

**Problem Statement**
What problem does this feature solve?

**Use Case Examples**
1. As a developer, I want to... so that...
2. When using the CLI for..., I need... because...
3. During my workflow of..., this feature would...

**Proposed Solution**
How should this feature work?

**Alternative Approaches**
What other solutions did you consider?

**Implementation Ideas** (Optional)
Technical approach suggestions if you have them.

**Additional Context**
Any other relevant information, mockups, or examples.
```

### Feature Evaluation Criteria

**User Impact Assessment**
- Number of users who would benefit
- Frequency of use in typical workflows
- Alignment with CLI-first approach
- Value proposition clarity

**Implementation Feasibility**
- Development complexity and effort
- Maintenance overhead requirements
- Integration with existing architecture
- Resource requirements and dependencies

**Project Alignment**
- Consistency with privacy-first principles
- CLI tool focus and scope
- Performance impact considerations
- Security implications assessment

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

1. Completed the [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md) environment configuration
2. Successfully built and tested the CLI application
3. Read the [USER_GUIDE.md](./USER_GUIDE.md) and [API_DOCS.md](./API_DOCS.md)
4. Configured at least one LLM provider for testing

### Development Environment

**1. Fork and Clone**
```bash
# Fork the repository on GitHub
# Clone your fork locally
git clone https://github.com/your-username/askme.git
cd askme

# Add upstream remote
git remote add upstream https://github.com/vn6295337/askme.git
```

**2. Verify Setup**
```bash
# Check build works
./gradlew build

# Run tests
./gradlew cliApp:test

# Test CLI functionality
./gradlew cliApp:run --args="--help"
```

## 🔄 Contribution Workflow

### 1. Issue Management

**Before Starting Work:**
1. **Check existing issues** for similar requests or bugs
2. **Create a new issue** if none exists, using appropriate template
3. **Wait for discussion** and approval before starting large changes
4. **Self-assign** the issue when you start working

**Issue Labels:**
- `bug`: Something isn't working correctly
- `enhancement`: New feature or improvement
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `priority-high`: High priority items

### 2. Branching Strategy

```bash
# Create feature branch
git checkout -b feature/add-interactive-mode

# Create bugfix branch  
git checkout -b bugfix/fix-provider-timeout

# Create documentation branch
git checkout -b docs/update-installation-guide
```

**Branch Naming Conventions:**
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Testing improvements

### 3. Development Standards

#### Code Style Guidelines

**Kotlin Style Guide:**
```kotlin
// Use descriptive, clear variable names
val queryProcessor = QueryProcessorImpl()

// Prefer immutable data structures
data class QueryRequest(
    val prompt: String,
    val model: String? = null,
    val timestamp: Long = System.currentTimeMillis()
)

// Use coroutines for async operations
suspend fun processQuery(request: QueryRequest): QueryResponse {
    return withContext(Dispatchers.IO) {
        // Implementation
    }
}

// Add comprehensive documentation
/**
 * Processes user queries through the provider chain with intelligent failover.
 * 
 * @param prompt The user's input prompt
 * @param preferredProvider Optional provider to try first
 * @return QueryResponse with processed result
 * @throws ValidationException if prompt is invalid
 */
suspend fun processQuery(prompt: String, preferredProvider: String? = null): QueryResponse
```

**File Organization:**
```
src/commonMain/kotlin/com/askme/
├── api/          # Provider interfaces and implementations
├── core/         # Business logic and utilities  
├── model/        # Data models and DTOs
├── security/     # Security and encryption utilities
└── util/         # Common utilities and extensions
```

#### Quality Standards

**Pre-commit Checklist:**
```bash
# 1. Format code
./gradlew ktlintFormat

# 2. Run quality checks
./gradlew detekt ktlintCheck

# 3. Run all tests
./gradlew test

# 4. Build project
./gradlew build

# 5. Test CLI functionality
./gradlew cliApp:run --args="test query"
```

**Quality Gates:**
- ✅ Zero Detekt violations
- ✅ All tests passing
- ✅ Code coverage maintained or improved
- ✅ No security vulnerabilities introduced
- ✅ Documentation updated for user-facing changes

### 4. Testing Requirements

#### Unit Tests

```kotlin
@Test
fun `should process query with valid input successfully`() = runTest {
    // Arrange
    val processor = QueryProcessorImpl(mockProviderManager, mockCache)
    val request = QueryRequest("test prompt")
    
    // Act  
    val result = processor.processQuery(request.prompt).first()
    
    // Assert
    assertEquals("expected response", result.content)
    assertEquals("gemini", result.provider)
    assertTrue(result.responseTime < 2000)
}
```

#### Integration Tests

```kotlin
@Test
fun `should handle provider failover correctly when primary fails`() = runTest {
    // Test complete failover chain: gemini -> mistral -> openai -> anthropic
    val providerManager = RealProviderManager(testConfig)
    
    // Mock first provider to fail
    mockProvider("gemini").setFailure(NetworkException("Connection failed"))
    
    // Verify failover to second provider
    val result = providerManager.executeWithFailover(testRequest)
    assertEquals("mistral", result.provider)
}
```

#### CLI Tests

```bash
# Test CLI basic functionality
./scripts/test_cli_basic.sh

# Test configuration handling
./scripts/test_cli_config.sh

# Test provider integration
./scripts/test_cli_providers.sh
```

### 5. Commit Guidelines

#### Commit Message Format

```
<type>(<scope>): <description>

<body>

<footer>
```

**Types:**
- `feat`: New feature implementation
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic changes)
- `refactor`: Code refactoring without behavior changes
- `test`: Test additions or modifications
- `chore`: Build system or auxiliary tool changes

**Examples:**
```bash
git commit -m "feat(cli): add interactive mode with command history and tab completion"

git commit -m "fix(provider): handle rate limiting with exponential backoff retry logic"

git commit -m "docs(api): update provider interface documentation with new methods"

git commit -m "test(integration): add comprehensive provider failover test scenarios"
```

#### Commit Best Practices

1. **Make atomic commits** (one logical change per commit)
2. **Write clear commit messages** explaining what and why
3. **Include issue references** when applicable: `Fixes #123` or `Closes #456`
4. **Sign commits** if required by project policy
5. **Keep commits focused** and avoid mixing unrelated changes

### 6. Pull Request Process

#### Before Creating PR

```bash
# 1. Sync with upstream
git fetch upstream
git rebase upstream/main

# 2. Final quality check
./gradlew clean build test detekt ktlintCheck

# 3. Test CLI end-to-end
./scripts/test_full_workflow.sh

# 4. Push to your fork
git push origin feature/your-feature-name
```

#### PR Requirements

**Required Checklist:**
- [ ] All automated checks passing
- [ ] Tests added/updated for new functionality
- [ ] Documentation updated for user-facing changes
- [ ] No breaking changes (or clearly documented)
- [ ] Performance impact assessed
- [ ] Security implications reviewed

**PR Description Template:**
```markdown
## Summary
Brief description of changes made and problem solved.

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)  
- [ ] Breaking change (fix/feature causing existing functionality to break)
- [ ] Documentation update

## Testing Performed
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] CLI functionality verified with real providers

## Documentation Updates
- [ ] User Guide updated
- [ ] API documentation updated
- [ ] Development setup instructions updated
- [ ] Code comments added for complex logic

## Performance Impact
Description of any performance implications.

## Security Considerations
Assessment of security implications and safeguards.

## Related Issues
Fixes #(issue number)
Related to #(issue number)
```

#### Review Process

**Review Stages:**
1. **Automated checks** must pass (CI/CD pipeline)
2. **Code review** by at least one maintainer
3. **Testing verification** on different environments
4. **Documentation review** for user-facing changes
5. **Security review** for sensitive changes
6. **Final approval** by project maintainer

**Review Criteria:**
- Code quality and maintainability
- Test coverage and quality
- Documentation completeness
- Security best practices
- Performance impact
- User experience considerations

## ⏰ Response Times and Support

### Expected Response Times

**Issue Acknowledgment:**
- **Critical Bugs**: 24-48 hours
- **High Priority**: 3-5 business days
- **Medium Priority**: 1-2 weeks
- **Low Priority**: 2-4 weeks
- **Feature Requests**: 1-2 weeks for initial review

**Pull Request Reviews:**
- **Bug fixes**: 3-5 business days
- **New features**: 1-2 weeks
- **Documentation**: 3-5 business days
- **Complex changes**: 2-3 weeks

### Support Channels

**Primary Channels:**
1. **GitHub Issues**: Primary support for bugs and feature requests
2. **GitHub Discussions**: Community Q&A and general discussions
3. **Pull Request Comments**: Code review and implementation discussions

**Communication Guidelines:**
1. **Search existing content** before creating new issues
2. **Use appropriate templates** for consistency
3. **Provide complete information** for faster resolution
4. **Be patient and respectful** in all interactions
5. **Follow up appropriately** on your submissions

### What to Expect

**Issue Lifecycle:**
1. **Acknowledgment**: Confirmation of receipt within response time
2. **Triage**: Priority assignment and initial assessment
3. **Investigation**: Analysis and reproduction of issues
4. **Development**: Implementation of fixes or features
5. **Testing**: Verification and quality assurance
6. **Resolution**: Delivery of solution or explanation

**Communication:**
- Regular updates on complex issues
- Clear explanations for decisions
- Guidance for resolution steps
- Transparency about timelines and blockers

## 🏗️ Development Areas

### High-Priority Contribution Opportunities

**1. Provider Integrations**
- Add new LLM provider support (Cohere, AI21, etc.)
- Improve error handling and resilience across providers
- Optimize response parsing and formatting
- Implement provider-specific features and optimizations

**2. CLI Enhancements**
- Interactive mode with command history and tab completion
- Advanced configuration management and profiles
- Batch processing and scripting capabilities
- Output formatting and filtering options

**3. Performance Optimization**
- Response caching strategies and invalidation
- Startup time improvements and lazy loading
- Memory usage optimization and leak prevention
- Network efficiency and connection pooling

**4. Security & Privacy**
- Enhanced encryption mechanisms and key management
- Security audit implementations and vulnerability scanning
- Privacy compliance features and data handling
- Secure configuration and credential management

**5. Testing & Quality**
- Comprehensive test coverage expansion
- Performance benchmarking and regression testing
- Integration test automation and CI/CD improvements
- Load testing and stress testing implementations

### Architecture Guidelines

**Adding New Providers:**
```kotlin
// 1. Implement AiProvider interface
class NewProvider(private val config: ProviderConfig) : AiProvider {
    override suspend fun query(request: QueryRequest): Flow<QueryResponse> {
        // Provider-specific implementation
        return flow {
            val response = httpClient.post(buildRequest(request))
            emit(parseResponse(response))
        }
    }
    
    override suspend fun healthCheck(): ProviderHealth {
        // Provider health verification
    }
}

// 2. Add provider configuration
// 3. Update ProviderManager registration
// 4. Add comprehensive tests
// 5. Update documentation
```

**CLI Feature Development:**
```kotlin
// 1. Add command-line argument parsing
val newFeature by parser.option(
    ArgType.String,
    shortName = "n",
    description = "Enable new feature functionality"
)

// 2. Implement feature logic with proper error handling
// 3. Integrate with existing CLI application flow
// 4. Add comprehensive help documentation
// 5. Test in both interactive and batch modes
```

## 📚 Documentation Standards

### Code Documentation

```kotlin
/**
 * Processes user queries through the provider chain with intelligent failover.
 * 
 * This function implements a sophisticated failover mechanism that tries providers
 * in order of preference and availability, caching successful responses for
 * improved performance on repeated queries.
 * 
 * @param prompt The user's input prompt, must be non-empty after trimming
 * @param preferredProvider Optional provider name to try first
 * @return Flow of QueryResponse with real-time updates during processing
 * @throws ValidationException if prompt is invalid or empty
 * @throws AllProvidersFailedException if all configured providers fail
 * @throws SecurityException if prompt contains unsafe content
 * 
 * @sample
 * ```kotlin
 * val processor = QueryProcessorImpl(providerManager, cache)
 * processor.processQuery("What is machine learning?", "gemini")
 *     .collect { response -> println(response.content) }
 * ```
 */
suspend fun processQuery(
    prompt: String,
    preferredProvider: String? = null
): Flow<QueryResponse>
```

### User-Facing Documentation

**Documentation Principles:**
1. **Keep examples current** and tested regularly
2. **Include error scenarios** and troubleshooting steps
3. **Use clear, jargon-free language** accessible to all users
4. **Provide complete workflows** from start to finish
5. **Update screenshots and outputs** when interfaces change

**Documentation Updates Required:**
- User Guide updates for new features
- API documentation for interface changes
- Setup instructions for new dependencies
- Troubleshooting guides for new error scenarios

## 🔒 Security Considerations

### Security Guidelines

**Development Security:**
1. **Never commit API keys** or sensitive credentials
2. **Encrypt sensitive configuration** using project encryption standards
3. **Validate all inputs** to prevent injection and manipulation attacks
4. **Use HTTPS only** for all network communications
5. **Follow secure coding practices** for authentication and authorization

**Code Review Security:**
1. **Review for security implications** in all changes
2. **Check for credential exposure** in logs and error messages
3. **Validate input sanitization** and output encoding
4. **Assess privacy impact** of data handling changes
5. **Verify encryption** and secure storage implementations

### Security Review Process

**Automated Security:**
1. **Dependency vulnerability scanning** in CI/CD pipeline
2. **Static code analysis** for security patterns
3. **Credential scanning** to prevent accidental exposure
4. **License compliance** checking for security implications

**Manual Security Review:**
1. **Code review** focused on security implications
2. **Architecture review** for security design patterns
3. **Privacy impact assessment** for data handling changes
4. **Threat modeling** for new attack vectors

## 📊 Performance Guidelines

### Performance Standards

**CLI Performance Targets:**
1. **Response time**: < 2 seconds for API calls (currently achieving 1.92s)
2. **Startup time**: < 1 second for CLI initialization
3. **Memory usage**: Efficient management with no detectable leaks
4. **Build time**: < 2 minutes for clean builds from source

**Performance Testing:**
```bash
# Benchmark CLI performance across providers
./scripts/benchmark_cli_performance.sh

# Profile memory usage during operation
./scripts/profile_memory_usage.sh

# Test response times under load
./scripts/test_response_times.sh

# Measure startup performance
./scripts/benchmark_startup_time.sh
```

### Performance Optimization

**Optimization Areas:**
1. **Provider response caching** with intelligent invalidation
2. **Lazy loading** of heavy dependencies and resources
3. **Connection pooling** for HTTP client efficiency
4. **Memory management** with proper cleanup and disposal
5. **Startup optimization** through selective initialization

## 🎁 Recognition and Community

### Contributor Recognition

**Recognition Methods:**
1. **Contributors listed** in CONTRIBUTORS.md with contribution details
2. **Significant contributions** highlighted in release notes
3. **Community recognition** for outstanding contributions and help
4. **Mentorship opportunities** for experienced contributors

### Contribution Types We Value

**Code Contributions:**
- Feature implementation and enhancements
- Bug fixes and stability improvements
- Performance optimizations and efficiency gains
- Security improvements and vulnerability fixes

**Non-Code Contributions:**
- Documentation improvements and examples
- Testing enhancements and coverage expansion
- Issue reporting with detailed reproduction steps
- Community support and user assistance
- Translation and internationalization support

### Building Community

**Community Engagement:**
1. **Help newcomers** get started with clear guidance
2. **Share knowledge** through discussions and examples
3. **Provide feedback** on proposals and implementations
4. **Mentor new contributors** in best practices
5. **Promote inclusive** and welcoming environment

## 📞 Getting Additional Help

### When You Need Help

**Before Asking:**
1. **Search existing documentation** and issues
2. **Check FAQ** and troubleshooting sections
3. **Review similar implementations** in the codebase
4. **Try simple reproduction** of your issue

**How to Ask for Help:**
1. **Describe your goal** and what you're trying to achieve
2. **Share what you've tried** and the results
3. **Provide relevant context** like environment details
4. **Include code samples** or error messages when applicable

### Maintainer Contact

**Communication Expectations:**
- **Response time**: Within 48 hours for questions and issues
- **Review time**: Within 1 week for pull requests
- **Support level**: Best effort community support
- **Escalation**: Available for critical issues and security concerns

---

**Thank you for contributing to askme!**

Together, we're building a privacy-focused, efficient, and user-friendly CLI tool for AI interactions that respects user privacy while delivering excellent performance and reliability.

---

**Contributing Guide Version**: 1.0.0  
**Last Updated**: 2025-06-17  
**Maintainers**: See CONTRIBUTORS.md