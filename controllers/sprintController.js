const modelListWork = require('../models/modalListWorks');
const modelSprint = require('../models/modelSprint');
const modelWorkProject = require('../models/modelWorkProject');

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
            status:'',
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
const ListSprint = async (req, res) => {
    try {
        const { _idProject } = req.params;
        const skip = parseInt(req.query.skip) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const search = req.query.search || '';
        if (!_idProject) {
            return res.status(400).json({
                message: 'is not id project',
            });
        }
        const totalSprint = await modelSprint.find({ projectID: _idProject });
        const totalPage = Math.ceil(totalSprint.length / limit);
        const sprintProject = await modelSprint
            .find({ projectID: _idProject, $or: [{ name: { $regex: search } }, { sprintGoal: { $regex: search } }] })
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
        
    } catch (error) {
        
    }
}

module.exports = { ListSprint, addNewSprint };
