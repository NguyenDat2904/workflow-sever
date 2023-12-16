const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ModelWorkProject = new Schema(
    {
        nameProject: { type: String },
        listWorkID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'listworks' }],
        memberID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
        managerID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
        adminID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
        codeProject:{type:String},
        managerID:[{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
        adminID:[{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
        startDay:{type:Date},
        endDate:{type:Date},
        expected:{type:String},
        describeProject:{type:String},
        projectStatus:{type:String},
        deleteProject:{type:Boolean}
    },
    { timestamps: true },
    { collection: 'workprojects' },
);
module.exports = mongoose.model('workprojects', ModelWorkProject);
