# askme-cli LLM Scout Agent

Autonomous agent for discovering free LLM models from US/European sources.

## Purpose

Scans public sources weekly to identify and track free-to-use large language models (LLMs) - both open-source and proprietary free-tier offerings - based in the US or Europe and capable of English text generation.

## Features

- Weekly automated discovery of new LLM models
- Filters by region (US/Europe), access type (free/open-source), and capability (English text generation)
- Integrates with askme-cli backend on Render.com
- Uses only free/open-access APIs and tools

## Usage

```bash
# Install dependencies
npm install

# Run manual discovery
npm run crawl

# Start scheduler
npm run schedule

# Run tests
npm test
```

## Configuration

Configure data sources in `config/sources.json`
Set environment variables in `.env` file

## Architecture

- `src/crawler.js` - Web scraping functionality
- `src/filters.js` - Region/access/capability filtering
- `src/scheduler.js` - Weekly execution logic
- `src/reporter.js` - Data formatting and backend communication
- `src/schemas/` - Data structure definitions
- `config/` - Configuration files