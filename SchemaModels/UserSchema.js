const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");
const { boolean } = require("joi");

const UserSchema = new mongoose.Schema({

    UserName: { type: String, required: true, unique: true },
    Email: { type: String, required: true, unique: true },
    Password: { type: String, required: true },
    RefreshToken: { type: String },
    Role: { type: String },
    PhoneNumber: { type: String, required: true },
    Address: { type: String, required: true },
    FirstName: { type: String, required: true },
    LastName: { type: String, required: true },
    DateCreated: { type: String, required: true, default: Date() },
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
    ParentUser:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    TnCAccepted:{type:Boolean},
    TnCAcceptedOn:{type:Date,default: Date() },
});

UserSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model("User", UserSchema);