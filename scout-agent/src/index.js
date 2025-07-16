const crawler = require('./crawler');
const reporter = require('./reporter');
const { validateLLMData } = require('./schemas/llm-model');

async function main() {
  try {
    console.log('Starting LLM Scout Agent...');
    
    const discoveredModels = await crawler.discoverModels();
    console.log(`Discovered ${discoveredModels.length} models`);
    
    const validatedModels = discoveredModels.filter(model => {
      const validation = validateLLMData(model);
      if (!validation.isValid) {
        console.warn(`Invalid model data: ${validation.errors.join(', ')}`);
        return false;
      }
      return true;
    });
    
    console.log(`${validatedModels.length} models passed validation`);
    
    // Always create output files, even if no models found
    await reporter.ensureOutputDir();
    
    if (validatedModels.length > 0) {
      await reporter.sendToBackend(validatedModels);
      await reporter.exportToCsv(validatedModels);
      console.log('Data sent to backend and CSV exported successfully');
    } else {
      // Create empty CSV file when no models found
      const fs = require('fs-extra');
      const path = require('path');
      const outputDir = path.join(__dirname, '..', 'output');
      const csvPath = path.join(outputDir, `llm-models-${Date.now()}.csv`);
      await fs.writeFile(csvPath, 'No models discovered in this run\n');
      console.log('No models found, created empty CSV file');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Agent execution failed:', error);
    
    // Create error log file
    try {
      const fs = require('fs-extra');
      const path = require('path');
      const outputDir = path.join(__dirname, '..', 'output');
      await fs.ensureDir(outputDir);
      const errorPath = path.join(outputDir, `error-${Date.now()}.txt`);
      await fs.writeFile(errorPath, `Error: ${error.message}\nStack: ${error.stack}\n`);
      console.log(`Error logged to: ${errorPath}`);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };