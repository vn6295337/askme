const fs = require('fs');
const path = require('path');

function jsonToCsv(jsonData) {
  const models = jsonData.models;
  
  if (!models || models.length === 0) {
    return 'No models found';
  }

  // Define the CSV headers in desired order
  const headers = [
    'name',
    'publisher', 
    'country',
    'source',
    'accessType',
    'modelSize',
    'license',
    'releaseDate',
    'sourceUrl',
    'inferenceSupport',
    'capabilities',
    'discoveryTimestamp',
    'validationStatus'
  ];

  // Create CSV header row
  const csvRows = [headers.join(',')];

  // Convert each model to CSV row
  models.forEach(model => {
    const row = headers.map(header => {
      let value = model[header] || '';
      
      // Handle arrays (like capabilities)
      if (Array.isArray(value)) {
        value = value.join('; ');
      }
      
      // Handle strings with commas or quotes
      if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = '"' + value.replace(/"/g, '""') + '"';
        }
      }
      
      return value;
    });
    
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

function createSummaryTable(jsonData) {
  const summary = jsonData.summary;
  const metadata = jsonData.metadata;
  
  let summaryText = `# LLM Discovery Report\n\n`;
  summaryText += `**Generated:** ${metadata.timestamp}\n`;
  summaryText += `**Total Models:** ${metadata.totalModels}\n`;
  summaryText += `**Agent Version:** ${metadata.agentVersion}\n`;
  summaryText += `**Run ID:** ${metadata.runId}\n\n`;
  
  // Sources breakdown
  summaryText += `## Sources\n`;
  summaryText += `| Source | Count |\n`;
  summaryText += `|--------|-------|\n`;
  Object.entries(summary.bySource).forEach(([source, count]) => {
    summaryText += `| ${source} | ${count} |\n`;
  });
  
  // Access type breakdown
  summaryText += `\n## Access Types\n`;
  summaryText += `| Access Type | Count |\n`;
  summaryText += `|-------------|-------|\n`;
  Object.entries(summary.byAccessType).forEach(([type, count]) => {
    summaryText += `| ${type} | ${count} |\n`;
  });
  
  // Model size breakdown
  summaryText += `\n## Model Sizes\n`;
  summaryText += `| Size | Count |\n`;
  summaryText += `|------|-------|\n`;
  Object.entries(summary.byModelSize).forEach(([size, count]) => {
    summaryText += `| ${size} | ${count} |\n`;
  });
  
  return summaryText;
}

// Main execution
if (require.main === module) {
  const inputFile = process.argv[2] || path.join(__dirname, '..', 'output', 'latest-discovery.json');
  const outputDir = process.argv[3] || path.join(__dirname, '..', 'output');
  
  try {
    // Read JSON file
    const jsonData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    
    // Convert to CSV
    const csvContent = jsonToCsv(jsonData);
    const csvPath = path.join(outputDir, 'llm-models.csv');
    fs.writeFileSync(csvPath, csvContent);
    console.log(`CSV exported to: ${csvPath}`);
    
    // Create summary markdown
    const summaryContent = createSummaryTable(jsonData);
    const summaryPath = path.join(outputDir, 'discovery-summary.md');
    fs.writeFileSync(summaryPath, summaryContent);
    console.log(`Summary exported to: ${summaryPath}`);
    
    // Create timestamped versions
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const timestampedCsv = path.join(outputDir, `llm-models-${timestamp}.csv`);
    const timestampedSummary = path.join(outputDir, `discovery-summary-${timestamp}.md`);
    
    fs.writeFileSync(timestampedCsv, csvContent);
    fs.writeFileSync(timestampedSummary, summaryContent);
    
    console.log(`Timestamped files created:`);
    console.log(`- ${timestampedCsv}`);
    console.log(`- ${timestampedSummary}`);
    
  } catch (error) {
    console.error('Error converting JSON to CSV:', error.message);
    process.exit(1);
  }
}

module.exports = { jsonToCsv, createSummaryTable };