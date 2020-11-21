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
    let evaluationList = await EvaluationRepo.aggregate([
        {$match: { Company: Mongoose.Types.ObjectId(orgId)}},
        {$group: { _id: "$EvaluationYear",
            list: {$addToSet :{ _id: "$_id",status:'$status'}}
        }}
      ]);
      response['current_status'] = evaluationCurrentStatus(evaluationList);
      response['evaluation_summary'] = evaluationChat(evaluationList);
      
    return response;
}
const evaluationCurrentStatus = (evaluationList)=>{
    let currentEvaluationObj = {};
    let currentYear = moment().format('YYYY');
    let completed=0, inprogress=0;
    let currentEvaluation = evaluationList.filter(obj => obj._id === currentYear);
    if(currentEvaluation){
        let {list} = currentEvaluation[0];
        completed = list.filter(obj => obj.status==='Completed').length;
        inprogress = list.filter(obj => obj.status!=='Completed').length;
        
    }
    currentEvaluationObj= {completed,inprogress};
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