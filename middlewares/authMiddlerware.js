const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddlerware = (req, res, next) => {
    const accessToken = req.headers['accessToken'];
    try {
        if (!accessToken) {
            res.status(404).json({
                message: 'Not available accessToken',
                data: null,
            });
        }
        jwt.verify(accessToken, process.env.SECRET_KEY);
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(404).json({
                message: 'Token is expired',
            });
        } else {
            res.status(500).json({
                error: error.message,
                stack: error.stack,
            });
        }
    }
};

module.exports = authMiddlerware;
