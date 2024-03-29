const jwt = require('jsonwebtoken');
require('dotenv').config();

const Token = (user, time, key) => {
    const payload = { _id: user.id, email: user.email, name: user.name };
    const options = {
        expiresIn: time,
    };
    return jwt.sign(payload, key === 'refreshToken' ? process.env.REFRESH_KEY : process.env.SECRET_KEY, options);
};
module.exports = Token;
