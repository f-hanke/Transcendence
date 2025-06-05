import winston from 'winston';

const winstonLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'webserver', type: 'webserver' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, service }) =>
          `[${timestamp}] ${level.toUpperCase()} [${service}]: ${message}`
        )
      )
    })
  ],
});

// Test log on startup
winstonLogger.info('Webserver logger initialized');

// Simple wrapper that just handles multiple arguments
const logger = {
  info(...args: any[]) {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    winstonLogger.info(message);
  },

  warn(...args: any[]) {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    winstonLogger.warn(message);
  },

  error(...args: any[]) {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    winstonLogger.error(message);
  },

  debug(...args: any[]) {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    winstonLogger.debug(message);
  }
};

export default logger;