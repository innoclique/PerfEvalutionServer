const DbConnection = require("../Config/DbConfig");
require('dotenv').config();
const Mongoose = require("mongoose");
const PaymentConfigSchema = require('../SchemaModels/PaymentConfigurationSchema');
const  ProductPriceScaleRepo= require('../SchemaModels/ProductPriceScale');
const  OverridePriceScaleRepo= require('../SchemaModels/OverridePriceScale');
const  PaymentReleaseSchema= require('../SchemaModels/PaymentReleaseSchema');
const  PriceSchema= require('../SchemaModels/PriceSchema');
const  UserSchema= require('../SchemaModels/UserSchema');
const  RsaAccountDetailsSchema= require('../SchemaModels/RsaAccountDetailsSchema');
const  StateTaxesSchema= require('../SchemaModels/StateTaxesSchema');
var logger = require('../logger');
var env = process.env.NODE_ENV || "dev";
var config = require(`../Config/${env}.config`);
const moment = require('moment');
const { createIndexes } = require("../SchemaModels/OverridePriceScale");
const SendMail = require("../Helpers/mail.js");
const OrganizationRepo = require('../SchemaModels/OrganizationSchema');
const EvaluationUtils = require("../utils/EvaluationUtils");
const AuthHelper = require('../Helpers/Auth_Helper');
const Bcrypt = require('bcrypt');

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
    console.log("inside:savePaymentRelease");
    let savedObjet;
    let payReleaseId;
    if(!paymentRelease.paymentreleaseId){
        if(paymentRelease.ClientType && paymentRelease.ClientType!="Reseller"){
            let currentEvaluationInfo = await EvaluationUtils.getOrganizationStartAndEndDates(paymentRelease.Organization);
            paymentRelease.EvaluationPeriod = currentEvaluationInfo.EvaluationPeriod;
            paymentRelease.EvaluationYear = currentEvaluationInfo.start.format("YYYY");
            paymentRelease.EvaluationStartMonth = currentEvaluationInfo.StartMonth;
            paymentRelease.EvaluationEndMonth = currentEvaluationInfo.EndMonth;
        }
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
        await modifyResellerAccountDetails(payReleaseId);
        console.log("Processing Emails");
        await processPaymentEmails({_id:payReleaseId});
        console.log("==End Process Emails==")
    }
    if(savedObjet){
        return savedObjet;
    }
    return savedObjet;
}

const modifyResellerAccountDetails = async (payReleaseId)=>{
    console.log("Inside:modifyResellerAccountDetails")
   let paymentRelease =  await PaymentReleaseSchema.findOne({_id:payReleaseId});
   let {Type,Status,RangeId,UsageType,NoNeeded,Organization,ClientType} = paymentRelease;
   console.log(`${Type} - ${Status} - ${ClientType}`)
    if(Type=="Initial" && Status=="Complete" && ClientType == "Reseller"){
        let TotalUsageType = NoNeeded;
        let Balance = NoNeeded;
        let accountInfo = {Organization,RangeId,UsageType,TotalUsageType,Balance};
        const _accountInfo = await RsaAccountDetailsSchema(accountInfo);
        await _accountInfo.save();
    }
    if(Type=="NewPurchase" && Status=="Complete" && ClientType == "Reseller"){
        let whereObj = {
            Organization,
            UsageType,
            RangeId
        };
        console.log(whereObj);
        let rsaAccountDetails = await RsaAccountDetailsSchema.findOne(whereObj);
        if(rsaAccountDetails){
            console.log("Update RsaAccountDetailsSchema")
            await RsaAccountDetailsSchema.update(whereObj,{ $inc: { Balance: NoNeeded,TotalUsageType:NoNeeded }});
        }else{
            let TotalUsageType = NoNeeded;
            let Balance = NoNeeded;
            let accountInfo = {Organization,RangeId,UsageType,TotalUsageType,Balance};
            const _accountInfo = await RsaAccountDetailsSchema(accountInfo);
            await _accountInfo.save();
        }
        
    }
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
    console.log("Inside:processPaymentEmails: paymentRelease = "+JSON.stringify(paymentRelease));
    const _paymentrelease = await PaymentReleaseSchema.findOne(paymentRelease).populate("Organization");
    let {Admin,_id,Name} = _paymentrelease.Organization;
    let _orgDomain=await OrganizationRepo.findOne({_id:_id}).populate("ParentOrganization");
    let evaluationYear = await EvaluationUtils.getOrganizationStartAndEndDates(_id);
    let evaluationPeriod="";
    if(evaluationYear){
            evaluationPeriod = evaluationYear.start.format("MMM-YYYY");
            evaluationPeriod+=" - "+ evaluationYear.end.format("MMM-YYYY");
        }
        
        let userDomain = await UserSchema.findOne({_id:Admin});
        let {Role} = userDomain;
    if(_paymentrelease && _paymentrelease.Status == "Complete"){
        if(Role === "CSA")
            await sendPaymentEmailToCSA({_paymentrelease,userDomain,evaluationPeriod});
            await sendPaymentEmailToPSA({Name,parentOrg:_orgDomain.ParentOrganization,_paymentrelease,evaluationPeriod,Role});
        
    }
    if(_paymentrelease && _paymentrelease.Type=="Initial" && _paymentrelease.Status == "Pending"){
        await activateAdminUsers(Admin);
        await sendInitialPaymentReleaseEmailToPSA({Name,parentOrg:_orgDomain.ParentOrganization,_paymentrelease,evaluationPeriod});
    }
    if(_paymentrelease && _paymentrelease.Type=="Adhoc" && _paymentrelease.Status == "Approved"){
        await sendAdhocApprovedEmailToPSA({Name,parentOrg:_orgDomain.ParentOrganization,_paymentrelease,evaluationPeriod});
        if(Role === "CSA")
            await sendAdhocApprovedEmailToCSA({userDomain,evaluationPeriod});
    }
    if(_paymentrelease && _paymentrelease.Type=="Adhoc" && _paymentrelease.Status == "Disapproved"){
        await sendAdhocDisapprovedEmailToPSA({Name,parentOrg:_orgDomain.ParentOrganization,_paymentrelease,evaluationPeriod});
        if(Role === "CSA")
            await sendAdhocDisApprovedEmailToCSA({userDomain,evaluationPeriod});
    }
    if(_paymentrelease && _paymentrelease.Type=="Adhoc" && _paymentrelease.Status == "Pending"){
        await sendAdhocRequestEmailToPSA({Name,parentOrg:_orgDomain.ParentOrganization,_paymentrelease,evaluationPeriod});
        if(Role === "CSA")
            await sendAdhocRequestEmailToCSA({userDomain,evaluationPeriod});
    }
    console.log("End:processPaymentEmails: paymentRelease = "+paymentRelease);
}
const sendAdhocRequestEmailToPSA  = async (options)=>{
    console.log("Inside:sendAdhocRequestEmailToPSA")
        let {Name,parentOrg,evaluationPeriod} = options; 
        
        let redirectURL = config.APP_BASE_REDIRECT_URL+"=/psa/payment-adhoc-list";
        let subject;
        subject = "Ad hoc purchase requested by " + Name ;
        let mailBody= `Dear ${parentOrg.Name},<br><br>`;
        mailBody = mailBody +Name+" has requested ad hoc evaluations for "+evaluationPeriod+".";
        mailBody=mailBody + "<br>To take action,"+ " <a href=" +redirectURL +">click here</a> <br><br>Thank you,<br>" + config.ProductName + " Administrator<br>";
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

const sendAdhocRequestEmailToCSA  = async (options)=>{
    console.log("Inside:sendAdhocRequestEmailToCSA");
    let redirectURL = config.APP_BASE_REDIRECT_URL;
    let {userDomain,evaluationPeriod} = options; 
    let mailBody= `Dear ${userDomain.FirstName},<br><br>`;
    let subject = "Ad hoc purchase request sent";
    
    mailBody = mailBody + "Your request for ad hoc purchase with the following details has been sent for approval.<br><br>";
    mailBody=mailBody + "<br>To login,"+ " <a href=" +redirectURL +">click here</a> <br><br>Thank you,<br>" + config.ProductName + " Administrator<br>";
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

const sendAdhocDisApprovedEmailToCSA  = async (options)=>{
    console.log("Inside:sendAdhocDisApprovedEmailToCSA");
    let redirectURL = config.APP_BASE_REDIRECT_URL;
    let {userDomain,evaluationPeriod} = options; 
    let mailBody= `Dear ${userDomain.FirstName},<br><br>`;
    let subject = "Ad hoc purchase for " + evaluationPeriod +" disapproved";
    
    mailBody = mailBody + "Your ad hoc purchase for " +evaluationPeriod+ " has been disapproved. You may contact the product super admin for more details.<br><br>";
    mailBody=mailBody + "<br>To login,"+ " <a href=" +redirectURL +">click here</a> <br><br>Thank you,<br>" + config.ProductName + " Administrator<br>";
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
const sendAdhocApprovedEmailToCSA  = async (options)=>{
    console.log("Inside:sendAdhocApprovedEmailToCSA");
    let redirectURL = config.APP_BASE_REDIRECT_URL+"=/csa/payments";
    let {userDomain,evaluationPeriod} = options; 
    let mailBody= `Dear ${userDomain.FirstName},<br><br>`;
    let subject = "Ad hoc purchase for " + evaluationPeriod +" approved";
    mailBody = mailBody + "Congratulations, your ad hoc purchase for " +evaluationPeriod+ " has been approved.<br><br>";
    mailBody=mailBody + "<br>To make payment,"+ " <a href=" +redirectURL +">click here</a> <br><br>Thank you,<br>" + config.ProductName + " Administrator<br>";
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


const activateAdminUsers = async (adminId) =>{
    const _temppwd = AuthHelper.GenerateRandomPassword();
    const pwd = Bcrypt.hashSync(_temppwd, 10);
    let updateData={
        Password: pwd,
        IsActive: true
    }
    const userData = await UserSchema.findOneAndUpdate({_id:adminId},updateData);
    await sendTemporaryPwdToCSA(userData,_temppwd);
    await sendWelcomeEmailCSA(userData);
}
const sendTemporaryPwdToCSA  = async (options,tmpPwd)=>{
    console.log("Inside:sendTemporaryPwdToCSA")
        let {Email,FirstName,} = options; 
        let mailBody= `Dear ${FirstName},<br><br>`;
        let subject = "Your " + config.ProductName +" password";
        mailBody = mailBody + "This is your temporary password for " +config.ProductName+": "+tmpPwd+"<br><br>";
        mailBody=mailBody + "<br>To login  "+ " <a href=" +config.APP_BASE_REDIRECT_URL +">click here</a> <br><br>Thank you,<br>" + config.ProductName + " Administrator<br>";
        var mailObject = SendMail.GetMailObject(
            Email,
            subject,
            mailBody,
            null,
            null
            );
        await SendMail.SendEmail(mailObject, function (res) {
            console.log(JSON.stringify(res))
        });
}
const sendWelcomeEmailCSA  = async (options)=>{
    console.log("Inside:sendPaymentEmailToCSA")
        let {Email,FirstName,} = options; 
        let mailBody= `Dear ${FirstName},<br><br>`;
        let subject = "Your account for " + config.ProductName +" has been created";
        mailBody = mailBody + "Congratulations, your account for " +config.ProductName+ " has been created. Your username is "+Email+"<br><br>";
        mailBody=mailBody + "<br>To login  "+ " <a href=" +config.APP_BASE_REDIRECT_URL +">click here</a> <br><br>Thank you,<br>" + config.ProductName + " Administrator<br>";
        var mailObject = SendMail.GetMailObject(
            Email,
            subject,
            mailBody,
            null,
            null
            );
        await SendMail.SendEmail(mailObject, function (res) {
            console.log(JSON.stringify(res))
        });
}

const sendAdhocApprovedEmailToPSA  = async (options)=>{
    console.log("Inside:sendAdhocApprovedEmailToPSA")
        let {Name,parentOrg,evaluationPeriod} = options; 
        
        let redirectURL = config.APP_BASE_REDIRECT_URL;
        let subject;
        subject = "Ad hoc purchase for " + Name +" approved";
        let mailBody= `Dear ${parentOrg.Name},<br><br>`;
        mailBody = mailBody +"Ad hoc purchase for "+Name+" for "+evaluationPeriod+" has been approved and payment info sent.";
        mailBody=mailBody + "<br>To login,"+ " <a href=" +redirectURL +">click here</a> <br><br>Thank you,<br>" + config.ProductName + " Administrator<br>";
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
const sendAdhocDisapprovedEmailToPSA  = async (options)=>{
    console.log("Inside:sendAdhocDisapprovedEmailToPSA")
        let {Name,parentOrg,_paymentrelease,evaluationPeriod} = options; 
        let {Type} = _paymentrelease;
        
        let redirectURL = config.APP_BASE_REDIRECT_URL;
        let subject;
        subject = "Ad hoc purchase for " + Name +" disapproved";
        let mailBody= `Dear ${parentOrg.Name},<br><br>`;
        mailBody = mailBody +"Ad hoc purchase for "+Name+" for "+evaluationPeriod+" has been disapproved and info sent.";
        mailBody=mailBody + "<br>To login,"+ " <a href=" +redirectURL +">click here</a> <br><br>Thank you,<br>" + config.ProductName + " Administrator<br>";
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


const sendInitialPaymentReleaseEmailToPSA  = async (options)=>{
    console.log("Inside:sendInitialPaymentReleaseEmailToPSA")
        let {Name,parentOrg,_paymentrelease,evaluationPeriod} = options; 
        let {Type} = _paymentrelease;
        
        let redirectURL = config.APP_BASE_REDIRECT_URL;
        let subject;
        if(evaluationPeriod && evaluationPeriod!="")
            subject = "Payment info for " + Name +" for "+evaluationPeriod+" sent";
        else
            subject = "Payment info for " + Name +" sent";

        let mailBody= `Dear ${parentOrg.Name},<br><br>`;
        mailBody = mailBody +" Payment information for "+evaluationPeriod+" has been sent to "+ Name+ ".";
        mailBody=mailBody + "<br>To login,"+ " <a href=" +redirectURL +">click here</a> <br><br>Thank you,<br>" + config.ProductName + " Administrator<br>";
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

const sendPaymentEmailToPSA  = async (options)=>{
    console.log("Inside:sendPaymentEmailToPSA")
        let {Name,parentOrg,_paymentrelease,evaluationPeriod,Role} = options; 
        let {Type} = _paymentrelease;
        let redirectURL = config.APP_BASE_REDIRECT_URL+"=/psa/reports/info/client";
        if(evaluationPeriod && evaluationPeriod!="")
            redirectURL = config.APP_BASE_REDIRECT_URL+"=/psa/reports/info/client";
        else
            redirectURL = config.APP_BASE_REDIRECT_URL+"=/psa/reports/info/reseller";

        let subject;
        subject = "Payment for " + Name +" successful";
        let mailBody= `Dear ${parentOrg.Name},<br><br>`;
        mailBody = mailBody + Name+ " has made payment for "+Type;
        if(evaluationPeriod && evaluationPeriod!="")
            mailBody = mailBody + " for " +evaluationPeriod+ ".<br><br>";
        mailBody = mailBody +".<br><br>";

        mailBody=mailBody + "<br>To view details  "+ " <a href=" +redirectURL +">click here</a> <br><br>Thank you,<br>" + config.ProductName + " Administrator<br>";
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
                mailBody = mailBody + " Your payment for " +evaluationPeriod+ " is successful. You may start using the application.<br><br>";
                mailBody=mailBody + "<br>To login  "+ " <a href=" +config.APP_BASE_REDIRECT_URL +">click here</a> <br><br>Thank you,<br>" + config.ProductName + " Administrator<br>";
                break;
            case 'Adhoc':
                subject = "Payment for ad hoc purchase for " + evaluationPeriod +" successful";
                mailBody = mailBody + "Your purchase of ad hoc evaluations for " +evaluationPeriod+ " was successful.<br><br>";
                mailBody=mailBody + "<br>To login  "+ " <a href=" +config.APP_BASE_REDIRECT_URL +">click here</a> <br><br>Thank you,<br>" + config.ProductName + " Administrator <br>";
                break;
            case 'Renewal':
                subject = "Your license for " + evaluationPeriod +" has been renewed";
                mailBody = mailBody + "Your license for " +evaluationPeriod+ " has been renewed.<br><br>";
                mailBody=mailBody + "<br>To login  "+ " <a href=" +config.APP_BASE_REDIRECT_URL +">click here</a> <br><br>Thank you,<br>" + config.ProductName + " Administrator<br>";
                
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
const sendPaymentInfoEmail = async (options)=>{
    console.log("Inside: sendPaymentInfoEmail");
    let redirectURL = config.APP_BASE_REDIRECT_URL;
    let {currentUser,paymentModel,paymentStructure,organization,paymentSummary} = options;
    let mailBody= `Dear ${currentUser.FirstName},<br><br>`;
    let subject = "";
    let evaluationYear = await EvaluationUtils.getOrganizationStartAndEndDates(organization._id);
    let evaluationPeriod="";
    if(evaluationYear){
            evaluationPeriod = evaluationYear.start.format("MMM-YYYY");
            evaluationPeriod+=" - "+ evaluationYear.end.format("MMM-YYYY");
    }
    if(evaluationPeriod && evaluationPeriod!=""){
        subject = "Payment info for " + organization.Name +" for "+evaluationPeriod+"";
        mailBody = mailBody +" Payment information for "+evaluationPeriod+" of "+ organization.Name+ ".";
    }
    else{
        subject = "Payment info for " + organization.Name +"";
        mailBody = mailBody +" Payment information for "+ organization.Name+ ".";
    }
    mailBody+="<br>";
    mailBody+="Usage Type: "+paymentModel.UsageType;
    mailBody+="<br>";
    mailBody+="Activation Date: "+paymentModel.ActivationDate;
    mailBody+="<br>";
    mailBody+="Total Amount: "+paymentSummary.TOTAL_PAYABLE_AMOUNT;
    mailBody+="<br>";
    mailBody=mailBody + "<br>To login,"+ " <a href=" +redirectURL +">click here</a> <br><br>Thank you,<br>" + config.ProductName + " Administrator<br>";
    console.log(subject)
    console.log(mailBody);
    console.log(`To Email = ${currentUser.Email}`);
    var mailObject = SendMail.GetMailObject(
        "venu.rai@innoclique.com",
        subject,
        mailBody,
        null,
        null
        );
    await SendMail.SendEmail(mailObject, function (res) {
        console.log(JSON.stringify(res));
    });
    return true
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
    console.log("Inside:Adhoc Request list");
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
    SendPaymentInfoEmailService:sendPaymentInfoEmail
}

