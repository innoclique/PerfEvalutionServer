const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");
const { boolean, number } = require("joi");

const Evalution = new mongoose.Schema({
    Employees:[],
    ActivateKPI:Boolean,
    ActivateActionPlan:Boolean,
    EvaluationForRole:String,
    EvaluationPeriod:String,
    EvaluationDuration:String,
    Model:[],
    PeerRatingNeeded:Boolean,
    Peers:[],
    PeersComptency:[],
    PeersMessage:String,
    DirectReports:[],
    DirectReportCompetency:[],
    DirectReportMessage:String,
    CreatedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User',default:null },
    CreatedDate:Date,
    UpdatedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User',default:null },
    UpdatedDate:Date,
    // tracks: [{
    //     user: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'User',
    //         default:null
    //     },
    //     action: {
    //         type: String,
    //         enum: ['APPROVE', 'REJECT', 'CREATE', 'FORWARD'],
    //         default: 'NEW'
    //     },
    //     comment: String,
    //     created_at: {
    //         type: Date,
    //         default: Date.now
    //     },
    //     updated_at: {
    //         type: Date,
    //         default: Date.now
    //     }
    // }],


    
    
});

Evalution.set('toJSON', { versionKey: false });

module.exports = mongoose.model("Evalution", Evalution);