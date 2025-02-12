const express = require('express');
const { verifyToken, authorizeRole } = require('../../middlewares/verifyToken');
const { 
    getProducts, deleteProduct, editProduct, getCategories, getVendors, addProduct, 
    addItemsToCart, getCartItems, decreaseQuantity, increaseQuantity, removeFromCart 
} = require('./pagination.controller');

const router = express.Router();

/**
 * @swagger
 * /api/v1/user/getProducts:
 *   get:
 *     summary: Retrieve all products
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of products.
 */
router.get('/getProducts', verifyToken, getProducts);

/**
 * @swagger
 * /api/v1/user/editProduct/{productId}:
 *   put:
 *     summary: Edit a product
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product updated.
 */
router.put('/editProduct/:productId', verifyToken, authorizeRole(["Admin", "Manager"]), editProduct);

/**
 * @swagger
 * /api/v1/user/deleteProduct/{productId}:
 *   delete:
 *     summary: Delete a product
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted.
 */
router.delete('/deleteProduct/:productId', authorizeRole(["Admin", "Manager"]), verifyToken, deleteProduct);

/**
 * @swagger
 * /api/v1/user/getCategories:
 *   get:
 *     summary: Retrieve all categories
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of categories.
 */
router.get('/getCategories', verifyToken, getCategories);

/**
 * @swagger
 * /api/v1/user/getVendors:
 *   get:
 *     summary: Retrieve all vendors
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of vendors.
 */
router.get('/getVendors', verifyToken, getVendors);

/**
 * @swagger
 * /api/v1/user/addProduct:
 *   post:
 *     summary: Add a new product
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Product added.
 */
router.post('/addProduct', verifyToken, authorizeRole([ "Manager"]), addProduct);

/**
 * @swagger
 * /api/v1/user/cart/addItems:
 *   post:
 *     summary: Add items to cart
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Items added to cart.
 */
router.post('/cart/addItems', verifyToken, addItemsToCart);

/**
 * @swagger
 * /api/v1/user/cart/items:
 *   get:
 *     summary: Get cart items
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of cart items.
 */
router.get('/cart/items', verifyToken, getCartItems);

/**
 * @swagger
 * /api/v1/user/cart/decreaseQuantity:
 *   post:
 *     summary: Decrease quantity of an item in the cart
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Quantity decreased.
 */
router.post('/cart/decreaseQuantity', verifyToken, decreaseQuantity);

/**
 * @swagger
 * /api/v1/user/cart/increaseQuantity:
 *   post:
 *     summary: Increase quantity of an item in the cart
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Quantity increased.
 */
router.post('/cart/increaseQuantity', verifyToken, increaseQuantity);

/**
 * @swagger
 * /api/v1/user/cart/remove/{Cart_ID}:
 *   delete:
 *     summary: Remove an item from the cart
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: Cart_ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from cart.
 */
router.delete('/cart/remove/:Cart_ID', verifyToken, removeFromCart);

module.exports = router;