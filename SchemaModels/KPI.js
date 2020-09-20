const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");
const { date, string, boolean } = require("joi");
//const { boolean } = require("joi");

const KpiSchema = new mongoose.Schema({

    Kpi: { type: String, required: true },
    MeasurementCriteria: { type: String, required: true, unique: true },
    TargetCompletionDate: { type: Date },
    Score: { type: Boolean },
    YearEndComments:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    Weighting:{ type: Number, required: true },
    Signoff:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    Status:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    IsDraft:{ type: Boolean, required: true },
    CreatedOn:  { type: Date },
    CreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    UpdatedOn:  { type: Date },
    UpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

KpiSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model("Kpi", KpiSchema);