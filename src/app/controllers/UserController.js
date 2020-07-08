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
    const schema = Yup.object().shape({
      username: Yup.string(),
      email: Yup.string(),
      oldPassword: Yup.string().min(6),
      newPassword: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('newPassword', (newPassword, field) =>
        newPassword ? field.required().oneOf([Yup.ref('newPassword')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    try {
      const id = req.userId;

      const userExists = await knex('users').where({ id }).first();
      if (!userExists) {
        return res.status(400).json({ error: 'User not find.' });
      }

      if (req.body.oldPassword) {
        const old_password_hash = userExists.password;

        const { oldPassword, newPassword, username, email } = req.body;

        const passwordIsValid = await bcrypt.compare(
          oldPassword,
          old_password_hash
        );

        if (!passwordIsValid) {
          return res
            .status(400)
            .json({ error: 'Current password does not match.' });
        }

        const password = await bcrypt.hash(newPassword, 12);

        const updatedUser = await knex('users')
          .update({ username, email, password })
          .where({ id })
          .returning(['id', 'username', 'email']);

        return res.status(200).json(updatedUser);
      }

      const user = req.body;

      const updatedUser = await knex('users')
        .update(user)
        .where({ id })
        .returning(['id', 'username', 'email']);

      return res.status(200).json(updatedUser);
    } catch (err) {
      return res.status(500).json({ error: err });
    }

    res.status(200).json({ message: 'ok' });
  }
}

module.exports = new UserController();
