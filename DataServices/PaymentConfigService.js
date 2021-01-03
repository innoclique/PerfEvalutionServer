const DbConnection = require("../Config/DbConfig");
require('dotenv').config();
const Mongoose = require("mongoose");
const PaymentConfigSchema = require('../SchemaModels/PaymentConfigurationSchema');
const  ProductPriceScaleRepo= require('../SchemaModels/ProductPriceScale');
const  OverridePriceScaleRepo= require('../SchemaModels/OverridePriceScale');
const  PaymentReleaseSchema= require('../SchemaModels/PaymentReleaseSchema');
const  PriceSchema= require('../SchemaModels/PriceSchema');
const  StateTaxesSchema= require('../SchemaModels/StateTaxesSchema');
var logger = require('../logger');
var env = process.env.NODE_ENV || "dev";
var config = require(`../Config/${env}.config`);
const moment = require('moment');
const { createIndexes } = require("../SchemaModels/OverridePriceScale");

const addPaymentConfiguration = async (paymentConfig) => {
    const _paymentConfig = await PaymentConfigSchema(paymentConfig);
    var savedpaymentConfig = await _paymentConfig.save();
    return savedpaymentConfig;
};

const findPaymentSettingByUserType = async (type) => {
    const paymentSettingObj = await PaymentConfigSchema.findOne({PaymentSettingType:type})
    return paymentSettingObj;
};

const getTaxRateByName = async (name)=>{
    let tax = 0;
    let stateTax = await StateTaxesSchema.findOne({name});
        if(stateTax){
            tax=stateTax.tax;
        }
    console.log(`state name : ${name} - tax amount : ${tax}`)
    return tax;
}

const findScaleByClientType = async (options) => {
    let {State} = options;
    let tax = 0;
    if(State){
        tax = await getTaxRateByName(State);
        delete options.State;
    }
    let priceScale = await ProductPriceScaleRepo.findOne(options);
    priceScale.tax = tax;
    return priceScale;
}

const findPriceList = async (options) => {
    console.log("inside:pricelist")
    console.log(options)
    let priceList = await PriceSchema.find(options);
    return priceList;
}

const findEmployeeScale = async (options) => {
    let {Organization,noOfEmployess,State,ClientType} = options;
    let tax = 0;
    if(State){
        tax = await getTaxRateByName(State);

    }
    noOfEmployess = parseInt(noOfEmployess);
    let overrideWhereObj={
        Organization,
        EvaluationYear:""+moment().format("YYYY"),
        UsageType:"Employees",
        RangeTo:{$gte:noOfEmployess},
        RangeFrom:{$lte:noOfEmployess},
    };
    console.log(overrideWhereObj);
    let overrideScale = await OverridePriceScaleRepo.findOne(overrideWhereObj);
    if(overrideScale){
        return overrideScale;
    }
    
    let productWhereObj={
        Type : "Range",
        UsageType:"Employees",
        ClientType:ClientType,
        RangeTo:{$gte:noOfEmployess},
        RangeFrom:{$lte:noOfEmployess},
    }
    console.log(productWhereObj);
    let priceScale = await ProductPriceScaleRepo.findOne(productWhereObj);
    priceScale.tax = tax;
    return priceScale;
}

const savePaymentRelease = async (paymentRelease) => {
    let savedObjet;
    if(!paymentRelease.paymentreleaseId){
        const _paymentrelease = await PaymentReleaseSchema(paymentRelease);
        savedObjet = await _paymentrelease.save();
        
    }else{
        let {paymentreleaseId} = paymentRelease;
        delete paymentRelease.paymentreleaseId;
        savedObjet = await PaymentReleaseSchema.updateOne({_id:paymentreleaseId},paymentRelease);
    }
    if(savedObjet){
        return true;
    }
    return false;
}
const findPaymentReleaseByOrgId = async (paymentRelease) => {
    console.log("Inside:findPaymentReleaseByOrgId");
    console.log(paymentRelease)
    const _paymentrelease = await PaymentReleaseSchema.findOne(paymentRelease);
    return _paymentrelease;
}
const findAdhocRequestList = async () => {
    let responseObj=[];
    console.log("Inside:Adhoc Request list")
    let whereObj={
        Type:"Adhoc",
        Status:{$ne:"Complete"}
    }
    const adhocList = await PaymentReleaseSchema.find(whereObj).populate('Organization');
    for(var i=0;i<adhocList.length;i++){
        let adhocObj = adhocList[i];
        let _whereObj={
            Organization:adhocObj.Organization._id,
            Type:"Adhoc",
            Status:"Complete"
        }
        
        let pastAdhocList = await PaymentReleaseSchema.find(_whereObj);
        let totalRequest=0;
        if(pastAdhocList.length>0)
            totalRequest=pastAdhocList.map(item => item.NoOfEmployees).reduce((prev, next) => prev + next);
        
        let createdYear = moment(adhocObj.Organization.CreatedOn).format("YYYY");
        responseObj[i]={
            paymentReleaseId:adhocObj._id,
            organizationId:adhocObj.Organization._id,
            clientName:adhocObj.Organization.Name,
            activeSince:createdYear,
            requestRange:adhocObj.Range,
            amount:adhocObj.TOTAL_PAYABLE_AMOUNT,
            status:adhocObj.Status,
            totalRequest:totalRequest,
            noOfEmployees:adhocObj.NoOfEmployees,
            purpose:adhocObj.Purpose,
        }
    }
    return responseObj;
}

const findAdhocLatestByOrganization = async (adhoc) => {
    console.log("Inside:Adhoc Request list")
    const adhocList = await PaymentReleaseSchema.find(adhoc).sort({_id:-1});
    if(adhocList && adhocList.length>0){
        return adhocList[0];
    }
    return null;
}

const findRangeList = async (options) => {
    let rangeList = await ProductPriceScaleRepo.find(options);
    return rangeList;
}

module.exports = {
    AddPaymentConfiguration:addPaymentConfiguration,
    findPaymentSettingByUserType:findPaymentSettingByUserType,
    FindScaleByClientType:findScaleByClientType,
    SavePaymentRelease:savePaymentRelease,
    FindPaymentReleaseByOrgId:findPaymentReleaseByOrgId,
    FindAdhocRequestList:findAdhocRequestList,
    FindAdhocLatestByOrganization:findAdhocLatestByOrganization,
    FindEmployeeScale:findEmployeeScale,
    FindRangeList:findRangeList,
    FindPriceList:findPriceList,
    FindTaxRateByName:getTaxRateByName
}

