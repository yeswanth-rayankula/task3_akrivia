const express = require('express');
const {verifyToken,authorizeRole} = require('../../middlewares/verifyToken');
const { getUser ,getAllUser} = require('./user.controller');
const { updateUser } = require('./user.controller');

const router = express.Router();

router.get('/getData',verifyToken,getUser);
router.get('/getAllData',verifyToken,getAllUser);
router.patch('/updateUser',verifyToken,updateUser);
module.exports = router;
