const jwt = require('jsonwebtoken');
const logger = require('./../../logger'); 
require('dotenv').config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

function verifyToken(req, res, next) {
   
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    
    logger.warn(`Authorization failed: No token provided for ${req.ip}`);
    return res.status(403).json({ message: 'No token provided.' });
  }
  
  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      
      logger.error(`Unauthorized access attempt: Invalid or expired token for ${req.ip}`);
      return res.status(401).json({ message: 'Unauthorized: Invalid or expired token.' });
    }

   
    logger.info(`User  authenticated successfully from ${req.ip}`);
    
    req.user = decoded;
    console.log(req.method);
    
    next();
  });
}

module.exports = verifyToken;
