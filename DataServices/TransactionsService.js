const DbConnection = require("../Config/DbConfig");
require('dotenv').config();
const Mongoose = require("mongoose");
const TransactionSchema = require('../SchemaModels/TransactionSchema');
var logger = require('../logger');
var env = process.env.NODE_ENV || "dev";
var config = require(`../Config/${env}.config`);
const moment = require('moment');

const addTransactions = async (transactionReq) => {
    const transaction = await TransactionSchema(transactionReq);
    var transactionResponse = await transaction.save();
    return transactionResponse;
};

module.exports = {
    AddTransactions:addTransactions,
}

