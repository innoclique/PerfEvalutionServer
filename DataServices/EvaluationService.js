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
var fs = require("fs");
const moment = require('moment');

const ModelsRepo = require('../SchemaModels/Model');
const ObjectId = Mongoose.Types.ObjectId;
const KpiRepo = require('../SchemaModels/KPI');
const MeasureCriteriaRepo = require('../SchemaModels/MeasurementCriteria');
const KpiFormRepo = require('../SchemaModels/KpiForm');
const EmployeeService = require('./EmployeeService');

const statusRepo=require('../SchemaModels/Statuses');

exports.AddEvaluation = async (evaluation) => {
    try {
        if(evaluation.EvaluationId){
            let employee = evaluation.Employees[0];
            const _evaluation = await EvaluationRepo.update(
                {
                    "_id":Mongoose.Types.ObjectId(evaluation.EvaluationId),
                    "Employees._id":Mongoose.Types.ObjectId(employee.EmployeeId)
                },
                {$set:{"Employees.$.Model":Mongoose.Types.ObjectId((evaluation.Model))}})
            return true;
        }
        console.log("Insert Evaluation");
        const evalStatus = await statusRepo.findOne({Key:"init"});
        let {Employees} = evaluation;
        Employees = Employees.map(employee=>{
            employee.Status=evalStatus._id;
            return employee;
        });
        evaluation.Employees = Employees;
        const _evaluation = await EvaluationRepo(evaluation);
        var savedEvauation = await _evaluation.save();
        var _emps = evaluation.Employees.map(x => x._id);
        await UserRepo.updateMany({ _id: { $in: _emps } }, { $set: { HasActiveEvaluation: "Yes" } });
        await KpiFormRepo.updateMany({ EmployeeId: { $in: _emps } }, { $set: { IsActive: false } });
        const _currentEvaluation = await EvaluationRepo.findOne({ _id: Mongoose.Types.ObjectId(savedEvauation._id) })
            .populate('Employees._id Employees.Peers.EmployeeId Employees.DirectReportees.EmployeeId CreatedBy').sort({ CreatedDate: -1 })
        var _deliveremails = [];


        await this.sendmail(_currentEvaluation.CreatedBy);
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
            Company: Mongoose.Types.ObjectId(clientId.clientId),
            "Employees":{$exists: true, $ne: [null]}
        }).populate("Employees.Model")
            .populate({ path: 'Employees._id', populate: { path: 'Manager' } })
            .populate("Statuses.Model").populate({ path: 'Employees.Status', populate: { path: 'Stasuses' } })
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
            { $match: { "Employee.HasActiveEvaluation": { $ne: "Yes" } } },
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

                Subject: 'New Peer Review Requested'
            })
        })
        var de = await DeliverEmailRepo.insertMany(_deliveremails);
        return true;
    } catch (error) {
        logger.error('error while updating Peer  Review:', error)
        throw error;
    }

};
exports.GetCompetencyValues = async (evaluation) => {
    try {
        const evaluationForm = await EvaluationRepo.findOne({ _id: Mongoose.Types.ObjectId(evaluation.EvaluationId), "Employees._id": ObjectId(evaluation.employeeId) });
        var employee = await evaluationForm.Employees.find(x => x._id.toString() === evaluation.employeeId);
        if (employee && employee.Competencies && employee.Competencies.length > 0) {
            return { EvaluationId: evaluationForm._id, Employee: employee };
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
            if (modelAggregation.length > 0) {
                for (let index = 0; index < modelAggregation[0].competenciesList.length; index++) {
                    const element = modelAggregation[0].competenciesList[index];
                    const Questions = [];
                    for (let k = 0; k < element.Questions.length; k++) {
                        const q = element.Questions[k];
                        var f = await questionsRepo.findById(ObjectId(q))
                        if (f) {
                            f.SelectedRating = 0
                            Questions.push(f)
                        }
                    }
                    list.push({ _id: new ObjectId(), Competency: element, Questions, Comments: "" })
                }
            }
            evaluationForm.Employees.find(x => x._id.toString() === evaluation.employeeId).Competencies = list;
            evaluationForm.Employees.find(x => x._id.toString() === evaluation.employeeId).Manager.Competencies = list;

            var t = await evaluationForm.save()
            var employee = await evaluationForm.Employees.find(x => x._id.toString() === evaluation.employeeId);
            if (employee && employee.Competencies && employee.Competencies.length > 0) {
                return { EvaluationId: evaluationForm._id, Employee: employee };
            }
        }
    } catch (error) {
        logger.error(error);
        throw error;
    }


    //const r = list
    //return r;

}


exports.GetEvaluationDashboardData = async (request) => {
    let evalDashboardResponse = {};
    let aggregateArray = [];
    let { userId } = request;
    let _userObj = await UserRepo.findOne({"_id":Mongoose.Types.ObjectId(userId)}).populate("Organization");
    let orgId = _userObj.Organization._id;
    let { EvaluationPeriod,StartMonth } = _userObj.Organization;
    /**
     * Start->Charts
     */
    let pieObject={};
    let evaluationArray = await EvaluationRepo.find(
        {"EvaluationYear" : moment().format("YYYY"), 
        "Company": ObjectId(orgId) }).populate("Employees.Status");
        
    evaluationArray.forEach(evaluation=>{
        let {Employees} = evaluation;
        Employees.forEach(employee=>{
            let {Status} = employee;
            if(Status){
                let key = Status.Status;
                if(pieObject[key]){
                    pieObject[key]+=1;
                }else{
                    pieObject[key]=1;
                }
            }
        })
    });
    
    evalDashboardResponse['pieChart'] = {
        labels:Object.keys(pieObject),
        numbers:Object.values(pieObject)
    };


    //evalDashboardResponse['chart'] = await EvaluationRepo.aggregate(aggregateArray);
    /**
     * End->Chart
     */

    /**
     * Start->Next Evaluation
     */
    evalDashboardResponse['next_evaluation'] = {};

    if (EvaluationPeriod && EvaluationPeriod === 'CalendarYear') {
        let momentNextEvlDate = moment().startOf('month').add(1, 'years').startOf('year');
        evalDashboardResponse['next_evaluation']['date'] = momentNextEvlDate.format("MMM DD,YYYY");
        evalDashboardResponse['next_evaluation']['days'] = momentNextEvlDate.diff(moment(), 'days');
    }
    if (EvaluationPeriod && EvaluationPeriod === 'FiscalYear') {
        let momentNextEvlDate = moment().month(parseInt(StartMonth)-1).startOf('month').add(1, 'years');
        //let fiscalEndMonth = moment().add(1, 'years').month(parseInt(StartMonth)-1);
        evalDashboardResponse['next_evaluation']['date'] = momentNextEvlDate.format("MMM DD,YYYY");
        evalDashboardResponse['next_evaluation']['days'] = momentNextEvlDate.diff(moment(), 'days');
    }
    

    let totalEmployees = await UserRepo.countDocuments({ "Organization": orgId,"Role":"EO" });

    evalDashboardResponse['next_evaluation']['total_employees'] = totalEmployees;
    let currPendingEval = 0;
    let evaluationList = await EvaluationRepo.find({
        "Company":Mongoose.Types.ObjectId(orgId),
        "status":{ "$exists": true, "$ne": "Completed" }
    });
    evaluationList.forEach(evaluation=>{
        let {Employees} = evaluation;
        if(Employees && Employees.length>0){
            currPendingEval+=Employees.length;
        }
    })
    let {Completed} =pieObject;
    if(Completed){
        currPendingEval=currPendingEval-pieObject.Completed;
    }
    evalDashboardResponse['next_evaluation']['current_pending_evealuations'] = currPendingEval;
    /**
     * Start->Overdue Evaluations
     */
    let evalDate;
    if (EvaluationPeriod && EvaluationPeriod === 'CalendarYear') {
        evalDate = moment().startOf('year');
    }

    if (EvaluationPeriod && EvaluationPeriod === 'FiscalYear') {
        evalDate = moment().startOf('year');
    }

    let overDueCondition = [
        {
            "$match": {
                "Company": orgId,
                "CreatedDate": { "$lt": evalDate.toDate() },
                "Employees.Status": { "$ne": "Completed" }
            }
        },
        { $lookup: { from: 'users', localField: 'Employees._id', foreignField: '_id', as: 'users' } }
    ];
    let overDueEvaluations = await EvaluationRepo.aggregate(overDueCondition);
    let overDueEvaluationEmps = [];
    
    overDueEvaluations.forEach(overDueObj => {
        
        let { CreatedDate,status, users, Employees } = overDueObj;
        for (var i = 0; i < users.length; i++) {
            let userObj = users[i];
            //let selectedEmployee = Employees.find(emp=>emp._id==userObj._id)
            let overDueEvaluationEmp = {
                name: userObj.FirstName,
                title: userObj.Title || "",
                designation: userObj.Role,
                status:status
                //noOfDays: evalDate.diff(CreatedDate, 'days')
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
    returnObject["ManagerCompetencies"] = {}
    returnObject["FinalRating"] = {}
    returnObject["KpiList"] = []
    returnObject["PeerScoreCard"] = {}
    returnObject["DirectReporteeScoreCard"] = {}
    returnObject["OverallCompetencyRatings"] = []
    let status = ['Active', 'InProgress','Completed'];
    try {
        const evaluationForm = await EvaluationRepo.findOne(
            {
                Employees: { $elemMatch: { _id: ObjectId(emp.EmployeeId) }},
                EvaluationYear: new Date().getFullYear().toString()
            }
        ).populate("Employees.PeersCompetencyList._id").select({ "Employees.Peers": 0 });
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
            returnObject.ManagerCompetencies = await this.GetEmpCompetenciesForManager({ EvaluationId: evaluationForm._id, employeeId: employee._id.toString() })
            returnObject.OverallCompetencyRating = await EmployeeService.GetOverallRatingByCompetency({ EvaluationId: evaluationForm._id, ForEmployeeId: employee._id.toString() })
            returnObject.Employee_Evaluation = employee;
            return returnObject;
        }
    } catch (error) {
        logger.error('error occurred ', error)
        throw error;
    }


}

exports.GetEmpEvaluationByEmpId = async (emp) => {
    var returnObject = {};
    returnObject["Competencies"] = {}
    returnObject["ManagerCompetencies"] = {}
    returnObject["FinalRating"] = {}
    returnObject["KpiList"] = []
    returnObject["PeerScoreCard"] = {}
    returnObject["DirectReporteeScoreCard"] = {}
    returnObject["OverallCompetencyRatings"] = []
    let status = ['Active', 'InProgress','Completed'];
    try {
        const evaluationForm = await EvaluationRepo.findOne(
            {
                Employees: { $elemMatch: { _id: ObjectId(emp.EmployeeId) }},
                EvaluationYear: new Date().getFullYear().toString()
            }
        ).populate("Employees.PeersCompetencyList._id").select({ "Employees.Peers": 0 });
        if (!evaluationForm) {
            console.log("No Evaluation Found");
            return null;
        }
        var employee = await evaluationForm.Employees.find(x => x._id.toString() === emp.EmployeeId);
        if (!employee) {
            console.log("No Emploee Found");
            return null;
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
            returnObject.ManagerCompetencies = await this.GetEmpCompetenciesForManager({ EvaluationId: evaluationForm._id, employeeId: employee._id.toString() })
            returnObject.OverallCompetencyRating = await EmployeeService.GetOverallRatingByCompetency({ EvaluationId: evaluationForm._id, ForEmployeeId: employee._id.toString() })
            returnObject.Employee_Evaluation = employee;
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
                    f.SelectedRating = 0
                    Questions.push(f)
                }
            }
            list.push({ Competency: element, Questions })
        }
        returnObject.Competencies = list;

    }
    return returnObject;

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
                    "Employees.Peers.CompetencyOverallRating": 1,
                    "Employees.Peers.CompetencySubmitted": 1
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
                    "Employees":1,
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

        );
        let peerList = list.find(peerInfo=>peerInfo.Employees._id==emp.EmployeeId);
        return peerList;
    } catch (error) {
        logger.error('Error Occurred while getting data for Peer Review list:', error)
        return Error(error.message)
    }
}
exports.UpdateEvaluationStatus = async (empId,status) => {
    let CompetencySubmitted = false;
    let CompetencySubmittedByManager = false;
    let score=0;
    let empObj={"EmployeeId":empId}
    let currentEmpEvaluation = await this.GetEmpEvaluationByEmpId(empObj);
    console.log(`status: ${status}`);
    if(currentEmpEvaluation){
        let {PeerScoreCard} = currentEmpEvaluation;
        let _userObj = await UserRepo.findOne({"_id":Mongoose.Types.ObjectId(empId)});
        if(currentEmpEvaluation && currentEmpEvaluation.Employee_Evaluation && currentEmpEvaluation.Employee_Evaluation.Status){
            let {Employee_Evaluation} = currentEmpEvaluation;
            let {Manager} = Employee_Evaluation;
            const evalStatus = await statusRepo.findOne({_id:Mongoose.Types.ObjectId(Employee_Evaluation.Status)});
            score = evalStatus.Percentage;
            CompetencySubmitted = Employee_Evaluation.CompetencySubmitted;
            CompetencySubmittedByManager = Manager.CompetencySubmitted;
        }
        if(status === "PG_SCORE_SUBMITTED" && !CompetencySubmitted){
            let {KpiList} = currentEmpEvaluation;
            let kpisScoreList = KpiList.filter(kpiObj => kpiObj.Score != "");
            if(kpisScoreList.length === KpiList.length){
                status="EmployeeGoalsCompleted";
            }else{
                status = "InProgress";
            }
        }

        if(status === "PG_SCORE_SUBMITTED" && CompetencySubmitted){
            let {KpiList} = currentEmpEvaluation;
            let kpisScoreList = KpiList.filter(kpiObj => kpiObj.Score != "");
            if(kpisScoreList.length === KpiList.length){
                status="CompletedGoalsCompetency";
            }
        }
        if(status === "COMPETENCY_SAVED_EMP" && (score == 5 || score == 10)){
            status = "InProgress";
        }

        if(status === "COMPETENCY_SUBMITTED" && score !== 25){
            status="EmployeeCompetencyCompleted";
        }

        if(status === "COMPETENCY_SUBMITTED" && score == 25){
            status="CompletedGoalsCompetency";
        }
        
        if(status === "MANAGER_SUBMITTED_PG_SCORE" && !CompetencySubmittedByManager){
            let {KpiList} = currentEmpEvaluation;
            let kpisScoreList = KpiList.filter(kpiObj => kpiObj.ManagerScore && kpiObj.ManagerScore != "");
            if(kpisScoreList.length === KpiList.length){
                status="ManagerPGCompleted";
            }else{
                status = "ManagerStarted";
            }
        }
        if(status === "MANAGER_SUBMITTED_PG_SCORE" && CompetencySubmittedByManager){
            let {KpiList} = currentEmpEvaluation;
            let kpisScoreList = KpiList.filter(kpiObj => kpiObj.ManagerScore && kpiObj.ManagerScore != "");
            if(kpisScoreList.length === KpiList.length){
                status="ManagerPGCompleted";
            }
        }

        if(status === "MANAGER_SAVE_COMPETENCY"){
            let {KpiList} = currentEmpEvaluation;
            let kpisScoreList = KpiList.filter(kpiObj => kpiObj.ManagerScore && kpiObj.ManagerScore != "");
            if(kpisScoreList.length === 0){
                status="ManagerStarted";
            }
        }

        if(status === "MANAGER_SUBMITTED_COMPETENCY" && score == 65){
            status="ManagerGoalsCompetencyCompleted";
            
        }

        if(status === "MANAGER_SUBMITTED_COMPETENCY" && score != 65){
            status="ManagerCompetencyCompleted";
        }

        
        if(status === "EmployeeRatingSubmission" && score > 45 && score<85){
            status="EmployeeSignoff";
            if(_userObj.ThirdSignatory.toString() === '5f60f96d08967f4688416a00'){
                status = "EvaluationComplete";
                
            }
        }

        if(status === "EmployeeRatingSubmission" && score > 85 && score<=95){
            status="EmployeeReSign_off";
        }

        if(status === "EmployeeManagerSignOff" && score > 80){
            status="RevisionSubmitted";
        }
        
        if(status === "PeerReview" && score == 75){
            let {PeerList} = PeerScoreCard;
            let submittedList = PeerList.filter(obj=>obj.CompetencySubmitted);
            if(PeerList.length === submittedList.length){
                status = "AwaitingPeerReview";
            }
        }
        if(status === "RevisionProgress" && score > 85){
            status="EvaluationComplete";
        }
        
        const evalStatus = await statusRepo.findOne({Key:status});
        if(evalStatus){
            console.log("Updating evaluation status = "+status);
            await EvaluationRepo.update(
                {"status" : "Active","Employees._id":Mongoose.Types.ObjectId(empId)},
                {$set:{'Employees.$.Status':evalStatus._id}}
                );
        }else{
            console.log("Not Updating status  "+status);
        }
    }else{
        console.log(`No Evaluation Found for the employee id : ${empId}`);
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
                    "Employees.DirectReportees.CompetencyOverallRating": 1,
                    "Employees.DirectReportees.CompetencySubmitted": 1
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
                    "Employees":1,
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



//#region Manager's Reportees Start
// exports.GetReporteeEvaluations = async (manager) => {
//     try {
//         const reportees = await UserRepo.aggregate([
//             { $match: { Manager: ObjectId(manager.id) } },
//             { $addFields: { EmployeeId: "$_id" } },
//             {
//                 $project: {
//                     FirstName: 1,
//                     LastName: 1,
//                     Email: 1,
//                     EmployeeId: 1
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "evalutions",
//                     localField: "EmployeeId",
//                     foreignField: "Employees._id",
//                     as: "EvaluationList"
//                 }
//             },
//             {
//                 $match: {
//                     "EvaluationList.EvaluationYear": new Date().getFullYear().toString(),


//                 }
//             },
//             {
//                 $lookup: {
//                     from: "devgoals",
//                     localField: "EmployeeId",
//                     foreignField: "Owner",
//                     as: "GoalList",
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "kpis",
//                     localField: "EmployeeId",
//                     foreignField: "Owner",
//                     as: "KpiList"
//                 }

//             },
//             //{$unwind:"$EvaluationList.Employees"},

//             { $addFields: { Evaluation: "$EvaluationList.Employees" } },



//             {
//                 $match: {
//                     $or: [{
//                         "KpiList.EvaluationYear": new Date().getFullYear().toString(),
//                         "KpiList.IsDraft": false, "KpiList.IsSubmitedKPIs": true
//                     }]
//                 }
//             },

//             {
//                 $project: {
//                     KpiList: 1,
//                     GoalList: 1,
//                     Email: 1,
//                     FirstName: 1,
//                     LastName: 1,
//                     EmployeeId: 1,
//                     Evaluation: 1

//                 }
//             }
//             // ,
//             // {$unwind:{"EvaluationList.Employees":1}}
//         ])
//         return reportees;

//     } catch (error) {
//         console.log('error', error)
//         logger.error(error);
//     }
// }
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
                    Manager: 1,
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
                    "EvaluationList.EvaluationYear": new Date().getFullYear().toString(),

                }
            },
            { $unwind: "$EvaluationList" },
            {
                $lookup: {
                    from: "statuses",
                    localField: "EvaluationList.Employees.Status",
                    foreignField: "_id",
                    as: "statuses",
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
                    from: "strengths",
                    localField: "EmployeeId",
                    foreignField: "Owner",
                    as: "StrengthList",
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
            { $addFields: { KpiExist: { $gt: [{ $size: "$KpiList" }, 0] } } },

            {
                $project: {
                    GoalList: {
                        "$filter": {
                            "input": "$GoalList",
                            "as": "goalresult",
                            "cond": {
                                "$and": [
                                    { "$eq": ["$$goalresult.CreatedYear", new Date().getFullYear()+""] },
                                    { "$eq": ["$$goalresult.IsDraft", false] },
                                    { "$eq": ["$$goalresult.IsGoalSubmited", true] }
                                ]
                            }
                        }
                    },
                    StrengthList: {
                        "$filter": {
                            "input": "$StrengthList",
                            "as": "strresult",
                            "cond": {
                                "$and": [
                                    { "$eq": ["$$strresult.CreatedYear", new Date().getFullYear()+""] },
                                    { "$eq": ["$$strresult.IsDraft", false] },
                                    { "$eq": ["$$strresult.IsStrengthSubmited", true] }
                                ]
                            }
                        }
                    },
                    Email: 1,
                    FirstName: 1,
                    LastName: 1,
                    EmployeeId: 1,
                    Manager: 1,
                    KpiExist: 1,
                    KpiList: {
                        "$filter": {
                            "input": "$KpiList",
                            "as": "result",
                            "cond": {
                                "$and": [
                                    { "$eq": ["$$result.EvaluationYear", new Date().getFullYear().toString()] },
                                    { "$eq": ["$$result.IsDraft", false] },
                                    { "$eq": ["$$result.IsSubmitedKPIs", true] }
                                ]
                            }
                        }
                    },
                    statuses: 1,
                    Evaluation: 1


                }
            }
            // ,
            // {$unwind:{"EvaluationList.Employees":1}}
        ]);

        let _reportees = [];
        reportees.forEach((reportee,index)=>{
            
            let {EmployeeId,Evaluation,statuses,FirstName} = reportee;
            let evaluationObj = Evaluation.find(element=>{
                let eid = element._id.toString();
                let empId = EmployeeId.toString();
                return eid==empId
            });
            let statusObj = statuses.find(status=>{
                let evalStatus = evaluationObj.Status.toString();
                let statusId = status._id.toString();
                return statusId == evalStatus
            });
            console.log(`FirstName: ${FirstName} - ${statusObj.Status}`);
            reportee['FRStatus'] = statusObj.Status
            _reportees[index]=reportee;
        })

        return _reportees;

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

exports.sendmail = async (user) => {
    fs.readFile("./EmailTemplates/EmailTemplate.html", async function read(err, bufcontent) {
        var content = bufcontent.toString();

        let des = `Evaluation has been successfully created.`
        content = content.replace("##FirstName##", user.FirstName);
        content = content.replace("##ProductName##", config.ProductName);
        content = content.replace("##Description##", des);
        content = content.replace("##Title##", "Evaluation Initiated");

        var mailObject = SendMail.GetMailObject(
            user.Email,
            "Evaluation Initiated",
            content,
            null,
            null
        );

        await SendMail.SendEmail(mailObject, function (res) {
            console.log(res);
        });
    })
}

//new Date().getFullYear()
exports.GetReporteeEvaluations = async (manager) => {
    try {
        const reportees = await UserRepo.aggregate([
            { $match: { Manager: ObjectId(manager.id)} },
            { $addFields: { EmployeeId: "$_id" } },
            {
                $project: {
                    FirstName: 1,
                    LastName: 1,
                    Email: 1,
                    EmployeeId: 1,
                    Manager: 1
                }
            }
            ,
            {
                $lookup: {
                    from: "evalutions",
                    localField: "EmployeeId",
                    foreignField: "Employees._id",
                    as: "EvaluationList"
                }
            },
            { $unwind: "$EvaluationList" },

            {
                $lookup: {
                    from: "statuses",
                    localField: "EvaluationList.Employees.Status",
                    foreignField: "_id",
                    as: "statuses",
                }
            },

            {
                $lookup: {
                    from: "strengths",
                    localField: "EmployeeId",
                    foreignField: "Owner",
                    as: "StrengthList",
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
            { $addFields: { KpiExist: { $gt: [{ $size: "$KpiList" }, 0] } } },
            //{$match:{"Evalaution.Status":"Active"}},
            {
                $project: {
                    //KpiList: 1,
                    GoalList: {
                        "$filter": {
                            "input": "$GoalList",
                            "as": "goalresult",
                            "cond": {
                                "$and": [
                                    { "$eq": ["$$goalresult.CreatedYear", new Date().getFullYear()+""] },
                                    { "$eq": ["$$goalresult.IsDraft", false] },
                                    { "$eq": ["$$goalresult.IsGoalSubmited", true] }
                                ]
                            }
                        }
                    },
                    StrengthList: {
                        "$filter": {
                            "input": "$StrengthList",
                            "as": "strresult",
                            "cond": {
                                "$and": [
                                    { "$eq": ["$$strresult.CreatedYear", new Date().getFullYear()+""] },
                                    { "$eq": ["$$strresult.IsDraft", false] },
                                    { "$eq": ["$$strresult.IsStrengthSubmited", true] }
                                ]
                            }
                        }
                    },
                    
                    Email: 1,
                    FirstName: 1,
                    LastName: 1,
                    EmployeeId: 1,
                    Manager: 1,
                    KpiExist: 1,
                    KpiList: {
                        "$filter": {
                            "input": "$KpiList",
                            "as": "result",
                            "cond": {
                                "$and": [
                                    { "$eq": ["$$result.EvaluationYear", new Date().getFullYear().toString()] },
                                    { "$eq": ["$$result.IsDraft", false] },
                                    { "$eq": ["$$result.IsSubmitedKPIs", true] }
                                ]
                            }
                        }
                    },
                    Evaluation: 1,
                    statuses: 1,
                    /*Evaluation: {
                        "$filter": {
                            "input": "$Evaluation",
                            "as": "e",
                            "cond": {
                                "$and": [
                                    { "$eq": ["$$e.Status", "Active"] }

                                ]
                            }
                        }
                    }*/
                }
            }
        ]);
        let _reportees = [];
        reportees.forEach((reportee,index)=>{
            
            let {EmployeeId,Evaluation,statuses,FirstName} = reportee;
            let evaluationObj = Evaluation.find(element=>{
                let eid = element._id.toString();
                let empId = EmployeeId.toString();
                return eid==empId
            });
            let statusObj = statuses.find(status=>{
                let evalStatus = evaluationObj.Status.toString();
                let statusId = status._id.toString();
                return statusId == evalStatus
            });
            console.log(`FirstName: ${FirstName} - ${statusObj.Status}`);
            reportee['FRStatus'] = statusObj.Status
            _reportees[index]=reportee;
        })
        return _reportees;

    } catch (error) {
        console.log('error', error)
        logger.error(error);
    }
}


exports.GetEmpCompetenciesForManager = async (evaluation) => {
    try {
        const evaluationForm = await EvaluationRepo.findOne({ _id: Mongoose.Types.ObjectId(evaluation.EvaluationId), "Employees._id": ObjectId(evaluation.employeeId) });
        var employee = await evaluationForm.Employees.find(x => x._id.toString() === evaluation.employeeId);
        if (employee && employee.Manager && employee.Manager.Competencies && employee.Manager.Competencies.length > 0) {
            return { EvaluationId: evaluationForm._id, Manager: employee.Manager };
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
            if (modelAggregation.length > 0) {
                for (let index = 0; index < modelAggregation[0].competenciesList.length; index++) {
                    const element = modelAggregation[0].competenciesList[index];
                    const Questions = [];
                    for (let k = 0; k < element.Questions.length; k++) {
                        const q = element.Questions[k];
                        var f = await questionsRepo.findById(ObjectId(q))
                        if (f) {
                            f.SelectedRating = 0
                            Questions.push(f)
                        }
                    }
                    list.push({ _id: new ObjectId(), Competency: element, Questions, Comments: "" })
                }
            }
            evaluationForm.Employees.find(x => x._id.toString() === evaluation.employeeId).Competencies = list;
            evaluationForm.Employees.find(x => x._id.toString() === evaluation.employeeId).Manager.Competencies = list;

            var t = await evaluationForm.save()
            var employee = await evaluationForm.Employees.find(x => x._id.toString() === evaluation.employeeId);
            if (employee && employee.Manager && employee.Manager.Competencies && employee.Manager.Competencies.length > 0) {
                return { EvaluationId: evaluationForm._id, Manager: employee.Manager };
            }
        }
    } catch (error) {
        logger.error(error);
        throw error;
    }


    //const r = list
    //return r;

}
