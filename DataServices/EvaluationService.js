const DbConnection = require("../Config/DbConfig");
require('dotenv').config();
const Mongoose = require("mongoose");
const EvaluationRepo = require('../SchemaModels/Evalution');
const OrganizationSchema = require('../SchemaModels/OrganizationSchema');
const UserRepo = require('../SchemaModels/UserSchema');
const questionsRepo = require('../SchemaModels/Questions');
const DeliverEmailRepo = require('../SchemaModels/DeliverEmail');
const SendMail = require("../Helpers/mail.js");
var logger = require('../logger');
var env = process.env.NODE_ENV || "dev";
var config = require(`../Config/${env}.config`);

const moment = require('moment');

const ModelsRepo = require('../SchemaModels/Model');
const ObjectId = Mongoose.Types.ObjectId;
const KpiRepo = require('../SchemaModels/KPI');
const MeasureCriteriaRepo = require('../SchemaModels/MeasurementCriteria');
const KpiFormRepo = require('../SchemaModels/KpiForm');
const EmployeeService = require('./EmployeeService');



exports.AddEvaluation = async (evaluation) => {
    try {
        const _evaluation = await EvaluationRepo(evaluation);
        var savedEvauation = await _evaluation.save();
        var _emps = evaluation.Employees.map(x => x._id);
        await UserRepo.updateMany({ _id: { $in: _emps } }, { $set: { HasActiveEvaluation: "Yes" } });
        const _currentEvaluation = await EvaluationRepo.findOne({ _id: Mongoose.Types.ObjectId(savedEvauation._id) })
            .populate('Employees._id Employees.Peers.EmployeeId Employees.DirectReportees.EmployeeId CreatedBy').sort({ CreatedDate: -1 })
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
        console.log('mail', mailObject);
        SendMail.SendEmail(mailObject, async function (res) {
            console.log(res);
        });
        _currentEvaluation.Employees.map(e => {
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
                    User: p.EmployeeId._id,
                    Type: 'Peer Review',
                    IsDelivered: false,
                    Email: p.EmployeeId.Email,
                    Template: `<h1>Dear ${p.EmployeeId.FirstName} <br/>
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
                    User: d.EmployeeId._id,
                    Type: 'Direct Reportee Review',
                    IsDelivered: false,
                    Email: d.EmployeeId.Email,
                    Template: `<h1>Dear ${d.EmployeeId.FirstName} <br/>
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
        return true;
    } catch (error) {
        logger.error('error while Adding a Evaluation Form:', error)
        throw error;
    }

};
exports.GetEvaluations = async (clientId) => {
    var response = {}
    response["kpiList"] = []
    response["evaluations"] = []
    try {

        response["evaluations"] = await EvaluationRepo.find({
            Company: Mongoose.Types.ObjectId(clientId.clientId)
        }).populate("Employees.Model")
            .populate({ path: 'Employees._id', populate: { path: 'Manager' } })
            .sort({ CreatedDate: -1 })
        

        response["kpiList"] = await KpiFormRepo.aggregate([
            { $match: { Company: Mongoose.Types.ObjectId(clientId.clientId) } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'EmployeeId',
                    foreignField: '_id',
                    as: 'Employee'
                }
            },
            {$match:{"Employee.HasActiveEvaluation":{ $ne: "Yes" }}},
            {
                $lookup: {
                    from: 'users',
                    localField: 'Employee.Manager',
                    foreignField: '_id',
                    as: 'Manager'
                }
            },
            {
                $project: {
                    "Manager": {
                        "$arrayToObject": {
                            "$map": {
                                "input": "$Manager",
                                "as": "el",
                                "in": {
                                    "k": "Name",
                                    "v": { $concat: ["$$el.FirstName", " ", "$$el.MiddleName", " ", "$$el.LastName"] }
                                }
                            }
                        }
                    },
                    Employee: 1,
                    CreatedDate: 1,
                    EvaluationYear: 1
                }
            }
        ])
        response["kpiList"].map(x => {
            x.Type = "K"
        })
        return [...response["kpiList"], ...response["evaluations"]];
    } catch (error) {
        logger.error('error while GetEvaluations :', error)
        throw error;
    }


}
exports.GetEvaluationFormById = async (formId) => {
    try {
        return await EvaluationRepo.findById({ _id: Mongoose.Types.ObjectId(formId.id) }).populate('Employees._id')
    } catch (error) {

    }

}

exports.DraftEvaluation = async (evaluation) => {
    const _evaluation = await EvaluationRepo(evaluation);
    await _evaluation.save();
    return true;
};

exports.UpdateDirectReportees = async (evaluation) => {
    try {
        const toupdateForm = await EvaluationRepo.findOne({ _id: Mongoose.Types.ObjectId(evaluation.EvaluationId) });
        toupdateForm.Employees.find(x => x._id.toString() === evaluation.EmployeeId).DirectReportees = evaluation.DirectReportees;
        toupdateForm.Employees.find(x => x._id.toString() === evaluation.EmployeeId).DirectReporteeComptencyMessage = evaluation.DirectReporteeCompetencyMessage;
        toupdateForm.Employees.find(x => x._id.toString() === evaluation.EmployeeId).DirectReporteeCompetencyList = evaluation.DirectReporteeCompetencyList;
        //Object.assign(toupdateForm, evaluation);
        var ff = await toupdateForm.save();
        var _deliveremails = [];
        toupdateForm.Employees.find(x => x._id.toString() === evaluation.EmployeeId).DirectReportees.map(p => {
            _deliveremails.push({
                User: p.EmployeeId._id,
                Type: 'Direct Reportee Review',
                IsDelivered: false,
                Email: p.EmployeeId.Email,
                Template: `<h1>Dear ${p.EmployeeId.FirstName} <br/>
        New Evaluation form has been rolledout. Please access Portal to submit the review.
        <br/>
        <br/>
        Thank you
        OPAssess Admin
        `,
                Company: "",
                Subject: 'New Direct Reportee Review Requested'
            })
        })
        var de = await DeliverEmailRepo.insertMany(_deliveremails);
        return true;
    } catch (error) {
        logger.error('error while updating Direct Reportee Review:', error)
        throw error;
    }

};

exports.UpdatePeers = async (evaluation) => {
    try {
        const toupdateForm = await EvaluationRepo.findOne({ _id: Mongoose.Types.ObjectId(evaluation.EvaluationId) });
        toupdateForm.Employees.find(x => x._id.toString() === evaluation.EmployeeId).Peers = evaluation.Peers;
        toupdateForm.Employees.find(x => x._id.toString() === evaluation.EmployeeId).PeersCompetencyMessage = evaluation.PeersCompetencyMessage;
        toupdateForm.Employees.find(x => x._id.toString() === evaluation.EmployeeId).PeersCompetencyList = evaluation.PeersCompetencyList;
        //Object.assign(toupdateForm, evaluation);
        var ff = await toupdateForm.save();
        var _deliveremails = [];
        toupdateForm.Employees.find(x => x._id.toString() === evaluation.EmployeeId).Peers.map(p => {
            _deliveremails.push({
                User: p.EmployeeId._id,
                Type: 'Peer Review',
                IsDelivered: false,
                Email: p.EmployeeId.Email,
                Template: `<h1>Dear ${p.EmployeeId.FirstName} <br/>
        New Evaluation form has been rolledout. Please access Portal to submit the review.
        <br/>
        <br/>
        Thank you
        OPAssess Admin
        `,
                Company: "",
                Subject: 'New Peer Review Requested'
            })
        })
        var de = await DeliverEmailRepo.insertMany(_deliveremails);
        return true;
    } catch (error) {
        logger.error('error while updating Direct Reportee Review:', error)
        throw error;
    }

};
exports.GetCompetencyValues = async (evaluation) => {
    const evaluationForm = await EvaluationRepo.findOne({ _id: Mongoose.Types.ObjectId(evaluation.EvaluationId), "Employees._id": ObjectId(evaluation.employeeId) });
    var employee = await evaluationForm.Employees.find(x => x._id.toString() === evaluation.employeeId);
    if (employee && employee.Competencies && employee.Competencies.length > 0) {
        return evaluationForm;
    } else {
        var modelAggregation = await ModelsRepo.aggregate([
            { $match: { _id: ObjectId(employee.Model) } },
            {
                $lookup:
                {
                    from: "competencies",
                    localField: "Competencies",
                    foreignField: "_id",
                    as: "competenciesList"
                }
            },
            {
                $lookup:
                {
                    from: "questions",
                    localField: "competenciesList.Questions",
                    foreignField: "_id",
                    as: "Questions"
                }
            }
        ])
        var list = [];
        for (let index = 0; index < modelAggregation[0].Questions.length; index++) {
            const element = modelAggregation[0].competenciesList[index];
            const Questions = [];
            for (let k = 0; k < element.Questions.length; k++) {
                const q = element.Questions[k];
                var f = await questionsRepo.findById(ObjectId(q))
                if (f) {
                    f.SelectedRating = -1
                    Questions.push(f)
                }
            }
            list.push({ _id: new ObjectId(), Competency: element, Questions })
        }
        evaluationForm.Employees[0].Competencies = list;
        var t = await evaluationForm.save()
        return t;
    }


    //const r = list
    //return r;

}


exports.GetEvaluationDashboardData = async (request) => {
    let evalDashboardResponse = {};
    let aggregateArray = [];
    let { userId } = request;
    let organization = await OrganizationSchema.findOne({ "Admin": userId });
    let { EvaluationPeriod } = organization;
    /**
     * Start->Charts
     */
    let matchObject = {};
    matchObject['$match'] = {};
    matchObject['$match']["Company"] = organization._id;
    matchObject['$match']["CreatedDate"] = {};
    matchObject['$match']["CreatedDate"] = {
        "$gte": moment().startOf('year').toDate(),
        "$lt": moment().endOf('year').toDate()
    };
    aggregateArray[0] = matchObject;
    let groupObj = {};
    groupObj['$group'] = {};
    groupObj['$group']['_id'] = "$status";
    groupObj['$group']['count'] = {};
    groupObj['$group']['count']['$sum'] = 1;
    aggregateArray[1] = groupObj;
    evalDashboardResponse['chart'] = await EvaluationRepo.aggregate(aggregateArray);
    /**
     * End->Chart
     */

    /**
     * Start->Next Evaluation
     */

    evalDashboardResponse['next_evaluation'] = {};
    if (EvaluationPeriod && EvaluationPeriod === 'CalendarYear') {
        let momentNextEvlDate = moment().add(1, 'years').startOf('year');
        evalDashboardResponse['next_evaluation']['date'] = momentNextEvlDate.format("MMM Do YYYY");
        evalDashboardResponse['next_evaluation']['days'] = momentNextEvlDate.diff(moment(), 'days');
    }
    let totalEmployees = await UserRepo.countDocuments({ "Organization": organization._id });
    evalDashboardResponse['next_evaluation']['total_employees'] = totalEmployees

    let currentEvlEmployees = await EvaluationRepo.aggregate([
        matchObject,
        { $unwind: '$Employees' },
        { $match: { "Employees.status": { "$exists": true, "$ne": "completed" } } },
        { $group: { _id: '$_id', count: { $sum: 1 } } }
    ]);
    let currPendingEval = currentEvlEmployees.map(item => item.count).reduce((prev, next) => prev + next);
    evalDashboardResponse['next_evaluation']['current_pending_evealuations'] = currPendingEval;
    /**
     * Start->Overdue Evaluations
     */
    let evalDate;
    if (EvaluationPeriod && EvaluationPeriod === 'CalendarYear') {
        evalDate = moment().startOf('year');
    }
    let overDueCondition = [
        {
            "$match": {
                "Company": organization._id,
                "CreatedDate": { "$lt": evalDate.toDate() },
                "Employees.status": { "$ne": "completed" }
            }
        },
        { $lookup: { from: 'users', localField: 'Employees._id', foreignField: '_id', as: 'users' } }
    ];
    let overDueEvaluations = await EvaluationRepo.aggregate(overDueCondition);
    let overDueEvaluationEmps = [];
    overDueEvaluations.forEach(overDueObj => {
        let { CreatedDate, users } = overDueObj;
        for (var i = 0; i < users.length; i++) {
            let userObj = users[i];
            let overDueEvaluationEmp = {
                name: userObj.FirstName,
                designation: userObj.Role,
                noOfDays: evalDate.diff(CreatedDate, 'days')
            }
            overDueEvaluationEmps.push(overDueEvaluationEmp);
        }
    });
    evalDashboardResponse['overdue_evaluation'] = overDueEvaluationEmps;
    return evalDashboardResponse;
}


exports.GetEmpCurrentEvaluation = async (emp) => {
    var returnObject = {};
    returnObject["Competencies"] = {}
    returnObject["FinalRating"] = {}
    returnObject["KpiList"] = []
    returnObject["PeerScoreCard"] = {}
    returnObject["DirectReporteeScoreCard"] = {}
    try {
        const evaluationForm = await EvaluationRepo.findOne({ "Employees._id": ObjectId(emp.EmployeeId) }).populate("Employees.PeersCompetencyList._id").select({ "Employees.Peers": 0 });
        if (!evaluationForm) {
            throw "No Evaluation Found";
        }
        var employee = await evaluationForm.Employees.find(x => x._id.toString() === emp.EmployeeId);
        if (!employee) {
            throw "No Emploee Found";
        }
        var returnObject = {};
        if (employee) {
            const Kpi = await KpiRepo.find({
                'Owner': emp.EmployeeId,
                'IsDraftByManager': false,
                'EvaluationYear': new Date().getFullYear(),
                // 'EvaluationId': evaluationForm._id.toString()
            }).populate('MeasurementCriteria.measureId Owner')
                .sort({ UpdatedOn: -1 });
            //this.GetCompetencyFormRatings({ EvaluationId: evaluationForm._id.toString(), EmployeeId: employee._id.toString() })// 
            returnObject.KpiList = Kpi;
            returnObject.Competencies = await this.GetCompetencyValues({ EvaluationId: evaluationForm._id, employeeId: employee._id.toString() });
            returnObject.FinalRating = employee.FinalRating;
            returnObject.PeerScoreCard = await this.GetPeerAvgRating({ EvaluationId: evaluationForm._id.toString(), EmployeeId: employee._id.toString() })
            returnObject.DirectReporteeScoreCard = await this.GetDirectReporteeAvgRating({ EvaluationId: evaluationForm._id.toString(), EmployeeId: employee._id.toString() })

            return returnObject;
        }
    } catch (error) {
        logger.error('error occurred ', error)
        throw error;
    }


}
exports.GetEmployeePeersCompetencies = async (peer) => {
    const evaluationForm = await EvaluationRepo.findOne({ _id: Mongoose.Types.ObjectId(peer.evaluationId), "Employees.Peers._id": ObjectId(peer.peerId) });
    var returnObject = {}
    if (evaluationForm && evaluationForm.Employees && evaluationForm.Employees.length > 0) {
        var emp = evaluationForm.Employees.find(x => x._id.toString() === peer.empId);
        var currentPeer = emp.Peers.find(x => x._id.toString() === peer.peerId);
        var competencyId = currentPeer.PeersCompetencyList.map(x => { return x._id });
        var modelAggregation = await ModelsRepo.aggregate([
            {
                $match: {
                    _id: ObjectId(emp.Model)
                }
            },
            {
                $lookup:
                {
                    from: "competencies",
                    localField: "Competencies",
                    foreignField: "_id",
                    as: "competenciesList"
                }
            }
        ]);

        var list = [];

        for (let index = 0; index < modelAggregation[0].competenciesList.length; index++) {
            const c = {};
            const element = modelAggregation[0].competenciesList[index];
            if (competencyId.indexOf(element._id.toString()) < 0) {
                continue;
            }
            const Questions = [];
            for (let k = 0; k < element.Questions.length; k++) {
                const q = element.Questions[k];
                var f = await questionsRepo.findById(ObjectId(q))
                if (f) {
                    f.SelectedRating = -1
                    Questions.push(f)
                }
            }
            list.push({ Competency: element, Questions })
        }
        returnObject.Competencies = list;

    }
    return returnObject;

}

exports.GetPeersRatingForEmployee = async (emp) => {
    try {
        var list = await EvaluationRepo.findOne({ _id: ObjectId(emp.EvaluationId), "Employees._id": ObjectId(emp.EmployeeId) }).populate("Peers.EmployeeId")



        return list;
    } catch (error) {
        logger.error('Error Occurred while getting data for Peer Review list:', error)
        return Error(error.message)
    }
}

exports.GetPeerAvgRating = async (emp) => {

    try {
        var list = await EvaluationRepo.aggregate([
            { $match: { _id: ObjectId(emp.EvaluationId), "Employees._id": Mongoose.Types.ObjectId(emp.EmployeeId) } },
            { $unwind: "$Employees" },
            {
                $project: {
                    _id: 0,
                    "EvaluationId": 1,
                    "Employees._id": 1,
                    "EvaluationPeriod": 1,
                    "EvaluationDuration": 1,
                    "Employees.Peers.EmployeeId": 1,
                    "Employees.Peers.CompetencyOverallRating": 1
                }

            },
            {
                $lookup:
                {
                    from: "users",
                    localField: "Employees.Peers.EmployeeId",
                    foreignField: "_id",
                    as: "PeerList"

                }
            }
            ,
            {
                $addFields: {
                    averageScore: { $avg: "$Employees.Peers.CompetencyOverallRating" }

                }
            },

            {
                $project: {
                    "PeerList._id": 1,
                    "PeerList.FirstName": 1,
                    "PeerList.LastName": 1,
                    "PeerList.Email": 1,
                    "PeerList.Manager": 1,
                    "EvaluationPeriod": 1,
                    "EvaluationDuration": 1,
                    "EvaluationId": 1,
                    "averageScore": 1

                }
            }
        ]

        )
        return list[0];
    } catch (error) {
        logger.error('Error Occurred while getting data for Peer Review list:', error)
        return Error(error.message)
    }
}

exports.GetDirectReporteeAvgRating = async (emp) => {

    try {
        var list = await EvaluationRepo.aggregate([
            { $match: { _id: ObjectId(emp.EvaluationId), "Employees._id": Mongoose.Types.ObjectId(emp.EmployeeId) } },
            { $unwind: "$Employees" },
            {
                $project: {
                    _id: 0,
                    "EvaluationId": 1,
                    "Employees._id": 1,
                    "EvaluationPeriod": 1,
                    "EvaluationDuration": 1,
                    "Employees.DirectReportees.EmployeeId": 1,
                    "Employees.DirectReportees.CompetencyOverallRating": 1
                }

            },
            { $match: { "Employees._id": Mongoose.Types.ObjectId(emp.EmployeeId) } },
            {
                $lookup:
                {
                    from: "users",
                    localField: "Employees.DirectReportees.EmployeeId",
                    foreignField: "_id",
                    as: "DirectReporteesList"
                }
            },
            {
                $addFields: {
                    averageScore: { $avg: "$Employees.DirectReportees.CompetencyOverallRating" }

                }
            },

            {
                $project: {
                    "DirectReporteesList._id": 1,
                    "DirectReporteesList.FirstName": 1,
                    "DirectReporteesList.LastName": 1,
                    "DirectReporteesList.Email": 1,
                    "DirectReporteesList.Manager": 1,
                    "EvaluationPeriod": 1,
                    "EvaluationDuration": 1,
                    "EvaluationId": 1,
                    "averageScore": 1

                }
            }
        ]

        )
        return list[0];
    } catch (error) {
        logger.error('Error Occurred while getting data for Peer Review list:', error)
        return Error(error.message)
    }
}

exports.GetCompetencyFormRatings = async (evaluation) => {
    var currentEvaluationForm = await EvaluationRepo.aggregate([
        { $match: { _id: ObjectId(evaluation.EvaluationId) } },
        { $unwind: "$Employees" },
        { $match: { "Employees._id": Mongoose.Types.ObjectId(evaluation.EmployeeId) } },
        {
            $project: {
                _id: 0,
                "EvaluationId": 1,
                "EvaluationPeriod": 1,
                "EvaluationDuration": 1,
                "Employees": 1
            }
        }
    ])
    if (currentEvaluationForm && currentEvaluationForm.length > 0) {
        const currentEmployee = currentEvaluationForm[0].Employees;
        if (currentEmployee && currentEmployee.Competencies && currentEmployee.Competencies.length > 0) {
            return currentEmployee;
        } else {
            var modelAggregation = await ModelsRepo.aggregate([
                { $match: { _id: currentEmployee.Model } },
                {
                    $lookup:
                    {
                        from: "competencies",
                        localField: "Competencies",
                        foreignField: "_id",
                        as: "competenciesList"
                    }
                },
                {
                    $lookup:
                    {
                        from: "questions",
                        localField: "competenciesList.Questions",
                        foreignField: "_id",
                        as: "Questions"
                    }
                }
            ])
            var list = [];
            for (let index = 0; index < modelAggregation[0].Questions.length; index++) {
                const q = modelAggregation[0].Questions[index];
                q.SelectedRating = -1
            }
            for (let index = 0; index < modelAggregation[0].competenciesList.length; index++) {
                const c = {};
                const element = modelAggregation[0].competenciesList[index];
                const Questions = [];
                for (let k = 0; k < element.Questions.length; k++) {
                    const q = element.Questions[k];
                    var f = await questionsRepo.findById(ObjectId(q))
                    if (f) {
                        f.SelectedRating = -1
                        Questions.push(f)
                    }
                }
                list.push({ _id: new ObjectId(), Competency: element, Questions })
            }
            currentEmployee.Competencies = list;
            currentEvaluationForm[0].Employees.Competencies = list;
            var t = await currentEvaluationForm.save()
            return currentEmployee;
        }

    }



}


//#region Manager's Reportees Start
exports.GetReporteeEvaluations = async (manager) => {
    try {
        const reportees = await UserRepo.aggregate([
            { $match: { Manager: ObjectId(manager.id) } },
            { $addFields: { EmployeeId: "$_id" } },
            {
                $project: {
                    FirstName: 1,
                    LastName: 1,
                    Email: 1,
                    EmployeeId: 1
                }
            },
            {
                $lookup: {
                    from: "evalutions",
                    localField: "EmployeeId",
                    foreignField: "Employees._id",
                    as: "EvaluationList"
                }
            }
            ,
            {
                $match: {
                    "EvaluationList.EvaluationYear": new Date().getFullYear().toString()
                }
            },

            {
                $lookup: {
                    from: "devgoals",
                    localField: "EmployeeId",
                    foreignField: "Owner",
                    as: "GoalList",
                }
            },
            {
                $lookup: {
                    from: "kpis",
                    localField: "EmployeeId",
                    foreignField: "Owner",
                    as: "KpiList"
                }

            },
            { $addFields: { Evaluation: "$EvaluationList.Employees" } },



            {
                $match: {
                    $or: [{
                        "KpiList.EvaluationYear": new Date().getFullYear().toString(),
                        "KpiList.IsDraft": false, "KpiList.IsSubmitedKPIs": true
                    }]
                }
            },

            {
                $project: {
                    KpiList: 1,
                    GoalList: 1,
                    Email: 1,
                    FirstName: 1,
                    LastName: 1,
                    EmployeeId: 1,
                    Evaluation: 1


                }
            }
            // ,
            // {$unwind:{"EvaluationList.Employees":1}}
        ])
        return reportees;

    } catch (error) {
        console.log('error', error)
        logger.error(error);
    }
}
//#endregion

exports.GetTSReporteeEvaluations = async (ts) => {
    try {
        const reportees = await UserRepo.aggregate([
            { $match: { ThirdSignatory: ObjectId(ts.id) } },
            { $addFields: { EmployeeId: "$_id" } },
            {
                $project: {
                    FirstName: 1,
                    LastName: 1,
                    Email: 1,
                    EmployeeId: 1
                }
            },
            {
                $lookup: {
                    from: "evalutions",
                    localField: "EmployeeId",
                    foreignField: "Employees._id",
                    as: "EvaluationList"
                }
            }
            ,
            {
                $match: {
                    "EvaluationList.EvaluationYear": new Date().getFullYear().toString()
                }
            },

            {
                $lookup: {
                    from: "devgoals",
                    localField: "EmployeeId",
                    foreignField: "Owner",
                    as: "GoalList",
                }
            },
            {
                $lookup: {
                    from: "kpis",
                    localField: "EmployeeId",
                    foreignField: "Owner",
                    as: "KpiList"
                }

            },
            { $addFields: { Evaluation: "$EvaluationList.Employees" } },

            {
                $project: {
                    KpiList: 1,
                    GoalList: 1,
                    Email: 1,
                    FirstName: 1,
                    LastName: 1,
                    EmployeeId: 1,
                    Evaluation: 1


                }
            }
            // ,
            // {$unwind:{"EvaluationList.Employees":1}}
        ])
        return reportees;

    } catch (error) {
        console.log('error', error)
        logger.error(error);
    }
}


exports.ReleaseKpiForm = async (evaluation) => {
    const g = await KpiFormRepo.insertMany(evaluation);
    // const _evaluation = await KpiFormRepo(evaluation);
    // var savedEvauation = await _evaluation.save();

    return true;
}