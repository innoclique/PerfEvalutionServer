const userSchema = require("../SchemaModels/UserSchema");
const organizationSchema = require("../SchemaModels/OrganizationSchema");
const moment = require('moment');
const Mongoose = require("mongoose");

const clientChartSummaryService =  async (options)=>{
    let {orgId,years,chartType,userType} = options
    let response = {};
    response['ClientSummary']={};
    if(chartType === 'CLIENT_SUMMARY')
        response['ClientSummary']['usage']=await clientSummaryUsage(orgId,userType,years);
    else if(chartType === 'STATUS')
        response['ClientSummary']['status']=await clientSummaryStatus(orgId,userType,years);
    return response;
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