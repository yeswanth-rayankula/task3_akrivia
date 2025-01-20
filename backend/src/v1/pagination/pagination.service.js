const knex = require('knex');
const knexConfig = require('../../../knexfile');
const db = knex(knexConfig.development);


exports.getAllProducts = async (page = 1, offset = 5) => {
  try {
    const limit = offset; // Number of items per page
    const offsetValue = (page - 1) * offset; // Calculate the offset based on the page number

    // Query to fetch paginated product data
    const products = await db('products')
      .join('categories', 'products.category_id', '=', 'categories.category_id')
      .join('product_to_vendor', 'products.product_id', '=', 'product_to_vendor.product_id')
      .join('vendors', 'product_to_vendor.vendor_id', '=', 'vendors.vendor_id')
      .select(
        'products.product_id',
        'products.product_name',
        'categories.category_name',
        'products.quantity_in_stock',
        'products.unit_price',
        'products.status',
        'vendors.vendor_name'
      )
      .where('products.status', '1')
      .andWhere('product_to_vendor.status', '1')
      .limit(limit)
      .offset(offsetValue);

    // Query to get the total count of products matching the conditions
    const totalProducts = await db('products')
      .join('product_to_vendor', 'products.product_id', '=', 'product_to_vendor.product_id')
      .where('products.status', '1')
      .andWhere('product_to_vendor.status', '1')
      .count({ total: 'products.product_id' })
      .first();

    // Return both paginated products and the total count
    return {
      products,
      totalProducts: parseInt(totalProducts.total, 10), // Ensure total is returned as a number
    };
  } catch (error) {
    throw new Error('Error fetching products from the database');
  }
};


// Function to delete a product and its associated records in a transaction
exports.deleteProduct = (productId) => {
  return new Promise((resolve, reject) => {
    db.transaction(async (trx) => {
      try {
        // Delete the product's relation in the product_to_vendor table
        await trx('product_to_vendor')
          .where('product_id', productId)
          .del();

        // Delete the product itself from the products table
        await trx('products')
          .where('product_id', productId)
          .del();

        // Commit the transaction
        await trx.commit();

        resolve();
      } catch (error) {
        // Rollback the transaction if any error occurs
        await trx.rollback();

        reject({ message: 'Failed to delete product and related records', error });
      }
    });
  });
};

// Function to edit product details along with related vendor information
exports.editProduct = async (productId, updatedProduct) => {
  const {
    product_name,
    status,
    category_name,
    vendor_name,
    quantity_in_stock,
    unit_price
  } = updatedProduct;

  console.log("Product ID:", productId); // Log the product ID
  console.log("Updated Product:", updatedProduct); // Log the updated product data

  // Ensure that unit_price is treated as a number
  const price = parseFloat(unit_price); // Convert string to number if needed

  try {
    // Check if the product exists
    const productExists = await db('products').where('product_id', productId).first();
    if (!productExists) {
      console.log("Product not found in the database.");
      throw new Error("Product not found in the database.");
    }

    // Get the category_id based on the provided category_name
    const category = await db('categories')
      .where('category_name', category_name)
      .first();

    if (!category) {
      console.log("Category not found in the database.");
      throw new Error("Category not found in the database.");
    }

    const category_id = category.category_id; // Get the category_id

    // Start a transaction to ensure both updates are done atomically
    return await db.transaction(async (trx) => {
      try {
        // Log start of transaction
        console.log("Transaction started");

        // Update product details in the 'products' table
        console.log("Updating product details...");
        await trx('products')
          .where('product_id', productId)
          .update({
            product_name,
            status,
            category_id, // Update category_id instead of category_name
            quantity_in_stock,
            unit_price: price, // Ensure it's a number
          });

        // Log successful product update
        console.log("Product updated successfully");

        // Optionally, you could use a vendor_id if that's the intended update
        const vendor = await trx('vendors').where('vendor_name', vendor_name).first();
        if (!vendor) {
          console.log("Vendor not found in the database.");
          throw new Error("Vendor not found in the database.");
        }

        // Log vendor update
        console.log("Updating product_to_vendor with vendor_id:", vendor.vendor_id);
        await trx('product_to_vendor')
          .where('product_id', productId)
          .update({
            vendor_id: vendor.vendor_id, // Update using vendor_id instead of vendor_name
          });

        // Log successful vendor update
        console.log("Vendor data updated successfully");

        // Commit the transaction if both updates succeed
        await trx.commit();
        console.log("Transaction committed successfully");

        return { message: 'Product and vendor data updated successfully' };
      } catch (err) {
        // Rollback the transaction in case of any errors
        console.log("Error in transaction:", err.message);
        await trx.rollback();
        throw err; // Rethrow to propagate the error
      }
    });
  } catch (err) {
    // Handle any error from the transaction or the service
    console.error("Error updating product:", err.message);
    throw new Error('Failed to update product and vendor data: ' + err.message);
  }
};
