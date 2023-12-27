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
        jwt.verify(authHeader, process.env.SECRET_KEY);
        next();
    } catch (error) {
        return res.status(404).json({
            message:"Token expired",
        })
    }
};

module.exports = authMiddlerware;
