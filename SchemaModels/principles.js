const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");
const { date, string } = require("joi");

const principles = new mongoose.Schema({

    principle: { type: String, required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },

});

principles.set('toJSON', { versionKey: false });

module.exports = mongoose.model("principles", principles);