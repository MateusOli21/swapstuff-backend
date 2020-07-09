exports.up = function (knex) {
  return knex.schema.createTable('exchange_offers', (table) => {
    table.increments('id').primary();
    table.integer('sender_id').notNullable().references('id').inTable('users');
    table
      .integer('receiver_id')
      .notNullable()
      .references('id')
      .inTable('users');
    table
      .integer('product_target_id')
      .notNullable()
      .references('id')
      .inTable('products');
    table.specificType('products_offer_id', 'INT[]').notNullable();

    table.boolean('exchanged').nullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('exchange_offers');
};
