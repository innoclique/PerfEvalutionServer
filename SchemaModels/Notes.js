const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");

//const { boolean } = require("joi");

const NotesSchema = new mongoose.Schema({

   

    Note: { type: String, required: true },
    CompletionDate: { type: Date },
   
    IsActive: { type: Boolean, default: true },
    IsDraft:{ type: Boolean, default:false },
    CreatedOn:  { type: Date,default:Date() },
    CreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    Owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    DiscussedWith:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
            type: Date,
            default: Date.now
        }
       
    }],


});

NotesSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model("Notes", NotesSchema);