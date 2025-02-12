const express = require('express');
const cors = require('cors');
const app = express();
const socketIo = require('socket.io');
const http = require('http');
const setupSwagger = require('./swagger');
require('dotenv').config();
const register = require('./src/v1/register/register.routes');
const loginUser = require('./src/v1/login/login.routes');
const User = require('./src/v1/user/user.routes');
const product = require('./src/v1/pagination/pagination.routes');
// const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const helmet=require('helmet');
const { decryptRequestBody, encryptResponseBody } = require('./src/middlewares/decrypt');
const fileroutes=require('./src/v1/file-uploads/file-uploads.routes');
const rateLimit = require('express-rate-limit');
const { notFoundHandler, errorHandler} = require('./src/middlewares/globalErrorHandler');
// const slowDown = require('express-slow-down');
const { generateAccessToken } = require('./src/utils/jwtConfig');
const imports = require('./src/v1/imports-file/imports-file.routes');  
const bcrypt = require('bcryptjs');
const knex = require('knex');
const knexConfig = require('./knexfile');
const nodemailer = require("nodemailer");
const statusMonitor = require('express-status-monitor');
app.use(statusMonitor());

const db = knex(knexConfig.development);

app.use(helmet());
app.use(express.json());
app.use(cors());


const ex=require('events');
const e=new ex();
e.on('helo',(data)=>{
  console.log("dgh");
})
e.emit('helo',10);



const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' }
});
// app.use(limiter);
app.use(decryptRequestBody);

setupSwagger(app);
app.use('/api/v1/user',  register);
app.use('/api/v1/user',  loginUser);
app.use('/api/v1/user',  User);
app.use('/api/v1/user',product)
app.use('/api/v1/user/files',fileroutes);

app.use('/api/v1/user/imports',imports);



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

  socket.on('sendMessage', async ({ sender_id, receiver_id, message }) => {
    console.log(`Message from ${sender_id} to ${receiver_id}: ${message}`);

    await  db('messages')
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
  
    socket.join(user_id.toString());
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  
  socket.on("join_team", (teamId) => {
    socket.join(`team_${teamId}`);
    console.log(`User joined team ${teamId}`);
});

socket.on("send_message", ({ teamId, sender, text }) => {
  console.log(teamId, sender, text);
    io.to(`team_${teamId}`).emit("receive_message", { sender, text });
});
});
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
  }
});
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    const user = await db("users").where({ email });
     console.log(user);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    console.log("hello")
    console.log(user[0].user_id,"hejlo")
    const token = jwt.sign({ id: user[0].user_id }, process.env.JWT_SECRET, { expiresIn: "15m" });
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
app.post("/reset-password", async (req, res) => {
  try {
    const { password,token } = req.body;
    // console.log(password.password);
    // console.log("toek",token);
    // console.log("hello yeswanth");
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
app.use(errorHandler);
app.use(encryptResponseBody);


server.listen(4000, () => console.log('Server running on port 4000'));
