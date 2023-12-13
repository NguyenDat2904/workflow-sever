const checkEmail = require('../helpers/email');
const UsersModal = require('../models/modelUser');
const token = require('../helpers/tokenHelpers');
const jwt=require("jsonwebtoken")
const { OAuth2Client } = require('google-auth-library');
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
const LoginGoogle = async (req, res) => {
    try {
        const tokenGoogle = req.headers['tokengoogle'];
        const client = new OAuth2Client({
            clientId: '927156751612-1uvnfve8d0oo0l9ekmoeenf09ji6llub.apps.googleusercontent.com',
        });
        const ticket = await client.verifyIdToken({
            idToken: tokenGoogle,
            audience: '927156751612-1uvnfve8d0oo0l9ekmoeenf09ji6llub.apps.googleusercontent.com',
        });
        const payload = ticket.getPayload();
       
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
                role: 'nomal',
                img: payload.picture,
                refreshToken: '',
                gender: '',
                birthDay: null,
                desc: '',
                imgCover:"",
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
            res.status(200).json({
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
            const accessToken = token(check, '24h');
            res.status(200).json({
                _id: check._id,
                role: check.role,
                name: check.name,
                email: check.email,
                refreshToken,
                accessToken,
            });
        }
    } catch (error) {
        return res.status(404).json({
            message: 'login error',
        });
    }
};
//forgot
const Forgot = async (req, res) => {
    const { email } = req.body;
    const userEmail = await checkEmail.checkEmail(email);
    if (!userEmail) {
        return res.status(404).json({
            message: 'Email does not exist, please register',
        });
    }
    const payload={
        userEmail
    }
    const tokenUSer=jwt.sign(payload,process.env.SECRET_KEY,{ expiresIn: 3 * 60 * 1000 })
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
                    <button style="background:#0052cc;padding:5px;border-radius:5px "><a style="cursor: pointer;font-size:16px;text-decoration:none;color:#fff;font-family: 'Helvetica Neue', Helvetica" href="${process.env.URL_EMAIL}?tokenUSer=${tokenUSer}$email=${email}&${userEmail._id}">Set password</a></button>
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
                _id:userEmail._id,
                tokenUser:tokenUSer,
                email:email
            });
        }
    });
};
// new passWord

const NewPassword = async (req, res) => {
    //check user email
    try {
        const { _id } = req.params;
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
        const { _id } = req.params;
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
        const { _id } = req.params;
        const { nameFill, contenEditing } = req.body;
        if (!_id) {
            res.status(404).json({
                message: 'is not id',
            });
        }
        const user = await UsersModal.findById(_id);
        switch (nameFill) {
            case 'name':
                user.name = contenEditing;
                await user.save();
                break;
            case 'gender':
                user.gender = contenEditing;
                await user.save();
                break;
            case 'birthDay':
                const newbirthday = new Date(contenEditing);
                user.birthDay = newbirthday;
                await user.save();
                break;
            case 'desc':
                user.desc = contenEditing;
                await user.save();
                break;
            case 'email':
                user.email = contenEditing;
                await user.save();
                break;
            case 'phone':
                user.phone = contenEditing;
                await user.save();
                break;
            case 'jopTitle':
                user.jopTitle = contenEditing;
                await user.save();
                break;
            case 'department':
                user.department = contenEditing;
                await user.save();
                break;
            case 'organization':
                user.organization = contenEditing;
                await user.save();
                break;
            case 'location':
                user.location = contenEditing;
                await user.save();
                break;
            default:
                break;
        }
        res.status(200).json({data:user})
    } catch (error) {
       return res.status(404).json({
            message:"Can not update"
        })
    }
};
//upload background content
const updateBackgroundAndContent=async(req,res)=>{
        try {
            const { _id } = req.params;
            const { backgroundProfile, contentProfile } = req.body;
            if(!_id||!backgroundProfile||!contentProfile){
             return res.status(404).json({
                    message:"is not id or backgroundProfile or contentProfile"
                })
            }
            const users = await UsersModal.findById(_id)
            if(!users){
              return  res.status(404).json({
                    message:"not found"
                })
            }
             users.backgroundProfile=backgroundProfile
             users.textInBackgroundProfile=contentProfile
             await users.save()
            return res.status(200).json({
                message:"successfully",
                users
            })
        } catch (error) {
            res.status(404).json({
                message:"can not update"
            })
        }
}
const uploadImg=async(req,res)=>{
    try {
         const {_id}=req.params
        const files =req.files
        const updatedData=req.body
        console.log(files)
        const users= await UsersModal.findById(_id)
        if(!users){
          return  res.status(404).json({
                message:"is not id"
            })
        }
     
        if (!users) {
            return res.status(404).json({ msg: 'User not found' });
        }
        if(files.img){
            updatedData.img=`${process.env.LOCALHOST}/images/${files.img[0].filename}`
            users.img=updatedData.img
           
        }
        if(files.imgCover)
        {
            updatedData.imgCover=`${process.env.LOCALHOST}/images/${files.imgCover[0].filename}`
            users.imgCover=updatedData.imgCover
           
        }
        await users.save()
        res.status(200).json({
            message:"successfully",
            image: updatedData.img,
            image_cover: updatedData.imgCover,
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({
            message:"error upload img"
        })
    }
   
}
//get user
const getUser=async(req,res)=>{
   
    try {
         const {_id}=req.params
         if(!_id){
            res.status(404).json({
                message:"is not id"
            })
         }
         const user=await UsersModal.findById(_id)
         res.status(200).json(user)
    } catch (error) {
        console.log(error)
        res.status(404).json({
            message:"can not get data"
        })
    }
}
module.exports = { Login, Forgot, NewPassword, LoginGoogle, ProfileChangePassword,updateInfoUser,uploadImg,updateBackgroundAndContent,getUser};
