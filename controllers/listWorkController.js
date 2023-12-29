const modelListWork=require('../models/modalListWorks')
const modelProject=require('../models/modelWorkProject')
const modelUsers=require('../models/modelUser')
const ListWorkProject=async(req,res)=>{
    try {
        //id user
        const {_id}=req.params
        const {codeProject}=req.body
        const skipPage=parseInt(req.query.page)||1
        const limitPage=parseInt(req.query.limit)
        if(!_id,!codeProject){
            return res.status(400).json({
                message:"is not id or jobCode"
            })
        }
        const user=await modelUsers.findById(_id)
        if(!user){
            return req.status(400).json({
                message:"user does not exist"
            })
        }
        const lengthListWork=await modelListWork.find(codeProject)
        const totalPage=Math.ceil(lengthListWork.length / 25)
        const checkCodeProject=await modelProject.findOne(codeProject)
        .populate({
            path: 'listWorkID',
            populate: {
                path: 'creatorID',
            },
            sort:{
                createdAt:"desc"
            },
            skip:(skipPage-1) * limitPage,
            limit:limitPage
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
        return res.status(404).json({
            message:"can not get list work"
        })
    }
}
module