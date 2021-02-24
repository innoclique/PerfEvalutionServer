const Express = require("express");
const { string } = require("joi");
require('dotenv').config();
const mongoose = require("mongoose");

const UserActivity = new mongoose.Schema({
    email: { type: String, required: true },
    activity: { type: String, required: true },
    url: { type: String },
    createdOn: { type: Date },
});

UserActivity.set('toJSON', { versionKey: false });

module.exports = mongoose.model("UserActivity", UserActivity);