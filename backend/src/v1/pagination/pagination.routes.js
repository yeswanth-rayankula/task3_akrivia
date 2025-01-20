const express = require('express');
const verifyToken = require('../../middlewares/verifyToken');
const { getProducts, deleteProduct, editProduct } = require('./pagination.controller');

const router = express.Router();

router.get('/getProducts',getProducts);
router.put('/editProduct/:productId', editProduct);
router.delete('/deleteProduct/:productId',deleteProduct);
module.exports = router;
