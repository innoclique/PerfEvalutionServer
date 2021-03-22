const Express = require("express");
const { string } = require("joi");
require('dotenv').config();
const mongoose = require("mongoose");


const Evalution = new mongoose.Schema({
    Employees: [{
        Status:{ type: mongoose.Schema.Types.ObjectId, ref: 'statuses', default: null },
        isEvaluationCompleted:{ type:Boolean,default:false },
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        Manager:{
            Id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
            Competencies: [],
            CompetencyComments: { type: String, default: "" },
            CompetencyOverallRating: { type: String, default: "" },
            CompetencySubmitted: {type:Boolean,default:false},
            CompetencySubmittedOn: { type: Date, default: Date() }
        },
        Peers: [
            {
                EmployeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
                displayTemplate: String,
                PeersCompetencyList: [],
                PeersCompetencyMessage: String,
                QnA: [],
                peerCompetenceMapping:{},
                CompetencyComments: { type: String, default: "" },
                CompetencyOverallRating: { type: Number, default: 0 },
                CompetencySubmitted: {type:Boolean,default:false},
                CompetencySubmittedOn: { type: Date, default: Date() }
            }],
        peerCompetenceMapping:[],
        ActivationDate:{ type: Date},
        DirectReportees: [
            {
                EmployeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
                displayTemplate: String,
                DirectReporteeComptencyMessage: { type: String, default: "" },
                DirectReporteeCompetencyList: [],
                DirectReporteeCompetencyMessage: String,
                QnA: [],
                drCompetenceMapping:{},
                CompetencyComments: { type: String, default: "" },
                CompetencyOverallRating: { type: Number, default: 0 },
                CompetencySubmitted: {type:Boolean,default:false},
                CompetencySubmittedOn: { type: Date, default: Date() }
            }
        ],
        drCompetenceMapping:[],
        Model: { type: mongoose.Schema.Types.ObjectId, ref: 'modelsMappings', default: null },
        Competencies: [],
        CompetencyComments: { type: String, default: "" },
        CompetencyOverallRating: { type: String, default: "" },
        CompetencySubmitted: {type:Boolean,default:false},
        CompetencySubmittedOn: { type: Date, default: Date() },
        FinalRating: {
            Self: {
                YearEndComments: { type: String, default: "" },
                YearEndRating: { type: String, default: "" },
                SubmittedOn: { type: Date,default:null },
                RevComments: { type: String, default: "" },
                IsSubmitted: { type: Boolean, default: false },
                SignOff:{ type: String, default: "" }
            },
            Manager: {
                YearEndComments: { type: String, default: "" },
                YearEndRating: { type: String, default: "" },
                RevComments: { type: String, default: "" },
                SubmittedOn: { type: Date,default:null },
                IsSubmitted: { type: Boolean, default: false },
                SignOff:{ type: String, default: "" },
            },
            ThirdSignatory: {
                YearEndComments: { type: String, default: "" },
                RevComments: { type: String, default: "" },
                YearEndRating: { type: String, default: "" },
                SubmittedOn: { type: Date ,default:null},
                IsSubmitted: { type: Boolean, default: false },
                SignOff:{ type: String, default: "" },
                ReqRevision: { type: Boolean, default: false }
            },
            Status: { type: String, default: "" },
            FRReqRevision: { type: Boolean, default: false },
            UpdatedOn: { type: Date, default: Date() }
        },
        InitiatedFor: { 
            type: String,             
            enum : ['KPI', 'Evaluation'],             
            default: 'KPI'             
            }
    }
    ],
    ActivateKPI: Boolean,
    ActivateActionPlan: Boolean,
    EvaluationForRole: String,
    EvaluationPeriod: String,
    EvaluationDuration: String,
    EvaluationType:String,
    CreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    CreatedDate: { type: Date },
    UpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    UpdatedDate: { type: Date, default: Date() },
    Company: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
    EvaluationYear: { type: String, default: new Date().getFullYear() },


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

KPIFor:String,
Department:String,
IsDraft:{type:Boolean,default:false},
status:{type:String,default:"Active"},
    
    
});

Evalution.set('toJSON', { versionKey: false });

module.exports = mongoose.model("Evalution", Evalution);
