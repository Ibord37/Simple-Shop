const LogoutRouter = require('express').Router();
const { RefreshToken } = require('../models');

LogoutRouter.post('/logout', async (req, res) => {
    const refreshToken = req.cookies.refresh_token;
    //console.log(refreshToken);

    if (refreshToken) {
        try {
            await RefreshToken.destroy({
                where: { refresh_token: refreshToken }
            });
        } catch (err) {
            console.error('Failed to revoke refresh token:', err);
        }
    }

    res.clearCookie('token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/refresh' });

    return res.status(200).json({ message: 'Logged out' });
});

module.exports = LogoutRouter;