const { parentPort, workerData } = require('worker_threads');
const Joi = require('joi');


const recordSchema = Joi.object({
  product_name: Joi.string().required(),
  category_name: Joi.string()
    .valid(
      'Books & Stationery',
      'Electronics',
      'Furniture',
      'Clothing',
      'Food & Beverages',
      'Health & Beauty',
      'Sports & Outdoors',  
      'Toys & Games',
      'Office Supplies'
    )
    .required(),
  vendor_name: Joi.string()
    .valid('Zomato', 'Blinkit', 'Swiggy', 'Amazon', 'Flipkart')
    .insensitive()
    .required(),
  unit_price: Joi.number().positive().required(),
  quantity_in_stock: Joi.number().positive().required(),
});


const validRecords = [];
const invalidRecords = [];

workerData.forEach((record) => {
  const { error, value } = recordSchema.validate(record, { abortEarly: false });
  if (error) {
   
    const errors = error.details.map((detail) => detail.message);
    invalidRecords.push({ ...record, reason: errors });
  } else {
    validRecords.push(value);
  }
});

parentPort.postMessage({ validRecords, invalidRecords });
