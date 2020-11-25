const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");
//const { boolean } = require("joi");

const StrengthSchema = new mongoose.Schema({
    Strength: { type: String, required: true },
    // Leverage: { type: String, required: true, unique: true },
    Leverage: { type: String },
    TeamBenifit: { type: String },
    SelfBenifit: { type: String },
    Status:{type:String},
    Employee:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ProgressComments:{ type: String },
    ManagerComments:{ type: String },
    IsDraft:{ type: Boolean, default:false },
    IsActive: { type: Boolean, default: true },
    IsStrengthSubmited:{ type: Boolean, default:false },
    ManagerSignOff:  { type: Object ,default:{submited:false}},
    ViewedByEmpOn:{ type: String },
    ViewedByManagerOn:{ type: String },
    CreatedYear:{ type: String },
    CreatedOn:  { type: Date,default:Date() },
    UpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    Owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ManagerId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    UpdatedOn:  { type: Date ,default:Date()},
});

StrengthSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model("Strength", StrengthSchema);