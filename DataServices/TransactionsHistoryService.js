const DbConnection = require("../Config/DbConfig");
require('dotenv').config();
const Mongoose = require("mongoose");
const TransactionHistorySchema = require('../SchemaModels/TransactionHistorySchema');
var logger = require('../logger');
var env = process.env.NODE_ENV || "dev";
var config = require(`../Config/${env}.config`);
const moment = require('moment');

const addTransactionsHistory = async (transactionReq) => {
    const transaction = await TransactionHistorySchema(transactionReq);
    var transactionResponse = await transaction.save();
    if(transactionResponse)
        return true;
    return false;
};

module.exports = {
    AddTransactionsHistory:addTransactionsHistory,
}

