const Joi = require('joi');

const recordSchema = Joi.object({
  product_name: Joi.string().required(),
  category_name: Joi.string().required(),
  vendor_name: Joi.string().required(),
  quantity_in_stock: Joi.number().integer().min(0).required(),
  unit_price: Joi.number().positive().required(),
});

module.exports = recordSchema;
