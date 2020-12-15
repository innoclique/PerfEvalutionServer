const userSchema = require("../SchemaModels/UserSchema");
const organizationSchema = require("../SchemaModels/OrganizationSchema");
const EvaluationRepo = require('../SchemaModels/Evalution');
const Mongoose = require("mongoose");
const ObjectId = Mongoose.Types.ObjectId;
const moment = require("moment");

const dashboardService =  async (userId)=>{
    let response = {};
    response['current_status']={};
    response['evaluation_summary']={};
    let userObj = await userSchema.findOne({ "_id": Mongoose.Types.ObjectId(userId)});
    let orgId = userObj.Organization;
    let evaluationAggregateList = await EvaluationRepo.aggregate([
        {$match: { Company: Mongoose.Types.ObjectId(orgId)}},
        {$group: { _id: "$EvaluationYear",
            list: {$addToSet :{ _id: "$_id",status:'$status'}}
        }}
      ]);
      let currentYear = moment().format('YYYY');
      let evaluationList = await EvaluationRepo.find({Company: Mongoose.Types.ObjectId(orgId),EvaluationYear:currentYear});
      response['current_status'] = await evaluationCurrentStatus(evaluationList,orgId);
      response['evaluation_summary'] = evaluationChat(evaluationAggregateList);
      
    return response;
}
const evaluationCurrentStatus = async (evaluationList,orgId)=>{
    let currentEvaluationObj = {};
    let completed=0, inprogress=0;
    let completedEvaluation = evaluationList.filter(obj => obj.status === 'Completed');
    let inprogressEvaluation = evaluationList.filter(obj => obj.status !== 'Completed');
    if(completedEvaluation && completedEvaluation.length>0){
        completedEvaluation.forEach(evaluation=>{
            let {Employees} = evaluation;
            completed+=Employees.length;
        })
    }
    if(inprogressEvaluation && inprogressEvaluation.length>0){
        inprogressEvaluation.forEach(evaluation=>{
            let {Employees} = evaluation;
            inprogress+=Employees.length;
        })
    }
    
    currentEvaluationObj= {completed,inprogress};
    currentEvaluationObj['evaluations_left']="N/A";
    let orgnizationDomain = await organizationSchema.find({"_id":Mongoose.Types.ObjectId(orgId)});
    if(orgnizationDomain.UsageType && orgnizationDomain.UsageType === "Employees"){
        let {UsageCount} = orgnizationDomain;
        UsageCount = parseInt(UsageCount);
        UsageCount-=completed;
        UsageCount-=inprogress;
        currentEvaluationObj['evaluations_left']=UsageCount;
    }
    return currentEvaluationObj;

}
const evaluationChat = (evaluationList)=>{
    let chartData = {};
    let yearList = [moment().format('YYYY')];
      let dataSet = [];
      let completedList = [0];
      let inprogressList = [0];
      let totalList = [0];
      evaluationList.forEach((element,i)=>{
          yearList[i] = element._id;
          let {list} = element;
          const completed = list.filter(obj => obj.status==='Completed').length;
          const inprogress = list.filter(obj => obj.status!=='Completed').length;
          completedList[i]=completed;
          inprogressList[i]=inprogress ;
          totalList[i]=list.length
      });
      dataSet[0] = {data:totalList,label:'Total'};
      dataSet[1] = {data:completedList,label:'Complete'};
      dataSet[2] = {data:inprogressList,label:'Inprogress'};
      chartData.years = yearList;
      chartData.dataSets = dataSet;
      return chartData;
}

module.exports = {
    CSADashboardService:dashboardService
}