const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

class BackendReporter {
  constructor() {
    this.backendUrl = process.env.BACKEND_URL || 'https://your-render-app.onrender.com';
    this.authToken = process.env.AGENT_AUTH_TOKEN || 'your-auth-token';
    this.outputDir = path.join(__dirname, '..', 'output');
  }

  async sendToBackend(models) {
    try {
      await this.ensureOutputDir();
      
      const enrichedModels = this.enrichModels(models);
      const report = this.generateReport(enrichedModels);
      
      await this.saveLocalCopy(report);
      await this.postToBackend(report);
      
      console.log('Report sent to backend successfully');
    } catch (error) {
      console.error('Failed to send report to backend:', error);
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

  generateReport(models) {
    return {
      metadata: {
        timestamp: new Date().toISOString(),
        totalModels: models.length,
        agentVersion: '1.0.0',
        sources: this.getUniqueSources(models),
        runId: this.generateRunId()
      },
      models: models,
      summary: this.generateSummary(models)
    };
  }

  getUniqueSources(models) {
    const sources = new Set();
    models.forEach(model => {
      if (model.source) {
        sources.add(model.source);
      }
    });
    return Array.from(sources);
  }

  generateRunId() {
    return `run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  generateSummary(models) {
    const summary = {
      totalModels: models.length,
      bySource: {},
      byAccessType: {},
      byCountry: {},
      byModelSize: {}
    };

    models.forEach(model => {
      const source = model.source || 'Unknown';
      const accessType = model.accessType || 'Unknown';
      const country = model.country || 'Unknown';
      const modelSize = model.modelSize || 'Unknown';

      summary.bySource[source] = (summary.bySource[source] || 0) + 1;
      summary.byAccessType[accessType] = (summary.byAccessType[accessType] || 0) + 1;
      summary.byCountry[country] = (summary.byCountry[country] || 0) + 1;
      summary.byModelSize[modelSize] = (summary.byModelSize[modelSize] || 0) + 1;
    });

    return summary;
  }

  async saveLocalCopy(report) {
    const filename = `llm-discovery-${report.metadata.runId}.json`;
    const filepath = path.join(this.outputDir, filename);
    
    await fs.writeJson(filepath, report, { spaces: 2 });
    console.log(`Local copy saved to: ${filepath}`);
    
    const latestPath = path.join(this.outputDir, 'latest.json');
    await fs.writeJson(latestPath, report, { spaces: 2 });
    console.log(`Latest copy saved to: ${latestPath}`);
  }

  async postToBackend(report) {
    if (!this.backendUrl || this.backendUrl.includes('your-render-app')) {
      console.log('Backend URL not configured, skipping backend submission');
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
        models: report.models,
        metadata: report.metadata
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
        console.error('Backend error:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('Network error:', error.message);
      } else {
        console.error('Request setup error:', error.message);
      }
      throw error;
    }
  }

  async exportToCsv(models) {
    const csvRows = [];
    
    if (models.length === 0) {
      return 'No models to export';
    }
    
    const headers = Object.keys(models[0]);
    csvRows.push(headers.join(','));
    
    models.forEach(model => {
      const row = headers.map(header => {
        const value = model[header] || '';
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      csvRows.push(row.join(','));
    });
    
    const csvContent = csvRows.join('\\n');
    const filename = `llm-models-${Date.now()}.csv`;
    const filepath = path.join(this.outputDir, filename);
    
    await fs.writeFile(filepath, csvContent);
    console.log(`CSV export saved to: ${filepath}`);
    
    return csvContent;
  }

  async getLatestReport() {
    const latestPath = path.join(this.outputDir, 'latest.json');
    
    try {
      const report = await fs.readJson(latestPath);
      return report;
    } catch (error) {
      console.error('No latest report found:', error.message);
      return null;
    }
  }
}

module.exports = new BackendReporter();