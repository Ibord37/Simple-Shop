const UserRouter = require('express').Router();

const CartController = require('../controllers/CartController');
const UserController = require('../controllers/UserController');
const TransactionController = require('../controllers/TransactionController');
const MailController = require('../controllers/MailController');

const Auth = require('../middlewares/auth');

// User Cart
UserRouter.get('/my-cart', Auth, CartController.Get);
UserRouter.post('/add-cart', Auth, CartController.Add);
UserRouter.delete('/cart-rm/:id', Auth, CartController.Delete);

// Transactions (for user)
UserRouter.get('/my-transactions', Auth, TransactionController.FindOne);
UserRouter.put('/transaction_finish/:transaction_id', Auth, TransactionController.Pay);

// Mails (for user)
UserRouter.get('/my-mails/:id', Auth, MailController.GetById);
UserRouter.get('/my-mails', Auth, MailController.GetUserMails);

// Extra Data
UserRouter.get('/get-extra-db', Auth, UserController.GetExtendedData);

module.exports = UserRouter;