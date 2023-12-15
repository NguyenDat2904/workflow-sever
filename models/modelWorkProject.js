const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ModelWorkProject = new Schema(
    {
        nameProject: { type: String },
        listWorkID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'listworks' }],
        memberID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
        codeProject: { type: String },
        
    },
    { timestamps: true },
    { collection: 'workprojects' },
);
module.exports = mongoose.model('workprojects', ModelWorkProject);
