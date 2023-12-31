const express = require('express');
const multer = require('multer');
const router = express.Router();
const Login = require('../controllers/usersController');
const veryfyEmail=require("../middlewares/checkVerifyToken")
const authMidddlerware = require('../middlewares/authMiddleware');
const refreshTokenMiddlerware = require('../middlewares/refreshTokenMiddleware');
const newAccess=require("../controllers/newToken")
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
router.get('/new-access',refreshTokenMiddlerware,newAccess)
router.patch('/uploadimg',authMidddlerware, upload.fields([{name:"img"},{name:"imgCover"}]),Login.uploadImg);
router.patch('/updateUser/background',  authMidddlerware, Login.updateBackgroundAndContent);
router.patch('/updateUser',  authMidddlerware, Login.updateInfoUser);
router.post('/login', Login.Login);
router.post('/forgot', Login.Forgot);
router.patch('/forgot/changePassword',veryfyEmail, Login.NewPassword);
router.post('/loginGoogle', Login.LoginGoogle);
router.patch('/profile/changePassword', authMidddlerware, Login.ProfileChangePassword);
router.get('/', authMidddlerware, Login.getUser);

module.exports = router;
