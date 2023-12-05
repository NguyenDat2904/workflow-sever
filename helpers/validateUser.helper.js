const Joi = require('joi');

const userSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    userName: Joi.string().min(3).max(50).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: Joi.string().min(6).max(20).required(),
    phone: Joi.string(),
    address: Joi.string(),
    age: Joi.number().integer().min(3).max(100),
    img: Joi.string(),
    role: Joi.string(),
    gender: Joi.string(),
    desc: Joi.string(),
    refreshToken: Joi.string(),
    birthDate: Joi.string(),
});

module.exports = userSchema;
