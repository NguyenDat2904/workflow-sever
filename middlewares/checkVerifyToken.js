const jwt = require('jsonwebtoken');
require('dotenv').config();

const checkVerifyToken = (req, res, next) => {
    const token = req.headers['verify-token'];
    if (!token) {
        return res.status(404).json({
            message: 'Token is incorrect',
        });
    }

    jwt.verify(token, process.env.SECRET_KEY_EMAIL, async (err, user) => {
        if (err) {
            console.log(err);
            return res.status(400).json({
                err,
            });
        } else {
            req.user = user;
            next();
        }
    });
};

module.exports = checkVerifyToken;
