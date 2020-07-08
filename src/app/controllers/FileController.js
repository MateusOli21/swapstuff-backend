const knex = require('../../database/connection');

class FileController {
  async store(req, res) {
    try {
      const { originalname: name, filename: path } = req.file;

      const fileExists = await knex('files').where({ name }).first();

      if (fileExists) {
        return res.status(400).json({ error: 'File already uploaded.' });
      }

      const trx = await knex.transaction();

      const persistedFile = await trx('files')
        .insert({ name, path })
        .returning('id');

      const id = persistedFile[0];

      const url = `${process.env.BASE_URL}/files/${path}`;

      if (req.query.product) {
        const product_id = parseInt(req.query.product);
        await trx('products').update({ file_id: id }).where({ id: product_id });
      } else {
        const user_id = req.userId;
        await trx('users').update({ file_id: id }).where({ id: user_id });
      }

      await trx.commit();

      return res.status(200).json({ id, name, path, url });
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }
}

module.exports = new FileController();
