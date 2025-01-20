

class User  {
  static get tableName() {
    return 'users';
  }

  static get idColumn() {
    return 'user_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [ 'password', 'email'],

      properties: {
        user_id: { type: 'integer' },
        first_name: { type: 'string', minLength: 1, maxLength: 255 },
        username: { type: 'string', minLength: 1, maxLength: 255 },
        password: { type: 'string', minLength: 6, maxLength: 255 },
        email: { type: 'string', format: 'email', maxLength: 255 },
        profile_pic: { type: ['string', 'null'], format: 'uri', maxLength: 2083 },
        thumbnail: { type: ['string', 'null'], format: 'uri', maxLength: 2083 },
        status: { type: 'integer', enum: [0, 1, 2, 99], default: 0 },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    };
  }

  static get relationMappings() {
    return {
     
    };
  }
}

module.exports = User;
