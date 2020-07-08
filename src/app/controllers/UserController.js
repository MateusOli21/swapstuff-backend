const knex = require('../../database/connection');
const bcrypt = require('bcryptjs');
const Yup = require('yup');

class UserController {
  async store(req, res) {
    const schma = Yup.object().shape({
      username: Yup.string().required(),
      email: Yup.string().required(),
      password: Yup.string().required().min(6),
    });

    if (!(await schma.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    try {
      const { username, email, password: passwordString } = req.body;

      const userExists = await knex('users').where({ email }).first();

      if (userExists) {
        return res.status(400).json({ error: 'User already exist.' });
      }

      const password = await bcrypt.hash(passwordString, 12);

      const user = { username, email, password };

      const insertedUser = await knex('users')
        .returning(['id', 'username', 'email'])
        .insert(user);

      return res.status(201).json(insertedUser);
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }

  async update(req, res) {
    res.status(200).json({ message: 'ok' });
  }
}

module.exports = new UserController();
