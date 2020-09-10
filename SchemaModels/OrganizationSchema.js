const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");


const OrganizationSchema = new mongoose.Schema({
    Name: { type: String, required: true, unique: true },
    Industry :{ type: String, required: true },
    Email: { type: String, required: true },
    Phone: { type: String, required: true },
    Address:{ type: String, required: true },
    State:{ type: String, required: true },
    City:{ type: String, required: true },
    Country:{ type: String, required: true },
    ZipCode:{ type: String, required: true },
    UsageType:{ type: String, required: true },
    IsAtive:{ type: Boolean, required: true },
    Role:{ type: String, required: true },
    OrganizationType:{ type: String, required: true },
    UsageCount:{ type: Number, required: true },
    ContactName:{ type: String, required: true },
    ContactEmail:{ type: String, required: true },
    ContactPhone:{ type: String, required: true },
    ContactPersonSameAsAdmin:{ type: Boolean, required: true },
    AdminName:{ type: String, required: true },
    AdminEmail:{ type: String, required: true },
    AdminPhone:{ type: String, required: true },
    EvaluationPeriod:{ type: String, required: true },
    EvaluationDuration:{ type: String, required: true },
    MaxEvaluationDays:{ type: String, required: true },
    CreatedOn:{type:Date,default: Date() },
    CreatedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    UpdatedOn:{type:Date,default: Date() },
    UpdatedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

OrganizationSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model("Organization", OrganizationSchema);