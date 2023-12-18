const modelWorkProject = require('../models/modelWorkProject');
const modelListWork = require('../models/modalListWorks');
const modalWorkDetail = require('../models/modelWorkDetail');
const dataImgProject = require('../imgProject.json');

//lấy project
const getWorkProject = async (req, res) => {
    try {
        const { sortKey } = req.query;
        const { _id } = req.params;
        const { deleteProject } = req.body;
        const page = parseInt(req.query.page) || 1;
        const sortOrder=parseInt(req.query.sortOrder) || 1;
        if (!_id || deleteProject === '') {
            return res.status(404).json({
                message: 'not found id or deleteProject',
            });
        }
        const totalUsers = await modelWorkProject.countDocuments();
        console.log(totalUsers)
        const totalPages = Math.ceil(totalUsers / 25);
        const workProject = await modelWorkProject
            .find({ memberID: _id, deleteProject: deleteProject })
            .populate({
                path: 'listWorkID',
                populate: {
                    path: 'creatorID',
                },
            })
            .populate({
                path: 'adminID',
               select:'-refreshToken -passWord'
            })
            .sort(sortKey === 'nameProject' ? { nameProject:sortOrder } : sortKey === 'codeProject' ? { codeProject: sortOrder } : {})
            .skip((page - 1) * 25)
            .limit(25)

        if (!workProject) {
            return res.status(404).json({
                message: 'project not found',
            });
        }
        return res.status(200).json({
            workProject,
             page,
             totalPages
             });
    } catch (error) {
        console.log(error);
        return res.status(404).json({
            message: 'can not get data work Project',
        });
    }
};
// lấy list công việc của hàm getWorkProject đã lọc công việc theo id user trả về
const getListWork = async (req, res) => {
    try {
        const { nameProject } = req.body;

        if (!nameProject) {
            return res.status(404).json({
                message: 'not found id',
            });
        }
        //check project
        const checkProject = await modelWorkProject.findOne({ nameProject: nameProject }).populate({
            path: 'listWorkID',
            populate: {
                path: 'creatorID',
            },
        });

        if (!checkProject) {
            return res.status(404).json({
                message: 'project not found',
            });
        }
        res.status(200).json(checkProject);
    } catch (error) {
        res.status(404).json({
            message: 'can not get data list work  ',
        });
    }
};
//lấy công việc chi tiết của user qua lọc của hàm getListWork theo project
const getWorkDetail = async (req, res) => {
    try {
        const { workDetrailID } = req.body;
        if (!workDetrailID) {
            return res.status(404).json({
                message: 'not found id',
            });
        }
        const WorkDetail = await modalWorkDetail.find({ _id: { $in: workDetrailID } });
        if (!WorkDetail) {
            return res.status(404).json({
                message: 'project not found',
            });
        }
        res.status(200).json(WorkDetail);
    } catch (error) {
        return res.status(404).json({
            message: 'can not get data work detail ',
        });
    }
};
// add new work
const addNewWork = async (req, res) => {
    try {
        const { _id } = req.params;
        const { nameProject, codeProject } = req.body;

        if (!_id || !nameProject || !codeProject) {
            return res.status(400).json({
                message: 'is not nameProject or codeProject or id',
            });
        }
        const checkCodeProject = await modelWorkProject.find({ memberID: _id, codeProject: codeProject });
        const checkNameProject = await modelWorkProject.find({ memberID: _id, nameProject: nameProject });

        if (checkCodeProject.length > 0 || checkNameProject.length > 0) {
            return res.status(401).json({
                message: 'already exists codeProject or checkNameProject',
            });
        }
        const randomImgProject = (Math.random() * dataImgProject.length) | 0;
        const newProject = new modelWorkProject({
            nameProject: nameProject,
            listWorkID: [],
            managerID: [],
            adminID: { _id },
            memberID: [_id],
            codeProject: codeProject,
            startDay: new Date(),
            endDate: null,
            expected: '',
            describeProject: '',
            projectStatus: 'Chuẩn  bị',
            deleteProject: false,
            imgProject: dataImgProject[randomImgProject],
        });
        await newProject.save();
        return res.status(200).json({
            message: 'Add new successfully',
            data: newProject,
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({
            message: 'Not found',
        });
    }
};
//delete project
const deleteProject = async (req, res) => {
    try {
        const { _id } = req.params;
        if (!_id) {
            return res.status(400).json({
                message: 'is not id',
            });
        }
        const findProjectID = await modelWorkProject.findById(_id);
        if (!findProjectID) {
            return res.status(400).json({
                message: 'user not found',
            });
        }
        if (findProjectID.deleteProject === false) {
            findProjectID.deleteProject = true;
            await findProjectID.save();
        }
        setTimeout(async () => {
            const checkAfterTimeOut = await modelWorkProject.findById(_id);
            if (checkAfterTimeOut.deleteProject === true) {
                await modelWorkProject.findByIdAndDelete(_id);
            }
        }, 3600000);
        return res.status(200).json({
            message: 'Moved to trash',
        });
    } catch (error) {
        console.log(error);
        return res.status(404).json({
            message: 'Can not delete',
        });
    }
};
//restore project
const restoreProject = async (req, res) => {
    try {
        const { _id } = req.params;
        if (!_id) {
            return res.status(404).json({
                message: 'Is nos id or restoreProject',
            });
        }
        const checkId = await modelWorkProject.findById(_id);
        if (!checkId) {
            return res.status(401).json({
                message: 'not found project want restore',
            });
        }
        if (checkId.deleteProject === false) {
            return res.status(404).json({
                message: 'Project no trash can',
            });
        }
        checkId.deleteProject = false;
        await checkId.save();
        return res.status(200).json({
            message: 'restore successfully',
        });
    } catch (error) {
        return res.status(404).json({
            message: 'Can not restore project',
        });
    }
};
//Delete existing members in the project
const DeleteExistingMembers = async (req, res) => {
    try {
        const { _id } = req.params;
        const { _idMemberDelete } = req.body;
        if (!_id || !_idMemberDelete) {
            return res.status(404).json({
                message: 'Is nos id or _idMemberDelete',
            });
        }
        const project = await modelWorkProject.findOneAndUpdate(
            { _id: _id },
            { $pull: { memberID: _idMemberDelete } },
            { new: true },
        );
        return res.status(200).json({
            message: 'Delete Existing Members Successfully',
            date: project,
        });
    } catch (error) {
        return res.status(404).json({
            message: 'error delete existing members',
        });
    }
};

const editProjectInformation = async (req, res) => {
    try {
        const { workProjectID } = req.params;
        const { codeProject, nameProject } = req.body;

        // check id project
        if (!workProjectID) {
            return res.status(404).json({
                message: 'not found id',
            });
        }
        const project = await modelWorkProject.findById({ _id: workProjectID }).populate({
            path: 'listWorkID',
            populate: {
                path: 'creatorID',
            },
        });

        // check project
        if (!project) {
            return res.status(400).json({
                message: 'Project not found',
            });
        }

        // check codeProject
        const checkCodeProject = await modelWorkProject.findOne({
            $and: [{ _id: workProjectID }, { codeProject: codeProject }],
        });

        if (checkCodeProject) {
            return res.status(400).json({
                message: 'codeProject already exists',
            });
        }

        if (codeProject && nameProject) {
            project.codeProject = codeProject;
            project.nameProject = nameProject;
        } else if (codeProject) {
            project.codeProject = codeProject;
        } else if (nameProject) {
            project.nameProject = nameProject;
        }

        await project.save();
        return res.json({
            message: 'Edit project information successfully',
        });
    } catch (error) {
        console.log(error);
        res.status(error.status).json({
            message: "Can't edit project information",
            error,
        });
    }
};
//list member
const ListMember=async(req,res)=>{
    try {
        const { _id } = req.params;
        const { deleteProject} = req.body;
        const page = parseInt(req.query.page) || 1;
        if (!_id || deleteProject === '') {
            return res.status(404).json({
                message: 'not found id or deleteProject',
            });
        }
        const workProject=await modelWorkProject.find({_id:_id,deleteProject:deleteProject})
        .populate({
            path:"memberID",
            select:'-refreshToken -passWord'
        })
        .skip((page-1) * 15)
        .limit(15);
        if (workProject.length===0) {
            return res.status(404).json({
                message: 'project not found',
            });
        }
         const totalMember=workProject.length
        const totalPages=Math.ceil(totalMember / 15);
        return res.status(200).json({
            listMemberProject:workProject,
             page,
             totalPages
             });
    } catch (error) {
       
        return res.status(404).json({
            message: 'project not found',
        });
    }
}
module.exports = {
    DeleteExistingMembers,
    restoreProject,
    getWorkProject,
    getListWork,
    getWorkDetail,
    editProjectInformation,
    deleteProject,
    addNewWork,
    ListMember
};
