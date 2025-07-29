#!/usr/bin/env node

import CLI from './core/infrastructure/cli.js';
import { createLogger } from './core/infrastructure/logger.js';
import config from './core/infrastructure/config.js';
import { ErrorHandler, ConfigurationError } from './core/infrastructure/errors.js';

const logger = createLogger({ level: config.get('LOG_LEVEL') });
const errorHandler = new ErrorHandler(logger);

class IntelligentDiscovery {
  constructor() {
    this.cli = new CLI();
    this.logger = logger;
    this.errorHandler = errorHandler;
    
    this.setupGlobalErrorHandlers();
    this.validateEnvironment();
  }

  setupGlobalErrorHandlers() {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.logger.error('Uncaught exception', { error: error.message, stack: error.stack });
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('Unhandled promise rejection', { 
        reason: reason instanceof Error ? reason.message : reason,
        stack: reason instanceof Error ? reason.stack : undefined
      });
      process.exit(1);
    });

    // Handle SIGINT (Ctrl+C)
    process.on('SIGINT', () => {
      this.logger.info('Received SIGINT, shutting down gracefully');
      this.shutdown();
    });

    // Handle SIGTERM
    process.on('SIGTERM', () => {
      this.logger.info('Received SIGTERM, shutting down gracefully');
      this.shutdown();
    });
  }

  validateEnvironment() {
    try {
      // Check Node.js version
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      
      if (majorVersion < 18) {
        throw new ConfigurationError(
          `Node.js version ${nodeVersion} is not supported. Please use Node.js 18 or higher.`
        );
      }

      // Validate configuration
      const apiKeys = config.getApiKeys();
      if (Object.keys(apiKeys).length === 0) {
        this.logger.warn('No API keys configured. Some features may not work properly.');
      }

      // Check database configuration
      const dbConfig = config.getDatabaseConfig();
      if (!dbConfig.url) {
        this.logger.warn('No database URL configured. Vector operations will not work.');
      }

      this.logger.info('Environment validation completed', {
        nodeVersion,
        environment: config.get('NODE_ENV'),
        configuredProviders: Object.keys(apiKeys),
        databaseUrl: dbConfig.url
      });

    } catch (error) {
      this.errorHandler.handle(error, { context: 'environment_validation' });
      throw error;
    }
  }

  async initialize() {
    try {
      this.logger.info('Initializing Intelligent Model Discovery System', {
        version: '1.0.0',
        environment: config.get('NODE_ENV'),
        logLevel: config.get('LOG_LEVEL')
      });

      // Initialize core services (will be implemented in future modules)
      await this.initializeCoreServices();

      this.logger.info('System initialization completed successfully');

    } catch (error) {
      this.errorHandler.handle(error, { context: 'system_initialization' });
      throw error;
    }
  }

  async initializeCoreServices() {
    // Placeholder for future service initialization
    // This will be expanded as we implement more modules:
    
    // await this.initializeDatabase();     // Module 2
    // await this.initializeProviders();    // Module 3
    // await this.initializeValidation();   // Module 5
    // await this.initializeIntelligence(); // Module 9
    // await this.initializeMonitoring();   // Module 15

    this.logger.debug('Core services initialization skipped (modules not yet implemented)');
  }

  async run() {
    try {
      await this.initialize();
      
      // Parse CLI arguments and execute commands
      this.cli.parse();
      
    } catch (error) {
      this.errorHandler.handle(error, { context: 'application_run' });
      process.exit(1);
    }
  }

  shutdown() {
    this.logger.info('Shutting down Intelligent Model Discovery System');
    
    // Graceful shutdown procedures
    // This will be expanded as we implement more modules:
    
    // await this.closeDatabase();
    // await this.stopMonitoring();
    // await this.cleanupResources();

    process.exit(0);
  }

  // Static method for programmatic usage
  static async create(options = {}) {
    const app = new IntelligentDiscovery();
    
    if (options.skipCliParsing) {
      await app.initialize();
      return app;
    }
    
    await app.run();
    return app;
  }
}

// Export for programmatic usage
export default IntelligentDiscovery;

// Run as CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = new IntelligentDiscovery();
  app.run().catch((error) => {
    logger.error('Application startup failed', { error: error.message });
    process.exit(1);
  });
}