const Express = require("express");
const { string } = require("joi");
require('dotenv').config();
const mongoose = require("mongoose");


const OrganizationSchema = new mongoose.Schema({
    Name: { type: String, required: false, unique: false },
    Industry :{ type: String, required: false },
    Email: { type: String, required: false },
    Phone: { type: String, required: false },
    PhoneExt:{ type: String},
    Address:{ type: String, required: false },
    State:{ type: String, required: false },
    City:{ type: String, required: false },
    Country:{ type: String, required: false },
    ZipCode:{ type: String, required: false  },
    UsageType:{ type: String },
    IsActive:{ type: Boolean, required: false },    
    ClientType:{ type: String, required: false },
    UsageCount:{ type: String},
    LicenceTypeCount:{ type: String,default:"0"}, // Transiant purpost
    EmpTypeCount:{ type: String,default:"0"}, // Transiant purpost
    ContactPersonEmail:{ type: String, required: false },
    ContactPersonFirstName:{ type: String, required: false },
    ContactPersonLastName:{ type: String, required: false },
    ContactPersonMiddleName:{ type: String },
    ContactPersonPhone:{ type: String, required: false },
    SameAsAdmin:{ type: Boolean, required: false },
    Admin:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    AdminEmail:{ type: String, required: false },
    AdminFirstName:{ type: String, required: false },
    AdminMiddleName:{ type: String },
    AdminLastName:{ type: String, required: false },
    AdminPhone:{ type: String, required: false },
    CoachingReminder:{ type: String },
    EvaluationModels:[],
    EvaluationPeriod:{ type: String },
    EvaluationDuration:{ type: String, default:'12 Months' },
    
    EmployeeBufferCount:{ type: String},
    DownloadBufferDays:{ type: String},
    CreatedOn:{type:Date,default: Date() },
    CreatedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User',default:null },
    UpdatedOn:{type:Date,default: Date() },
    UpdatedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User',default:null },
    StartMonth:{type:String},
    EndMonth:{type:String},
    IsDraft:Boolean,
    Competencies:[],
    ParentOrganization:{ type: mongoose.Schema.Types.ObjectId, ref: 'Organization',default:null },
    Range:{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductPriceScale',default:null },
    IsProfileUpToDate: { type: Boolean, default: true },
    profile:{type:Object,default:null}
//     countryCode:{type:String}
});

OrganizationSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model("Organization", OrganizationSchema);
