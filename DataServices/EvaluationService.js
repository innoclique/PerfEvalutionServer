const DbConnection = require("../Config/DbConfig");
require('dotenv').config();
const Mongoose = require("mongoose");

const EvaluationRepo = require('../SchemaModels/Evalution');

const UserRepo = require('../SchemaModels/UserSchema');

const SendMail = require("../Helpers/mail.js");
var logger = require('../logger');

exports.AddEvaluation = async (evaluation) => {      
    const _evaluation = await EvaluationRepo(evaluation);
    await _evaluation.save();
    return true;
};




