const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");
const { date, string, boolean } = require("joi");
//const { boolean } = require("joi");

const DevGoalSchema = new mongoose.Schema({

    DevGoal: { type: String, required: true },
    Kpi: { type: mongoose.Schema.Types.ObjectId, ref: 'Kpi' },
    DesiredOutcomes:String,
    MakePrivate:String,
    GoalActionItems: [{
        ActionStep:String,
        ProgressIndicators:String,
        TargetDate:Date,
        Status :String,
        Barriers:String,
        OtherParticipants:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }

           }
        
    ],

   
    ManagerComments:{ type: String },
    Signoff:{ type: Object},
    EvaluationId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Evalution' },
    // Status:{ type: String},
    IsDraft:{ type: Boolean, default:false },
    IsDraftByManager:{ type: Boolean,default:false },
    IsActive: { type: Boolean, default: true },
    IsGoalSubmited:{ type: Boolean, default:false },
    ViewedByEmpOn:{ type: String },
    CreatedOn:  { type: Date,default:Date() },
    EmpFTSubmitedOn:  { type: Date },
    EmpFTViewOn:  { type: Date },
    ManagerFTSubmitedOn:  { type: Date },
    ManagerSignOff:  { type: Object },
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
            type: Date,
            default: Date.now
        }
       
    }],
    UpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}
,{usePushEach: true}
);

DevGoalSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model("DevGoals", DevGoalSchema);