const express = require('express');
const verifyToken = require('../../middlewares/verifyToken');
const { getUser } = require('./user.controller');
const { updateUser } = require('./user.controller');

const router = express.Router();


router.get('/getData',verifyToken,getUser);
router.patch('/updateUser',verifyToken,updateUser);
module.exports = router;
