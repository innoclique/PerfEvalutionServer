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
    var _emps=evaluation.Employees.map(x=> x._id);
    await UserRepo.updateMany({_id:{$in:_emps}},{$set:{HasActiveEvaluation:"Yes"}});    
    return true;
};
exports.GetEvaluations=async (clientId)=>{        
    return await EvaluationRepo.find({Company: Mongoose.Types.ObjectId(clientId.clientId)}).populate('Employees._id').sort({CreatedDate:-1})  
}
exports.GetEvaluationFormById=async (formId)=>{
    return await EvaluationRepo.findById({_id: Mongoose.Types.ObjectId(formId.id)}).populate('Employees._id')
}

exports.DraftEvaluation = async (evaluation) => {
    const _evaluation = await EvaluationRepo(evaluation);
    await _evaluation.save();
    return true;
};

exports.UpdateDirectReportees = async (evaluation) => {
    const toupdateForm = await EvaluationRepo.findOne({ _id: Mongoose.Types.ObjectId(evaluation.EvaluationId) });
    toupdateForm.Employees.find(x=>x._id.toString()===evaluation.EmployeeId).DirectReportees=evaluation.DirectReportees;
    toupdateForm.Employees.find(x=>x._id.toString()===evaluation.EmployeeId).DirectReporteeComptencyMessage=evaluation.DirectReporteeCompetencyMessage;
    toupdateForm.Employees.find(x=>x._id.toString()===evaluation.EmployeeId).DirectReporteeCompetencyList=evaluation.DirectReporteeCompetencyList;    
    //Object.assign(toupdateForm, evaluation);
    var ff = await toupdateForm.save();
    return true;
};

exports.UpdatePeers = async (evaluation) => {
    const toupdateForm = await EvaluationRepo.findOne({ _id: Mongoose.Types.ObjectId(evaluation.EvaluationId) });
    toupdateForm.Employees.find(x=>x._id.toString()===evaluation.EmployeeId).Peers=evaluation.Peers;
    toupdateForm.Employees.find(x=>x._id.toString()===evaluation.EmployeeId).PeersCompetencyMessage=evaluation.PeersCompetencyMessage;
    toupdateForm.Employees.find(x=>x._id.toString()===evaluation.EmployeeId).PeersCompetencyList=evaluation.PeersCompetencyList;    
    //Object.assign(toupdateForm, evaluation);
    var ff = await toupdateForm.save();
    return true;
};

