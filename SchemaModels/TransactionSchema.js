const Express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");

const TransactionsSchema = new mongoose.Schema({
    UserId:{type: mongoose.Schema.Types.ObjectId, ref: 'PaymentReleases', default: null },
    PaymentReleaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentReleases', default: null },
    Status: { type: String},
    Amount: { type: Number,default:0 },
    CreatedOn:{type:Date,default:new Date()},
    UpdatedOn:{type:Date,default:new Date()},
    TransactionResponse:{type:Object},
    Organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
});

TransactionsSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model("Transactions", TransactionsSchema);