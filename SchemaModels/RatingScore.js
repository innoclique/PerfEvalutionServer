const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");
const { date, string } = require("joi");

const RatingScore = new mongoose.Schema({

    Text: { type: String, required: true },
    value: { type: String, required: true },
    scale: { type: String, required: true },
    definition: { type: String, required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
    CreatedOn: { type: Date },
    CreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    UpdatedOn: { type: Date },
    UpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

RatingScore.set('toJSON', { versionKey: false });

module.exports = mongoose.model("RatingScores", RatingScore);
