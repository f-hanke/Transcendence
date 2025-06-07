import { monitoringEnabled } from 'transcendence';
import winston from 'winston';
const transports = [
    new winston.transports.Console({
        format: winston.format.combine(winston.format.timestamp(), winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`))
    })
];
if (monitoringEnabled) {
    transports.push(new winston.transports.Http({
        host: 'logstash',
        port: 5000,
        path: '/',
        format: winston.format.json()
    }));
}
const winstonLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    defaultMeta: { service: 'api-gateway', type: 'api-gateway' },
    transports: transports,
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
