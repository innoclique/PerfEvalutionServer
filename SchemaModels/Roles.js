const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");

const RolesSchema = new mongoose.Schema({

    RoleCode: { type: String, required: true },
    RoleName: { type: Date(), required: true },
    RoleLevel: { type: String },    
    CreatedOn:  { type: Date() },
    CreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    UpdatedOn:  { type: Date() },
    UpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

RolesSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model("Roles", RolesSchema);