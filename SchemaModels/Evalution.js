const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");
const { boolean } = require("joi");

const Evalution = new mongoose.Schema({
    
    Period:String,
    RatingSale:[],
    RatingList:[],
    StartDate:Date,
    EndDate:Date,
    CreatedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    CreatedDate:Date,
    UpdatedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    UpdatedDate:Date,
    tracks: [{
        actorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        action: {
            type: String,
            enum: ['APPROVE', 'REJECT', 'CREATE', 'FORWARD'],
            default: 'NEW'
        },
        comment: String,
        created_at: {
            type: Date,
            default: Date.now
        },
        updated_at: {
            type: Date,
            default: Date.now
        }
    }],


    
    
});

Evalution.set('toJSON', { versionKey: false });

module.exports = mongoose.model("Evalution", Evalution);