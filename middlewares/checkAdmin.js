const modelWorkProject=require("../models/modelWorkProject")

const CheckAdmin=async(req,res,next)=>{
    try {
        const{_id}=req.params;
        const {_idUser}=req.body;
        if(!_idUser){
            return res.status(404).json({
                message:"is not _id"
            })
        }
        const listProject =await modelWorkProject.find({_id:_id,adminID:_idUser})
        if(listProject.length===0){
            return res.status(404).json({
                message:"not found user"
            })
        }
        next()
    } catch (error) {
        console.log(error)
        return res.status(404).json({
            message:"error check admin"
        })
    }
}
module.exports = CheckAdmin