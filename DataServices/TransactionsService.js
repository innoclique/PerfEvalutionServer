const DbConnection = require("../Config/DbConfig");
require('dotenv').config();
const Mongoose = require("mongoose");
const TransactionSchema = require('../SchemaModels/TransactionSchema');
const {SavePaymentRelease} = require('../DataServices/PaymentConfigService');
var logger = require('../logger');
var env = process.env.NODE_ENV || "dev";
var config = require(`../Config/${env}.config`);
const moment = require('moment');

const addTransactions = async (transactionReq) => {
    const transaction = await TransactionSchema(transactionReq);
    var transactionResponse = await transaction.save();
    let paymentRelease={
        paymentreleaseId:transactionReq.PaymentReleaseId,
        Status:'Complete',
    }
    await SavePaymentRelease(paymentRelease);
    return transactionResponse;
};

const findAllTransactionsByOrgId = async (transactionReq) => {
    console.log("inside:findAllTransactionsByOrgId")
    const transactionList = await TransactionSchema.find(transactionReq).sort({_id:-1}).populate("Organization Paymentrelease")
    return transactionList;
};

module.exports = {
    AddTransactions:addTransactions,
    FindAllTransactionsByOrgId:findAllTransactionsByOrgId
}

