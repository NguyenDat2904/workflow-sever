const jwt = require('jsonwebtoken');
require('dotenv').config();

const Token = (user, time) => {
    const payload = { _id: user.id, role: user.role };
    const options = {
        expiresIn: time,
    };
    return jwt.sign(payload, process.env.SECRET_KEY, options);
};
module.exports = Token;
