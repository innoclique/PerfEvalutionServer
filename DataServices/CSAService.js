const userSchema = require("../SchemaModels/UserSchema");
const organizationSchema = require("../SchemaModels/OrganizationSchema");
const EvaluationRepo = require('../SchemaModels/Evalution');
const SubscriptionsSchema = require('../SchemaModels/SubscriptionsSchema');
const ProductPriceScaleSchema = require('../SchemaModels/ProductPriceScale');
const Mongoose = require("mongoose");
const ObjectId = Mongoose.Types.ObjectId;
const moment = require("moment");
const EvaluationUtils = require("../utils/EvaluationUtils");

const dashboardService =  async (userId)=>{
    const OwnerUserDomain = await userSchema.findOne({ "_id": userId });
    let evaluationYear = await EvaluationUtils.GetOrgEvaluationYear(OwnerUserDomain.Organization);
    console.log(`evaluationYear:dashboardService = ${evaluationYear}`);

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
      
      let evaluationList = await EvaluationRepo.find({Company: Mongoose.Types.ObjectId(orgId),EvaluationYear:evaluationYear});
      response['current_status'] = await evaluationCurrentStatus(evaluationList,orgId);
      response['evaluation_summary'] = evaluationChat(evaluationAggregateList);
      
    return response;
}
const evaluationCurrentStatus = async (evaluationList,orgId)=>{
    console.log("inside:evaluationCurrentStatus")
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
    let orgnizationDomain = await organizationSchema.findOne({"_id":Mongoose.Types.ObjectId(orgId)});
    if(orgnizationDomain.UsageType && orgnizationDomain.UsageType === "Employees"){
        let {UsageCount} = orgnizationDomain;
        UsageCount = parseInt(UsageCount);
        UsageCount-=completed;
        UsageCount-=inprogress;
        currentEvaluationObj['evaluations_left']=UsageCount;
    }
    if(orgnizationDomain.UsageType && orgnizationDomain.UsageType === "License"){
        let Range = orgnizationDomain.Range;
        let priceScale = await ProductPriceScaleSchema.findOne({_id:Mongoose.Types.ObjectId(Range)});
        let UsageCount = 0;
        UsageCount = parseInt(priceScale.RangeTo);
        UsageCount-=completed;
        UsageCount-=inprogress;
        currentEvaluationObj['evaluations_left']=UsageCount;
    }

    let subscriptionDomain = await SubscriptionsSchema.findOne({
        Organization:Mongoose.Types.ObjectId(orgId),
        Type:"Initial",
    });
    currentEvaluationObj['renewalDate'] = "N/A";
    if(subscriptionDomain){
        currentEvaluationObj['renewalDate'] = moment(subscriptionDomain.ValidTill).format("MMM DD,YYYY")
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