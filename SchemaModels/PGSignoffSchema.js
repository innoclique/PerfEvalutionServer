const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");
const { date, string, boolean, any } = require("joi");
//const { boolean } = require("joi");

const PGsignoffsSchema = new mongoose.Schema({

    EvaluationYear: { type: String, default: new Date().getFullYear() },
    ManagerSignOff:  { type: Object ,default:{submited:false}},
    SignOff:  { type: Object ,default:{submited:false}},
    FinalSignoff:  { type: Boolean ,default:false},
    CreatedOn:  { type: Date,default:Date() },
    Owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    Manager:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    FinalSignoffOn:{ type: Date,default:null },
}
,{usePushEach: true}
);

PGsignoffsSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model("Pgsignoffs", PGsignoffsSchema);