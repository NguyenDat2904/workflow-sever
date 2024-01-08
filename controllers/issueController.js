const modelIssue = require('../models/issue');
const modelSprint=require('../models/sprint')
const modelWorkProject=require('../models/project')
const listIssuesProject = async (req, res) => {
    try {
        //id user
        const { codeProject } = req.params;
        const skipPage = parseInt(req.query.page) || 1;
        const limitPage = parseInt(req.query.limit) || 25;
        const search = req.query.search || '';
        const sprintID=req.query.sprintID
        const parentIssueID=req.query.parentIssueID
        const assignee=req.query.assignee
        if (!codeProject) {
            return res.status(400).json({
                message: 'is not id or jobCode',
            });
        }
        const checkProject=await modelWorkProject.findOne({codeProject})
        const lengthIssue = await modelIssue.find({ projectID: checkProject._id, parentIssue: null });
        const totalPage = Math.ceil(lengthIssue.length / 3);
        const checkCodeProject = await modelIssue
            .find({
                projectID: checkProject._id,
                ...sprintID && {
                    sprint:sprintID
                },
                 ...parentIssueID!==undefined && {parentIssue:parentIssueID==="null"?null:parentIssueID},
                 ...assignee && {
                    assignee:assignee
                 },
                $or: [
                    { summary: { $regex: search } },
                    { priority: { $regex: search } },
                    { issueType: { $regex: search } },
                ],
            })
            .populate({
                path: 'sprint',
            })
            .populate({
                path: 'assignee',
                select: '-passWord',
            })
            .populate({
                path: 'reporter',
                select: '-passWord',
            })
            .sort({ createdAt: -1 })
            .skip((skipPage - 1) * limitPage)
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
//issuesChildren
const issuesChildren = async (req, res) => {
    try {
        const { _idIssueParent } = req.params;
        if (!_idIssueParent) {
            return res.status(400).json({
                message: 'is not id issue',
            });
        }
        const checkIssueParent = await modelIssue.find({ parentIssue: _idIssueParent });
        if (checkIssueParent.length === 0) {
            return res.status(400).json({
                message: 'is not issue children',
            });
        }
        return res.status(200).json(checkIssueParent);
    } catch (error) {
        console.log();g
        return res.status(404).json({
            message: 'can not get issue parent',
        });
    }
};
// add new work
const addNewIssues = async (req, res) => {
    try {
        const {
            issueType,
            summary,
            sprintID,
        } = req.body;
        const {codeProject}=req.params
        if (!summary) {
            return res.status(400).json({
                message: 'A summary is required',
            });
        }
        const project =await modelWorkProject.findOne({codeProject})
        const issue=await modelIssue.find({projectID:project._id})
        const nameIssue=`${codeProject}-${issue.length + 1}`
        const newIssues = new modelIssue({
            projectID:project._id,
            issueType,
            status: 'TODO',
            summary,
            sprint: sprintID,
            startDate: new Date(),
            parentIssue:parentIssue?parentIssue: null,
            name:nameIssue
        });
        await newIssues.save();
        return res.status(200).json({
            message: 'add new issue successfully',
            data: newIssues,
        });
    } catch (error) {
        console.log(error);
        return res.status(404).json({
            message: 'can not add work',
        });
    }
};

//edit information
const editInformationIssue = async (req, res) => {
    try {
        const { idIssue } = req.params;
        const { fillName, content } = req.body;
        if (!fillName || !content) {
            return res.status(400).json({
                message: 'is not fillName or content',
            });
        }
        const newDueDate = new Date(content);
        const checkIssue = await modelIssue.findById({ _id: idIssue });

        if (!checkIssue) {
            return res.status(404).json({
                message: 'idIssue not found',
            });
        }

        switch (fillName) {
            case 'summary':
                checkIssue.summary = content;
                break;

            case 'status':
                checkIssue.status = content;

                break;
            case 'priority':
                checkIssue.priority = content;

                break;
            case 'assignee':
                checkIssue.assignee = content;

                break;
            case 'reporter':
                checkIssue.reporter = content;

                break;
            case 'startDate':
                checkIssue.startDate = newDueDate;

                break;
            case 'dueDate':
                checkIssue.dueDate = newDueDate;
                break;
            default:
                return res.status(400).json({
                    message: 'FillName does not exist',
                });
        }
        await checkIssue.save();
        return res.status(200).json(checkIssue);
    } catch (error) {
        console.log(error);
        return res.status(404).json({
            error: error.message,
        });
    }
};
//delete issue
const deleteIssue = async (req, res) => {
    const { issueID } = req.params;

    if (!issueID) {
        return res.status(400).json({
            message: 'issueID not found',
        });
    }

    const issue = await modelIssue.findByIdAndDelete({ _id: issueID });
    if (!issue) {
        return res.status(400).json({
            message: 'Deleting issue failed',
        });
    }

    res.json({
        message: 'Deleted issue successfully',
    });
};
//list issues in broad
const listIssuesBroad=async(req,res)=>{
    try {
        const {codeProject}=req.params
        const skip=parseInt(req.query.skip)||1
        const limit=parseInt(req.query.limit)||25
        const searchIssueUser=req.query.issueUser||""
        if(!codeProject){
            return res.status(400).json({
                message:'is not id project'
            })
        }
        const checkProject=await modelWorkProject.findOne({codeProject})
        const sprint=await modelSprint.find({projectID:checkProject._id,status:'RUNNING'})
        const  sprintID=[]
        sprint.forEach((element)=>{
            sprintID.push(element._id)
        })
        const countIssue=await modelIssue.find({projectID:checkProject._id,sprint:{$in:sprintID},parentIssue:{$ne: null}})
        const totalPage=Math.ceil(countIssue.length/limit)
        const checkIssues= await modelIssue.find({projectID:checkProject._id,sprint:{$in:sprintID},parentIssue:{$ne: null},$or:[{assignee:{$regex:searchIssueUser}},{issueType:{$regex:searchIssueUser}},{sprint:{$regex:searchIssueUser}}]})
        .populate({
            path:'parentIssue'
        })
        .skip((skip -1) * limit)
        .limit(limit)
        if(!checkIssues){
            return res.status(400).json({
                message:'is not issues of project'
            })
        }
        return res.status(200).json({
            issuesBroad:checkIssues,
            page:skip,
            totalPage
            
        })
    } catch (error) {
        console.log(error)
        return res.status(404).json({
            message:"can not get issues broad"
        })
    }
}

module.exports = {
    listIssuesBroad,
    editInformationIssue,
    listIssuesProject,
    addNewIssues,
    issuesChildren,
    deleteIssue,
};
