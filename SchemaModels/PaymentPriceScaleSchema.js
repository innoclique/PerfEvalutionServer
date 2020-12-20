const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");

//const { boolean } = require("joi");

const PaymentPriceScaleSchema = new mongoose.Schema({

    ClientType: { type: String, required: true },
    Range: { type: String, required: true },
    RangeFrom: { type: Number, required: true, default:0 },
    RangeTo: { type: Number, required: true,default:0},
    Cost: { type: Number, required: true ,default:0},
    Discount: { type: Number ,default:0},
    Tax: { type: Number,default:0 },
});

PaymentPriceScaleSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model("productpricescale", PaymentPriceScaleSchema);