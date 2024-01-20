
const modelSprint = require('../models/sprint');
const modelWorkProject = require('../models/project');
const modelIssues=require('../models/issue')
const modelIssue=require('../models/issue')
// add sprint
const addNewSprint = async (req, res) => {
    try {
        const {codeProject} = req.params;
        if (!codeProject ) {
            return res.status(400).json({
                message: 'not enough information',
            });
        }
        
        const project= await modelWorkProject.findOne({codeProject})
         const listSprint=await modelSprint.find({projectID:project._id}).sort({createdAt:-1})
        const nameSprin=`${codeProject} Sprint ${listSprint.length + 1}`
        const startDate=listSprint[0]?.endDate
        const endDate=startDate + 1209600033
        const newIssue = new modelSprint({
            projectID:project._id,
            name:nameSprin,
            startDate: startDate?startDate:null,
            endDate: startDate?endDate:null,
            sprintGoal:'',
            status:'PENDING',//RUNNING AND DONE
            duration:2
        });
        await newIssue.save();
        return res.status(200).json({
            message: 'add new successfully',
            data: newIssue,
        });
    } catch (error) {
        console.log(error)
        return res.status(404).json({
            message: 'can not add new',
        });
    }
};

// list issue
const listSprint = async (req, res) => {
    try {
        const { codeProject } = req.params;
        const skip = parseInt(req.query.skip) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const search = req.query.search || '';
        if (!codeProject) {
            return res.status(400).json({
                message: 'is not id project',
            });
        }
        const checkProject=await modelWorkProject.findOne({codeProject})
        const totalSprint = await modelSprint.find({ projectID: checkProject._id });
        const totalPage = Math.ceil(totalSprint.length / limit);
        const sprintProject = await modelSprint
            .find({ projectID: checkProject._id, $or: [{ name: { $regex: search } }, { sprintGoal: { $regex: search } }] })
            .sort({ createdAt: -1 })
            .skip((skip - 1) * limit)
            .limit(limit);
        if (!sprintProject.length === 0) {
            return res.status(400).json({
                message: 'Not available sprint',
            });
        }
        return res.status(200).json({
            sprint: sprintProject,
            page: skip,
            totalPage,
        });
    } catch (error) {
        console.log(error);
        return res.status(404).json({
            message: 'Can not issue ',
        });
    }
};
////edit information sprint
const editInformationSprint=async(req,res)=>{
    try {
        const updateData  =req.body
       const {idSprint}=req.params
        if(!updateData){
        return res.status(404).json({
            message:'updateData is required'
        })
       }
       if(!idSprint){
        return res.status(404).json({
            message:'idSprint is required'
        })
       }
       const checkSprint=await modelSprint.findByIdAndUpdate(idSprint,updateData,{new:true})
       return res.status(200).json({
        message:'update success',
        data:checkSprint
       })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message:error
        })
    }
}
//delete sprint
const deleteSprint=async(req,res)=>{
    try {
        const {idSprint,codeProject}=req.params
        if(!idSprint){
            return res.status(404).json({
                message:'is not id sprint'
            })
        }
        const project=await modelWorkProject.findOne({codeProject})
        const sprint=await modelSprint.findByIdAndDelete({_id:idSprint})
        if (!sprint) {
            return res.status(400).json({
                message: 'Deleting sprint failed',
            });
        }
        const updateNameSprint=await modelSprint.find({projectID:project._id})
        const updateParentIssue=await modelIssue.find({sprint:idSprint.toString()})
        updateParentIssue.forEach(async(element)=>{
            element.sprint=null
             await element.save()
        })
        updateNameSprint.forEach(async(element,index)=>{
            element.name=`${codeProject} Sprint ${index + 1}`
            await element.save()
        })
        res.status(200).json({
            message: 'Deleted issue successfully'
        });
    } catch (error) {
        res.status(404).json({
            message: error,
        });
    }
}
//Active Sprint
const activeSprint=async(req,res)=>{
    try {
        const {idSprintComplete,idSprintRunning}=req.params

        if(!idSprintComplete){
            return res.status(404).json({
                message:"is not id sprint complete"
            })
        }
        await modelIssues.findOneAndUpdate({sprint:idSprintRunning,status:{$ne:"DONE"}},{
        sprint: idSprintComplete
        },{new:true})
        await modelSprint.findByIdAndUpdate({_id:idSprintRunning},{
            status:'DONE'
        },{new:true})
        return res.status(200).json({
            message:'active sprint success'
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message:error
        })
    }
} 
module.exports = {activeSprint,deleteSprint, listSprint,editInformationSprint, addNewSprint };
