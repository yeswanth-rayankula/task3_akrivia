const express = require('express');
const cors = require('cors');
const app = express();
const register = require('./src/v1/register/register.routes');
const loginUser = require('./src/v1/login/login.routes');
const User = require('./src/v1/user/user.routes');
const product = require('./src/v1/pagination/pagination.routes');
const AWS = require('aws-sdk');
const { decryptRequestBody, encryptResponseBody } = require('./src/middlewares/decrypt');
const fileroutes=require('./src/v1/file-uploads/file-uploads.routes');
const rateLimit = require('express-rate-limit');
const verifyToken = require('./src/middlewares/verifyToken');


app.use(express.json());
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
  allowedHeaders: ['Authorization', 'Content-Type'],
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100000,
  message: 'Too many requests, please try again later.'
});


app.use(limiter);
 app.use(decryptRequestBody);

app.use('/api/v1/user',  register);
app.use('/api/v1/user',  loginUser);

app.use('/api/v1/user',  User);
app.use('/api/v1/user',product)
app.use('/api/files',fileroutes)



app.use(encryptResponseBody);


app.listen(4000, () => console.log('Server running on port 4000'));
