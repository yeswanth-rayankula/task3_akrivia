const knex = require('knex');
const knexConfig = require('../../../knexfile');
const logger = require('../../../logger');

const db = knex(knexConfig.development);

exports.getAllProducts = async (page = 1, offset = 5, searchText = '', selectedFilters = {}) => {
  try {
    const limit = offset;
    const offsetValue = (page - 1) * offset;

    let query = db('products')
      .join('categories', 'products.category_id', '=', 'categories.category_id')
      .join('product_to_vendor', 'products.product_id', '=', 'product_to_vendor.product_id')
      .join('vendors', 'product_to_vendor.vendor_id', '=', 'vendors.vendor_id')
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
      .where('products.status', '1')
      .andWhere('product_to_vendor.status', '1');

    if (searchText) {
      query = query.andWhere(function () {
        if (selectedFilters.category_name) {
          this.orWhere('categories.category_name', 'like', `%${searchText}%`);
        }
        if (selectedFilters.vendor_name) {
          this.orWhere('vendors.vendor_name', 'like', `%${searchText}%`);
        }
        if (selectedFilters.product_name) {
          this.orWhere('products.product_name', 'like', `%${searchText}%`);
        }
      });
    }

    const products = await query.limit(limit).offset(offsetValue);

    let countQuery = db('products')
      .join('categories', 'products.category_id', '=', 'categories.category_id')
      .join('product_to_vendor', 'products.product_id', '=', 'product_to_vendor.product_id')
      .join('vendors', 'product_to_vendor.vendor_id', '=', 'vendors.vendor_id')
      .where('products.status', '1')
      .andWhere('product_to_vendor.status', '1');

    if (searchText) {
      countQuery = countQuery.andWhere(function () {
        if (selectedFilters.category_name) {
          this.orWhere('categories.category_name', 'like', `%${searchText}%`);
        }
        if (selectedFilters.vendor_name) {
          this.orWhere('vendors.vendor_name', 'like', `%${searchText}%`);
        }
        if (selectedFilters.product_name) {
          this.orWhere('products.product_name', 'like', `%${searchText}%`);
        }
      });
    }

    const totalProducts = await countQuery.count({ total: 'products.product_id' }).first();

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
  const { product_name, status, category_name, vendor_name, quantity_in_stock, unit_price } = updatedProduct;
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
   
    console.log(items);
    const insertPromises = items.map((item) =>
      db('Cart').insert({
        product_name: item.product_name,
        category_name: item.category_name,
        vendor_name: item.vendor_name,
        quantity_in_stock: item.quantity_in_stock, 
        unit_price: item.unit_price,
        product_id:item.product_id
      })
    );

    await Promise.all(insertPromises); 
    return { success: true, message: 'Items added to the cart successfully' };
  } catch (error) {
    console.error('Error in addItemsToCart service:', error.message);
    throw new Error('Failed to add items to the cart');
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
      console.log("dg");
      const cartItem = await trx('Cart')
        .where({ Cart_ID: cartId, product_id: productId })
        .first();

   

     
      await trx('Cart')
        .where({ Cart_ID: cartId, product_id: productId })
        .increment('quantity_in_stock', 1);

     
      await trx('Products')
        .where({ product_id: productId })
        .decrement('quantity_in_stock', 1);
    });

    return { success: true, message: 'Cart quantity decreased and stock updated' };
  } catch (error) {
    console.error('Error in cart service:', error.message);
    throw new Error('Failed to update cart and stock');
  }
};


exports.removeItem = async (cartId) => {
  try {
    const result = await db('cart')
      .where({ Cart_ID: cartId })
      .del();

    return result > 0; // Returns true if rows were affected
  } catch (error) {
    logger.error(`Error removing item from cart: ${error.message}`);
    throw new Error('Database operation failed.');
  }
};
