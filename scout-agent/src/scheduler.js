const cron = require('node-cron');
const { main } = require('./index');

class AgentScheduler {
  constructor() {
    this.job = null;
    this.isRunning = false;
  }

  start() {
    console.log('Starting LLM Scout Agent scheduler...');
    
    this.job = cron.schedule('0 2 * * 0', async () => {
      if (this.isRunning) {
        console.log('Agent is already running, skipping this execution');
        return;
      }
      
      this.isRunning = true;
      console.log('Executing weekly LLM discovery...');
      
      try {
        await main();
        console.log('Weekly discovery completed successfully');
      } catch (error) {
        console.error('Weekly discovery failed:', error);
        this.handleError(error);
      } finally {
        this.isRunning = false;
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });
    
    console.log('Scheduler started - will run every Sunday at 2 AM UTC');
  }

  stop() {
    if (this.job) {
      this.job.stop();
      console.log('Scheduler stopped');
    }
  }

  async runNow() {
    if (this.isRunning) {
      console.log('Agent is already running');
      return;
    }
    
    this.isRunning = true;
    console.log('Running manual discovery...');
    
    try {
      await main();
      console.log('Manual discovery completed successfully');
    } catch (error) {
      console.error('Manual discovery failed:', error);
      this.handleError(error);
    } finally {
      this.isRunning = false;
    }
  }

  handleError(error) {
    console.error('Agent execution error:', error);
    
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      type: 'scheduler_error'
    };
    
    console.error('Error details:', JSON.stringify(errorLog, null, 2));
  }

  getStatus() {
    return {
      isScheduled: this.job ? this.job.running : false,
      isRunning: this.isRunning,
      nextRun: this.job ? 'Next Sunday at 2 AM UTC' : 'Not scheduled',
      lastRun: new Date().toISOString()
    };
  }
}

const scheduler = new AgentScheduler();

if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'start':
      scheduler.start();
      break;
    case 'stop':
      scheduler.stop();
      break;
    case 'run':
      scheduler.runNow();
      break;
    case 'status':
      console.log(scheduler.getStatus());
      break;
    default:
      console.log('Usage: node scheduler.js [start|stop|run|status]');
  }
}

module.exports = scheduler;