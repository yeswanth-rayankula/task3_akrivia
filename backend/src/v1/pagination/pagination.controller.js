
const productService = require('./pagination.service');

exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;  // Default to page 1
    const offset = parseInt(req.query.offset) || 5;  // Default to 10 items per page
    const products = await productService.getAllProducts(page, offset);
    res.status(200).json({ data: products });

  } catch (error) {
    res.status(500).json({ message: 'Error retrieving products', error: error.message });
  }
};


exports.deleteProduct = (req, res) => {
  const productId = req.params.productId;
  console.log("helo");
  productService.deleteProduct(productId)
    .then(() => {
      res.status(200).json({ message: 'Product and related records deleted successfully' });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Failed to delete product', error });
    });
};
exports.editProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const updatedProduct = req.body;

    // Call the service to update product
    const result = await productService.editProduct(productId, updatedProduct);

    // Return success response
    res.status(200).json({ message: 'Product and vendor data updated successfully', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating product', error });
  }
};