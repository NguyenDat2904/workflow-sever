
const modelSprint = require('../models/sprint');
const modelWorkProject = require('../models/project');
const modelIssues=require('../models/issue')
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
        const {  name,
        startDate,
        endDate,
        sprintGoal,
        duration
       }=req.body
       const {idSprint}=req.params
       if(!idSprint){
        return res.status(404).json({
            message:'is not codeProject'
        })
       }
     
       const checkSprint=await modelSprint.findByIdAndUpdate({_id:idSprint},
        {name:name?name:"",
        startDate:startDate?startDate:null,
        endDate:endDate?endDate:null,
        sprintGoal:sprintGoal?sprintGoal:"",
        duration:duration?duration:null
       },{new:true})
      
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
        const {idSprint}=req.params
        if(!idSprint){
            return res.status(404).json({
                message:'is not id sprint'
            })
        }
        const sprint=await modelSprint.findByIdAndDelete({_id:idSprint})
        if (!sprint) {
            return res.status(400).json({
                message: 'Deleting sprint failed',
            });
        }
        res.status(200).json({
            message: 'Deleted issue successfully',
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
