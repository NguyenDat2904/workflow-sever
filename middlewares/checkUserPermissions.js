const modelWorkProject = require('../models/modelWorkProject');
const { ADMIN, MANAGER_PROJECT, MEMBER } = require('../configs/permissions');

const checkUserPermissions = (action) => async (req, res, next) => {
    try {
        const { keyProject } = req.params;
        const { _id } = req.user;
        if (!keyProject || !_id) {
            return res.status(404).json({
                message: 'keyProject or _id not found',
            });
        }

        // get project
        const project = await modelWorkProject.findOne({ codeProject: keyProject });
        if (!project) {
            return res.status(404).json({
                message: 'not found project',
            });
        }

        // check user permissions
        if (project.adminID.toString() === _id) {
            if (ADMIN.includes(action)) return next();
        }

        const isManager = project.managerID.find((idUser) => {
            return idUser.toString() === _id;
        });
        if (isManager) {
            if (MANAGER_PROJECT.includes(action)) return next();
        }
        res.status(400).json({
            message: 'the user has no rights',
        });
    } catch (error) {
        console.log(error);
        return res.status(404).json({
            message: 'error check admin',
        });
    }
};
module.exports = checkUserPermissions;
