const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");
const { date, string, boolean, any } = require("joi");
//const { boolean } = require("joi");

const KpiSchema = new mongoose.Schema({

    Kpi: { type: String, required: true },
   MeasurementCriteria: [{ measureId:{ type: mongoose.Schema.Types.ObjectId, ref:'MeasurementCriterias',required: true} }],
    TargetCompletionDate: { type: Date },
    Score: {type: String},
    YECommManager:{ type: String },
    ManagerComments:{ type: String },
    ManagerScore: {type: String,default:""},
    CoachingReminder: {type: String},
    YearEndComments:{ type: String },
    Weighting:{ type: Number },
    Signoff:{ type: Object},
    EvaluationId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Evalution' },
    EvaluationYear: { type: String, default: new Date().getFullYear() },
    Status:{ type: String},
    IsDraft:{ type: Boolean, default:false },
    IsDraftByManager:{ type: Boolean,default:false },
    IsActive: { type: Boolean, default: true },
    IsSubmitedKPIs:{ type: Boolean, default:false },
    ViewedByEmpOn:{ type: String },
    ViewedByManagerOn:{ type: String },
    CreatedOn:  { type: Date,default:Date() },
    EmpFTSubmitedOn:  { type: Date },
    EmpFTViewOn:  { type: Date },
    ManagerFTSubmitedOn:  { type: Date },
    ManagerSignOff:  { type: Object ,default:{submited:false}},
    CreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    Owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ManagerId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    UpdatedOn:  { type: Date ,default:Date()},
    tracks: [{
        actorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        action: {
            type: String,
        },
        comment: String,
        CreatedOn: {
            type: Date
        }
       
    }],
    UpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isFinalSignoff: { type: Boolean, default:false },
}
,{usePushEach: true}
);

KpiSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model("Kpi", KpiSchema);