const modelProject = require('../models/modelWorkProject');
const modelListWork = require('../models/modalListWorks');
const modelSprint = require('../models/modelSprint');

const ListIssuesProject = async (req, res) => {
    try {
        //id user
        const { _idProject } = req.params;
        const skipPage = parseInt(req.query.page) || 1;
        const limitPage = parseInt(req.query.limit) || 25;
        if (!_idProject) {
            return res.status(400).json({
                message: 'is not id or jobCode',
            });
        }
        
        const lengthListWork = await modelSprint.find({projectID:_idProject});
        const totalPage = Math.ceil(lengthListWork.length / 3);
        const checkCodeProject = await modelSprint.find({projectID:_idProject})
        .sort({ createdAt: -1 })
        .skip( (skipPage - 1) * limitPage)
        .limit(limitPage);
        if (!checkCodeProject) {
            return req.status(400).json({
                message: 'codeProject does not exist',
            });
        }
        return res.status(200).json({
            dataListIssues: checkCodeProject,
            page: skipPage,
            totalPage,
        });
    } catch (error) {
        console.log(error);
        return res.status(404).json({
            message: 'can not get list work',
        });
    }
};
// add new work
const addNewIssues = async (req, res) => {
    try {
        const { nameProject, priority, issueType, statusWork, nameWork, description, sprint } = req.body;
        const { _id } = req.user;
        const checkProject = await modelProject.findOne({ userMembers: _id, nameProject });

        const newIssues = new modelListWork({
            nameWork: nameWork,
            jobCode: '',
            issueType: issueType,
            priority: priority,
            dateCreated: null,
            deadline: null,
            actualEndDate: null,
            creatorID: [_id],
            implementerMenberID: null,
            sprint: sprint,
            status: statusWork,
            description: description,
            parentIssue: '',
        });
        await newIssues.save();
        checkProject.listWorkID.push(newIssues._id);
        await checkProject.save();
        return res.status(200).json({
            message: 'add new issue successfully',
        });
    } catch (error) {
        return req.status(404).json({
            message: 'can not add work',
        });
    }
};
// add sprint
const addNewSprint = async (req, res) => {
    try {
        const { projectID, name, startDate, endDate, sprintGoal, status } = req.body;
        if (!projectID||!name|| !startDate|| !endDate|| !sprintGoal|| !status) {
            return res.status(400).json({
                message: 'not enough information',
            });
        }
        const checkName= await modelSprint.findOne({name})
        if(checkName){
            return res.status(400).json({
                message:'name already exists'
            })
        }
        const newStartDate=new Date(startDate)
        const newEndDate=new Date(endDate)
        const newIssue = new modelSprint({
            projectID,
            name,
            startDate:newStartDate||new Date(),
            endDate:newEndDate,
            sprintGoal,
            status,
        });
        await newIssue.save()
    return res.status(200).json({
        message:'add new successfully',
        data:newIssue
    })
    } catch (error) {
        return res.status(404).json({
            message:'can not add new'
        })
    }
};
module.exports = { ListIssuesProject, addNewIssues,addNewSprint};
