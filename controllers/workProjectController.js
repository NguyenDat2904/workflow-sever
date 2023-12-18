const modelWorkProject = require('../models/modelWorkProject');
const modelListWork = require('../models/modalListWorks');
const modalWorkDetail = require('../models/modelWorkDetail');

//lấy project
const getWorkProject = async (req, res) => {
    try {
        const { _id } = req.params;
        const { deleteProject } = req.body;
        if (!_id || deleteProject === '') {
            res.status(404).json({
                message: 'not found id or deleteProject',
            });
        }
        const workProject = await modelWorkProject
            .find({ memberID: _id })
            .populate({
                path: 'listWorkID',
                populate: {
                    path: 'creatorID',
                },
            })
            .populate({
                path: 'listWorkID',
                populate: {
                    path: 'creatorID',
                },
            });
        if (!workProject) {
            return res.status(404).json({
                message: 'project not found',
            });
        }
        res.status(200).json(workProject);
    } catch (error) {
        res.status(404).json({
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
        const checkProject = await modelWorkProject
            .findOne({ nameProject: nameProject })
            .populate({
                path: 'listWorkID',
                populate: {
                    path: 'creatorID',
                },
            })
            .populate({
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
        console.log(nameProject, codeProject);
        if (!_id || !nameProject || !codeProject) {
            return res.status(400).json({
                message: 'is not nameProject or codeProject or id',
            });
        }
        const checkCodeProject = await modelWorkProject.findOne({ codeProject: codeProject });
        if (checkCodeProject) {
            return res.status(401).json({
                message: 'already exists codeProject',
            });
        }
        const newProject = new modelWorkProject({
            nameProject: nameProject,
            listWorkID: [],
            managerID: [],
            adminID: [_id],
            memberID: [_id],
            codeProject: codeProject,
            startDay: new Date(),
            endDate: null,
            expected: '',
            describeProject: '',
            projectStatus: 'Chuẩn  bị',
            deleteProject: false,
        });
        await newProject.save();
        const data = await modelWorkProject.find({});
        return res.status(200).json({
            message: 'Add new successfully',
            data: data,
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

const editProjectInformation = async (req, res) => {
    try {
        const { _id } = req.params;
        const { codeProject, nameProject } = req.body;

        // check id project
        if (!_id) {
            return res.status(404).json({
                message: 'not found id',
            });
        }
        const project = await modelWorkProject.findById({ _id: _id }).populate({
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
        if (project.codeProject === codeProject) {
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

module.exports = {
    restoreProject,
    getWorkProject,
    getListWork,
    getWorkDetail,
    editProjectInformation,
    deleteProject,
    addNewWork,
};
