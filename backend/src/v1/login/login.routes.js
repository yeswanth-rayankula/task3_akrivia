const express = require('express');
const { loginUserHandler } = require('./login.controller');
const router = express.Router();

router.post('/login', loginUserHandler);

module.exports = router;
