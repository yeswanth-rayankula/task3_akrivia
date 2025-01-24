const Joi = require('joi');

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  offset: Joi.number().integer().min(1).default(5),
  searchText: Joi.string().optional().min(0),
  
});


const productSchema = Joi.object({
  product_name:   Joi.string().optional(),
  category_name: Joi.string().optional(),
  vendor_name: Joi.string().optional(),
  quantity_in_stock: Joi.number().integer().min(0).required(),
  unit_price: Joi.number().min(0).required(),
  product_image: Joi.string().uri().optional(),
  status: Joi.number().required(),
});




module.exports = { paginationSchema, productSchema};
