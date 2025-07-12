const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

function Auth(req, res, next) {
    const token = req.cookies.token;

    if (!token)
        return res.status(403).json({ message: "Unauthorized." });

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        console.log("JWT Error:", err);
        return res.status(403).json({ message: "Unauthorized." });
    }
}

module.exports = Auth;