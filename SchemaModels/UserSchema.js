const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");
const { boolean } = require("joi");

const UserSchema = new mongoose.Schema({
    Email: { type: String, required: true, unique: true },
    Password: { type: String, required: true },
    RefreshToken: { type: String },
    Role: { type: String },
    ApplicationRole: { type: String },
   
    PhoneNumber: { type: String, required: true },
    Address: { type: String, required: true },
    State:{ type: String, required: true },
    City:{ type: String, required: true },
    Country:{ type: String, required: true },
    ZipCode:{ type: String, required: true },
    Title:{ type: String },
    MiddleName:{type:String},
    FirstName: { type: String, required: true },
    LastName: { type: String, required: true },
    ExtNumber: { type: String },
      AltPhoneNumber: { type: String },
      MiddleName: { type: String },
      MobileNumber: { type: String },
    DateCreated: { type: String, required: true, default: Date() },
    JoiningDate: { type: String, required: true, default: Date() },
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
    IsSubmit: { type: Boolean, default: false },
    ParentUser:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    JobRole:{ type: mongoose.Schema.Types.ObjectId, ref: 'jobrole' },
    JobLevel:{ type: mongoose.Schema.Types.ObjectId, ref: 'joblevel' },
    Department:{ type: mongoose.Schema.Types.ObjectId, ref: 'Departments' },
    ApplicationRole:{ type: mongoose.Schema.Types.ObjectId, ref: 'ApplicationRoles' },
    TnCAccepted:{type:Boolean},
    TnCAcceptedOn:{type:Date,default: Date() },
    CreatedOn:{type:Date,default: Date() },
    CreatedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    DirectReports:{ type: mongoose.Schema.Types.ObjectId,default:'5f60f96d08967f4688416a00', ref: 'User' },
    CopiesTo:{ type: mongoose.Schema.Types.ObjectId,default:'5f60f96d08967f4688416a00', ref: 'User' },
    ThirdSignatory:{ type: mongoose.Schema.Types.ObjectId,default:'5f60f96d08967f4688416a00', ref: 'User' },
    UpdatedOn:{type:Date,default: Date() },
    UpdatedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    Permissions:[]
});

UserSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model("User", UserSchema);