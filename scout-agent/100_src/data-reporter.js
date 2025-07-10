const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

class BackendReporter {
  constructor() {
    this.backendUrl = process.env.BACKEND_URL || 'https://askme-backend-proxy.onrender.com';
    this.authToken = process.env.AGENT_AUTH_TOKEN || 'your-auth-token';
    this.outputDir = path.join(__dirname, '..', 'output');
  }

  async sendToBackend(models) {
    try {
      await this.ensureOutputDir();
      
      const enrichedModels = this.enrichModels(models);
      
      // Generate only CSV output
      await this.saveAsCsv(enrichedModels);
      
      try {
        await this.postToBackend({ models: enrichedModels });
        console.log('Data sent to backend successfully');
      } catch (backendError) {
        console.log('Backend submission failed, but CSV was saved successfully');
      }
    } catch (error) {
      console.error('Failed to process models:', error);
      throw error;
    }
  }

  async ensureOutputDir() {
    await fs.ensureDir(this.outputDir);
  }

  enrichModels(models) {
    return models.map(model => ({
      ...model,
      discoveryTimestamp: new Date().toISOString(),
      agentVersion: '1.0.0',
      validationStatus: 'validated'
    }));
  }

  // Removed: generateReport, getUniqueSources, generateRunId, generateSummary
  // Only CSV output is needed

  async saveAsCsv(models) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, -5);
    const filename = `llm-models-${timestamp}.csv`;
    const filepath = path.join(this.outputDir, filename);
    
    const csvContent = this.generateCsv(models);
    await fs.writeFile(filepath, csvContent);
    console.log(`CSV saved to: ${filepath}`);
    
    // Also save as latest
    const latestPath = path.join(this.outputDir, 'llm-models-latest.csv');
    await fs.writeFile(latestPath, csvContent);
    console.log(`Latest CSV saved to: ${latestPath}`);
  }

  generateCsv(models) {
    if (models.length === 0) {
      return 'name,publisher,country,source,accessType,modelSize,license,releaseDate,sourceUrl,inferenceSupport,capabilities,discoveryTimestamp,validationStatus\n';
    }
    
    const headers = [
      'name', 'publisher', 'country', 'source', 'accessType', 'modelSize', 
      'license', 'releaseDate', 'sourceUrl', 'inferenceSupport', 'capabilities',
      'discoveryTimestamp', 'validationStatus'
    ];
    
    const csvRows = [headers.join(',')];
    
    models.forEach(model => {
      const row = headers.map(header => {
        const value = model[header] || 'Unknown';
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }

  async postToBackend(data) {
    if (!this.backendUrl || this.backendUrl === 'https://your-render-app.onrender.com') {
      console.log('Backend URL not configured or using placeholder, skipping backend submission');
      return;
    }

    const config = {
      method: 'POST',
      url: `${this.backendUrl}/api/llms`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
        'User-Agent': 'askme-scout-agent/1.0.0'
      },
      data: {
        models: data.models,
        timestamp: new Date().toISOString()
      },
      timeout: 30000
    };

    try {
      const response = await axios(config);
      console.log('Backend response:', response.status, response.statusText);
      
      if (response.status === 200 || response.status === 201) {
        console.log('Models successfully submitted to backend');
      } else {
        console.warn('Unexpected response status:', response.status);
      }
    } catch (error) {
      if (error.response) {
        console.error('Backend error:', error.response.status, error.response.statusText);
        if (error.response.data) {
          console.error('Response data:', error.response.data);
        }
        // Don't throw error for backend issues - continue with local save
        console.log('Continuing with local save only due to backend error');
      } else if (error.request) {
        console.error('Network error - backend unreachable:', error.message);
        console.log('Continuing with local save only due to network error');
      } else {
        console.error('Request setup error:', error.message);
        throw error;
      }
    }
  }

  // Removed: exportToCsv, getLatestReport
  // Only single CSV output method is needed
}

module.exports = new BackendReporter();