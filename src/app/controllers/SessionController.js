const knex = require('../../database/connection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Yup = require('yup');

const authConfig = require('../../config/auth');

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    try {
      const { email, password } = req.body;

      const userExists = await knex('users').where({ email }).first();
      if (!userExists) {
        return res.status(400).json({ error: 'User not found.' });
      }

      const password_hash = userExists.password;
      if (!(await bcrypt.compare(password, password_hash))) {
        return res.status(400).json({ error: 'Password does not match.' });
      }

      const { id, username } = userExists;

      return res.status(200).json({
        user: {
          id,
          username,
          email,
        },
        token: jwt.sign({ id }, authConfig.secret, {
          expiresIn: authConfig.expiresIn,
        }),
      });
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }
}

module.exports = new SessionController();
