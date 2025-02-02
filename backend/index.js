const express = require('express');
const cors = require('cors');
const app = express();

require('dotenv').config();
const register = require('./src/v1/register/register.routes');
const loginUser = require('./src/v1/login/login.routes');
const User = require('./src/v1/user/user.routes');
const product = require('./src/v1/pagination/pagination.routes');
const AWS = require('aws-sdk');
const helmet=require('helmet');
const { decryptRequestBody, encryptResponseBody } = require('./src/middlewares/decrypt');
const fileroutes=require('./src/v1/file-uploads/file-uploads.routes');
const rateLimit = require('express-rate-limit');
const { notFoundHandler, errorHandler} = require('./src/middlewares/globalErrorHandler');
const slowDown = require('express-slow-down');
const { generateAccessToken } = require('./src/utils/jwtConfig');
const imports = require('./src/v1/imports-file/imports-file.routes');  


app.use(helmet());
app.use(express.json());
app.use(cors());



// app.use(limiter);
app.use(decryptRequestBody);

app.use('/api/v1/user',  register);
app.use('/api/v1/user',  loginUser);
app.use('/api/v1/user',  User);
app.use('/api/v1/user',product)
app.use('/api/v1/user/files',fileroutes);

app.use('/api/v1/user/imports',imports)




app.post("/token", (req, res) => {
  const { token: refreshToken } = req.body;

  if (!refreshToken) return res.status(401).send("Refresh token required.");
 

  jwt.verify(refreshToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).send("Invalid or expired refresh token.");

 
    const {username,email,user_id } = user;
    const accessToken = generateAccessToken({ username,email,user_id });
    res.json({ accessToken });
  });
});

app.use(notFoundHandler);
app.use(encryptResponseBody);
app.use(errorHandler);

app.listen(4000, () => console.log('Server running on port 4000'));
