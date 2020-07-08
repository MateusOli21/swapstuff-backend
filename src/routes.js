const { Router } = require('express');

const routes = new Router();

routes.get('/', (req, res) => res.status(200).json({ message: 'ok' }));

module.exports = routes;
