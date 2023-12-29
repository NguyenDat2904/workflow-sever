const modelProject=require('../models/modelWorkProject')
const ListWorkProject=async(req,res)=>{
    try {
        //id user
        const {codeProject}=req.body
        const skipPage=parseInt(req.query.page)||1
        const limitPage=parseInt(req.query.limit)||25
        if(!codeProject){
            return res.status(400).json({
                message:"is not id or jobCode"
            })
        }
        const lengthListWork=await modelProject.findOne({codeProject})
        const totalPage=Math.ceil(lengthListWork.listWorkID.length/ 3)
        const checkCodeProject=await modelProject.findOne({codeProject})
        .populate({
            path: 'listWorkID',
            populate: {
                path: 'creatorID',
            },
            options:{
             sort:{createdAt:-1},
            skip:(skipPage-1) * limitPage,
            limit:limitPage
            }
           
        })
        if(!checkCodeProject){
            return req.status(400).json({
                message:"codeProject does not exist"
            })
        }
        return res.status(200).json({
            dataListWork:checkCodeProject.listWorkID,
            page:skipPage,
            totalPage
        })
    } catch (error) {
        console.log(error)
        return res.status(404).json({
            message:"can not get list work"
        })
    }
}
module.exports= {ListWorkProject}