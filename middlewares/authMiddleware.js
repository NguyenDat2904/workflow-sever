const jwt = require('jsonwebtoken');
const UsersModal = require('../models/modelUser');
const Token = require('../helpers/tokenHelpers');
require('dotenv').config();

const authMiddlerware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const refreshToken = req.headers['refresh_token'];
    if (!authHeader) {
        return res.status(404).json({
            message: 'Token is incorrect',
        });
    }
    jwt.verify(authHeader, process.env.SECRET_KEY, async (err, user) => {
        if (err) {
            if ((err.name = 'TokenExpiredError')) {
                try {
                    const user = await UsersModal.findOne({ refreshToken: refreshToken });
                    console.log(user);
                    if (user) {
                        const accessToken = Token(user, '24h');
                        return res.status(200).json({
                            accessToken: accessToken,
                        });
                    } else {
                        return res.status(400).json({ error: 'Invalid refresh token' });
                    }
                } catch (error) {
                    return res.status(400).json({ error: error });
                }
            } else {
                res.status(400).json({ error: 'Invalid token' });
                return;
            }
        } else {
            req.user = user;
            next();
        }
    });
};

module.exports = authMiddlerware;
