# askme Project Directory Structure

## Root Level Organization
```
askme/
├── 001_readme.md                   # Main project overview
├── 002_directory_structure.md      # Project organization  
├── 100_planning/                   # Project Planning & Management
├── 200_development/                # Technical Development Documentation
├── 300_implementation/             # Source Code & Applications
├── 400_testing/                    # Quality Assurance & Testing
├── 500_release/                    # Release Management & Deployment
├── 600_team/                       # Team Structure & Coordination
├── 700_scripts/                    # Development Tools & Scripts
├── .git/                           # Git repository metadata
├── .github/                        # GitHub configuration
└── .gitignore                      # Git ignore rules
```

## 100_planning/ - Project Planning & Management
```
├── 101_project_charter.md          # Project charter and scope
├── 102_master_checklist.md         # 420-item execution checklist
├── 103_project_plan.md             # Detailed project roadmap
├── 104_risk_management.md          # Risk assessment and mitigation
├── 105_resource_planning.md        # Resource allocation planning
├── 106_mvp_requirements.md         # MVP definition and boundaries
├── 107_roadmap.md                  # Project roadmap
└── 108_project_completion.md       # Project completion documentation
```

## 200_development/ - Technical Development
```
├── 201_tech_stack.md               # Technology stack documentation
├── 202_setup_guide.md              # Development environment setup
├── 203_implementation_log.md       # Implementation history and decisions
├── 204_stack_diagram.html          # Visual tech stack diagram
├── 205_stack_diagram.pdf           # Tech stack diagram (PDF)
├── 206_system_architecture.md      # System architecture overview
├── 207_tool_checklist.md           # Tool installation procedures
├── 208_cli_wireframes.txt          # CLI wireframes
└── 209_wireframe_notes.md          # Wireframe documentation
```

## 300_implementation/ - Source Code
```
└── askme-cli/                      # CLI Application (KMP)
    ├── src/                        # Source code
    │   ├── commonMain/kotlin/      # Shared Kotlin code
    │   │   ├── com/askme/api/      # Provider implementations
    │   │   ├── com/askme/core/     # Query processing & business logic
    │   │   ├── com/askme/model/    # Data models and DTOs
    │   │   └── com/askme/security/ # Security and encryption utilities
    │   ├── commonTest/kotlin/      # Shared tests
    │   │   └── com/askme/security/ # Security test suites
    │   └── cliApp/                 # CLI application module
    │       ├── src/main/kotlin/    # CLI implementation
    │       └── src/test/kotlin/    # CLI-specific tests
    │           └── com/askme/security/ # CLI security tests
    ├── build.gradle.kts            # Build configuration
    ├── settings.gradle.kts         # Gradle settings
    ├── gradle.properties           # Gradle properties
    ├── gradlew                     # Gradle wrapper script
    ├── gradle/                     # Gradle wrapper files
    ├── build/                      # Build outputs and reports
    │   ├── install/cliApp/         # CLI distribution
    │   └── reports/                # Test and quality reports
    ├── docs/                       # CLI-specific documentation
    └── README.md                   # CLI application overview
```

## 400_testing/ - Quality Assurance
```
├── 401_test_strategy.md           # Test strategy documentation
├── 402_test_plan.md               # Test planning procedures
├── 403_test_scenarios.md          # Test scenario definitions
├── 404_test_cases.md              # Detailed test case specifications
├── 405_test_checklist.md          # Testing procedures checklist
├── 406_bug_tracking.md            # Bug tracking procedures
├── 407_test_summary.md            # Test summary reports
├── 408_static_analysis_report.html# Static analysis report
└── reports/                       # Test report outputs
```

## 500_release/ - Release Management
```
├── 501_readme.md                  # Main project overview
├── 502_license                    # License information
├── 503_changelog.md               # Version change documentation
├── 504_release_notes.md           # Release notes and updates
├── 505_user_guide.md              # Complete CLI user guide
├── 506_api_docs.md                # Technical API documentation
├── 507_development_setup.md       # Environment setup instructions
├── 508_contributing.md            # Contribution guidelines
└── 509_known_issues.md            # Known issues and limitations
```

## 600_team/ - Team Coordination
```
├── 601_persona_prompts.md         # 13 AI persona specifications
├── 602_team_structure.html        # Visual team structure diagram
└── 603_team_structure.md          # Team organization overview
```

## 700_scripts/ - Development Tools
```
├── 701_sync_script.sh             # 3-tier cloud storage synchronization
├── 702_env_check.sh               # Environment validation script
├── 703_cli_automation.sh          # CLI automation scripts
├── 704_cli_performance_test.sh    # Performance testing scripts
└── tiered_sync.log                # Sync operation logs
```