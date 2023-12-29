const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ModelListWork = new Schema(
    {
        nameWork: { type: String },
        jobCode: { type: String },
        typeOfWork: { type: String },
        priority: { type: String },
        dateCreated: { type: Date },
        deadline: { type: Date },
        actualEndDate: { type: Date },
        creatorID: [{ type: mongoose.Types.ObjectId, ref: 'users' }],
        workDetrailID: [{ type: mongoose.Types.ObjectId, ref: 'workdetails' }],
        implementerMenberID: [{ type: String }],
        sprint:{type:String},
        statusWork:{type:String},
        description:{type:String}
    },
    { timestamps: true },
    { collection: 'listworks' },
);
module.exports = mongoose.model('listworks', ModelListWork);
