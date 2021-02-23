const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");
const { date, string } = require("joi");

const joblevelconfigs = new mongoose.Schema({

    jobLevelName: { type: String, required: true },
    objectives: { type: String, required: true },
    coreResponsibilities: { type: String, required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },

});

joblevelconfigs.set('toJSON', { versionKey: false });

module.exports = mongoose.model("joblevelconfigs", joblevelconfigs);