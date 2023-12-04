const checkEmail = require('../helpers/email');
const UsersModal = require('../models/modelUser');
const token = require('../helpers/token.helpers');
require('dotenv').config();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Login = async (req, res) => {
    const { userName, passWord } = req.body;
    try {
        const userEmail = await checkEmail.checkUsers(userName);
        if (!userEmail) {
            return res.status(404).json({
                message: 'Email does not exist',
            });
        }
        //check  password
        const isPassword = await bcrypt.compare(passWord, userEmail.passWord);
        if (!isPassword) {
            return res.status(404).json({
                message: 'Wrong password',
            });
        }
        const refreshToken = token(userEmail, '720h');
        userEmail.refreshToken = refreshToken;
        await userEmail.save();
        const accessToken = token(userEmail, '24h');
        res.status(200).json({
            _id: userEmail._id,
            role: userEmail.role,
            name: userEmail.name,
            email: userEmail.email,
            refreshToken,
            accessToken,
        });
    } catch (error) {
        res.status(404).json({
            message: 'Can not call data',
            data: null,
        });
    }
};
//login google
//forgot
const Forgot = async (req, res) => {
    const { email } = req.body;
    const userEmail = await checkEmail.checkEmail(email);
    if (!userEmail) {
        return res.status(404).json({
            message: 'Email does not exist, please register',
        });
    }
    const smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'vanhungnvh1712004@gmail.com',
            pass: 'scxhxbjaclczltxk',
        },
    });
    const mailOptions = {
        from: 'vanhungnvh1712004@gmail.com', // sender address
        to: `${email}`, // list of receivers
        subject: 'Set your new Atlassian password', // Subject line
        text: 'Password retrieval', // plaintext body
        html: `
                <div style="width:50%;margin:0 auto">
                    <img style="width:60%;margin: 0 0 0 20%" src="https://ci4.googleusercontent.com/proxy/vk8LmR5a7FvUV3DH_cqWmOMtMIKcUeupy_3BD3GB5w4cHDMuILXjz0L1efFRY9R0us2Muy1A-X44AIezMJ38kngolPjP-L-yWJ6w-HCw0X1_BLo23XS_fY7iaIqEx6gz6WFfbLJJLxRh2h3Y=s0-d-e1-ft#https://id-mail-assets.atlassian.com/shared/id-summit/id-summit-email_logo_360x80_NEW.png" alt="" />
                    <hr style="margin:15px 0"/>
                    <img style="width:60%;margin: 0 0 0 20%" src="https://ci4.googleusercontent.com/proxy/c-ZnjN8qvtu8l_OEizK8mFLIVr9DHtfiLE5TAcrF6zyH4UEx7WsSsYP2ovwjQXXFUhGDD3uG8eszfrR_EKz3CE6Ty8n7mtKqtaPzIHIpFKdN6aGICYwszYV7nWbAV4Q8N0fMey3MUbwO=s0-d-e1-ft#https://id-mail-assets.atlassian.com/template/aid_signup_welcome_verify_adg/people.png" alt="" />
                    <p style="font-size:18px;font-weight:600;font-family: 'Helvetica Neue', Helvetica"> Hi ${userEmail.name}</p>
                    <p style="font-size:16px;font-family: 'Helvetica Neue', Helvetica">We've received a request to set a new password for this Atlassian account:</p>
                    <p style="font-size:16px;font-family: 'Helvetica Neue', Helvetica">${email}.</p>
                    <button style="cursor: pointer;background:#0052cc;padding:5px";border-radius:5px ><a style="font-size:16px;color:#fff;font-family: 'Helvetica Neue', Helvetica" href="">Set password</a></button>
                   <p style="font-size:16px;font-family: 'Helvetica Neue', Helvetica">If you didn't request this, you can safely ignore this email.</p>
                    <hr style="margin:15px 0"/>
                    <p style="text-align:center;font-size:14px;font-family: 'Helvetica Neue', Helvetica">This message was sent to you by Atlassian Cloud</p>
                    <img style="width:30%;margin: 0 0 0 35%" src="https://ci5.googleusercontent.com/proxy/zIOVA2ab3bb8vFu6rLdIa9bwEmhKYRnK4uizA8zEYuHEHS5KDGJE-NEVwrs7_NEhUxid-wHZqBG1Ic7djSh763B_pibY83IfcwX-OevYWB-YJrq-apGh90n__trodVg8iORj5gxA6JY=s0-d-e1-ft#https://id-mail-assets.atlassian.com/shared/id-summit/id-summit-logo-email-footer.png" alt="" />
                </div>
        
        `, // html body
    };
    smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
            console.log(error);
            return res.status(404).json({
                message: 'Error when sending email',
            });
        } else {
            console.log('Message sent: ' + response.response);
            return res.status(200).json({
                message: 'Email has been sent',
            });
        }
    });
};
// new passWord

const NewPassword = async (req, res) => {
    const { _id } = req.params;
    const { passWord } = req.body;
    //check user email
    try {
        const checkId = await UsersModal.findById(_id);
        console.log(checkId);
        if (!checkId) {
            return res.status(404).json({
                message: 'user not found',
            });
        }
        const salt = bcrypt.genSaltSync(10);
        const hashPassWord = bcrypt.hashSync(passWord, salt);
        checkId.passWord = hashPassWord;
        await checkId.save();
        console.log(checkId.passWord);
        res.status(200).json({
            message: 'Changed password successfully',
        });
    } catch (error) {
        res.status(404).json({
            message: 'Password change failed',
            data: null,
        });
    }
};
module.exports = { Login, Forgot, NewPassword };
