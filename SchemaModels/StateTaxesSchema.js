const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");

//const { boolean } = require("joi");

const StateTaxesSchema = new mongoose.Schema({

    name: { type: String, required: true },
    country_id: { type: Number, required: true },
    country_code: { type: String, required: true, default:0 },
    state_code: { type: String, required: true },
    tax: { type: Number, required: true },
    
});

StateTaxesSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model("Statetaxe", StateTaxesSchema);