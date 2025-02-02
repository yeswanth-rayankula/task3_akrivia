
const express = require('express');
const  importData  = require('./imports-file.controller');

const router = express.Router();

router.post('/add',importData.importData);
router.get('/get-imports',importData.exportData);
module.exports = router;
