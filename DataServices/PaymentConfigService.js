const DbConnection = require("../Config/DbConfig");
require('dotenv').config();
const Mongoose = require("mongoose");
const PaymentConfigSchema = require('../SchemaModels/PaymentConfigurationSchema');
const  ProductPriceScaleRepo= require('../SchemaModels/ProductPriceScale');
const  OverridePriceScaleRepo= require('../SchemaModels/OverridePriceScale');
const  PaymentReleaseSchema= require('../SchemaModels/PaymentReleaseSchema');
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

const findScaleByClientType = async (options) => {
    let {Organization,ClientType,UsageType,UsageCount,Type} = options;
    let overrideWhereObj={
        Organization,
        EvaluationYear:""+moment().format("YYYY")
    };
    console.log(overrideWhereObj);
    let overrideScale = await OverridePriceScaleRepo.findOne(overrideWhereObj);
    if(overrideScale){
        return overrideScale;
    }
    let productWhereObj={
        ClientType,UsageType,Type
    }
    console.log(productWhereObj);
    let priceScale = await ProductPriceScaleRepo.findOne(productWhereObj);
    return priceScale;
}

const findEmployeeScale = async (options) => {
    let {Organization,noOfEmployess} = options;
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
        RangeTo:{$gte:noOfEmployess},
        RangeFrom:{$lte:noOfEmployess},
    }
    console.log(productWhereObj);
    let priceScale = await ProductPriceScaleRepo.findOne(productWhereObj);
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
    const _paymentrelease = await PaymentReleaseSchema.findOne(paymentRelease);
    return _paymentrelease;
}
const findAdhocRequestList = async () => {
    console.log("Inside:Adhoc Request list")
    let _whereObj={
        Type:"Adhoc"
    }
    const adhocList = await PaymentReleaseSchema.find(_whereObj).populate('Organization');
    return adhocList;
}

const findAdhocLatestByOrganization = async (adhoc) => {
    console.log("Inside:Adhoc Request list")
    const adhocList = await PaymentReleaseSchema.find(adhoc).sort({_id:-1});
    if(adhocList && adhocList.length>0){
        return adhocList[0];
    }
    return null;
}

module.exports = {
    AddPaymentConfiguration:addPaymentConfiguration,
    findPaymentSettingByUserType:findPaymentSettingByUserType,
    FindScaleByClientType:findScaleByClientType,
    SavePaymentRelease:savePaymentRelease,
    FindPaymentReleaseByOrgId:findPaymentReleaseByOrgId,
    FindAdhocRequestList:findAdhocRequestList,
    FindAdhocLatestByOrganization:findAdhocLatestByOrganization,
    FindEmployeeScale:findEmployeeScale
}

