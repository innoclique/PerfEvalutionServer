const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");
const { date, string, boolean } = require("joi");
//const { boolean } = require("joi");

const KpiSchema = new mongoose.Schema({

    Kpi: { type: String, required: true },
   MeasurementCriteria: [{ measureId:{ type: mongoose.Schema.Types.ObjectId, ref:'MeasurementCriterias',required: true} }],
    TargetCompletionDate: { type: Date },
    Score: {type: String, required: true},
    YECommManager:{ type: String },
    ManagerScore: {type: String, required: true},
    YearEndComments:{ type: String },
    Weighting:{ type: Number },
    Signoff:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    Status:{ type: String, required: true },
    IsDraft:{ type: Boolean, required: true },
    IsActive: { type: Boolean, default: true },
    IsSubmitedKPIs:{ type: Boolean, default:false },
    CreatedOn:  { type: Date,default:Date() },
    EmpFTSubmitedOn:  { type: Date },
    EmpFTViewOn:  { type: Date },
    ManagerFTSubmitedOn:  { type: Date },
    ManagerSignOff:  { type: Object },
    CreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    Owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ManagerId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    UpdatedOn:  { type: Date ,default:Date()},
    UpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}
,{usePushEach: true}
);

KpiSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model("Kpi", KpiSchema);