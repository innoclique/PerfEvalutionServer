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
exports.GetEvaluations=async (clientId)=>{
    return await EvaluationRepo.find({Company: Mongoose.Types.ObjectId(clientId.clientId)}).sort({CreatedDate:-1});  ;
}
exports.GetEvaluationFormById=async (formId)=>{
    return await EvaluationRepo.findById({_id: Mongoose.Types.ObjectId(formId.id)}).populate('Employees._id')
}

exports.DraftEvaluation = async (evaluation) => {
    const _evaluation = await EvaluationRepo(evaluation);
    await _evaluation.save();
    return true;
};

exports.UpdateEvaluationForm = async (evaluation) => {
    const toupdateForm = await EvaluationRepo.findOne({ _id: Mongoose.Types.ObjectId(evaluation._id) });
    Object.assign(toupdateForm, evaluation);
    var ff = await toupdateForm.save();
    
    
    return true;
};

