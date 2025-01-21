
const winston = require('winston');
const { format } = winston;

const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()  // Format logs as JSON
  ),
  transports: [
    // Write logs to a single file, overwriting it each time the app restarts
    new winston.transports.File({
      filename: 'logs/app.log',  // Specify your log file name
      maxsize: 20 * 1024 * 1024, // Maximum log file size (20MB in this example)
      maxFiles: 1,  // Keep only 1 file (overwrite it each time)
      tailable: true // Make the file "tailable" (appends to the log if not overwriting)
    }),
    
  ],
});

// Optional: Handle uncaught exceptions
logger.exceptions.handle(
  new winston.transports.File({ filename: 'logs/exceptions.log' })
);

module.exports = logger;
