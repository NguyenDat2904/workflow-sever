const modelWorkProject = require('../models/modelWorkProject');
const ModelListWork = require('../models/modalListWorks');
const modalWorkDetail = require('../models/modelWorkDetail');

//lấy project
const getWorkProject=async(req,res)=>{
    try {
        const {_id}=req.params
        if(!_id){
            res.status(404).json({
                message:"not found id"
            })
        }
        const workProject= await modelWorkProject.find({memberID:_id});
        if(!workProject){
            res.status(404).json({
                message:"project not found"
            })
        }
        res.status(200).json(workProject)
    } catch (error) {
        res.status(404).json({
            message:"can not get data work Project"
        })
    }
}
// lấy list công việc của hàm getWorkProject đã lọc công việc theo id user trả về
const getListWork=async(req,res)=>{
    try {
        const {listWorkID}=req.body
        if(!listWorkID){
            res.status(404).json({
                message:"not found id"
            })
        }
        const listWork= await ModelListWork.find({_id:{$in:listWorkID}})
        if(!listWork){
            res.status(404).json({
                message:"project not found"
            })
        }
        res.status(200).json(listWork)
    } catch (error) {
        res.status(404).json({
            message:"can not get data list work  "
        })
    }
}
//lấy công việc chi tiết của user qua lọc của hàm getListWork theo project
const getWorkDetail=async(req,res)=>{
    try {
        const {workDetrailID}=req.body
        if(!workDetrailID){
            res.status(404).json({
                message:"not found id"
            })
        }
        const WorkDetail= await modalWorkDetail.find({_id:{$in:workDetrailID}})
        if(!WorkDetail){
            res.status(404).json({
                message:"project not found"
            })
        }
        res.status(200).json(WorkDetail)
    } catch (error) {
        res.status(404).json({
            message:"can not get data work detail "
        })
    }
}
module.exports={getWorkProject,getListWork,getWorkDetail}