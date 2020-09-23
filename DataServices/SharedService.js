const DbConnection = require("../Config/DbConfig");
require('dotenv').config();
const Mongoose = require("mongoose");

const OrganizationRepo = require('../SchemaModels/OrganizationSchema');
const IndustryRepo = require('../SchemaModels/Industry');
const UserRepo = require('../SchemaModels/UserSchema');
const NavigationMenu = require('../SchemaModels/NavigationMenu');
const SendMail = require("../Helpers/mail.js");
var logger = require('../logger');

exports.GetIndustries = async () => {      
    const industries = await IndustryRepo.find({}).sort({Name:1});
    return industries;
};




