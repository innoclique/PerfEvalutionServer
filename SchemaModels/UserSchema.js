const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");
const { boolean, string } = require("joi");

const UserSchema = new mongoose.Schema({
    Email: { type: String, unique: true },
    Password: { type: String,select:false },
    RefreshToken: { type: String },
    Role: { type: String },
    SelectedRoles: [],
    ApplicationRole: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Roles' }],   
    PhoneNumber: { type: String },
    Address: { type: String },
    State:{ type: String },
    City:{ type: String },
    Country:{ type: String },
    ZipCode:{ type: String },
    Title:{ type: String },
    MiddleName:{type:String},
    FirstName: { type: String },
    LastName: { type: String },
    ExtNumber: { type: String },
      AltPhoneNumber: { type: String },
      MiddleName: { type: String },
      MobileNumber: { type: String },
    DateCreated: { type: String, default: Date() },
    JoiningDate: { type: String, default: Date() },
    RoleEffFrom: { type: String },
    UpdatedDate: { type: String },
    LastLogin: { type: String },
    IsLoggedIn: {
        type: Boolean,
        default: false
    },
    IsPswChangedOnFirstLogin: {
        type: Boolean,
        default: false
    },
    PswUpdatedOn: { type: String },
    IsActive: { type: Boolean, default: false },
    IsDraft:{ type: Boolean, default:false },
    IsSubmit: { type: Boolean, default: false },
    ParentUser:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    JobRole:{type: String },
    JobLevel:{ type: mongoose.Schema.Types.ObjectId, ref: 'JobLevels' },
    Department:{type: String },
    TnCAccepted:{type:Boolean},
    TnCAcceptedOn:{type:Date,default: Date() },
    CreatedOn:{type:Date,default: Date() },
    CreatedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    Manager:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    Organization:{ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    DirectReports:{ type: mongoose.Schema.Types.ObjectId,default:'5f60f96d08967f4688416a00', ref: 'User' },
    CopiesTo:{ type: mongoose.Schema.Types.ObjectId,default:'5f60f96d08967f4688416a00', ref: 'User' },
    ThirdSignatory:{ type: mongoose.Schema.Types.ObjectId,default:'5f60f96d08967f4688416a00', ref: 'User' },
    UpdatedOn:{type:Date,default: Date() },
    UpdatedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    Permissions:[],
    HasActiveEvaluation:{type:String,default:"No"}
},
{
    usePushEach: true
}
);

UserSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model("User", UserSchema);