import winston from 'winston';

// Define log levels and their colors (optional)
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
};

// Create a new winston logger instance
const logger = winston.createLogger({
  level: 'debug',
  levels,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp, stack }) => {
      if (level === 'error' && stack) {
        return `${timestamp} [${level}]: ${message} \nStack Trace: ${stack}`;
      }
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.File({ filename: 'errors.log', level: 'error' }),
  ],
});

// Add colors to the console output
winston.addColors(colors);

export default logger;
