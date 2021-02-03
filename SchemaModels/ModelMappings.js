const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");


const ModelMappingSchema = new mongoose.Schema({
    Name: { type: String, required: true, unique: true },
    Industry :[],
    JobRole:[],
    JobLevel:[],
    IsActive:Boolean,
    CreatedOn:{type:Date,default: Date() },
    CreatedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User',default:null },
    UpdatedOn:{type:Date,default: Date() },
    UpdatedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User',default:null },    
    IsDraft:Boolean,
    Competencies:[ {type: String} ],
    Organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
});

ModelMappingSchema.set('toJSON', { versionKey: false });
module.exports = mongoose.model("modelsMappings", ModelMappingSchema);