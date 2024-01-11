const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const IssueModel = new Schema(
    {
        projectID: { type: mongoose.Types.ObjectId, ref: 'projects' },
        issueType: { type: String, enum: ['EPIC', 'TASK', 'USER_STORY', 'BUG'], default: 'USER_STORY' },
        status: { type: String,enum:['TODO','INPROGRESS','REVIEW','DONE'],default:'TODO' },
        summary: { type: String },
        description: { type: String },
        assignee: { type: String, ref: 'users' },
        reporter: { type: mongoose.Types.ObjectId, ref: 'users' },
        priority: { type: String, enum: ['Highest', 'High', 'Low', 'Lowest', 'Medium'], default: 'Medium' },
        sprint: { type: String, ref: 'sprints' },
        storyPointEstimate: { type: Number },
        startDate: { type: Date },
        dueDate: { type: Date },
        parentIssue: { type: mongoose.Types.ObjectId, ref: 'issues' },
        name:{type:String}
    },
    { timestamps: true },
    { collection: 'issues' },
);
module.exports = mongoose.model('issues', IssueModel);
