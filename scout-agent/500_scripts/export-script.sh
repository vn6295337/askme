#!/bin/bash

# LLM Discovery Data Export Script
# This script runs the discovery and exports CSV data locally

set -e

echo "🤖 Starting LLM Discovery and Export..."

# Create output directory
mkdir -p output

# Run the discovery
echo "📡 Running LLM discovery..."
npm start

# Create timestamped backup
TIMESTAMP=$(date -u +"%Y-%m-%d_%H-%M-%S")
echo "⏰ Creating timestamped backup for: $TIMESTAMP"

# Create timestamped copy of CSV
if [ -f "output/llm-models-latest.csv" ]; then
    cp output/llm-models-latest.csv "output/llm-models-$TIMESTAMP.csv"
fi

echo "✅ Export completed successfully!"
echo ""
echo "📁 Generated files:"
echo "   📄 output/llm-models-latest.csv"
echo "   📄 output/llm-models-$TIMESTAMP.csv"
echo ""

# Display summary
if [ -f "output/llm-models-latest.csv" ]; then
    TOTAL_MODELS=$(wc -l < output/llm-models-latest.csv)
    TOTAL_MODELS=$((TOTAL_MODELS - 1))  # Subtract header row
    echo "📊 Summary:"
    echo "   🔢 Total Models: $TOTAL_MODELS"
    echo "   📅 Timestamp: $(date -u)"
    echo "   📄 CSV Format: Single file output"
fi

echo ""
echo "🚀 To commit to git:"
echo "   git add output/"
echo "   git commit -m '📊 LLM Discovery Update - $(date -u)'"
echo "   git push"