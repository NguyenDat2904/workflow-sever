const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const IssueModel = new Schema(
    {
        nameWork: { type: String },
        jobCode: { type: String },
        issueType: { type: String,enum:['EPIC','TASK','USER_STORY','BUG'] ,default:'USER_STORY'},
        priority: { type: String },
        dateCreated: { type: Date },
        deadline: { type: Date },
        actualEndDate: { type: Date },
        creatorID: [{ type: mongoose.Types.ObjectId, ref: 'users' }],
        implementerMenberID: [{ type: String }],
        sprint:{type:String},
        status:{type:String},
        description:{type:String},
        parentIssue:{type:String}
    },
    { timestamps: true },
    { collection: 'listworks' },
);
module.exports = mongoose.model('listworks', IssueModel);
