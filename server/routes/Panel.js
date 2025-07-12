const PanelRouter = require('express').Router();

const LogController = require('../controllers/LogController');
const LoginController = require('../controllers/LoginController');
const PanelController = require('../controllers/PanelController');
const StockController = require('../controllers/StockController');
const TransactionController = require('../controllers/TransactionController');

const Auth = require('../middlewares/auth');

// Other panel functionalities
PanelRouter.get('/dashboard', Auth, PanelController.GetDashboard);

// Stock
PanelRouter.get('/stocks', Auth, StockController.Get);
PanelRouter.get('/stock/:id', Auth, StockController.GetById);
PanelRouter.post('/stock_add', Auth, StockController.Add);
PanelRouter.put('/stock_update/:id', Auth, StockController.Update);
PanelRouter.delete('/stock_rm/:id', Auth, StockController.Delete);

// Transaction
PanelRouter.get('/transactions', Auth, TransactionController.Get);
PanelRouter.get('/my-transactions', Auth, TransactionController.FindOne);
PanelRouter.put('/transaction_finish/:transaction_id', Auth, TransactionController.Pay);
PanelRouter.post('/transactions_add', Auth, TransactionController.Add);

// Logs
PanelRouter.get('/logs', Auth, LogController.Get);

module.exports = PanelRouter;