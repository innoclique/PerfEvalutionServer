const Express = require("express");

require('dotenv').config();
const mongoose = require("mongoose");


const KpiForm = new mongoose.Schema({

    EmployeeId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    CreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    CreatedDate: { type: Date, default: Date() },
    UpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    UpdatedDate: { type: Date, default: Date() },
    Company: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
    EvaluationYear: { type: String, default: new Date().getFullYear() },
    IsDraft:{type:Boolean,default:false}
});

KpiForm.set('toJSON', { versionKey: false });

module.exports = mongoose.model("kpiform", KpiForm);