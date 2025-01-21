const express = require('express');
const verifyToken = require('../../middlewares/verifyToken');
const { getProducts, deleteProduct, editProduct, getCategories, getVendors, addProduct, addItemsToCart, getCartItems, decreaseQuantity } = require('./pagination.controller');

const router = express.Router();

router.get('/getProducts',getProducts);
router.put('/editProduct/:productId', editProduct);
router.delete('/deleteProduct/:productId',deleteProduct);
router.get('/getCategories',getCategories);
router.get('/getVendors',getVendors);
router.post('/addProduct',addProduct);
router.post('/cart/addItems',addItemsToCart);
router.get('/cart/items',getCartItems);
router.post('/cart/decreaseQuantity', decreaseQuantity);
module.exports = router;
