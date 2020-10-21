const DbConnection = require("../Config/DbConfig");
require('dotenv').config();
const Mongoose = require("mongoose");
const EvaluationRepo = require('../SchemaModels/Evalution');
const UserRepo = require('../SchemaModels/UserSchema');
const DeliverEmailRepo = require('../SchemaModels/DeliverEmail');
const SendMail = require("../Helpers/mail.js");
var logger = require('../logger');
var env = process.env.NODE_ENV || "dev";
var config = require(`../Config/${env}.config`);
exports.AddEvaluation = async (evaluation) => {
    const _evaluation = await EvaluationRepo(evaluation);
    var savedEvauation = await _evaluation.save();
    var _emps = evaluation.Employees.map(x => x._id);
    await UserRepo.updateMany({ _id: { $in: _emps } }, { $set: { HasActiveEvaluation: "Yes" } });
    const _currentEvaluation = await EvaluationRepo.findOne({ _id: Mongoose.Types.ObjectId(savedEvauation._id) }).populate('Employees._id Employees.Peers._id Employees.DirectReportees._id CreatedBy').sort({ CreatedDate: -1 })
    var _deliveremails = [];
    var mailObject = SendMail.GetMailObject(
        _currentEvaluation.CreatedBy.Email,
        "Evaluation Rolledout Successfully",
        `Dear ${_currentEvaluation.CreatedBy.FirstName} 
        <br/>
        Congratulations, you have successfully setup the roll-out for the Evaluation for the year : ${new Date().getFullYear()}
        <br/>
        <br/>

        Thank you
        Admin,
        ${config.ProductName}
        `,
        null,
        null
    );
    console.log('mail',mailObject);
    SendMail.SendEmail(mailObject, async function (res) {
        console.log(res);       
    });
    _currentEvaluation.Employees.map(e => {
        debugger
        _deliveremails.push({
            User: e._id._id,
            Type: 'Employee Evaluation',
            IsDelivered: false,
            Email: e._id.Email,
            Template: `<h1>Dear ${e._id.FirstName} <br/>
        New Evaluation form has been rolledout. Please access Portal to submit the review.
        <br/>
        <br/>
        Thank you
        ${config.ProductName}
        `,
            Company: _currentEvaluation.Company,
            Subject: 'New Evaluation Rolledout'
        })

        e.Peers.map(p => {
            _deliveremails.push({
                User: p._id,
                Type: 'Peer Review',
                IsDelivered: false,
                Email: p._id.Email,
                Template: `<h1>Dear ${p._id.FirstName} <br/>
        New Evaluation form has been rolledout. Please access Portal to submit the review.
        <br/>
        <br/>
        Thank you
        OPAssess Admin
        `,
                Company: _currentEvaluation.Company,
                Subject: 'New Peer Review Requested'
            })
        })
        e.DirectReportees.map(d => {
            _deliveremails.push({
                User: d._id,
                Type: 'Peer Review',
                IsDelivered: false,
                Email: d._id.Email,
                Template: `<h1>Dear ${d._id.FirstName} <br/>
        New Evaluation form has been rolledout. Please access Portal to submit the review.
        <br/>
        <br/>
        Thank you
        OPAssess Admin
        `,
                Company: _currentEvaluation.Company,
                Subject: 'Your Reportee Evaluation Rolledout'
            })
        })
    })

    var de = await DeliverEmailRepo.insertMany(_deliveremails);
    // var mailObject = SendMail.GetMailObject(
    //     element.Email,
    //     element.Subject,
    //     element.Template,null,null
    // );
    // console.log('mail',mailObject);
    // SendMail.sendEmail(mailObject, async function (res) {
    //     console.log(res);
    //     await DeliverEmailRepo.update({_id:element._id},{IsDelivered:true})
    // });
    

    return true;
};
exports.GetEvaluations = async (clientId) => {
    return await EvaluationRepo.find({ Company: Mongoose.Types.ObjectId(clientId.clientId) }).populate('Employees._id').sort({ CreatedDate: -1 })
}
exports.GetEvaluationFormById = async (formId) => {
    return await EvaluationRepo.findById({ _id: Mongoose.Types.ObjectId(formId.id) }).populate('Employees._id')
}

exports.DraftEvaluation = async (evaluation) => {
    const _evaluation = await EvaluationRepo(evaluation);
    await _evaluation.save();
    return true;
};

exports.UpdateDirectReportees = async (evaluation) => {
    const toupdateForm = await EvaluationRepo.findOne({ _id: Mongoose.Types.ObjectId(evaluation.EvaluationId) });
    toupdateForm.Employees.find(x => x._id.toString() === evaluation.EmployeeId).DirectReportees = evaluation.DirectReportees;
    toupdateForm.Employees.find(x => x._id.toString() === evaluation.EmployeeId).DirectReporteeComptencyMessage = evaluation.DirectReporteeCompetencyMessage;
    toupdateForm.Employees.find(x => x._id.toString() === evaluation.EmployeeId).DirectReporteeCompetencyList = evaluation.DirectReporteeCompetencyList;
    //Object.assign(toupdateForm, evaluation);
    var ff = await toupdateForm.save();
    return true;
};

exports.UpdatePeers = async (evaluation) => {
    const toupdateForm = await EvaluationRepo.findOne({ _id: Mongoose.Types.ObjectId(evaluation.EvaluationId) });
    toupdateForm.Employees.find(x => x._id.toString() === evaluation.EmployeeId).Peers = evaluation.Peers;
    toupdateForm.Employees.find(x => x._id.toString() === evaluation.EmployeeId).PeersCompetencyMessage = evaluation.PeersCompetencyMessage;
    toupdateForm.Employees.find(x => x._id.toString() === evaluation.EmployeeId).PeersCompetencyList = evaluation.PeersCompetencyList;
    //Object.assign(toupdateForm, evaluation);
    var ff = await toupdateForm.save();
    return true;
};

