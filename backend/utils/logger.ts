import winston from "winston";
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const logFilePath = path.resolve(__dirname, '../log/eventlogs/events.log');
const errorLogFilePath = path.resolve(__dirname, '../log/eventlogs/error.log');


const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, errors } = format;


const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
});

const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        errors({stack: true}),
        logFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ 
            filename: errorLogFilePath, 
            level: 'error',
            maxsize: 20 * 1024 * 1024,
        }),
        new transports.File({ 
            filename: logFilePath,
            maxsize: 20 * 1024 * 1024,
        }),
    ],
});

export { logger };