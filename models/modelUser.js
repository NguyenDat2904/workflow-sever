const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersModal = new Schema(
    {
        name: { type: String },
        email: { type: String, lowercase: true, required: true, unique: true },
        phone: { type: String },
        userName: { type: String },
        passWord: { type: String, require: true },
        role: { type: String },
        img: { type: String },
        refreshToken: { type: String },
        gender: { type: String },
        birthDay: { type: Date },
        imgCover: { type: String },
        desc: { type: String },
        jopTitle: { type: String },
        department: { type: String },
        organization: { type: String },
        location: { type: String },
        backgroundProfile: { type: String },
        textInBackgroundProfile: { type: String },
    },

    { timestamps: true },
    { collection: 'users' },
);

module.exports = mongoose.model('users', UsersModal);
