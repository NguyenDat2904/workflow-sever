const modelWorkProject = require('../models/modelWorkProject');
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
        if (project.userManagers.includes(email) && !MANAGER_PROJECT.includes(action)) {
            console.log('manager');
            return res.status(403).json({
                message: 'the user has not rights',
            });
        }

        if (project.userMembers.includes(email) && !MEMBER.includes(action)) {
            console.log('member');
            return res.status(403).json({
                message: 'the user has not rights',
            });
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(error.status).json({
            error,
        });
    }
};
module.exports = checkUserPermissions;
