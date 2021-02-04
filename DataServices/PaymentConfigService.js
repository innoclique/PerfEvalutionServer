const DbConnection = require("../Config/DbConfig");
require('dotenv').config();
const Mongoose = require("mongoose");
const PaymentConfigSchema = require('../SchemaModels/PaymentConfigurationSchema');
const  ProductPriceScaleRepo= require('../SchemaModels/ProductPriceScale');
const  OverridePriceScaleRepo= require('../SchemaModels/OverridePriceScale');
const  PaymentReleaseSchema= require('../SchemaModels/PaymentReleaseSchema');
const  PriceSchema= require('../SchemaModels/PriceSchema');
const  UserSchema= require('../SchemaModels/UserSchema');
const  StateTaxesSchema= require('../SchemaModels/StateTaxesSchema');
var logger = require('../logger');
var env = process.env.NODE_ENV || "dev";
var config = require(`../Config/${env}.config`);
const moment = require('moment');
const { createIndexes } = require("../SchemaModels/OverridePriceScale");
const SendMail = require("../Helpers/mail.js");
const OrganizationRepo = require('../SchemaModels/OrganizationSchema');
const EvaluationUtils = require("../utils/EvaluationUtils");

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
    let payReleaseId;
    if(!paymentRelease.paymentreleaseId){
        if(!paymentRelease.ClientId){
            delete paymentRelease.ClientId;
        }
        const _paymentrelease = await PaymentReleaseSchema(paymentRelease);
        savedObjet = await _paymentrelease.save();
        payReleaseId = savedObjet._id;
    }else{
        let {paymentreleaseId} = paymentRelease;
        payReleaseId = paymentreleaseId;
        delete paymentRelease.paymentreleaseId;
        savedObjet = await PaymentReleaseSchema.updateOne({_id:paymentreleaseId},paymentRelease);
    }
    if(payReleaseId){
        await processPaymentEmails({_id:payReleaseId});
    }
    if(savedObjet){
        return savedObjet;
    }
    return savedObjet;
}

const deletePaymentRelease = async (request) => {
    console.log("remove payment release.");

    const _paymentrelease = await PaymentReleaseSchema.remove({_id:request.paymentReleaseId});
    return _paymentrelease;
}
const findPaymentReleaseByOrgId = async (paymentRelease) => {
   // console.log("Inside:findPaymentReleaseByOrgId");
    console.log(paymentRelease)
    const _paymentrelease = await PaymentReleaseSchema.findOne(paymentRelease);
    return _paymentrelease;
}
const processPaymentEmails = async(paymentRelease) => {
    const _paymentrelease = await PaymentReleaseSchema.findOne(paymentRelease).populate("Organization");
    if(_paymentrelease && _paymentrelease.Status == "Complete"){
        let {Admin,_id,Name} = _paymentrelease.Organization;
        let _orgDomain=await OrganizationRepo.findOne({_id:_id}).populate("ParentOrganization");
        let evaluationYear = await EvaluationUtils.getOrganizationStartAndEndDates(_id);
        let evaluationPeriod = evaluationYear.start.format("MMM-YYYY");
        evaluationPeriod+=" - "+ evaluationYear.end.format("MMM-YYYY");
        let userDomain = await UserSchema.findOne({_id:Admin});
        await sendPaymentEmailToCSA({_paymentrelease,userDomain,evaluationPeriod});
        await sendPaymentEmailToPSA({Name,parentOrg:_orgDomain.ParentOrganization,_paymentrelease,evaluationPeriod});
        
    }
}

const sendPaymentEmailToPSA  = async (options)=>{
    console.log("Inside:sendPaymentEmailToPSA")
        let {Name,parentOrg,_paymentrelease,evaluationPeriod} = options; 
        let {Type} = _paymentrelease;
        
        let redirectURL = config.APP_BASE_REDIRECT_URL+"psa/reports/info/client";
        let subject;
        subject = "Payment for " + Name +" successful";
        let mailBody= `Dear ${Name},<br><br>`;
        mailBody = mailBody + Name+ "has made payment for "+Type+" for " +evaluationPeriod+ ".<br><br>";
        mailBody=mailBody + "<br>To view details  "+ " <a href=" +redirectURL +">click here</a> <br><br>Thanks,<br>Administrator " + config.ProductName + "<br>";
            console.log(mailBody);
            console.log(`To Email = ${parentOrg.AdminEmail}`);
            var mailObject = SendMail.GetMailObject(
                parentOrg.AdminEmail,
                subject,
                mailBody,
                null,
                null
                );
            await SendMail.SendEmail(mailObject, function (res) {
                console.log(JSON.stringify(res))
            });
}


const sendPaymentEmailToCSA  = async (options)=>{
    console.log("Inside:sendPaymentEmailToCSA")
        let {_paymentrelease,userDomain,evaluationPeriod} = options; 
        let {Type} = _paymentrelease;
        let flag=true;
        let mailBody= `Dear ${userDomain.FirstName},<br><br>`;
        let subject;
        switch (Type) {
            case 'Initial':
                subject = "Payment for " + evaluationPeriod +" successful";
                mailBody = mailBody + "Your payment for " +evaluationPeriod+ " is successful. You may start using the application.<br><br>";
                mailBody=mailBody + "<br>To login  "+ " <a href=" +config.APP_BASE_REDIRECT_URL +">click here</a> <br><br>Thanks,<br>Administrator " + config.ProductName + "<br>";
                break;
            case 'Adhoc':
                subject = "Payment for ad hoc purchase for " + evaluationPeriod +" successful";
                mailBody = mailBody + "Your purchase of ad hoc evaluations for " +evaluationPeriod+ " was successful.<br><br>";
                mailBody=mailBody + "<br>To login  "+ " <a href=" +config.APP_BASE_REDIRECT_URL +">click here</a> <br><br>Thanks,<br>Administrator " + config.ProductName + "<br>";
                break;
            case 'Renewal':
                subject = "Your license for " + evaluationPeriod +" has been renewed";
                mailBody = mailBody + "Your license for " +evaluationPeriod+ " has been renewed.<br><br>";
                mailBody=mailBody + "<br>To login  "+ " <a href=" +config.APP_BASE_REDIRECT_URL +">click here</a> <br><br>Thanks,<br>Administrator " + config.ProductName + "<br>";
                
                break;
            default:
                flag=false;
                break;
        }
        if(flag){
            console.log(mailBody);
            console.log(`To Email = ${userDomain.Email}`);
            var mailObject = SendMail.GetMailObject(
                userDomain.Email,
                subject,
                mailBody,
                null,
                null
                );
            await SendMail.SendEmail(mailObject, function (res) {
                console.log(JSON.stringify(res))
            });
        }
    
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
/*const init = async ()=>{
    console.log("Loading.....")
    await processPaymentEmails({_id:"601abe02ded5335a5ae34867"})
}
init();*/
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
    FindTaxRateByName:getTaxRateByName,
    DeletePaymentRelease:deletePaymentRelease,
}

