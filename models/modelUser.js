const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersModel = new Schema(
    {
        email: { type: String, lowercase: true, required: true, unique: true },
        name: { type: String },
        phone: { type: String },
        userName: { type: String },
        passWord: { type: String, require: true },
        role: { type: String },
        img: { type: String },
        refreshToken: { type: String },
        gender: { type: String },
        birthDate: { type: Date },
        desc: { type: String },
    },

    { timestamps: true },
    { collection: 'users' },
);

module.exports = mongoose.model('users', UsersModel);
