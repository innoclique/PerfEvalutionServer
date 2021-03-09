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
const EvaluationUtils = require("../utils/EvaluationUtils");
const PeerDirectReportsRequestRepo = require("../SchemaModels/PeerDirectReportsRequestSchema");

exports.FindPeerDirectReportRequestByEmployee= async (options) => {
    let {EmpId,EvaluationYear,owner} = options;
    return await PeerDirectReportsRequestRepo.findOne({EmployeeId:ObjectId(EmpId),EvaluationYear:EvaluationYear,CreatedBy:ObjectId(owner)}).populate("EmployeeId")
}
exports.FindPeerDirectReportRequest= async (options) => {
    let {EvaluationYear,owner} = options;
    return await PeerDirectReportsRequestRepo.find({EvaluationYear:EvaluationYear,CreatedBy:ObjectId(owner)}).populate("EmployeeId")
}

exports.SavePeerDirectReportRequest = async (peerDirectRepoRequest) => {
    let {EmployeeId,CreatedBy,Type,Employees,Competencies} = peerDirectRepoRequest;
    peerDirectRepoRequest.EmployeeId = ObjectId(EmployeeId);
    peerDirectRepoRequest.CreatedBy = ObjectId(CreatedBy);
    console.log("Inside:SavePeerDirectReportRequest");
    try{
        let peerDirectReportsObj = await PeerDirectReportsRequestRepo.
        findOne({EmployeeId:peerDirectRepoRequest.EmployeeId,EvaluationYear:peerDirectRepoRequest.EvaluationYear,CreatedBy:peerDirectRepoRequest.CreatedBy});
        if(!peerDirectReportsObj){
            let addRecordObj = {
                EmployeeId:peerDirectRepoRequest.EmployeeId,
                CreatedBy:peerDirectRepoRequest.CreatedBy,
                EvaluationYear:peerDirectRepoRequest.EvaluationYear
            }
            addRecordObj.Peer=[];
            addRecordObj.DirectReportees=[];
            if(Type==="Peer"){
                let peers=[];
                for(let i=0;i<Employees.length;i++){
                    let peerObj = Employees[i];
                    peerObj.Competencies=Competencies;
                    peers.push(peerObj);

                }
                addRecordObj.Peer=peers;
            }else if(Type==="DirectReportees"){
                let directReportees=[];
                for(let i=0;i<Employees.length;i++){
                    let directReporteesObj = Employees[i];
                    directReporteesObj.Competencies=Competencies;
                    directReportees.push(directReporteesObj);

                }
                addRecordObj.DirectReportees=directReportees;
            }
            const peerDirectReportsRequest = await PeerDirectReportsRequestRepo(addRecordObj);
            return await peerDirectReportsRequest.save();
        }else{
            let updateRequestObj = peerDirectReportsObj;
            delete updateRequestObj._id;
            if(Type==="Peer"){
                let peers=[];
                for(let i=0;i<Employees.length;i++){
                    let peerObj = Employees[i];
                    peerObj.Competencies=Competencies;
                    peers.push(peerObj);

                }
                updateRequestObj.Peer=peers;
            }else if(Type==="DirectReportees"){
                let directReportees=[];
                for(let i=0;i<Employees.length;i++){
                    let directReporteesObj = Employees[i];
                    directReporteesObj.Competencies=Competencies;
                    directReportees.push(directReporteesObj);

                }
                updateRequestObj.DirectReportees=directReportees;
            }
              await PeerDirectReportsRequestRepo.update(
                {
                    "_id":peerDirectReportsObj._id,
                },
                {$set:updateRequestObj});
                return true;
        }
    }catch(error){
        console.log(error)
        return null;
    }
}
exports.DirectReports = async (employee) => {
    let { userId,orgId } = employee;
    let userType= "EM";
    if(employee.type){
        userType=employee.type;
    }
    response = await directReports(orgId,userId,userType);
    return response;
}
exports.EMDashboardData = async (employee) => {
    let userType= "EM";
    if(employee.type){
        userType=employee.type;
    }
    const response = {};
    response['current_evaluation']={}
    try{
    
    let { userId,orgId } = employee;
    const evaluationRepo = await peerInfo(userId);
    response['current_evaluation'] = await currentEvaluationProgress(orgId,userId,userType);
    response['peer_review'] = {};
    let peerReviewList = [];
    if (evaluationRepo && evaluationRepo.length > 0 && evaluationRepo[0].Employees) {
        evaluationRepo.forEach(element => {
            let { Employees,Company } = element;
            let evaluationId = element._id;
            let daysRemaining = caluculateDaysRemaining(Company.EvaluationPeriod,Company.EndMonth,Company.StartMonth);
            Employees.forEach(employeeObj => {
                let { Peers, _id } = employeeObj;
                let peerFoundObject = Peers.find(peerObj => peerObj.EmployeeId == userId);
                if(peerFoundObject){
                    let peerReviewObj = {};
                peerReviewObj.EvaluationId = evaluationId;
                peerReviewObj.employeeId = _id._id;
                peerReviewObj.peer = _id.FirstName +" "+_id.LastName;
                peerReviewObj.title = _id.Title || "";
                peerReviewObj.rating = peerFoundObject.CompetencyOverallRating;
                peerReviewObj.deparment = _id.Department || 'N/A';
                peerReviewObj.daysRemaining = daysRemaining;
                peerReviewList.push(peerReviewObj);
                }
                
            });
        });
    }
    console.log("====peerReviewList====");
    console.log(peerReviewList);
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

const currentEvaluationProgress = async (orgId,userId,userType) => {
    console.log("currentEvaluationProgress");
    let currentYear = await EvaluationUtils.GetOrgEvaluationYear(orgId);
    console.log(`evaluationYear:dashboardService = ${currentYear}`);

    let evaluationObj = {};
    let whereObj = {
        "Company": Mongoose.Types.ObjectId(orgId),
        "EvaluationYear": currentYear

    };
    let currentEvaluation = await EvaluationRepo.find(whereObj).populate("Employees._id").populate("Employees.Status");
    let currentEvaluationList = [];
    currentEvaluation.forEach(evaluationObj=>{
        let {Employees} = evaluationObj;
        if (Employees && Employees.length > 0) {
            Employees.forEach(employeeObj => {
                let { Status, _id } = employeeObj;
                let evaluationEmpObj={};
                evaluationEmpObj.name = _id.FirstName + " " + _id.LastName;
                evaluationEmpObj.status = !Status.Status?"":Status.Status;
                    //evaluationEmpObj.status = Status;
                evaluationEmpObj.employeeId = _id._id;
                evaluationEmpObj.managerId = _id.Manager;
                if(userType === 'EM' && _id.Manager && _id.Manager == userId){
                    currentEvaluationList.push(evaluationEmpObj);
                }else if(userType === 'TS' && _id.ThirdSignatory && _id.ThirdSignatory == userId){
                    currentEvaluationList.push(evaluationEmpObj);
                }
                
            });
        }
    });
    currentEvaluationList = currentEvaluationList.sort((a,b)=> (a.name > b.name ? 1 : -1))
    evaluationObj['list']=currentEvaluationList;
    return evaluationObj;
}

const directReports = async (orgId,userId,userType) => {
    console.log("inside:directReports");
    let currentYear = moment().format('YYYY');
    let responseObj = {};
    let userWhereObj={};
    if(userType === 'EM'){
        userWhereObj['Manager']=Mongoose.Types.ObjectId(userId)
    }else if(userType === 'TS'){
        userWhereObj['ThirdSignatory']=Mongoose.Types.ObjectId(userId)
    }
    let usersList = await UserRepo.find(userWhereObj);
    let directReportList = [];
    for (const userObj of usersList) {
        let pastEvaluations = await EvaluationRepo.find({
            "Employees._id":Mongoose.Types.ObjectId(userObj._id),"EvaluationYear": {"$ne":currentYear}
        }).sort({_id:-1});
        let empEvaluation=null;
        if(pastEvaluations.length>0){
            let lastEvaluation = pastEvaluations[0];
            let {Employees} = lastEvaluation;
            empEvaluation = Employees.find(empObj=>{
                return empObj._id.toString() == userObj._id.toString()
            });
        }
        let directReportObj={};
        directReportObj.name = userObj.FirstName + " " + userObj.LastName;
        directReportObj.joiningDate = moment(userObj.JoiningDate).format("MMM DD YYYY");
        directReportObj.lastRating = empEvaluation?empEvaluation.Manager.CompetencyOverallRating:"";
        directReportObj.noOfEvaluations = pastEvaluations.length;
        directReportList.push(directReportObj);
    };
    responseObj['list']=directReportList;
    return responseObj;
}



const caluculateDaysRemaining = (evaluationPeriod,endMonth,StartMonth) =>{
    endMonth = "January";
    let remainingDays = "N/A";
    if(evaluationPeriod === 'CalendarYear'){
        let momentNextEvlDate = moment().add(1, 'years').startOf('year');
        remainingDays = momentNextEvlDate.diff(moment(), 'days');
    }else if(evaluationPeriod === 'FiscalYear'){
        let currentMoment = moment();
        var currentMonth = parseInt(currentMoment.format('M'));
        console.log(`${currentMonth} <= ${StartMonth}`);
        let evaluationStartMoment;
        let evaluationEndMoment;
        if(currentMonth <= StartMonth){
            evaluationStartMoment = moment().month(StartMonth-1).startOf('month').subtract(1, 'years');
            evaluationEndMoment = moment().month(StartMonth-2).endOf('month');
            console.log(`${evaluationStartMoment.format("MM DD,YYYY")} = ${evaluationEndMoment.format("MM DD,YYYY")}`);
          }else{
            evaluationStartMoment = moment().month(StartMonth-1).startOf('month');
            evaluationEndMoment = moment().month(StartMonth-2).endOf('month').add(1, 'years');
            console.log(`${evaluationStartMoment.format("MM DD,YYYY")} = ${evaluationEndMoment.format("MM DD,YYYY")}`);
          }
        remainingDays = evaluationEndMoment.diff(moment(), 'days');
    }
    return remainingDays;
    
}