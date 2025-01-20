const { Model } = require('objection');

class Product extends Model {
  static get tableName() {
    return 'products';
  }

  static get idColumn() {
    return 'product_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['product_name', 'quantity_in_stock', 'unit_price'],

      properties: {
        product_id: { type: 'integer' },
        product_name: { type: 'string', minLength: 1, maxLength: 255 },
        category_id: { type: ['integer', 'null'] },
        quantity_in_stock: { type: 'integer', minimum: 0 },
        unit_price: { type: 'number', minimum: 0 },
        product_image: { type: ['string', 'null'], maxLength: 255 },
        status: { type: 'integer', enum: [0, 1, 2, 99], default: 0 },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    };
  }
}

module.exports = Product;
