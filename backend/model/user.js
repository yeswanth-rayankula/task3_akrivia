const { Model } = require('objection');

class User extends Model {
  static get tableName() {
    return 'users';
  }

  static get idColumn() {
    return 'user_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['first_name', 'username', 'password', 'email', 'role'],
      properties: {
        user_id: { type: 'integer' },
        first_name: { type: 'string', maxLength: 255 },
        username: { type: 'string', maxLength: 255 },
        password: { type: 'string', maxLength: 255 },
        email: { type: 'string', format: 'email', maxLength: 255 },
        profile_pic: { type: ['string', 'null'], maxLength: 1000 },
        thumbnail: { type: ['string', 'null'], maxLength: 255 },
        status: { type: 'string', enum: ['0', '1', '2', '99'], default: '0' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        role: { type: 'string', enum: ['Admin', 'Manager', 'User'], default: 'User' },
        location_id: { type: ['integer', 'null'] },
      },
    };
  }
}
module.exports = User;