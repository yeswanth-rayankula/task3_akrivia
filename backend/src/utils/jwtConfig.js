const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_SECRET = '10';
const REFRESH_TOKEN_SECRET = '10';


const generateAccessToken = (payload) => {
  console.log(payload);
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '5h' });
};


const generateRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' }); 
};

module.exports = { generateAccessToken, generateRefreshToken };
