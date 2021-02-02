const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");


const CompetencyMapSchema = new mongoose.Schema({
    _id: { type: String, required: true, unique: true },  
    Name: { type: String, required: true },    
    IsActive:Boolean,
    Questions:[{type: mongoose.Schema.Types.ObjectId,default:null}],
    CreatedOn:{type:Date,default: Date() },
    CreatedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User',default:null },
    UpdatedOn:{type:Date,default: Date() },
    UpdatedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User',default:null },
    Organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
    
});

CompetencyMapSchema.set('toJSON', { versionKey: false });
module.exports = mongoose.model("competenciesMappings", CompetencyMapSchema);