const knex = require('knex');
const knexConfig = require('../../../knexfile');
const logger = require('../../../logger');
const { productSchema } = require('./pagination.utils');

const db = knex(knexConfig.development);

exports.getAllProducts = async (page = 1, offset = 5, searchText = '', selectedFilters = {}) => {
  try {
    const limit = offset;
    const offsetValue = (page - 1) * offset;

    const baseQuery = db('products')
      .join('categories', 'products.category_id', '=', 'categories.category_id')
      .join('product_to_vendor', 'products.product_id', '=', 'product_to_vendor.product_id')
      .join('vendors', 'product_to_vendor.vendor_id', '=', 'vendors.vendor_id')
      .where('products.status', '1')
      .andWhere('product_to_vendor.status', '1');

    const applyFilters = (query) => {
      if (searchText) {
        query.andWhere(function () {
          if (selectedFilters.category_name) this.orWhere('categories.category_name', 'like', `%${searchText}%`);
          if (selectedFilters.vendor_name) this.orWhere('vendors.vendor_name', 'like', `%${searchText}%`);
          if (selectedFilters.product_name) this.orWhere('products.product_name', 'like', `%${searchText}%`);
        });
      }
    };


    const productsQuery = baseQuery.clone()
      .select(
        'products.product_image',
        'products.product_id',
        'products.product_name',
        'categories.category_name',
        'products.quantity_in_stock',
        'products.unit_price',
        'products.status',
        'vendors.vendor_name'
      )
      .limit(limit)
      .offset(offsetValue);

    applyFilters(productsQuery);
    const products = await productsQuery;

 
    const countQuery = baseQuery.clone().count({ total: 'products.product_id' }).first();
    applyFilters(countQuery);
    const totalProducts = await countQuery;

    logger.info(`Fetched ${products.length} products for page ${page}, offset ${offset}`);
    return {
      products,
      totalProducts: parseInt(totalProducts.total, 10),
    };
  } catch (error) {
    logger.error('Error fetching products from the database:', error.message);
    throw new Error('Error fetching products from the database');
  }
};


exports.deleteProduct = (productId) => {
  return new Promise((resolve, reject) => {
    db.transaction(async (trx) => {
      try {
        await trx('product_to_vendor').where('product_id', productId).del();
        await trx('products').where('product_id', productId).del();
        await trx.commit();
        logger.info(`Product with ID ${productId} deleted successfully`);
        resolve();
      } catch (error) {
        await trx.rollback();
        logger.error(`Failed to delete product with ID ${productId}: ${error.message}`);
        reject({ message: 'Failed to delete product and related records', error });
      }
    });
  });
};

exports.editProduct = async (productId, updatedProduct) => {
  console.log(updatedProduct);
  const { product_name, status, category_name, vendor_name, quantity_in_stock, unit_price ,product_image} = updatedProduct;
  const price = parseFloat(unit_price);

  try {
    const productExists = await db('products').where('product_id', productId).first();
    if (!productExists) {
      logger.warn(`Product with ID ${productId} not found in the database.`);
      throw new Error("Product not found in the database.");
    }

    const category = await db('categories').where('category_name', category_name).first();
    if (!category) {
      logger.warn(`Category ${category_name} not found in the database.`);
      throw new Error("Category not found in the database.");
    }

    const category_id = category.category_id;

    return await db.transaction(async (trx) => {
      try {
        await trx('products')
          .where('product_id', productId)
          .update({
            product_name,
            status,
            category_id,
            quantity_in_stock,
            unit_price: price,
            product_image:product_image
          });

        const vendor = await trx('vendors').where('vendor_name', vendor_name).first();
        if (!vendor) {
          logger.warn(`Vendor ${vendor_name} not found in the database.`);
          throw new Error("Vendor not found in the database.");
        }

        await trx('product_to_vendor')
          .where('product_id', productId)
          .update({ vendor_id: vendor.vendor_id });

        await trx.commit();
        logger.info(`Product with ID ${productId} updated successfully.`);
        return { message: 'Product and vendor data updated successfully' };
      } catch (err) {
        await trx.rollback();
        logger.error(`Error in transaction while updating product with ID ${productId}: ${err.message}`);
        throw err;
      }
    });
  } catch (err) {
    logger.error(`Error updating product with ID ${productId}: ${err.message}`);
    throw new Error('Failed to update product and vendor data: ' + err.message);
  }
};

exports.getCategories = async () => {
  try {
    console.log("fgh");
    const categories = await db('categories')
      .select('category_name')
      .where('status', '1');
    logger.info('Fetched categories successfully');
    return categories;
  } catch (error) {
    logger.error('Error fetching categories:', error.message);
    throw new Error('Failed to fetch categories');
  }
};

exports.getVendors = async () => {
  try {
    const vendors = await db('vendors')
      .select('vendor_name')
      .where('status', '1');
    logger.info('Fetched vendors successfully');
    return vendors;
  } catch (error) {
    logger.error('Error fetching vendors:', error.message);
    throw new Error('Failed to fetch vendors');
  }
};

exports.addProduct = async (productData) => {
  console.log(productData);
  const { product_name, category_name, vendor_name, quantity_in_stock, unit_price, product_image, status } = productData;
  const trx = await db.transaction();

  try {
    const vendor = await trx('vendors').where('vendor_name', vendor_name).first();
    if (!vendor) {
      logger.warn(`Vendor ${vendor_name} not found`);
      throw new Error(`Vendor with name "${vendor_name}" not found`);
    }

    const category = await trx('categories').where('category_name', category_name).first();
    if (!category) {
      logger.warn(`Category ${category_name} not found`);
      throw new Error(`Category with name "${category_name}" not found`);
    }

    const [insertedProductId] = await trx('products').insert({
      product_name,
      category_id: category.category_id,
      quantity_in_stock,
      unit_price,
      product_image,
      status: '1',
    });

    const newProduct = await trx('products').where('product_id', insertedProductId).first();
    if (!newProduct) {
      logger.error('Failed to retrieve inserted product details');
      throw new Error('Failed to retrieve inserted product details');
    }

    await trx('product_to_vendor').insert({
      product_id: newProduct.product_id,
      vendor_id: vendor.vendor_id,
      status: '1',
    });

    await trx.commit();
    logger.info(`New product added: ${product_name}`);
    return {
      product: newProduct,
      product_to_vendor: {
        product_id: newProduct.product_id,
        vendor_id: vendor.vendor_id,
        status: 1,
      },
    };
  } catch (error) {
    await trx.rollback();
    logger.error('Error adding product and vendor association:', error.message);
    throw new Error('Failed to add product and associate with vendor');
  }
};

exports.addItemsToCart = async (items) => {
  try {
    await db.transaction(async (trx) => {
      const insertPromises = items.map(async (item) => {
        
        
        await trx('Cart').insert({
          product_name: item.product_name,
          category_name: item.category_name,
          vendor_name: item.vendor_name,
          quantity_in_stock: item.quantity_in_stock, 
          unit_price: item.unit_price,
          product_id: item.product_id
        });

        await trx('products')
          .where({ product_id: item.product_id })
          .decrement('quantity_in_stock', item.quantity_in_stock);
      });

      // Wait for all insertions and updates to complete
      await Promise.all(insertPromises);
    });

    console.log('Items inserted into Cart and Products updated successfully.');
  } catch (error) {
    console.error(`Error inserting items into Cart: ${error.message}`);
    throw new Error('Database operation failed.');
  }
};
exports.getCartItems = async () => {
  try {
    const cartItems = await db('Cart').select(
      'Cart_ID',
      'product_name',
      'category_name',
      'vendor_name',
      'quantity_in_stock',
      'unit_price',
       'product_id'
    );
    return cartItems;
  } catch (error) {
    console.error('Error fetching cart items:', error.message);
    throw new Error('Failed to fetch cart items');
  }
};



exports.decreaseCartQuantityAndUpdateStock = async (cartId, productId) => {
  try {
    await db.transaction(async (trx) => {
      console.log("dg");
      const cartItem = await trx('Cart')
        .where({ Cart_ID: cartId, product_id: productId })
        .first();

      if (!cartItem || cartItem.quantity_in_stock <= 0) {
        throw new Error('Invalid cart item or quantity already at 0');
      }

     
      await trx('Cart')
        .where({ Cart_ID: cartId, product_id: productId })
        .decrement('quantity_in_stock', 1);

     
      await trx('Products')
        .where({ product_id: productId })
        .increment('quantity_in_stock', 1);
    });

    return { success: true, message: 'Cart quantity decreased and stock updated' };
  } catch (error) {
    console.error('Error in cart service:', error.message);
    throw new Error('Failed to update cart and stock');
  }
};



exports.increaseCartQuantityAndUpdateStock = async (cartId, productId) => {
  try {
    await db.transaction(async (trx) => {
     
      const product = await trx('Products')
        .where({ product_id: productId })
        .select('quantity_in_stock')
        .first();
    
   
      if (!product || product.quantity_in_stock <= 0) {
        throw new Error("Insufficient stock in Products table.");
      }
    

      const cartItem = await trx('Cart')
        .where({ Cart_ID: cartId, product_id: productId })
        .first();
    
      if (!cartItem) {
        throw new Error("Cart item not found.");
      }
    
    
      await trx('Cart')
        .where({ Cart_ID: cartId, product_id: productId })
        .increment('quantity_in_stock', 1);
    
   
      await trx('Products')
        .where({ product_id: productId })
        .decrement('quantity_in_stock', 1);
    
      console.log("Transaction completed successfully.");
    });
    

    return { success: true, message: 'Cart quantity decreased and stock updated' };
  } catch (error) {
    console.error('Error in cart service:', error.message);
    throw new Error('Failed to update cart and stock');
  }
};


exports.removeItem = async (Cart_ID, product_id) => {
  try {
    console.log(Cart_ID,product_id);
    // Start a transaction
    await db.transaction(async (trx) => {
      
      const cartItem = await trx('cart')
        .select('quantity_in_stock')
        .where({ Cart_ID, product_id })
        .first();

      if (!cartItem) {
        throw new Error('Cart item not found.');
      }

      const { quantity_in_stock } = cartItem;

      // Update the quantity in the product table
      await trx('products')
        .where({ product_id })
        .increment('quantity_in_stock', quantity_in_stock);

      // Delete the item from the cart
      const result = await trx('cart')
        .where({ Cart_ID, product_id })
        .del();

      if (result <= 0) {
        throw new Error('Failed to delete cart item.');
      }
    });

    return true;
  } catch (error) {
    logger.error(`Error removing item from cart: ${error.message}`);
    throw new Error('Database operation failed.');
  }
};

