exports.up = function (knex) {
  return knex.schema.createTable('products', (table) => {
    table.increments('id').primary();
    table.integer('user_id').notNullable().references('id').inTable('users');
    table
      .integer('category_id')
      .notNullable()
      .references('id')
      .inTable('categories');
    table.integer('file_id').nullable().references('id').inTable('files');
    table.string('name').notNullable();
    table.string('description').nullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('products');
};
