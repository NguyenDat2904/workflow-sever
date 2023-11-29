const UsersModal=require("../model/modalUser")
const checkEmail=async(email)=>{
        if(email){
            const users=await UsersModal.findOne({email:email})
            return users;
        }
        else{
            return null;
        }
}
const checkUsers=async(userName)=>{
    if(userName){
        const users=await UsersModal.findOne({userName:userName})
        return users;
    }
    else{
        return null;
    }
}
module.exports={checkEmail,checkUsers}