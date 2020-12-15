const DbConnection = require("../Config/DbConfig");
require('dotenv').config();
var env = process.env.NODE_ENV || "dev";
const Mongoose = require("mongoose");
const Bcrypt = require('bcrypt');
const OrganizationRepo = require('../SchemaModels/OrganizationSchema');
const StrengthRepo = require('../SchemaModels/Strengths');
const AccomplishmentRepo = require('../SchemaModels/Accomplishments');
const DepartmentRepo = require('../SchemaModels/DepartmentSchema');
const JobRoleRepo = require('../SchemaModels/JobRoleSchema');
const JobLevelRepo = require('../SchemaModels/JobLevelSchema');
const AppRoleRepo = require('../SchemaModels/ApplicationRolesSchema');
const RoleRepo = require('../SchemaModels/Roles');
const KpiRepo = require('../SchemaModels/KPI');
const MeasureCriteriaRepo = require('../SchemaModels/MeasurementCriteria');
const IndustriesRepo = require('../SchemaModels/Industry');
const EvaluationRepo = require('../SchemaModels/Evalution');
const AuthHelper = require('../Helpers/Auth_Helper');
const Messages = require('../Helpers/Messages');
const UserRepo = require('../SchemaModels/UserSchema');
const SendMail = require("../Helpers/mail.js");
var logger = require('../logger');
const moment = require("moment");
const ObjectId = Mongoose.Types.ObjectId;
const KpiFormRepo = require('../SchemaModels/KpiForm');
const strengthRepo = require('../SchemaModels/Strengths');
var fs = require("fs");
var config = require(`../Config/${env}.config`);
const EvaluationStatus = require('../common/EvaluationStatus');
const { boolean } = require("joi");

exports.EMDashboardData = async (employee) => {
    const response = {};
    response['current_evaluation']={}
    try{
    
    let { userId,orgId } = employee;
    const evaluationRepo = await peerInfo(userId);
    response['current_evaluation'] = await currentEvaluationProgress(orgId);
    response['peer_review'] = {};
    let peerReviewList = [];
    if (evaluationRepo && evaluationRepo.length > 0 && evaluationRepo[0].Employees) {
        evaluationRepo.forEach(element => {
            let { Employees,Company } = element;
            let evaluationId = element._id;
            let daysRemaining = caluculateDaysRemaining(Company.EvaluationPeriod,Company.EndMonth);
            Employees.forEach(employeeObj => {
                let { Peers, _id } = employeeObj;
                let peerList = Peers.filter(peerObj => peerObj.EmployeeId == userId);
                let peerReviewObj = {};
                peerReviewObj.EvaluationId = evaluationId;
                peerReviewObj.employeeId = _id._id;
                peerReviewObj.peer = _id.FirstName +" "+_id.LastName;
                peerReviewObj.title = _id.Title || "";
                if(peerList && peerList.length>0)
                    peerReviewObj.rating = peerList[0].CompetencyOverallRating;
                else
                peerReviewObj.deparment = _id.Department || 'N/A';
                peerReviewObj.daysRemaining = daysRemaining;
                peerReviewList.push(peerReviewObj);
            });
        });
    }
    response['peer_review']['list'] = peerReviewList;
    }
    catch(e){
        console.log(e)
    }
    
    return response;
}

const peerInfo = async (userId) => {
    return await EvaluationRepo
        .find({
            "Employees.Peers": {
                $elemMatch:
                    { "EmployeeId": Mongoose.Types.ObjectId(userId) }
            }
        }).populate("Employees._id").populate("Company");
}

const currentEvaluationProgress = async (orgId) => {
    console.log("currentEvaluationProgress");
    let currentYear = moment().format('YYYY');
    let evaluationObj = {};
    let whereObj = {
        "Company": Mongoose.Types.ObjectId(orgId),
        "EvaluationYear": currentYear

    };
    
    let currentEvaluation = await EvaluationRepo.findOne(whereObj).populate("Employees._id").populate("Employees.Status");
    let {Employees} = currentEvaluation;
    let currentEvaluationList = [];
    if (Employees && Employees.length > 0) {
        Employees.forEach(employeeObj => {
            console.log(JSON.stringify(employeeObj,null,5))
            let { Status, _id } = employeeObj;
            let evaluationEmpObj={};
            evaluationEmpObj.name = _id.FirstName + " " + _id.LastName;
            evaluationEmpObj.status = !Status.Status?"":Status.Status;
            //evaluationEmpObj.status = Status;
            evaluationEmpObj.employeeId = _id._id;
            currentEvaluationList.push(evaluationEmpObj);
        });
    } 
    evaluationObj['list']=currentEvaluationList;
    return evaluationObj;
}

const caluculateDaysRemaining = (evaluationPeriod,endMonth) =>{
    endMonth = "January";
    let remainingDays = "N/A";
    if(evaluationPeriod === 'CalendarYear'){
        let momentNextEvlDate = moment().add(1, 'years').startOf('year');
        remainingDays = momentNextEvlDate.diff(moment(), 'days');
    }else if(evaluationPeriod === 'FiscalYear'){
        let currentMonth= moment().format('M');
        let endMonthVal = moment().month(endMonth).format("M");
        let nextYear = moment().add(1, 'years').month(endMonthVal-1).endOf('month');
    if(currentMonth === endMonthVal){
        nextYear = moment().endOf('month');
    }
    remainingDays = nextYear.diff(moment(), 'days');
    }
    return remainingDays;
    
}