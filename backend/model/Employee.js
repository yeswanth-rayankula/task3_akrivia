const { Model } = require('objection');

class Employee extends Model {
  static get tableName() {
    return 'employees';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['first_name', 'last_name', 'email', 'department_id'],
      properties: {
        id: { type: 'integer' },
        first_name: { type: 'string', maxLength: 255 },
        last_name: { type: 'string', maxLength: 255 },
        email: { type: 'string', format: 'email', maxLength: 255 },
        department_id: { type: 'integer' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    };
  }

  static get relationMappings() {
    const Department = require('./Department');
    return {
      department: {
        relation: Model.BelongsToOneRelation,
        modelClass: Department,
        join: {
          from: 'employees.department_id',
          to: 'departments.id',
        },
      },
    };
  }
}

module.exports = Employee;
