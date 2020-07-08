const knex = require('../../database/connection');
const Yup = require('yup');

class ProductController {
  async index(req, res) {
    try {
      const user_id = req.userId;
      const listedProducts = await knex('products')
        .select('id', 'category_id', 'file_id', 'name', 'description')
        .where({ user_id });

      res.status(200).json(listedProducts);
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }

  async indexByCategory(req, res) {
    try {
      const { id: category_id } = req.params;

      const categoryExists = await knex('categories')
        .where({ id: category_id })
        .first();

      if (!categoryExists) {
        return res.status(400).json({ error: 'Category does not exist.' });
      }

      const user_id = req.userId;

      const categoryProducts = await knex('products')
        .select('id', 'category_id', 'file_id', 'name', 'description')
        .where({ user_id, category_id });

      res.status(200).json(categoryProducts);
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      category_id: Yup.number().required(),
      file_id: Yup.number(),
      name: Yup.string().required(),
      description: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    try {
      const user_id = req.userId;
      const product = { user_id, ...req.body };

      const persistedProduct = await knex('products')
        .returning(['user_id', 'name'])
        .insert(product);

      res.status(200).json(persistedProduct);
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      category_id: Yup.number(),
      file_id: Yup.number(),
      name: Yup.string(),
      description: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    try {
      const { id } = req.params;

      const productExists = await knex('products').where({ id }).first();
      if (!productExists) {
        return res.status(400).json({ error: 'Product not found.' });
      }

      const product = { ...req.body };

      const updatedProduct = await knex('products')
        .update(product)
        .where({ id })
        .returning(['id', 'name']);

      res.status(200).json(updatedProduct);
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }
  async delete(req, res) {
    try {
      const { id } = req.params;

      const productExists = await knex('products').where({ id }).first();
      if (!productExists) {
        return res.status(400).json({ error: 'Product not found.' });
      }

      await knex('products').where({ id }).del();
      res.status(204).json();
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }
}

module.exports = new ProductController();
