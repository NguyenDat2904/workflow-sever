const modelProject = require('../models/modelWorkProject');
const modelListWork =require('../models/modalListWorks')
const ListIssuesProject = async (req, res) => {
    try {
        //id user
        const { codeProject } = req.params;
        const skipPage = parseInt(req.query.page) || 1;
        const limitPage = parseInt(req.query.limit) || 25;
        if (!codeProject) {
            return res.status(400).json({
                message: 'is not id or jobCode',
            });
        }
        const lengthListWork = await modelProject.findOne({ codeProject });
        const totalPage = Math.ceil(lengthListWork.listWorkID.length / 3);
        const checkCodeProject = await modelProject.findOne({ codeProject }).populate({
            path: 'listWorkID',
            options: {
                sort: { createdAt: -1 },
                skip: (skipPage - 1) * limitPage,
                limit: limitPage,
            },
        });
        if (!checkCodeProject) {
            return req.status(400).json({
                message: 'codeProject does not exist',
            });
        }
        return res.status(200).json({
            dataListWork: checkCodeProject.listWorkID,
            page: skipPage,
            totalPage,
        });
    } catch (error) {
        console.log(error);
        return res.status(404).json({
            message: 'can not get list work',
        });
    }
}
// add new work
const addNewIssues=async(req,res)=>{
    try {
        const {nameProject,priority,issueType,statusWork,nameWork,description,sprint}=req.body
        const {_id}=req.user
        const checkProject= await modelProject.findOne({userMembers:_id,nameProject})
        
        const newIssues= new modelListWork({
            nameWork: nameWork,
            jobCode:'',
            issueType: issueType,
            priority: priority,
            dateCreated: null,
            deadline: null,
            actualEndDate: null,
            creatorID: [_id],
            implementerMenberID: null,
            sprint:sprint,
            status:statusWork,
            description:description,
            parentIssue:''
        })
        await newIssues.save()
        checkProject.listWorkID.push(newIssues._id)
        await checkProject.save()
        return res.status(200).json({
            message:"add new issue successfully"
        })
    } catch (error) {
        return req.status(404).json({
            message:"can not add work"
        })
    }
}

module.exports = { ListIssuesProject ,addNewIssues};
