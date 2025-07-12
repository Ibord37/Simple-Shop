const LoginRouter = require('express').Router();
const LoginController = require('../controllers/LoginController');

const Auth = require('../middlewares/auth');

LoginRouter.get('/auth', Auth, (req, res) => {
    return res.json({ user: req.user });
});

LoginRouter.post('/refresh', LoginController.HandleRefresh);
LoginRouter.post('/login', LoginController.VerifyLogin);
LoginRouter.post('/register', LoginController.Register);

module.exports = LoginRouter;