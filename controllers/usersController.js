const checkEmail = require('../helpers/email');
const UsersModal = require('../models/user');
const token = require('../helpers/tokenHelpers');
const { transporter } = require('../helpers/email');
const jwt = require('jsonwebtoken');
const { google } = require('googleapis');
require('dotenv').config();
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const login = async (req, res) => {
    try {
        const { userName, passWord } = req.body;
        const userEmail = await checkEmail.checkUsers(userName);
        if (!userEmail) {
            return res.status(404).json({
                message: 'Email does not exist',
            });
        }
        //check  password
        const isPassword = await bcrypt.compare(passWord, userEmail.passWord);
        console.log(userEmail.passWord);
        if (!isPassword) {
            return res.status(404).json({
                message: 'Wrong password',
            });
        }
        const refreshToken = token(userEmail, '720h','refreshToken');
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
        console.log(error);
        res.status(404).json({
            message: 'Can not call data',
            data: null,
        });
    }
};
//login google
const loginGoogle = async (req, res) => {
    try {
        const tokenGoogle = req.headers['tokengoogle'];
        if (!tokenGoogle) {
            return res.status(404).json({
                message: 'is not token google',
            });
        }
        const oauth2Client = new google.auth.OAuth2({
            clientId: '927156751612-1uvnfve8d0oo0l9ekmoeenf09ji6llub.apps.googleusercontent.com',
        });
        oauth2Client.setCredentials({ access_token: tokenGoogle });
        const oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2',
        });
        const info = await oauth2.userinfo.get();
        const payload = info.data;
        if (!payload) {
            return res.status(404).json({
                message: 'something went wrong',
            });
        }
        const check = await checkEmail.checkEmail(payload.email);
        if (!check) {
            const newUser = new UsersModal({
                name: payload.name,
                email: payload.email,
                phone: '',
                userName: '',
                passWord: '',
                role: 'normal',
                img: payload.picture,
                refreshToken: '',
                gender: '',
                birthDay: null,
                desc: '',
                imgCover: '',
                jopTitle: '',
                department: '',
                organization: '',
                location: '',
                backgroundProfile: '',
                textInBackgroundProfile: '',
            });
            const refreshToken = token(newUser, '720h');
            newUser.refreshToken = refreshToken;
            await newUser.save();
            const accessToken = token(newUser, '24h');
            return res.status(200).json({
                _id: newUser._id,
                role: newUser.role,
                name: newUser.name,
                email: newUser.email,
                refreshToken,
                accessToken,
            });
        } else {
            const refreshToken = token(check, '720h');
            check.refreshToken = refreshToken;
            await check.save();
            const accessToken = token(check, '24h');
            return res.status(200).json({
                _id: check._id,
                role: check.role,
                name: check.name,
                email: check.email,
                refreshToken,
                accessToken,
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(404).json({
            message: 'login error',
        });
    }
};
//forgot
const forgot = async (req, res) => {
    const { email } = req.body;
    const userEmail = await checkEmail.checkEmail(email);
    if (!userEmail) {
        return res.status(404).json({
            message: 'Email does not exist, please register',
        });
    }
    const payload = {
        userEmail,
    };
    const tokenUSer = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: 3 * 60 * 1000 });
    const mailOptions = {
        from: `${process.env.USER_EMAIL}`, // sender address
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
                    <button style="background:#0052cc;padding:5px;border-radius:5px "><a style="cursor: pointer;font-size:16px;text-decoration:none;color:#fff;font-family: 'Helvetica Neue', Helvetica" href="${process.env.URL_EMAIL_RESETPASSWORD}?tokenUSer=${tokenUSer}&email=${email}&id=${userEmail._id}">Set password</a></button>
                   <p style="font-size:16px;font-family: 'Helvetica Neue', Helvetica">If you didn't request this, you can safely ignore this email.</p>
                    <hr style="margin:15px 0"/>
                    <p style="text-align:center;font-size:14px;font-family: 'Helvetica Neue', Helvetica">This message was sent to you by Atlassian Cloud</p>
                    <img style="width:30%;margin: 0 0 0 35%" src="https://ci5.googleusercontent.com/proxy/zIOVA2ab3bb8vFu6rLdIa9bwEmhKYRnK4uizA8zEYuHEHS5KDGJE-NEVwrs7_NEhUxid-wHZqBG1Ic7djSh763B_pibY83IfcwX-OevYWB-YJrq-apGh90n__trodVg8iORj5gxA6JY=s0-d-e1-ft#https://id-mail-assets.atlassian.com/shared/id-summit/id-summit-logo-email-footer.png" alt="" />
                </div>
        
        `, // html body
    };
    transporter.sendMail(mailOptions, function (error, response) {
        if (error) {
            console.log(error);
            return res.status(404).json({
                message: 'Error when sending email',
            });
        } else {
            console.log('Message sent: ' + response.response);
            return res.status(200).json({
                message: 'Email has been sent',
                _id: userEmail._id,
                tokenUser: tokenUSer,
                email: email,
            });
        }
    });
};
// new passWord

const newPassword = async (req, res) => {
    //check user email
    try {
        const { _id } = req.user;
        const { passWord } = req.body;
        const checkId = await UsersModal.findById(_id);
        if (!checkId) {
            return res.status(404).json({
                message: 'user not found',
            });
        }
        const salt = bcrypt.genSaltSync(10);
        const hashPassWord = bcrypt.hashSync(passWord, salt);
        checkId.passWord = hashPassWord;
        await checkId.save();
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
//profile change password
const ProfileChangePassword = async (req, res) => {
    try {
        const { _id } = req.user;
        const { oldPassword, newPassword } = req.body;
        const checkIdUser = await UsersModal.findById(_id);
        const checkOldPassword = await bcrypt.compareSync(oldPassword, checkIdUser.passWord);
        if (!checkOldPassword) {
            return res.status(404).json({
                message: 'Old passwords do not match',
            });
        }
        const salt = await bcrypt.genSaltSync(10);
        const hashNewPassword = await bcrypt.hashSync(newPassword, salt);
        checkIdUser.passWord = hashNewPassword;
        await checkIdUser.save();
        return res.status(200).json({
            message: 'changed password successfully',
        });
    } catch (error) {
        return res.status(404).json({
            message: 'Unable to change password due to pass',
        });
    }
};
//cập nhật thông tin user
const updateInfoUser = async (req, res) => {
    try {
        const { _id } = req.user;
        const { nameFill, contenEditing } = req.body;
        if (!_id || !nameFill) {
            res.status(404).json({
                message: 'is not id or trường cần thay đổi',
            });
        }
        const user = await UsersModal.findById(_id);
        switch (nameFill) {
            case 'name':
                user.name = contenEditing;
                break;
            case 'gender':
                user.gender = contenEditing;
                break;
            case 'birthDay':
                const newbirthday = new Date(contenEditing);
                user.birthDay = newbirthday;
                break;
            case 'desc':
                user.desc = contenEditing;
                break;
            case 'email':
                user.email = contenEditing;
                break;
            case 'phone':
                user.phone = contenEditing;
                break;
            case 'jopTitle':
                user.jopTitle = contenEditing;
                break;
            case 'department':
                user.department = contenEditing;
                break;
            case 'organization':
                user.organization = contenEditing;
                break;
            case 'location':
                user.location = contenEditing;
                break;
            default:
                break;
        }
        await user.save();

        res.status(200).json({ data: user });
    } catch (error) {
        return res.status(404).json({
            message: 'Can not update',
        });
    }
};
//upload background content
const updateBackgroundAndContent = async (req, res) => {
    try {
        const { _id } = req.user;
        const { backgroundProfile, contentProfile } = req.body;
        const users = await UsersModal.findById(_id);
        if (!users) {
            return res.status(404).json({
                message: 'not found',
            });
        }
        users.backgroundProfile = backgroundProfile;
        users.textInBackgroundProfile = contentProfile;
        users.img = '';
        await users.save();
        return res.status(200).json({
            message: 'successfully',
            users,
        });
    } catch (error) {
        res.status(404).json({
            message: 'can not update',
        });
    }
};
const uploadImg = async (req, res) => {
    try {
        const { _id } = req.user;
        const files = req.files;
        const users = await UsersModal.findById(_id);
        cloudinary.config({
            cloud_name: 'djybyg1o3',
            api_key: '515998948284271',
            api_secret: '53vkRUxGp4_JXSjQVIFfED6u-tk',
            secure: true,
        });
        if (!users) {
            return res.status(404).json({
                message: 'is not id',
            });
        }

        if (!users) {
            return res.status(404).json({ msg: 'User not found' });
        }
        if (files.img) {
            const cloudinaryResponse = await cloudinary.uploader.upload(files.img[0].path);
            if (cloudinaryResponse) {
                users.img = cloudinaryResponse.secure_url;
            }
        }
        if (files.imgCover) {
            const cloudinaryResponse = await cloudinary.uploader.upload(files.imgCover[0].path);

            if (cloudinaryResponse) {
                users.imgCover = cloudinaryResponse.secure_url;
            }
        }
        await users.save();
        return res.status(200).json({ img: users.img, imgCover: users.imgCover });
    } catch (error) {
        res.status(404).json({
            message: 'error upload img',
        });
    }
};
//get user
const getUser = async (req, res) => {
    try {
        const { _id } = req.user;
        if (!_id) {
            res.status(404).json({
                message: 'is not id',
            });
        }
        const user = await UsersModal.findById(_id);
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(404).json({
            message: 'can not get data',
        });
    }
};
module.exports = {
    login,
    forgot,
    newPassword,
    loginGoogle,
    ProfileChangePassword,
    updateInfoUser,
    uploadImg,
    updateBackgroundAndContent,
    getUser,
};
