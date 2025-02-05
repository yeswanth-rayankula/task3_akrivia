const express = require('express');
const cors = require('cors');
const app = express();
const socketIo = require('socket.io');
const http = require('http');

require('dotenv').config();
const register = require('./src/v1/register/register.routes');
const loginUser = require('./src/v1/login/login.routes');
const User = require('./src/v1/user/user.routes');
const product = require('./src/v1/pagination/pagination.routes');
// const AWS = require('aws-sdk');
const helmet=require('helmet');
const { decryptRequestBody, encryptResponseBody } = require('./src/middlewares/decrypt');
const fileroutes=require('./src/v1/file-uploads/file-uploads.routes');
const rateLimit = require('express-rate-limit');
const { notFoundHandler, errorHandler} = require('./src/middlewares/globalErrorHandler');
// const slowDown = require('express-slow-down');
const { generateAccessToken } = require('./src/utils/jwtConfig');
const imports = require('./src/v1/imports-file/imports-file.routes');  

const knex = require('knex');
const knexConfig = require('./knexfile');


const db = knex(knexConfig.development);
app.use(helmet());
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' }
});
// app.use(limiter);
app.use(decryptRequestBody);

app.use('/api/v1/user',  register);
app.use('/api/v1/user',  loginUser);
app.use('/api/v1/user',  User);
app.use('/api/v1/user',product)
app.use('/api/v1/user/files',fileroutes);

app.use('/api/v1/user/imports',imports)
app.get('/api/v1/user/chat-history/:sender_id/:receiver_id', async (req, res) => {
  try {
    console.log('Fetching chat history...');
    const { sender_id, receiver_id } = req.params;

    const messages = await db('messages')
      .where(function () {
        this.where({ sender_id, receiver_id })
            .orWhere({ sender_id: receiver_id, receiver_id: sender_id });
      })
      .orderBy('created_at', 'asc');

    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




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




io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('sendMessage', ({ sender_id, receiver_id, message }) => {
    console.log(`Message from ${sender_id} to ${receiver_id}: ${message}`);

    db('messages')
      .insert({
        sender_id: sender_id,
        receiver_id: receiver_id,
        message: message
      })
      .then(() => {
        console.log('Message saved to DB');
      })
      .catch((err) => {
        console.error('DB error:', err);
      });

    io.to(receiver_id.toString()).emit('receiveMessage', { sender_id, message, created_at: new Date() });
  });

  socket.on('joinChat', (user_id) => {
    console.log(`User ${user_id} joined chat`);
    socket.join(user_id.toString());
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
  }
});
const jwt = require('jsonwebtoken');
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    const user = await db("users").where({ email });
   
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    console.log("hello")
    const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const resetLink = `http://localhost:4200/reset-password?token=${token}`;
    console.log("hello")
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Password Reset",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    });
    console.log("bhello")
    res.status(200).json({ message: "Reset link sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Error processing request" });
  }
});
const bcrypt = require('bcryptjs');
app.post("/reset-password", async (req, res) => {
  try {
    const { password,token } = req.body;
    console.log(password.password);
    console.log("toek",token);
    console.log("hello yeswanth");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded,"decodes");
    const hashedPassword =await bcrypt.hash(password.password, 10);
    console.log("dhojhd",hashedPassword);
    await db("users").where({ user_id: decoded.id }).update({ password: hashedPassword });
   
    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

app.use(notFoundHandler);
app.use(encryptResponseBody);
app.use(errorHandler);

server.listen(4000, () => console.log('Server running on port 4000'));
