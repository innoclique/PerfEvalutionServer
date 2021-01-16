const DbConnection = require("../Config/DbConfig");
require('dotenv').config();
const Mongoose = require("mongoose");
const TransactionSchema = require('../SchemaModels/TransactionSchema');
const PaymentReleaseSchema = require('../SchemaModels/PaymentReleaseSchema');
const SubscriptionsSchema = require('../SchemaModels/SubscriptionsSchema');
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
    await addSubscription(transactionReq.PaymentReleaseId);
    return transactionResponse;
};

const addSubscription = async(paymentreleaseId) => {
    console.log("Inside:addSubscription");
    console.log(`paymentreleaseId : ${paymentreleaseId}`);
    let paymentReleaseDomain = await PaymentReleaseSchema.findOne({_id:Mongoose.Types.ObjectId(paymentreleaseId)});
    if(paymentReleaseDomain && paymentReleaseDomain.Type === "Initial"){
        let {Organization,ActivationDate,NoOfMonths} = paymentReleaseDomain;
        
        console.log(`Organization=>${Organization}`);
        console.log(`ActivationDate=>${ActivationDate}`);
        console.log(`NoOfMonths=>${NoOfMonths}`);

        let ActivatedOn = ActivationDate;
        let ValidTill = moment(ActivationDate).startOf('month').add(NoOfMonths,'months');
        let subscriptions = {Organization,ActivatedOn,ValidTill,Type:paymentReleaseDomain.Type,IsActive:true};
        let findSubscription = await SubscriptionsSchema.findOne({Organization:Mongoose.Types.ObjectId(Organization)});
        if(!findSubscription){
            console.log("Add New Subscription.");
            const subscriptionDomain = await SubscriptionsSchema(subscriptions);
            await subscriptionDomain.save();
        }else{
            console.log(`Update Subscription. id: ${findSubscription._id}`)
            await SubscriptionsSchema.updateOne({_id:findSubscription._id},subscriptions);
        }
        
    }
    if(paymentReleaseDomain && paymentReleaseDomain.Type === "Renewal"){
        let {Organization,ActivationDate,NoOfMonths} = paymentReleaseDomain;
        let findSubscription = await SubscriptionsSchema.findOne({Organization:Mongoose.Types.ObjectId(Organization)});
        let {ActivatedOn,ValidTill} = findSubscription;
        console.log(`Organization=>${Organization}`);
        console.log(`ActivatedOn=>${ActivatedOn}`);
        console.log(`ValidTill=>${ValidTill}`);
        
        ValidTill = moment(ValidTill).startOf('month').add(NoOfMonths,'months');
        let subscriptions = {Organization,ActivatedOn,ValidTill};
        console.log(`Update Subscription. id: ${findSubscription._id}`);
        await SubscriptionsSchema.updateOne({_id:findSubscription._id},subscriptions);
        
    }
    console.log("end:addSubscription");
}

//PaymentReleaseId

const findAllTransactionsByOrgId = async (transactionReq) => {
    console.log("inside:findAllTransactionsByOrgId")
    const transactionList = await TransactionSchema.find(transactionReq).sort({_id:-1}).populate("Organization Paymentrelease")
    return transactionList;
};

module.exports = {
    AddTransactions:addTransactions,
    FindAllTransactionsByOrgId:findAllTransactionsByOrgId
}

