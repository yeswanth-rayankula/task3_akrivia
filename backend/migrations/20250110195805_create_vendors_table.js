exports.up = function(knex) {
  return knex.schema.createTable('vendors', function(table) {
    table.increments('vendor_id').primary();  // Primary Key
    table.string('vendor_name').notNullable();
    table.string('contact_name').nullable();
    table.string('address').nullable();
    table.string('city').nullable();
    table.string('postal_code').nullable();
    table.string('country').nullable();
    table.string('phone').nullable();
    table.enum('status', ['0', '1', '2', '99']).defaultTo('0');  // Default status is 'created'
    table.timestamps(true, true);  // Created and updated timestamps
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('vendors');
};
