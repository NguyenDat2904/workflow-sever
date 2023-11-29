
const checkEmail=require("../helpers/email");
const token=require("../helpers/token.helpers")
const bcrypt=require("bcrypt");
const Login=async(req,res)=>{
    const {userName,passWord}=req.body
    try {
        
        const userEmail=await checkEmail.checkUsers(userName)
        if(!userEmail){
           return res.status(404).json({
                message:"Email does not exist",
            })
        }
        //check  password
        const isPassword = await bcrypt.compare(passWord, userEmail.password);
        if (!isPassword) {
         return  res.status(404).json({
                message:"Wrong password"
         });
        }
        const refreshToken= token(userEmail,"720h");
        userEmail.refreshToken=refreshToken
        await userEmail.save()
        const accessToken =token(userEmail,'24h');
            res.status(200).json({
                _id:userEmail._id,
                role:userEmail.role,
                refreshToken,
                accessToken
            })
    } catch (error) {
        res.status(404).json({
            message:"Can not call data",
            data:null
        })
    }
}
module.exports=Login;