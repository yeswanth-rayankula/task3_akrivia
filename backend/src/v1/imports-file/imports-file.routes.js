
const express = require('express');
const  importData  = require('./imports-file.controller');
const { manual_check } = require('./imports-file.service');
const {verifyToken,authorizeRole}=require('./../../middlewares/verifyToken.js')
const router = express.Router();

router.post('/add',verifyToken,authorizeRole(["Admin", "Manager"]),importData.importData);
router.get('/get-imports',importData.exportData);
router.post('/manual-check',verifyToken,authorizeRole(["Admin", "Manager"]),manual_check)
module.exports = router;
