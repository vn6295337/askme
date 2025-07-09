# LLM Scout Agent Architecture

## Overview
The LLM Scout Agent is an autonomous system that discovers free LLM models from US/European sources and populates the askme-cli backend weekly.

## System Components

### 1. Agent Core (`src/`)
- **index.js**: Main orchestrator and entry point
- **crawler.js**: Multi-source data discovery
- **filters.js**: Region/access/capability filtering
- **scheduler.js**: Weekly execution management
- **reporter.js**: Data formatting and backend communication

### 2. Data Layer (`src/schemas/`)
- **llm-model.js**: Data validation and normalization
- JSON schema definitions
- Batch validation utilities

### 3. Configuration (`config/`)
- **sources.json**: Discovery source configurations
- API endpoints and scraping selectors
- Rate limiting parameters

### 4. Automation (`.github/workflows/`)
- **scout-agent.yml**: GitHub Actions workflow
- Weekly scheduling and manual triggers
- Error handling and notifications

## Data Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Sources   │───▶│   Crawler   │───▶│   Filters   │
│             │    │             │    │             │
│ • GitHub    │    │ • Rate      │    │ • US/Europe │
│ • HF        │    │   limiting  │    │ • Free      │
│ • arXiv     │    │ • Parsing   │    │ • English   │
│ • Papers    │    │ • Dedup     │    │ • Active    │
│ • Blogs     │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
                                              │
                                              ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Backend   │◀───│  Reporter   │◀───│ Validation  │
│             │    │             │    │             │
│ • /api/llms │    │ • Format    │    │ • Schema    │
│ • JSON      │    │ • Enrich    │    │ • Required  │
│ • Auth      │    │ • Submit    │    │ • Types     │
│             │    │ • Local     │    │ • Dates     │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Discovery Sources

### 1. GitHub API
- **Endpoint**: `https://api.github.com/search/repositories`
- **Query**: LLM-related repositories with free/open-source topics
- **Rate Limit**: 60 requests/hour (unauthenticated)
- **Data**: Repository metadata, licenses, organizations

### 2. Hugging Face API
- **Endpoint**: `https://huggingface.co/api/models`
- **Filter**: Text-generation models, sorted by recency
- **Rate Limit**: No official limit, respectful usage
- **Data**: Model metadata, authors, licenses

### 3. arXiv API
- **Endpoint**: `http://export.arxiv.org/api/query`
- **Query**: Papers about language models
- **Rate Limit**: 3 seconds between requests
- **Data**: Paper titles, authors, abstracts

### 4. Papers with Code API
- **Endpoint**: `https://paperswithcode.com/api/v1/papers/`
- **Query**: Language model papers
- **Rate Limit**: Respectful usage
- **Data**: Paper metadata, implementation links

### 5. Blog RSS/Scraping
- **Sources**: OpenAI, Anthropic, Google AI, Meta AI, etc.
- **Method**: HTML parsing with selectors
- **Rate Limit**: 1 request/second per domain
- **Data**: Blog posts, announcements

## Filtering Logic

### 1. Region Filter
- **US Companies**: OpenAI, Anthropic, Google, Microsoft, Meta
- **EU Companies**: Mistral, DeepMind, Stability AI
- **Method**: Publisher name matching and URL analysis
- **Fallback**: Domain-based detection

### 2. Access Filter
- **Open Source**: Apache, MIT, GPL, BSD licenses
- **Free Tier**: API access without cost
- **Keywords**: "free", "open source", "community"
- **Exclusions**: Commercial-only, paid-only

### 3. Language Filter
- **English Support**: Model descriptions, capabilities
- **Patterns**: "english", "multilingual", "instruction"
- **Model Types**: Chat, instruct, conversation models
- **Exclusions**: Language-specific models

### 4. Activity Filter
- **Recency**: Released within last 12 months
- **Status**: Not deprecated or archived
- **Availability**: Active inference endpoints
- **Exclusions**: End-of-life models

## Data Schema

### Required Fields
```json
{
  "name": "string",
  "publisher": "string", 
  "country": "string"
}
```

### Optional Fields
```json
{
  "accessType": "Open Source | Proprietary - Free Tier | Research Paper | Blog Post",
  "license": "string",
  "modelSize": "string (e.g., 7B, 13B)",
  "releaseDate": "ISO 8601 date",
  "sourceUrl": "URL",
  "inferenceSupport": "string",
  "deprecationDate": "ISO 8601 date | null"
}
```

### Metadata Fields
```json
{
  "discoveryTimestamp": "ISO 8601 date",
  "agentVersion": "string",
  "validationStatus": "string",
  "source": "string",
  "capabilities": ["array of strings"],
  "tags": ["array of strings"]
}
```

## Backend Integration

### Authentication
- **Method**: Bearer token authentication
- **Header**: `Authorization: Bearer <AGENT_AUTH_TOKEN>`
- **Scope**: Agent-only endpoints

### Endpoints

#### POST /api/llms
- **Purpose**: Accept model data from agent
- **Auth**: Required
- **Body**: `{ models: [...], metadata: {...} }`
- **Response**: Success confirmation

#### GET /api/llms
- **Purpose**: Retrieve models for CLI consumption
- **Auth**: None (public)
- **Filters**: country, accessType, source
- **Response**: Filtered model list

#### GET /api/llms/health
- **Purpose**: System health check
- **Auth**: None
- **Response**: Service status

### Data Storage
- **Format**: JSON file (`data/llms.json`)
- **Backup**: Timestamped files
- **Size**: Optimized for CLI consumption
- **Persistence**: File system (Render.com)

## Scheduling

### GitHub Actions
- **Trigger**: Weekly (Sunday 2 AM UTC)
- **Runtime**: ~5-10 minutes
- **Artifacts**: Discovery results
- **Notifications**: Issue creation on failure

### Manual Execution
- **Trigger**: Workflow dispatch
- **Debug**: Optional debug mode
- **Use Cases**: Testing, maintenance

## Error Handling

### Discovery Errors
- **Strategy**: Graceful degradation
- **Fallback**: Continue with available sources
- **Logging**: Detailed error messages
- **Recovery**: Retry logic for transient failures

### Validation Errors
- **Strategy**: Filter invalid models
- **Reporting**: Log validation failures
- **Impact**: Reduce dataset, don't fail
- **Recovery**: Skip invalid entries

### Backend Errors
- **Strategy**: Fail fast with retry
- **Fallback**: Local storage only
- **Notification**: GitHub issue creation
- **Recovery**: Manual intervention

## Security

### API Security
- **Rate Limiting**: Respectful usage patterns
- **Authentication**: Secure token storage
- **Secrets**: GitHub secrets management
- **Validation**: Input sanitization

### Data Security
- **Privacy**: No personal data collection
- **Compliance**: Public data sources only
- **Storage**: Temporary local storage
- **Transmission**: HTTPS only

## Performance

### Optimization
- **Parallelization**: Concurrent source crawling
- **Caching**: Local rate limiting cache
- **Deduplication**: Efficient duplicate removal
- **Filtering**: Early filtering to reduce processing

### Monitoring
- **Metrics**: Discovery count, success rate
- **Timing**: Execution duration tracking
- **Alerts**: Failure notifications
- **Reporting**: Weekly summary statistics

## Future Enhancements

### Phase 2: CLI Integration
- **Dynamic Models**: CLI consumes discovered models
- **Selection**: User choice from discovered options
- **Caching**: Client-side model caching
- **Updates**: Automatic model list refresh

### Phase 3: Advanced Features
- **Quality Scoring**: Model ranking system
- **Usage Analytics**: Model popularity tracking
- **Community**: User-contributed models
- **API Expansion**: Additional model sources