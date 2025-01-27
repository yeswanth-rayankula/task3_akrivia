const productService = require('./pagination.service');
const logger = require('../../../logger');
const { productSchema, paginationSchema } = require('./pagination.utils');

exports.getProducts = async (req, res) => {
  
  try {

    const page = parseInt(req.query.page) || 1;
    const offset = parseInt(req.query.offset) || 5;
    const searchText = req.query.searchText || '';
    const selectedFilters = {};

    Object.keys(req.query).forEach(key => {
      if (key !== 'page' && key !== 'offset' && key !== 'searchText') {
        selectedFilters[key] = req.query[key] === 'true';
      }
    });

    const products = await productService.getAllProducts(page, offset, searchText, selectedFilters);
    res.status(200).json({ data: products });
    logger.info(`Fetched products for page ${page}, offset ${offset}, searchText ${searchText}`);
  } catch (error) {
    logger.error('Error retrieving products:', error.message);
    res.status(500).json({ message: 'Error retrieving products', error: error.message });
  }
};

exports.deleteProduct = (req, res) => {
  const productId = req.params.productId;
  productService.deleteProduct(productId)
    .then(() => {
      logger.info(`Product with ID ${productId} deleted successfully`);
      res.status(200).json({ message: 'Product and related records deleted successfully' });
    })
    .catch((error) => {
      logger.error(`Failed to delete product with ID ${productId}: ${error.message}`);
      res.status(500).json({ message: 'Failed to delete product', error });
    });
};

exports.editProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const updatedProduct = req.body;

    const result = await productService.editProduct(productId, updatedProduct);

    logger.info(`Product with ID ${productId} updated successfully`);
    res.status(200).json({ message: 'Product and vendor data updated successfully', data: result });
  } catch (error) {
    logger.error(`Error updating product with ID ${req.params.productId}: ${error.message}`);
    res.status(500).json({ message: 'Error updating product', error });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await productService.getCategories();  
    res.status(200).json({ data: categories });
    logger.info('Fetched categories successfully');
  } catch (error) {
    logger.error('Error fetching categories:', error.message);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

exports.getVendors = async (req, res) => {
  try {
    const vendors = await productService.getVendors();  
    res.status(200).json({ data: vendors });
    logger.info('Fetched vendors successfully');
  } catch (error) {
    logger.error('Error fetching vendors:', error.message);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
};

exports.addProduct = async (req, res) => {
  
  try {
    const { product_name, category_name, vendor_name, quantity_in_stock, unit_price, product_image, status } = req.body;

    const newProduct = await productService.addProduct({
      product_name,
      category_name,
      vendor_name,
      quantity_in_stock,
      unit_price,
      product_image,
      status
    });

    logger.info(`New product added: ${product_name}`);
    res.status(201).json({
      message: 'Product added successfully',
      product: newProduct
    });
  } catch (error) {
    logger.error('Error adding product:', error.message);
    res.status(500).json({ error: 'Failed to add product' });
  }
};
exports.addItemsToCart = async (req, res) => {
  const items = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'No items provided to add to the cart' });
  }

  try {
    const result = await productService.addItemsToCart(items);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in addItemsToCart controller:', error.message);
 

     res.status(500).json({ message: 'Failed to add items to the cart', error: error.message });
  }
};
exports.getCartItems = async (req, res) => {
  try {
    const cartItems = await productService.getCartItems();
    res.status(200).json({ success: true, data: cartItems });
  } catch (error) {
    console.error('Error in getCartItems controller:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch cart items', error: error.message });
  }
};

exports.decreaseQuantity = async (req, res) => {
  const { cartId, productId } = req.body;

   console.log(cartId,productId);

  if (!cartId || !productId) {
    return res.status(400).json({ message: 'cartId and productId are required' });
  }

  try {
    const result = await productService.decreaseCartQuantityAndUpdateStock(cartId, productId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in decreaseQuantity controller:', error.message);
    res.status(500).json({ message: 'Failed to decrease cart quantity and update stock', error: error.message });
  }
};
exports.increaseQuantity = async (req, res) => {
  const { cartId, productId } = req.body;

   console.log(cartId,productId);

  if (!cartId || !productId) {
    return res.status(400).json({ message: 'cartId and productId are required' });
  }

  try {
    const result = await productService.increaseCartQuantityAndUpdateStock(cartId, productId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in decreaseQuantity controller:', error.message);
    res.status(500).json({ message: 'Failed to decrease cart quantity and update stock', error: error.message });
  }
};
exports.removeFromCart = async (req, res) => {
  try {
    const { Cart_ID } = req.params;
    const { product_id } = req.query;
    const result = await productService.removeItem(Cart_ID,product_id);

    if (result) {
      res.status(200).json({ message: 'Item removed from cart successfully.' });
    } else {
      res.status(404).json({ message: 'Item not found in cart.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
};