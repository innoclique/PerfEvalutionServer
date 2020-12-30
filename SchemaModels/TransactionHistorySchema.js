const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");

const TransactionHistoriesSchema = new mongoose.Schema({
    UserId:{type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    PaymentReleaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentRelease', default: null },
    Amount: { type: Number,default:0 },
    CreatedOn:{type:Date,default:new Date()},
    UpdatedOn:{type:Date,default:new Date()},
    TransactionResponse:{type:Object},
    Organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
});

TransactionHistoriesSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model("TransactionHistorie", TransactionHistoriesSchema);