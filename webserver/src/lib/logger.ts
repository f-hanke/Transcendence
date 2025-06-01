import winston from 'winston';

const logger = winston.createLogger({
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
logger.info('Webserver logger initialized');

export default logger;