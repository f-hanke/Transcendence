import { monitoringEnabled } from 'transcendence';
import winston from 'winston';

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message }) =>
        `[${timestamp}] ${level.toUpperCase()}: ${message}`
      )
    )
  })
];

if (monitoringEnabled) {
  transports.push(new winston.transports.Http({
    host: 'logstash',
    port: 5000,
    path: '/',
    format: winston.format.json(),
    auth: {
      username: process.env.LOGSTASH_HTTP_USER || 'logstash',
      password: process.env.LOGSTASH_HTTP_PASSWORD || ''
    },
    ssl: false
  }));
}

const winstonLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'chat-service', type: 'chat-service' },
  transports: transports,
});

// Test log on startup
winstonLogger.info('Chat service logger initialized');

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