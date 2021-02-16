const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");

const RsaAccountDetailsSchema = new mongoose.Schema({
    Organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    UsageType: { type: String},
    RangeId : { type: mongoose.Schema.Types.ObjectId, ref: 'Productpricescale', default: null  },
    TotalUsageType: { type: Number,default:0 },
    Balance: { type: Number,default:0 },
});

RsaAccountDetailsSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model("RsaAccountDetails", RsaAccountDetailsSchema);