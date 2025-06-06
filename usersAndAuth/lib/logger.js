import winston from 'winston';
const winstonLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    defaultMeta: { service: 'users-auth', type: 'auth-service' },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.timestamp(), winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`))
        }),
        // Send logs to Logstash
        // new winston.transports.Http({
        //   host: 'logstash',
        //   port: 5000,
        //   path: '/',
        //   format: winston.format.json()
        // })
    ],
});
// Simple wrapper that just handles multiple arguments
const logger = {
    info(...args) {
        const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
        winstonLogger.info(message);
    },
    warn(...args) {
        const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
        winstonLogger.warn(message);
    },
    error(...args) {
        const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
        winstonLogger.error(message);
    },
    debug(...args) {
        const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
        winstonLogger.debug(message);
    }
};
export default logger;
