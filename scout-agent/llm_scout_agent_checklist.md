# askme-cli LLM Scout Agent - MVP Development Checklist

**Project**: askme-cli LLM Scout Agent Extension  
**Target**: Minimum Viable Product (MVP)  
**Environment**: Linux Chromebook + USB repo symlink  
**Backend**: Node.js on Render.com  

---

## Section: Project Setup

1. - [x] Create new directory `scout-agent/` in askme repository root
2. - [x] Initialize package.json for Scout Agent with Node.js dependencies
3. - [x] Set up .gitignore for agent-specific files (node_modules, logs, .env)
4. - [x] Create README.md with agent purpose and basic usage
5. - [x] Verify existing backend structure at `300_implementation/askme-backend/`

## Section: Agent Core Structure

6. - [x] Create `src/` directory with main agent files
7. - [x] Create `src/crawler.js` for web scraping functionality
8. - [x] Create `src/filters.js` for region/access/capability filtering
9. - [x] Create `src/scheduler.js` for weekly execution logic
10. - [x] Create `src/reporter.js` for data formatting and backend communication
11. - [x] Create `config/sources.json` for crawl target configuration

## Section: Data Schema Implementation

12. - [x] Define LLM data structure in `src/schemas/llm-model.js`
13. - [x] Implement validation for required fields (Model Name, Publisher, Country)
14. - [x] Add optional field handling (Model Size, Deprecation Date)
15. - [x] Create JSON output formatter matching PRD schema
16. - [x] Add CSV export functionality as backup format

## Section: Source Discovery Implementation

17. - [x] Implement GitHub repository crawler for new LLM releases
18. - [x] Add Hugging Face Model Hub API integration
19. - [x] Create arXiv paper abstract scraper for new model announcements
20. - [x] Implement Papers with Code API integration
21. - [x] Add blog/news RSS feed monitoring (OpenAI, Anthropic, Google AI)
22. - [x] Configure rate limiting for all API calls

## Section: Filtering Logic

23. - [x] Implement US/Europe region detection from publisher information
24. - [x] Create free-tier/open-source access type classifier
25. - [x] Add English language capability verification
26. - [x] Filter out deprecated or sunset models
27. - [x] Validate model availability and active status
28. - [x] Remove duplicates and merge similar entries

## Section: Backend Integration

29. - [x] Modify `askme-backend/server.js` to add LLM management routes
30. - [x] Create `POST /api/llms` endpoint for agent data submission
31. - [x] Add authentication middleware for agent requests
32. - [x] Implement JSON file storage using fs module (`llms.json`)
33. - [x] Create `GET /api/llms` endpoint for CLI consumption
34. - [x] Add error handling and validation for LLM data format

## Section: Agent Scheduler

35. - [x] Create GitHub Actions workflow for weekly execution
36. - [x] Configure environment variables for API keys and tokens
37. - [x] Set up job scheduling using cron syntax (weekly Sunday 2 AM UTC)
38. - [x] Add failure notification and retry logic
39. - [x] Implement logging for successful runs and errors
40. - [x] Create manual trigger option for testing and maintenance

## Section: Data Processing Pipeline

41. - [x] Create data aggregation logic to combine all source results
42. - [x] Implement deduplication algorithm for similar models
43. - [x] Add data enrichment from multiple sources for same model
44. - [x] Create validation pipeline for data completeness
45. - [x] Format final dataset according to PRD schema requirements
46. - [x] Add timestamp and metadata to each discovery run

## Section: Testing Framework

47. - [x] Create unit tests for each crawler module
48. - [x] Add integration tests for backend API endpoints
49. - [x] Test filtering logic with sample LLM data
50. - [x] Verify JSON schema validation with various inputs
51. - [x] Test rate limiting and error handling
52. - [x] Create end-to-end test from discovery to backend storage

## Section: Error Handling & Monitoring

53. - [x] Implement comprehensive logging throughout agent pipeline
54. - [x] Add error recovery for network failures and API limits
55. - [x] Create health check endpoint for agent status monitoring
56. - [x] Set up alert system for discovery failures
57. - [x] Add data quality checks and validation reports
58. - [x] Implement graceful degradation when sources are unavailable

## Section: Documentation

59. - [x] Document agent architecture and data flow
60. - [x] Create configuration guide for new data sources
61. - [x] Write troubleshooting guide for common issues
62. - [x] Document backend API changes and new endpoints
63. - [x] Add example usage and testing instructions
64. - [x] Create deployment guide for Render.com environment

## Section: Deployment Preparation

65. - [x] Test agent execution in Linux Chromebook environment
66. - [x] Verify GitHub Actions workflow configuration
67. - [x] Deploy backend changes to Render.com staging environment
68. - [x] Test end-to-end flow from agent to backend to storage
69. - [x] Validate production environment variables and secrets
70. - [x] Create rollback plan for backend API changes

## Section: CLI Integration Setup

71. - [x] Plan CLI modifications to consume new LLM discovery data
72. - [x] Design integration point for dynamic model selection
73. - [x] Document API contract between agent, backend, and CLI
74. - [x] Create feature flag for LLM discovery integration
75. - [x] Plan backward compatibility for existing hardcoded models
76. - [x] Schedule CLI integration for post-MVP iteration

## Section: Production Launch

77. - [x] Deploy final agent code to production repository
78. - [x] Activate GitHub Actions weekly scheduling
79. - [x] Deploy backend API changes to production Render instance
80. - [x] Execute first manual agent run and verify data quality
81. - [x] Monitor first week of automated discovery runs
82. - [x] Document operational procedures and maintenance tasks

---

**Next Phase**: CLI Integration (requires separate checklist)  
**Total Items**: 82 serialized development tasks