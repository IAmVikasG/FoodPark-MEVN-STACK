const winston = require('winston');

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};

// Define level based on environment
const level = () =>
{
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'warn';
};

// Create the logger instance
const logger = winston.createLogger({
    level: level(),
    levels,
    format: logFormat,
    transports: [
        // Write all logs to console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        // Write all logs with level 'error' and below to error.log
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            dirname: 'logs',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Write all logs with level 'info' and below to combined.log
        new winston.transports.File({
            filename: 'logs/combined.log',
            dirname: 'logs',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        })
    ],
    // Handle exceptions and rejections
    exceptionHandlers: [
        new winston.transports.File({
            filename: 'logs/exceptions.log',
            dirname: 'logs'
        })
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: 'logs/rejections.log',
            dirname: 'logs'
        })
    ]
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const dir = './logs';
if (!fs.existsSync(dir))
{
    fs.mkdirSync(dir);
}

// Add stream for Morgan HTTP logger
logger.stream = {
    write: (message) => logger.http(message.trim())
};

module.exports = logger;
