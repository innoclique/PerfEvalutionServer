
const DbConnection = require("../Config/DbConfig");
require('dotenv').config();
const Mongoose = require("mongoose");
const OrganizationSchema = require('../SchemaModels/OrganizationSchema');
const moment = require("moment");
const userSchema = require("../SchemaModels/UserSchema");

/*exports.GetEmployeeEvaluationYears = async (userId) => {
  console.log("inside:GetEmployeeEvaluationYears");
  const UserDomain = await userSchema.findOne({ "_id": userId });
  let {JoiningDate} = UserDomain;
  let joiningMoment = moment(JoiningDate);
  const Organization = await OrganizationSchema.findOne({ "_id": UserDomain.Organization });
  let {StartMonth,EndMonth,EvaluationPeriod} = Organization;
  console.log(`${StartMonth},${EndMonth},${EvaluationPeriod}`);
  var currentMoment = moment();
  let yearsStartFrom=joiningMoment;
  if(EvaluationPeriod === "FiscalYear"){
    var currentMonth = parseInt(joiningMoment.format('M'));
    console.log(`${currentMonth} <= ${StartMonth}`)
    if(currentMonth <= StartMonth){
      yearsStartFrom = joiningMoment.subtract(1, 'years');
    }
  }else if(EvaluationPeriod === "CalendarYear"){
    currentMoment = moment().add(1, 'years');;
  }
  console.log("yearsStartFrom>"+yearsStartFrom.format("YYYY"));
  let yearsList = [];
  yearsStartFrom = Number(yearsStartFrom.format("YYYY"));
  let yearsEndValue = Number(currentMoment.format("YYYY"));
  let index=0;
  while(yearsStartFrom<=yearsEndValue){
    yearsList[index]=yearsStartFrom;
    yearsStartFrom++;
    index++;
  }
  console.log(`yearsList :`+yearsList)
  return yearsList;
}*/

exports.GetEmployeeEvaluationYears = async (userId) => {
  console.log("inside:GetEmployeeEvaluationYears");
  const UserDomain = await userSchema.findOne({ "_id": userId });
  let {JoiningDate} = UserDomain;
  let joiningMoment = moment(JoiningDate);
  const Organization = await OrganizationSchema.findOne({ "_id": UserDomain.Organization });
  let {StartMonth,EndMonth,EvaluationPeriod} = Organization;
  console.log(`${StartMonth},${EndMonth},${EvaluationPeriod}`);
  var currentMoment = moment();
  let yearsStartFrom=joiningMoment;
  if(EvaluationPeriod === "FiscalYear"){
    var currentMonth = parseInt(joiningMoment.format('M'));
    console.log(`${currentMonth} <= ${StartMonth}`)
    if(currentMonth <= StartMonth){
      yearsStartFrom = joiningMoment.subtract(1, 'years');
    }
  }else if(EvaluationPeriod === "CalendarYear"){
    currentMoment = moment().add(1, 'years');;
  }
  console.log("yearsStartFrom>"+yearsStartFrom.format("YYYY"));
  let yearsList = [];
  yearsStartFrom = Number(yearsStartFrom.format("YYYY"));
  let yearsEndValue = Number(currentMoment.format("YYYY"));
  let index=0;
  //EndMonth = Number(EndMonth);
  while(yearsStartFrom<=yearsEndValue){
    console.log(`${yearsStartFrom}+"<="+${yearsEndValue}`);
    let yearLabel="";
    if(EvaluationPeriod === "FiscalYear"){
      let startDate;
      let endDate;
      if(currentMonth <= StartMonth){
          startDate = moment([yearsStartFrom, StartMonth - 1]);
          endDate = moment([yearsStartFrom+1]).month(EndMonth);
      }else{
          startDate = moment([yearsStartFrom, StartMonth - 1]);
          endDate = moment([yearsStartFrom+1, EndMonth]);
      }
      yearLabel = startDate.format("MMM'YY")+" - "+endDate.format("MMM'YY");
    }else{
      let startDate = moment([yearsStartFrom, StartMonth - 1]);
      let endDate = moment([yearsStartFrom, 11]);
      yearLabel = startDate.format("MMM'YY")+" - "+endDate.format("MMM'YY");
    }
    yearsList[index]={
      label:yearLabel,
      value:yearsStartFrom
    };
    yearsStartFrom++;
    index++;
  }
  console.log(`yearsList :`+yearsList)
  return yearsList;
}
exports.GetOrgEvaluationYear = async (organizationId) => {
    const Organization = await OrganizationSchema.findOne({"_id":Mongoose.Types.ObjectId(organizationId)});
    let {StartMonth,EndMonth,EvaluationPeriod} = Organization;
    StartMonth = parseInt(StartMonth);
    let currentMoment = moment();
    let evaluationStartMoment;
    let evaluationEndMoment
    if(EvaluationPeriod === "FiscalYear"){
      var currentMonth = parseInt(currentMoment.format('M'));
      console.log(`${currentMonth} <= ${StartMonth}`)
      if(currentMonth <= StartMonth){
        evaluationStartMoment = moment().month(StartMonth-1).startOf('month').subtract(1, 'years');
        evaluationEndMoment = moment().month(StartMonth-2).endOf('month');
        console.log(`${evaluationStartMoment.format("MM DD,YYYY")} = ${evaluationEndMoment.format("MM DD,YYYY")}`);
      }else{
        evaluationStartMoment = moment().month(StartMonth-1).startOf('month');
        evaluationEndMoment = moment().month(StartMonth-2).endOf('month').add(1, 'years');
        console.log(`${evaluationStartMoment.format("MM DD,YYYY")} = ${evaluationEndMoment.format("MM DD,YYYY")}`);
      }
    }else if(EvaluationPeriod === "CalendarYear"){
      evaluationStartMoment = moment().startOf('month');
      evaluationEndMoment = moment().month(0).endOf('month').add(1, 'years');
    }
    return evaluationStartMoment.format("YYYY");

};


exports.getOrganizationStartAndEndDates = async (organizationId) => {
  const Organization = await OrganizationSchema.findOne({"_id":Mongoose.Types.ObjectId(organizationId)});
  let {StartMonth,EndMonth,EvaluationPeriod} = Organization;
  if(EvaluationPeriod){
    StartMonth = parseInt(StartMonth);
    let currentMoment = moment();
    let evaluationStartMoment;
    let evaluationEndMoment
    if(EvaluationPeriod === "FiscalYear"){
      var currentMonth = parseInt(currentMoment.format('M'));
      console.log(`${currentMonth} <= ${StartMonth}`)
      if(currentMonth <= StartMonth){
        evaluationStartMoment = moment().month(StartMonth-1).startOf('month').subtract(1, 'years');
        evaluationEndMoment = moment().month(StartMonth-2).endOf('month');
        console.log(`${evaluationStartMoment.format("MM DD,YYYY")} = ${evaluationEndMoment.format("MM DD,YYYY")}`);
      }else{
        evaluationStartMoment = moment().month(StartMonth-1).startOf('month');
        evaluationEndMoment = moment().month(StartMonth-2).endOf('month').add(1, 'years');
        console.log(`${evaluationStartMoment.format("MM DD,YYYY")} = ${evaluationEndMoment.format("MM DD,YYYY")}`);
      }
    }else if(EvaluationPeriod === "CalendarYear"){
      evaluationStartMoment = moment().month(0).startOf('month');
      evaluationEndMoment = moment().month(11).endOf('month');
    }
    return {
      start:evaluationStartMoment,
      end:evaluationEndMoment,
      EvaluationPeriod:EvaluationPeriod,
      StartMonth:StartMonth,
      EndMonth:EndMonth
    }
  }
  return null;
    

};

