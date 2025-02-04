
const express = require('express');
const  importData  = require('./imports-file.controller');
const { manual_check } = require('./imports-file.service');

const router = express.Router();

router.post('/add',importData.importData);
router.get('/get-imports',importData.exportData);
router.post('/manual-check',manual_check)
module.exports = router;
