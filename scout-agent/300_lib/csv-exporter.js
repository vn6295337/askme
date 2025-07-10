const fs = require('fs-extra');
const path = require('path');

/**
 * CsvExporter - Handles CSV file generation and management
 */
class CsvExporter {
  constructor() {
    this.outputDir = path.join(__dirname, '../../data/output');
  }

  /**
   * Export models to CSV format
   */
  async exportToCsv(models) {
    try {
      await this.ensureOutputDir();
      
      console.log(`📊 Exporting ${models.length} models to CSV...`);
      
      const csvContent = this.generateCsvContent(models);
      const timestamp = this.getTimestamp();
      
      // Save timestamped version
      const timestampedFile = `llm-models-${timestamp}.csv`;
      const timestampedPath = path.join(this.outputDir, timestampedFile);
      await fs.writeFile(timestampedPath, csvContent);
      
      // Save latest version
      const latestPath = path.join(this.outputDir, 'llm-models-latest.csv');
      await fs.writeFile(latestPath, csvContent);
      
      console.log(`✅ CSV exported successfully:`);
      console.log(`   📄 ${timestampedFile}`);
      console.log(`   📄 llm-models-latest.csv`);
      
      return {
        timestampedPath,
        latestPath,
        filename: timestampedFile,
        rowCount: models.length
      };
    } catch (error) {
      console.error('❌ CSV export failed:', error);
      throw error;
    }
  }

  /**
   * Generate CSV content from models array
   */
  generateCsvContent(models) {
    if (models.length === 0) {
      return this.getEmptyCsv();
    }
    
    const headers = this.getCsvHeaders();
    const csvRows = [headers.join(',')];
    
    models.forEach(model => {
      const row = headers.map(header => {
        const value = model[header] || 'Unknown';
        return this.escapeCsvValue(value);
      });
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }

  /**
   * Get standard CSV headers
   */
  getCsvHeaders() {
    return [
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
  }

  /**
   * Escape CSV values properly
   */
  escapeCsvValue(value) {
    const stringValue = String(value);
    
    // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  }

  /**
   * Get empty CSV with headers only
   */
  getEmptyCsv() {
    return this.getCsvHeaders().join(',') + '\n';
  }

  /**
   * Get timestamp for file naming
   */
  getTimestamp() {
    return new Date().toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .slice(0, -5); // Remove milliseconds and Z
  }

  /**
   * Ensure output directory exists
   */
  async ensureOutputDir() {
    await fs.ensureDir(this.outputDir);
  }

  /**
   * Read existing CSV file
   */
  async readCsv(filename = 'llm-models-latest.csv') {
    try {
      const filePath = path.join(this.outputDir, filename);
      const content = await fs.readFile(filePath, 'utf8');
      return this.parseCsvContent(content);
    } catch (error) {
      console.warn(`⚠️  Could not read CSV file ${filename}:`, error.message);
      return [];
    }
  }

  /**
   * Parse CSV content into objects
   */
  parseCsvContent(content) {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',');
    const models = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i]);
      if (values.length === headers.length) {
        const model = {};
        headers.forEach((header, index) => {
          model[header] = values[index];
        });
        models.push(model);
      }
    }
    
    return models;
  }

  /**
   * Parse a single CSV line handling quoted values
   */
  parseCsvLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        values.push(current);
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
    
    // Add the last field
    values.push(current);
    
    return values;
  }

  /**
   * Get CSV statistics
   */
  async getCsvStats(filename = 'llm-models-latest.csv') {
    try {
      const models = await this.readCsv(filename);
      const stats = {
        totalModels: models.length,
        byPublisher: {},
        byCountry: {},
        bySource: {},
        byAccessType: {}
      };
      
      models.forEach(model => {
        // Count by publisher
        const publisher = model.publisher || 'Unknown';
        stats.byPublisher[publisher] = (stats.byPublisher[publisher] || 0) + 1;
        
        // Count by country
        const country = model.country || 'Unknown';
        stats.byCountry[country] = (stats.byCountry[country] || 0) + 1;
        
        // Count by source
        const source = model.source || 'Unknown';
        stats.bySource[source] = (stats.bySource[source] || 0) + 1;
        
        // Count by access type
        const accessType = model.accessType || 'Unknown';
        stats.byAccessType[accessType] = (stats.byAccessType[accessType] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('❌ Failed to get CSV stats:', error);
      return null;
    }
  }
}

module.exports = CsvExporter;