# Known Issues

**Version**: 1.0.0  
**Last Updated**: June 17, 2025  
**Repository**: https://github.com/vn6295337/askme

This document outlines current limitations, known issues, and workarounds for askme CLI version 1.0.0.

## Provider Limitations

### Deprecated Models (Backend Updated, CLI `Providers.kt` needs update)

**Google Deprecated Models**
*   `gemini-1.0-pro`: **REMOVE** - Returns 404
*   `gemini-pro`: **REMOVE** - Returns 404

**Llama Deprecating Models**
*   `meta-llama/Meta-Llama-3-70B-Instruct-Turbo`: **REPLACE** with `meta-llama/Llama-3.3-70B-Instruct` (by June 30, 2025)

*(No other provider-specific limitations in CLI MVP beyond general network connectivity)*

### Deprecated Models (Backend Updated, CLI `Providers.kt` needs update)

**Google Deprecated Models**
*   `gemini-1.0-pro`: **REMOVE** - Returns 404
*   `gemini-pro`: **REMOVE** - Returns 404

**Llama Deprecating Models**
*   `meta-llama/Meta-Llama-3-70B-Instruct-Turbo`: **REPLACE** with `meta-llama/Llama-3.3-70B-Instruct` (by June 30, 2025)

## Platform Limitations

### Android SDK Integration

**Status**: Temporarily Blocked - Infrastructure Dependencies

**Issue Description**

Android SDK integration and mobile app development are temporarily blocked due to development environment infrastructure limitations.

**Current State**

1. Android development framework prepared but not accessible
2. Kotlin Multiplatform configuration ready for mobile deployment
3. CLI functionality fully operational and serves as foundation
4. Mobile UI framework designed but not implemented

**Impact**

1. No mobile application available for Android devices
2. CLI interface only available on desktop/server platforms
3. Mobile-specific features not accessible in current release

**Workaround**

1. Use CLI application on desktop or server environments
2. Access through terminal applications on mobile devices with Linux support
3. Remote access via SSH for mobile usage scenarios

**Expected Resolution**

Android integration will be addressed in future release when infrastructure dependencies resolved.

### iOS Platform Support

**Status**: Not Implemented - Outside Current Scope

**Issue Description**

iOS platform support is not included in version 1.0.0 release scope.

**Current State**

1. Kotlin Multiplatform supports iOS development
2. No iOS-specific implementation or testing performed
3. CLI functionality not designed for iOS deployment
4. Future iOS support requires separate development effort

**Impact**

1. No native iOS application available
2. iPhone and iPad users cannot access askme functionality natively
3. iOS-specific features and integrations not available

**Workaround**

1. Use web-based terminal applications with SSH access to Linux systems
2. Access through remote desktop applications connecting to supported platforms
3. Consider alternative AI assistant applications for iOS-specific needs

**Expected Resolution**

iOS support may be considered for future major releases based on user demand and resource availability.

## Configuration Issues

### API Key Storage Security

**Status**: Known Limitation - Platform Dependent

**Issue Description**

API key storage security varies by platform and may not integrate with system credential managers.

**Current State**

1. AES-256 encryption implemented for file-based storage
2. File permissions enforced (600) for access control
3. System keychain integration not implemented
4. Credential manager integration not available

**Impact**

1. API keys stored in local filesystem rather than system credential store
2. Security depends on filesystem permissions and user account security
3. Key rotation requires manual configuration file updates
4. No integration with enterprise credential management systems

**Workaround**

1. Ensure proper file system permissions on configuration directory
2. Use environment variables for temporary or CI/CD scenarios
3. Implement external key management through environment variable injection
4. Regular key rotation through manual configuration updates

**Expected Resolution**

System credential manager integration planned for future releases.

### Configuration File Migration

**Status**: Known Limitation - Manual Process Required

**Issue Description**

Configuration file format changes between versions require manual migration.

**Current State**

1. Configuration schema validation implemented
2. Backward compatibility not guaranteed across major versions
3. No automatic migration utilities provided
4. Configuration format may evolve with new features

**Impact**

1. Users must manually update configuration files after major version upgrades
2. Complex configurations may require careful migration planning
3. Risk of configuration errors during manual migration process
4. No validation of migrated configurations until runtime

**Workaround**

1. Backup existing configuration before upgrades
2. Use interactive setup wizard to recreate configuration
3. Validate configuration with --config command after migration
4. Test provider connectivity after configuration changes

**Expected Resolution**

Automatic configuration migration utilities planned for future releases.

## Performance Limitations

### Memory Usage Under High Load

**Status**: Known Limitation - Resource Constraints

**Issue Description**

Memory usage may increase significantly under sustained high-load operations.

**Current State**

1. Average memory usage optimized for single-user scenarios
2. Concurrent request handling implemented but not extensively load-tested
3. Memory cleanup implemented but may be insufficient under extreme load
4. Garbage collection tuning not optimized for all deployment scenarios

**Impact**

1. Memory usage may exceed 200MB under sustained high-load operations
2. Performance degradation possible in resource-constrained environments
3. Potential memory pressure on systems with limited RAM
4. Garbage collection pauses may affect response time consistency

**Workaround**

1. Monitor memory usage during high-load operations
2. Restart CLI application periodically in high-throughput scenarios
3. Implement external process management for sustained operations
4. Use batch processing with controlled concurrency limits

**Expected Resolution**

Memory optimization and load testing planned for future releases.

### Network Connectivity Dependencies

**Status**: Known Limitation - Design Constraint

**Issue Description**

All AI functionality requires active internet connectivity to provider APIs.

**Current State**

1. No offline mode or local AI model support implemented
2. All processing depends on external API availability
3. Network failure results in complete functionality loss
4. No local caching of responses or model capabilities

**Impact**

1. Complete loss of functionality during network outages
2. Dependency on third-party service availability
3. Potential privacy concerns for sensitive data in restrictive networks
4. Performance impact from network latency

**Workaround**

1. Ensure stable internet connectivity for critical operations
2. Implement network monitoring for operational environments
3. Consider offline alternatives for sensitive or isolated environments
4. Use multiple providers to reduce single point of failure

**Expected Resolution**

Offline mode and local model support may be considered for future major releases.

## Reporting Issues

### Bug Reports

For new issues not listed in this document:

1. Check existing GitHub issues at https://github.com/vn6295337/askme/issues
2. Use appropriate issue templates for bug reports or feature requests
3. Include system information, version details, and reproduction steps
4. Provide error messages and logs with sensitive information redacted

### Security Issues

For security-related concerns:

1. Do not report security issues through public issue tracker
2. Follow responsible disclosure procedures outlined in 402_test_plan.md
3. Contact development team through designated security channels
4. Provide detailed reproduction steps for security vulnerabilities

### Performance Issues

For performance-related problems:

1. Include system specifications and load characteristics
2. Provide timing measurements and resource usage data
3. Describe expected vs actual performance behavior
4. Include configuration details affecting performance

---

This document will be updated as issues are resolved and new limitations identified. Check the GitHub repository for the most current version.