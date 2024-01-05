const modelWorkProject = require('../models/project');
const { ADMIN, MANAGER_PROJECT, MEMBER } = require('../configs/permissions');

const checkUserPermissions = (action) => async (req, res, next) => {
    try {
        const { keyProject } = req.params;
        const { email } = req.user;
        if (!keyProject || !email) {
            return res.status(404).json({
                message: 'keyProject or email not found',
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
        if (project.listManagers.includes(email) && !MANAGER_PROJECT.includes(action)) {
            return res.status(403).json({
                message: 'manager has not rights',
            });
        }

        if (project.listMembers.includes(email) && !MEMBER.includes(action)) {
            return res.status(403).json({
                message: 'member has not rights',
            });
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: error.message,
        });
    }
};
module.exports = checkUserPermissions;
