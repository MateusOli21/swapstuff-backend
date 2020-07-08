const { Router } = require('express');

const routes = new Router();

const authMiddleware = require('./app/middlewares/auth');

const UserController = require('./app/controllers/UserController');
const SessionController = require('./app/controllers/SessionController');

routes.post('/', UserController.store);

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.put('/users/:id', UserController.update);

module.exports = routes;
