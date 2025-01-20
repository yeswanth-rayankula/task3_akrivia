

exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('user_id').primary();  
    table.string('first_name').notNullable();  
    table.string('username').notNullable().unique(); 
    table.string('password').notNullable();  
    table.string('email').notNullable().unique();  // Unique email
    table.binary('profile_pic').nullable();  // Profile picture URL
    table.string('thumbnail');  // Thumbnail image URL
    table.enum('status', ['0', '1', '2', '99']).defaultTo('0'); 
    table.timestamps(true, true);  
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('users');
};
