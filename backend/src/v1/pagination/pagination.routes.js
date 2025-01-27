const express = require('express');
const verifyToken = require('../../middlewares/verifyToken');
const { getProducts, deleteProduct, editProduct, getCategories, getVendors, addProduct, addItemsToCart, getCartItems, decreaseQuantity, increaseQuantity, removeFromCart } = require('./pagination.controller');

const router = express.Router();

router.get('/getProducts',verifyToken,getProducts);
router.put('/editProduct/:productId',verifyToken, editProduct);
router.delete('/deleteProduct/:productId',verifyToken,deleteProduct);
router.get('/getCategories',verifyToken,getCategories);
router.get('/getVendors',verifyToken,getVendors);
router.post('/addProduct',verifyToken,addProduct);
router.post('/cart/addItems',verifyToken,addItemsToCart);
router.get('/cart/items',verifyToken,getCartItems);
router.post('/cart/decreaseQuantity',verifyToken, decreaseQuantity);
router.post('/cart/increaseQuantity',verifyToken, increaseQuantity);
router.delete('/cart/remove/:Cart_ID',verifyToken,removeFromCart);
module.exports = router;
