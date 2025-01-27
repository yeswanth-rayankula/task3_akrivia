
const winston = require('winston');
const { format } = winston;

const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()  
  ),
  transports: [
   
    new winston.transports.File({
      filename: 'logs/app.log', 
      maxsize: 20 * 1024 * 1024,
      maxFiles: 1, 
      tailable: true 
    }),
    
  ],
});


logger.exceptions.handle(
  new winston.transports.File({ filename: 'logs/exceptions.log' })
);

module.exports = logger;
