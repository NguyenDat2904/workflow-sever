const modelProject = require('../models/project');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const handleComment = async (io, socket) => {
    try {
        const { projectID } = socket.handshake.headers;
        const token = socket.handshake.auth.token;
        const project = await modelProject.findById({ _id: projectID });
        if (!project) throw new Error({ message: 'not found project' });

        jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
            if (err) {
                console.log(err);
            } else {
                const isAmin = project.admin === user.email;
                const isManager = project.listManagers.includes(user.email);
                const isMember = project.listMembers.includes(user.email);
                if (isAmin || isManager || isMember) {
                    socket.on('comments', (comment) => {
                        console.log(comment);
                        socket.broadcast.emit('comments', comment);
                    });
                }
            }
        });
    } catch (error) {
        console.log(error);
        // socket.io.on('error', (error) => {
        //     console.log(error);
        //     return error;
        // });
    }
};

module.exports = handleComment;
