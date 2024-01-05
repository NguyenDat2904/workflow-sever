const bcrypt = require('bcrypt');
const userModel = require('../models/user');
const Token = require('../helpers/tokenHelpers');
const jwt = require('jsonwebtoken');
const { checkEmail, checkUsers, transporter } = require('../helpers/email');
const userSchema = require('../helpers/validateUser.helper');
require('dotenv').config();

const AuthController = {
    // post
    verify: async (req, res) => {
        try {
            const { email = '', userName = '', fullName = '' } = req.body;

            const isCheckUserEmail = await checkEmail(email);
            const isCheckUserName = await checkUsers(userName);
            if (isCheckUserEmail) {
                return res.status(400).json({
                    errEmail: 'Email already exists',
                });
            } else if (isCheckUserName) {
                return res.status(400).json({
                    errUserName: 'UserName already exists',
                });
            }

            const payload = {
                userName,
                email,
                fullName,
            };
            console.log(process.env.SECRET_KEY_EMAIL);
            // hết hạn sau 3p
            const token = jwt.sign(payload, process.env.SECRET_KEY_EMAIL, { expiresIn: 3 * 60 * 1000 });

            const mailOptions = {
                from: `${process.env.USER_EMAIL}`,
                to: `${email}`,
                subject: 'Verify your email for Workflow',
                html: `<div style="max-width:600px;margin:0 auto"><div style="vertical-align:top;text-align:left;
                font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Fira Sans,Droid Sans,Helvetica
                 Neue,sans-serif;font-size:14px;font-weight:400;letter-spacing:-0.005em;color:#091e42;line-height:20px">
                 <div style="padding-top:30px;padding-bottom:20px;vertical-align:top;text-align:center;max-width:520px;margin:0 auto">
                 <h1 style="margin-bottom:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;font-size:24px;font-weight:500;letter-spacing:-0.01em;color:#172b4d;line-height:28px;margin-top:40px">WORKFLOW</h1>
                 </div><hr style="margin-top:24px;margin-bottom:24px;border:0;border-bottom:1px solid #c1c7d0"><div><table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse"><tbody><tr><td align="center"><img src="https://ci4.googleusercontent.com/proxy/c-ZnjN8qvtu8l_OEizK8mFLIVr9DHtfiLE5TAcrF6zyH4UEx7WsSsYP2ovwjQXXFUhGDD3uG8eszfrR_EKz3CE6Ty8n7mtKqtaPzIHIpFKdN6aGICYwszYV7nWbAV4Q8N0fMey3MUbwO=s0-d-e1-ft#https://id-mail-assets.atlassian.com/template/aid_signup_welcome_verify_adg/people.png" height="175" border="0" alt="" style="border:0;line-height:100%;outline:none;text-decoration:none" class="CToWUd a6T" data-bit="iit" tabindex="0"><div class="a6S" dir="ltr" style="opacity: 0.01; left: 486.8px; top: 268.8px;">
                 <div id=":1dz" class="T-I J-J5-Ji aQv T-I-ax7 L3 a5q" role="button" tabindex="0" aria-label="Tải xuống tệp đính kèm " jslog="91252; u014N:cOuCgd,Kr2w4b,xr6bB; 4:WyIjbXNnLWY6MTc4MzgyMDM1NzYwMTAyNTg5MSJd" data-tooltip-class="a1V" jsaction="JIbuQc:.CLIENT" data-tooltip="Tải xuống"><div class="akn"><div class="aSK J-J5-Ji aYr"></div></div></div></div></td></tr></tbody></table>
                  <h1 style="margin-bottom:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;font-size:24px;font-weight:500;letter-spacing:-0.01em;color:#172b4d;line-height:28px;margin-top:40px">You’re nearly there!</h1><p style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;font-size:14px;font-weight:400;letter-spacing:-0.005em;color:#091e42;line-height:20px;margin-top:12px">
                  <a style="text-decoration:none;color:inherit">Hi ${userName},</a></p><p style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;font-size:14px;font-weight:400;letter-spacing:-0.005em;color:#091e42;line-height:20px;margin-top:12px">To finish setting up your account and start using Workflow products, confirm we’ve got the correct email for you.</p><div style="margin-top:28px">
                  <a href="${process.env.URL_EMAIL}?token=${token}&fullName=${fullName}&email=${email}&username=${userName}"
                   style="box-sizing:border-box;border-radius:3px;border-width:0;border:none;display:inline-flex;font-style:normal;font-size:inherit;line-height:24px;margin:0;outline:none;padding:4px 12px;text-align:center;vertical-align:middle;white-space:nowrap;text-decoration:none;background:#0052cc;color:#ffffff;cursor:pointer;" target="_blank">
                   Verify your email
                    </a>
                  </div></div><hr style="margin-top:24px;margin-bottom:24px;border:0;border-bottom:1px solid #c1c7d0">
                  <h4 style="margin-bottom:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;font-size:14px;font-weight:600;letter-spacing:-0.003em;color:#172b4d;line-height:16px;margin-top:16px">Your Workflow Account</h4><p style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;font-size:14px;font-weight:400;letter-spacing:-0.005em;color:#091e42;line-height:20px;margin-top:12px">Make things easier by using one account across all of your Workflow products. <a href="" style="border:none;background:transparent;color:#0052cc;text-decoration:none" target="_blank"
                   data-saferedirecturl="https://www.google.com/url?q=https://confluence.atlassian.com/cloud/your-atlassian-account-976161169.html&amp;source=gmail&amp;ust=1701523652239000&amp;usg=AOvVaw0Zmgd8CXRbCxQnfiRGhP-C">Learn more.</a></p><hr style="margin-top:24px;margin-bottom:24px;border:0;border-bottom:1px solid #c1c7d0"><div style="color:#707070;font-size:13px;line-height:19px;text-align:center;margin-top:10px"><table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" align="center" style="border-collapse:collapse"><tbody><tr><td valign="top" align="center" style="padding-top:10px;line-height:18px;text-align:center;font-weight:none;font-size:12px;color:#505f79"><span>This message was sent to you by Workflow Cloud</span>
                   <br></td></tr><tr valign="top">
                  <td align="center" style="padding-top:15px;padding-bottom:30px"><a href="#" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://www.atlassian.com&amp;source=gmail&amp;ust=1701523652239000&amp;usg=AOvVaw0zgsKi1JVSAtxfD4-OFx0E">
                  <h3 style="margin-bottom:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;font-size:14px;font-weight:600;letter-spacing:-0.003em;color:#172b4d;line-height:16px;margin-top:16px"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">Workflow</font></font></h3>
                  </a></td></tr></tbody></table></div></div></div>`,
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.log(err);
                    res.status(400).json({
                        error: "The email wasn't sent successfully",
                    });
                } else {
                    res.json({
                        info: info.response,
                        email,
                        token,
                        fullName,
                    });
                    console.log('Email xác thực đã được gửi:', info.response);
                }
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error,
            });
        }
    },
    register: async (req, res) => {
        try {
            const { email = '', fullName = '', userName = '', password = '' } = req.body;

            if (email === '' || fullName === '' || userName === '' || password === '') {
                return res.status(400).json({
                    err: 'User data is missing',
                });
            }
            // check email and userName
            const isCheckUserEmail = await checkEmail(email);
            const isCheckUserName = await checkUsers(userName);
            if (isCheckUserEmail && isCheckUserName) {
                return res.status(400).json({
                    errEmail: 'Email already exists',
                    errUserName: 'UserName already exists',
                });
            } else if (isCheckUserEmail) {
                return res.status(400).json({
                    errEmail: 'Email already exists',
                });
            } else if (isCheckUserName) {
                return res.status(400).json({
                    errUserName: 'UserName already exists',
                });
            }

            const salt = bcrypt.genSaltSync(10);
            const hashPassword = bcrypt.hashSync(password, salt);

            // create user
            const newUser = new userModel({
                name: fullName,
                userName,
                email,
                passWord: hashPassword.toString(),
                role: '',
                refreshToken: '',
                phone: '',
                img: '',
                gender: '',
                birthDate: '',
                desc: '',
                imgCover: '',
                jopTitle: '',
                department: '',
                organization: '',
                location: '',
                backgroundProfile: '',
                textInBackgroundProfile: '',
            });

            const user = {
                id: newUser._id,
                role: newUser.role,
            };

            const assetToken = Token(user, '24h');
            const refreshToken = Token(user, '720h');
            newUser.refreshToken = refreshToken;

            await newUser.save();
            return res.status(200).json({ id: newUser._id, userName, email, assetToken, refreshToken });
        } catch (error) {
            console.log(error);
            return res.status(400).json({
                error,
            });
        }
    },
};

module.exports = AuthController;
