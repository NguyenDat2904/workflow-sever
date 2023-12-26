const express = require('express');
const multer = require('multer');
const router = express.Router();
const Login = require('../controllers/usersController');
const veryfyEmail=require("../middlewares/checkVerifyToken")
const authMidddlerware = require('../middlewares/authMiddleware');
const refreshTokenMiddlerware = require('../middlewares/refreshTokenMiddleware');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const originalName = file.originalname;
        const extension = originalName.split('.').pop();
        const filename = `${uniqueSuffix}.${extension}`;
        cb(null, filename);
    },
});

const upload = multer({
    storage: storage,
});
/* GET users listing. */
router.patch('/uploadimg/:_id', upload.fields([{name:"img"},{name:"imgCover"}]),Login.uploadImg);
router.patch('/updateUser/background/:_id', refreshTokenMiddlerware, authMidddlerware, Login.updateBackgroundAndContent);
router.patch('/updateUser/:_id', refreshTokenMiddlerware, authMidddlerware, Login.updateInfoUser);
router.post('/login', Login.Login);
router.post('/forgot', Login.Forgot);
router.patch('/forgot/changePassword/:_id',veryfyEmail, Login.NewPassword);
router.post('/loginGoogle', Login.LoginGoogle);
router.patch('/profile/changePassword/:_id', refreshTokenMiddlerware, authMidddlerware, Login.ProfileChangePassword);
router.get('/:_id', refreshTokenMiddlerware, authMidddlerware, Login.getUser);

module.exports = router;
