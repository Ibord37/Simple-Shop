const PanelRouter = require('express').Router();

const LogController = require('../controllers/LogController');
const MailController = require('../controllers/MailController');
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

// Transaction (For admin or server-side handler)
PanelRouter.get('/transactions', Auth, TransactionController.Get);
PanelRouter.post('/transactions_add', Auth, TransactionController.Add);

// Logs
PanelRouter.get('/logs', Auth, LogController.Get);

// Mails (for admin)
PanelRouter.post('/send-mail', Auth, MailController.SendToUser);
PanelRouter.post('/send-broadcast', Auth, MailController.SendBroadcast);

module.exports = PanelRouter;