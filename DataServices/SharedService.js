const DbConnection = require("../Config/DbConfig");
require('dotenv').config();
const Mongoose = require("mongoose");

const OrganizationRepo = require('../SchemaModels/OrganizationSchema');
const IndustryRepo = require('../SchemaModels/Industry');
const UserRepo = require('../SchemaModels/UserSchema');
const EvaluationPeriods = require('../SchemaModels/EvaluationPeriod');

const NavigationMenu = require('../SchemaModels/NavigationMenu');
const SendMail = require("../Helpers/mail.js");
var logger = require('../logger');

exports.GetIndustries = async () => {      
    const industries = await IndustryRepo.find({}).sort({Name:1});
    return industries;
};

exports.GetEvaluationCategories = async () => {   
    var _cc={
        Code:"CalendarYear",
        Name:"Calendar Year",
        IsActive:true
    }   
    var f=new EvaluationPeriods(_cc);
    await f.save();
    const evaluationperiods = await EvaluationPeriods.find({}).sort({Name:1});
    return evaluationperiods;
};



