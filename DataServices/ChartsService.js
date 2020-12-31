const userSchema = require("../SchemaModels/UserSchema");
const organizationSchema = require("../SchemaModels/OrganizationSchema");
const EvaluationRepo = require('../SchemaModels/Evalution');
const moment = require('moment');
const Mongoose = require("mongoose");
const { Console } = require("winston/lib/winston/transports");

const clientChartSummaryService =  async (options)=>{
    let {orgId,years,chartType,userType} = options
    let response = {};
    response['ClientSummary']={};
    response['Evaluation']={};
    switch (chartType) {
        case 'CLIENT_SUMMARY':
            response['ClientSummary']['usage']=await clientSummaryUsage(orgId,userType,years);
            break;
        case 'STATUS':
            response['ClientSummary']['status']=await clientSummaryStatus(orgId,userType,years);
            break;
        case 'EVALUATION_SUMMARY':
            response['Evaluation']['summary']=await evaluatonSummary(orgId,years);
            break;
        default:
            break;
    }
    return response;
}

const evaluatonSummary = async (companyId,years)=>{
    let clientSummaryResponse = [];
    let yearEndCount=[];
    for(var i=0;i<years.length;i++){
        let whereObj ={};
        whereObj['EvaluationYear']=`${years[i]}`;
        whereObj['Company']=Mongoose.Types.ObjectId(companyId);
        let numberOfEvaluation=0;
        let evaluationSummaryArray = await EvaluationRepo.find(whereObj).populate("Company");
        if(evaluationSummaryArray && evaluationSummaryArray.length>0){
            let {Company} = evaluationSummaryArray[0];
            if(Company){
                let evaluationYear = getEvaluationPeriod(Company.EvaluationPeriod,Company.StartMonth);
                years[i]=evaluationYear;
            }
        }else{
            let whereObj={};
            whereObj['_id']=Mongoose.Types.ObjectId(companyId);
            let orgDomain = await organizationSchema.findOne(whereObj);
            console.log(orgDomain.EvaluationPeriod)
            years[i] = getNonEvaluationPeriod(years[i],orgDomain.EvaluationPeriod,orgDomain.StartMonth);
        }
        evaluationSummaryArray.forEach(evaluation=>{
            numberOfEvaluation+=evaluation.Employees.length;
        });
        yearEndCount[i]=numberOfEvaluation;
    }
    clientSummaryResponse[0]={data:yearEndCount,label:'Year-end'};
    return {
        chartDataSets:clientSummaryResponse,
        Label:years

    };
    
}

const getEvaluationPeriod = (type,StartMonth)=>{
    if (type === 'CalendarYear') {
        let momentCurrentEvlDate = moment().startOf('month').startOf('year');
        //let momentNextEvlDate = moment().startOf('month').add(1, 'years').startOf('year');
        let momentNextEvlDate = moment().startOf('month').endOf('year');
        return momentCurrentEvlDate.format("MMM-YY") +" - "+momentNextEvlDate.format("MMM-YY");
        
    }
    if (type === 'FiscalYear') {
        let momentCurrentEvlDate = moment().month(parseInt(StartMonth)).startOf('month');
        let momentNextEvlDate = moment().month(parseInt(StartMonth)-1).startOf('month').add(1, 'years');
        return momentCurrentEvlDate.format("MMM-YY") +" - "+momentNextEvlDate.format("MMM-YY");
    }
}

const getNonEvaluationPeriod = (year,type,StartMonth)=>{
    console.log("inside:year")
    if (type === 'CalendarYear') {
        let _momentStrat = moment(year,"YYYY");
        let _momentEnd = moment(year,"YYYY");
        let momentCurrentEvlDate = _momentStrat.startOf('month').startOf('year');
        //let momentNextEvlDate = moment().startOf('month').add(1, 'years').startOf('year');
        let momentNextEvlDate = _momentEnd.startOf('month').endOf('year');
        return momentCurrentEvlDate.format("MMM-YY") +" - "+momentNextEvlDate.format("MMM-YY");
        
    }
    if (type === 'FiscalYear') {
        console.log("==start==")
        let _momentStrat = moment(year,"YYYY");
        let _momentEnd = moment(year,"YYYY");
        let momentCurrentEvlDate = _momentStrat.month(parseInt(StartMonth)).startOf('month');
        let momentNextEvlDate = _momentEnd.month(parseInt(StartMonth)-1).startOf('month').add(1, 'years');
        return momentCurrentEvlDate.format("MMM-YY") +" - "+momentNextEvlDate.format("MMM-YY");
    }
}

const clientSummaryUsage = async (ParentOrganization,ClientType,years)=>{
    let clientSummaryResponse = [];
    let licenseCount=[];
    let employeesCount=[];
    for(var i=0;i<years.length;i++){
        var startDate = moment([years[i], 0]);
        var endDate = moment(startDate).endOf('year');
        let whereObj ={ClientType};
        whereObj['CreatedOn']={
            "$gt":startDate,
            "$lte":endDate
        }
        whereObj['ParentOrganization']=Mongoose.Types.ObjectId(ParentOrganization);
        let clientSummaryArray = await organizationSchema.find(whereObj,{UsageType:1,ClientType:1});
        let licenseArray = [];
        let employeesArray = [];
        if(clientSummaryArray.length>0){
            licenseArray = clientSummaryArray.filter(summary=>summary.UsageType==='License');
            employeesArray = clientSummaryArray.filter(summary=>summary.UsageType==='Employees');
        }
        licenseCount[i]=licenseArray.length;
        employeesCount[i]=employeesArray.length;
    }
    clientSummaryResponse[0]={data:licenseCount,label:'License'};
    clientSummaryResponse[1]={data:employeesCount,label:'Employees'};
    return {
        chartDataSets:clientSummaryResponse,
        Label:years
    };
    
}

const clientSummaryStatus = async (ParentOrganization,ClientType,years)=>{
    let clientSummaryResponse = [];
    let activeCount=[];
    let inActiveCount=[];
    for(var i=0;i<years.length;i++){
        var startDate = moment([years[i], 0]);
        var endDate = moment(startDate).endOf('year');
        let whereObj ={ClientType};
        whereObj['CreatedOn']={
            "$gt":startDate,
            "$lte":endDate
        }
        whereObj['ParentOrganization']=Mongoose.Types.ObjectId(ParentOrganization);
        let clientSummaryArray = await organizationSchema.find(whereObj,{UsageType:1,ClientType:1,IsActive:1});
        let activeList = [];
        let inActiveList = [];
        if(clientSummaryArray.length>0){
            activeList = clientSummaryArray.filter(summary=>summary.IsActive);
            inActiveList = clientSummaryArray.filter(summary=>!summary.IsActive);
        }
        activeCount[i]=activeList.length;
        inActiveCount[i]=inActiveList.length;
    }
    clientSummaryResponse[0]={data:activeCount,label:'Active'};
    clientSummaryResponse[1]={data:inActiveCount,label:'Inactive'};
    return {
        chartDataSets:clientSummaryResponse,
        Label:years

    };
    
}
module.exports = {
    ClientChartSummaryService:clientChartSummaryService
}