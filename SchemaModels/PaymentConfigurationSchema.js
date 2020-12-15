const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");

//const { boolean } = require("joi");

const PaymentConfigSchema = new mongoose.Schema({

    PaymentSettingType: { type: String, required: true },
    PaymentUserType: { type: String, required: true },
    PaymentDuration: { type: Number, required: true, default:0 },
    RegularCostRange: { type: String, required: true },
    RegularCost: { type: Number, required: true },
    RegularCostAnualDiscount: { type: Number ,default:0},
    RegularCostAnualC2S: { type: Number,default:0 },
    RegularCostAnualDiscountC2S: { type: Number, default:0 },
    Organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    Reseller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    CreatedOn:{type:Date,default: Date() },
    UpdatedOn:{type:Date,default: Date() },
});

PaymentConfigSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model("paymentconfigurations", PaymentConfigSchema);