const jwt = require('jsonwebtoken');
const logger = require('./../../logger'); // Import the logger

const SECRET_KEY = "your_secret_key";
const ACCESS_TOKEN_SECRET = '10';

function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    // Log missing token event
    logger.warn(`Authorization failed: No token provided for ${req.ip}`);
    return res.status(403).json({ message: 'No token provided.' });
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      // Log invalid or expired token event
      logger.error(`Unauthorized access attempt: Invalid or expired token for ${req.ip}`);
      return res.status(401).json({ message: 'Unauthorized: Invalid or expired token.' });
    }

    // Log successful authentication event
    logger.info(`User  authenticated successfully from ${req.ip}`);
    
    req.user = decoded;
    next();
  });
}

module.exports = verifyToken;
