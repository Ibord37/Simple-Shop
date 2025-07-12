const UserRouter = require('express').Router();

const CartController = require('../controllers/CartController');
const UserController = require('../controllers/UserController');

const Auth = require('../middlewares/auth');

// User Cart
UserRouter.get('/my-cart', Auth, CartController.Get);
UserRouter.post('/add-cart', Auth, CartController.Add);
UserRouter.delete('/cart-rm/:id', Auth, CartController.Delete);

// Extra Data
UserRouter.get('/get-extra-db', Auth, UserController.GetExtendedData);

module.exports = UserRouter;