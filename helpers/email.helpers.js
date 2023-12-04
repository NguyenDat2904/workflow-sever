const UsersModel = require('../models/modelUser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const checkEmail = async (email) => {
    if (email) {
        const users = await UsersModel.findOne({ email: email });
        return users;
    } else {
        return null;
    }
};

const checkUsers = async (userName) => {
    if (userName) {
        const users = await UsersModel.findOne({ userName: userName });
        return users;
    } else {
        return null;
    }
};

// Cấu hình Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.PASSWORD_EMAIL,
    },
});
module.exports = { checkEmail, checkUsers, transporter };
