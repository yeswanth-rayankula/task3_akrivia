const { Model } = require('objection');

class Department extends Model {
  static get tableName() {
    return 'departments';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', maxLength: 255 },
        description: { type: ['string', 'null'] },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    };
  }

  static get relationMappings() {
    const Employee = require('./Employee');
    return {
      employees: {
        relation: Model.HasManyRelation,
        modelClass: Employee,
        join: {
          from: 'departments.id',
          to: 'employees.department_id',
        },
      },
    };
  }
}

module.exports = Department;
