const { Router } = require('express');
const multer = require('multer');

const multerConfig = require('./config/multer');

const routes = new Router();
const upload = multer(multerConfig);

const authMiddleware = require('./app/middlewares/auth');

const UserController = require('./app/controllers/UserController');
const SessionController = require('./app/controllers/SessionController');
const ProductController = require('./app/controllers/ProductController');
const FileController = require('./app/controllers/FileController');

routes.post('/users', UserController.store);

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.post('/files', upload.single('file'), FileController.store);

routes.get('/products', ProductController.index);
routes.get('/products/:id', ProductController.indexByCategory);
routes.post('/products', ProductController.store);
routes.put('/products/:id', ProductController.update);
routes.delete('/products/:id', ProductController.delete);

module.exports = routes;
