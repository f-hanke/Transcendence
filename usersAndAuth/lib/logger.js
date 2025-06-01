import winston from 'winston';
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    defaultMeta: { service: 'users-auth', type: 'auth-service' },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.timestamp(), winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`))
        }),
        // Send logs to Logstash
        new winston.transports.Http({
            host: 'logstash',
            port: 5000,
            path: '/',
            format: winston.format.json()
        })
    ],
});
export default logger;
