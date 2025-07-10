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
    
    if (validatedModels.length > 0) {
      await reporter.sendToBackend(validatedModels);
      console.log('Data sent to backend successfully');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Agent execution failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };