const jwt = require('jsonwebtoken');

const SECRET_KEY = "your_secret_key";
const ACCESS_TOKEN_SECRET = '10';
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'No token provided.' });
  }

  jwt.verify(token,ACCESS_TOKEN_SECRET , (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized: Invalid or expired token.' });
    }

    req.user = decoded;
   
    next();
  });
}

module.exports = verifyToken;
