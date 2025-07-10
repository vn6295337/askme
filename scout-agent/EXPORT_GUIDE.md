# LLM Discovery Data Export Guide

This guide explains how to convert your LLM discovery JSON data to CSV/table format and export it via GitHub Actions or locally.

## 🚀 Quick Start

### Local Export (Immediate)

```bash
# Run discovery and export in one command
npm run discover-and-export

# Or export existing data
npm run export

# Or just convert JSON to CSV
npm run convert
```

### GitHub Actions (Automated)

The repository includes a GitHub Actions workflow that:
- Runs daily at 6:00 AM UTC
- Can be triggered manually
- Automatically exports data to git repository
- Creates releases with downloadable artifacts

## 📁 Generated Files

After running the export, you'll get:

### CSV Files
- `data/exports/llm-models-latest.csv` - Latest models in spreadsheet format
- `data/exports/llm-models-YYYY-MM-DD_HH-MM-SS.csv` - Timestamped version

### Summary Reports  
- `data/reports/discovery-summary-latest.md` - Human-readable summary with tables
- `data/reports/discovery-summary-YYYY-MM-DD_HH-MM-SS.md` - Timestamped version

### Raw Data
- `data/exports/llm-discovery-latest.json` - Complete JSON data
- `data/exports/llm-discovery-YYYY-MM-DD_HH-MM-SS.json` - Timestamped version

## 📊 CSV Format

The CSV contains these columns:
- `name` - Model name
- `publisher` - Organization/individual behind the model  
- `country` - Country of origin
- `source` - Discovery source (GitHub, Hugging Face, arXiv, etc.)
- `accessType` - Open Source, Research Paper, etc.
- `modelSize` - Model parameter size (7B, 13B, etc.)
- `license` - License information
- `releaseDate` - When the model was released
- `sourceUrl` - Link to the model
- `inferenceSupport` - Supported inference methods
- `capabilities` - Model capabilities (semicolon-separated)
- `discoveryTimestamp` - When we discovered it
- `validationStatus` - Validation status

## 🤖 GitHub Actions Workflow

### Setup

1. **Push to GitHub**: Commit your scout-agent code to a GitHub repository

2. **Configure Secrets** (optional):
   ```
   BACKEND_URL - Your backend URL (defaults to render.com)
   AGENT_AUTH_TOKEN - Authentication token
   ```

3. **Enable Actions**: Go to your repo → Actions tab → Enable workflows

### Workflow Features

- **Scheduled runs**: Daily at 6:00 AM UTC
- **Manual trigger**: Click "Run workflow" in Actions tab  
- **Auto-commit**: Pushes data files to your repository
- **Releases**: Creates tagged releases with downloadable data
- **Artifacts**: Uploads files as GitHub artifacts

### Triggering Manually

1. Go to your GitHub repository
2. Click **Actions** tab
3. Select **LLM Discovery and Export** workflow
4. Click **Run workflow** → **Run workflow**

## 📥 Downloading Data

### From GitHub Repository
Navigate to your repo's `data/` directory:
- `data/exports/llm-models-latest.csv` - Direct download
- `data/reports/discovery-summary-latest.md` - View in browser

### From GitHub Releases
1. Go to **Releases** tab in your repository
2. Download assets from latest release
3. Contains CSV, JSON, and Markdown files

### From GitHub Actions Artifacts
1. Go to **Actions** tab
2. Click on a completed workflow run
3. Download the `llm-discovery-data` artifact

## 💻 Local Development

### Manual Steps

```bash
# 1. Run discovery
npm start

# 2. Convert to CSV/Markdown  
node scripts/json-to-csv.js

# 3. Export to data directory
./export-data.sh

# 4. Commit to git
git add data/
git commit -m "📊 LLM Discovery Update - $(date)"
git push
```

### Custom Export

You can customize the CSV converter (`scripts/json-to-csv.js`) to:
- Change column order
- Add/remove fields  
- Modify formatting
- Add custom processing

## 🔧 Troubleshooting

### Missing Dependencies
```bash
npm install axios cheerio fs-extra
```

### Permission Denied
```bash
chmod +x export-data.sh
```

### GitHub Actions Failures
- Check the Actions tab for error logs
- Verify your repository has write permissions enabled
- Check if secrets are properly configured

## 📈 Data Analysis

### Import to Excel/Google Sheets
1. Download `llm-models-latest.csv`
2. Open in Excel/Google Sheets
3. Use "Import" or "Open" with CSV format

### Import to Python/R
```python
import pandas as pd
df = pd.read_csv('llm-models-latest.csv')
```

```r
library(readr)
df <- read_csv('llm-models-latest.csv')
```

## 🔄 Automation Schedule

The GitHub Actions workflow runs:
- **Daily**: 6:00 AM UTC
- **On push**: When code is updated
- **Manual**: Anytime via GitHub UI

You can modify the schedule in `.github/workflows/llm-discovery.yml`:
```yaml
schedule:
  - cron: '0 6 * * *'  # Daily at 6:00 AM UTC
```

## 📞 Support

If you encounter issues:
1. Check the workflow logs in GitHub Actions
2. Verify file permissions for local scripts
3. Ensure all dependencies are installed
4. Check the issue tracker in your repository