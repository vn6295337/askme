const axios = require('axios');

/**
 * BackendExporter - Handles communication with the askme backend API
 */
class BackendExporter {
  constructor() {
    this.backendUrl = process.env.BACKEND_URL || 'https://askme-backend-proxy.onrender.com';
    this.authToken = process.env.AGENT_AUTH_TOKEN || 'your-auth-token';
    this.timeout = 30000; // 30 seconds
  }

  /**
   * Send models to backend API
   */
  async exportToBackend(models) {
    if (!this.isBackendConfigured()) {
      console.log('⏭️  Backend not configured, skipping API submission');
      return { success: false, reason: 'not_configured' };
    }

    try {
      console.log(`🌐 Sending ${models.length} models to backend...`);
      
      const response = await this.makeRequest(models);
      
      if (this.isSuccessResponse(response)) {
        console.log('✅ Models successfully sent to backend');
        return { 
          success: true, 
          status: response.status, 
          data: response.data 
        };
      } else {
        console.warn(`⚠️  Unexpected backend response: ${response.status}`);
        return { 
          success: false, 
          reason: 'unexpected_status', 
          status: response.status 
        };
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Check if backend is properly configured
   */
  isBackendConfigured() {
    return this.backendUrl && 
           this.backendUrl !== 'https://your-render-app.onrender.com' &&
           this.authToken &&
           this.authToken !== 'your-auth-token';
  }

  /**
   * Make HTTP request to backend
   */
  async makeRequest(models) {
    const config = {
      method: 'POST',
      url: `${this.backendUrl}/api/llms`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
        'User-Agent': 'askme-scout-agent/1.0.0'
      },
      data: {
        models: models,
        timestamp: new Date().toISOString(),
        agentVersion: '1.0.0',
        totalModels: models.length
      },
      timeout: this.timeout
    };

    return await axios(config);
  }

  /**
   * Check if response indicates success
   */
  isSuccessResponse(response) {
    return response.status === 200 || response.status === 201;
  }

  /**
   * Handle various types of errors
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      console.error(`❌ Backend error: ${error.response.status} ${error.response.statusText}`);
      
      if (error.response.data) {
        console.error('Response details:', error.response.data);
      }
      
      return {
        success: false,
        reason: 'server_error',
        status: error.response.status,
        message: error.response.statusText,
        data: error.response.data
      };
    } else if (error.request) {
      // Network error - request made but no response
      console.error(`❌ Network error - backend unreachable: ${error.message}`);
      
      return {
        success: false,
        reason: 'network_error',
        message: error.message
      };
    } else {
      // Request setup error
      console.error(`❌ Request setup error: ${error.message}`);
      
      return {
        success: false,
        reason: 'request_error',
        message: error.message
      };
    }
  }

  /**
   * Test backend connectivity
   */
  async testConnection() {
    if (!this.isBackendConfigured()) {
      return {
        success: false,
        reason: 'not_configured',
        message: 'Backend URL or auth token not configured'
      };
    }

    try {
      console.log('🔍 Testing backend connection...');
      
      // Try a simple health check or minimal request
      const config = {
        method: 'GET',
        url: `${this.backendUrl}/health`,
        headers: {
          'User-Agent': 'askme-scout-agent/1.0.0'
        },
        timeout: 10000 // 10 seconds for health check
      };

      const response = await axios(config);
      
      console.log(`✅ Backend connection test successful: ${response.status}`);
      return {
        success: true,
        status: response.status,
        message: 'Connection successful'
      };
    } catch (error) {
      console.error('❌ Backend connection test failed:', error.message);
      return this.handleError(error);
    }
  }

  /**
   * Get backend configuration info (for debugging)
   */
  getConfig() {
    return {
      backendUrl: this.backendUrl,
      hasAuthToken: !!this.authToken && this.authToken !== 'your-auth-token',
      timeout: this.timeout,
      isConfigured: this.isBackendConfigured()
    };
  }

  /**
   * Update configuration
   */
  updateConfig({ backendUrl, authToken, timeout }) {
    if (backendUrl) this.backendUrl = backendUrl;
    if (authToken) this.authToken = authToken;
    if (timeout) this.timeout = timeout;
  }
}

module.exports = BackendExporter;