const express = require('express');
const { registerUser, getLocations } = require('./register.controller');
const router = express.Router();

router.post('/register', registerUser);

router.post('/register/locations', getLocations);

module.exports = router;
