const jwt = require("jsonwebtoken");
require("dotenv").config();
const RefreshToken = (req, res, next) => {
    const refreshToken = req.headers['refresh_token'];
    try {
        if (!refreshToken) {
        return res.status(404).json({
        message: "RefeshToken is incorrect",
        });
        }
        jwt.verify(refreshToken, process.env.SECRET_KEY);
        next();
    } catch (error) {
        res.status(404).json({
            message:error
        })
    }
  
};
 module.exports=RefreshToken