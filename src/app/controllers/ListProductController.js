const knex = require('../../database/connection');

class ListProductController {
  async index(req, res) {
    const user_id = req.userId;

    const searchedAllProducts = await knex('products')
      .select('id', 'user_id', 'category_id', 'file_id', 'name', 'description')
      .whereNot({ user_id });

    return res.status(200).json(searchedAllProducts);
  }

  async indexByCategory(req, res) {
    const { id: category_id } = req.params;
    const user_id = req.userId;

    const categoryExists = await knex('categories')
      .where({ id: category_id })
      .first();

    if (!categoryExists) {
      return res.status(400).json({ error: 'Category not found.' });
    }

    const searchedProductsByCategory = await knex('products')
      .select('id', 'user_id', 'category_id', 'file_id', 'name', 'description')
      .where({ category_id })
      .whereNot({ user_id });

    return res.status(200).json(searchedProductsByCategory);
  }
}

module.exports = new ListProductController();
