const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");
const { date, string } = require("joi");
//const { boolean } = require("joi");

const AccomplishmentsSchema = new mongoose.Schema({

    Accomplishment: { type: String, required: true },
    CompletionDate: { type: Date },
    Comments: { type: String },
    IsActive: { type: Boolean, default: true },
    IsDraft:{ type: Boolean, default:false },
    ShowToManager: { type: Boolean },
    // Employee:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    CreatedOn:  { type: Date,default:Date() },
    CreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    Owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ManagerId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    EvaluationYear: { type: String, default: new Date().getFullYear() },
    UpdatedOn:  { type: Date ,default:Date()},
    UpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
});

AccomplishmentsSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model("Accomplishments", AccomplishmentsSchema);