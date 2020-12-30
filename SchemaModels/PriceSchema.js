const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");

const PriceSchema = new mongoose.Schema({
    ClientType: { type: String },
    Range: { type: String },
    RangeFrom: { type: Number },
    RangeTo: { type: Number},
    Cost: { type: Number},
    Discount: { type: Number},
    Tax: { type: Number},
    Type: { type: String},
    UsageType: { type: String },/* Draft,Pending,Success,Complete,Canceled,Rejected */
    
});

PriceSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model("Productpricescale", PriceSchema);