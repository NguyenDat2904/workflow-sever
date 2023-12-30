const jwt = require('jsonwebtoken');
require('dotenv').config();
const RefreshToken = (req, res, next) => {
    const refreshToken = req.headers['refresh_token'];
    try {
        if (!refreshToken) {
            return res.status(404).json({
                message: 'RefeshToken is incorrect',
            });
        }
        jwt.verify(refreshToken, process.env.REFRESH_KEY,(err,user) => {
            if (err) {
                if ((err.name = 'TokenExpiredError')) {
                    return res.status(401).json({
                        message: 'Token expired',
                    });
                }
                else{
                    res.status(400).json({ error: 'Invalid token' });
                    return;
                }
            }
            else{
                req.user = user;
                 next();
            }
        });
    } catch (error) {
        res.status(404).json({
            message: "refresh token expired",
        });
    }
};
module.exports = RefreshToken;
