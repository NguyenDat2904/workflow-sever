const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddlerware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    try {
        if (!authHeader) {
            return res.status(400).json({
                message: 'Token is incorrect',
            });
        }
        jwt.verify(authHeader, process.env.SECRET_KEY, (err) => {
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
                 next();
            }
        });
       
    } catch (error) {
        return res.status(404).json({
            message: error,
        });
    }
};

module.exports = authMiddlerware;
