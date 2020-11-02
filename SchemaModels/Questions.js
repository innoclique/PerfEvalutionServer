const Express = require("express");
const { number } = require("joi");
require('dotenv').config();
const mongoose = require("mongoose");


const QuestionSchema = new mongoose.Schema({
    Question: { type: String },    
    JobLevel:{type:String},
    Rating:[],
    IsActive:Boolean,
    CreatedOn:{type:Date,default: Date() },
    CreatedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User',default:null },
    UpdatedOn:{type:Date,default: Date() },
    UpdatedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User',default:null } ,
    SelectedRating:Number
});

QuestionSchema.set('toJSON', { versionKey: false });
module.exports = mongoose.model("questions", QuestionSchema);