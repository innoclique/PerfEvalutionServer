require('dotenv').config();
var env = process.env.NODE_ENV || "dev";
const Mongoose = require("mongoose");
const DevGoalsRepo = require('../SchemaModels/DevGoals');
const UserRepo = require('../SchemaModels/UserSchema');
const KpiRepo = require('../SchemaModels/KPI');
const EvaluationRepo = require('../SchemaModels/Evalution');
const strengthRepo = require('../SchemaModels/Strengths');
const ObjectId = Mongoose.Types.ObjectId;
const DevGoalsService = require('../DataServices/DevGoalsService')
const EvaluationService = require('./EvaluationService');
var config = require(`../Config/${env}.config`);
const SendMail = require("../Helpers/mail.js");
const moment = require("moment");
var fs = require("fs");
const PGSignoffSchema = require('../SchemaModels/PGSignoffSchema');
var logger = require('../logger');
const EvaluationUtils = require('../utils/EvaluationUtils');

exports.GetKpisForDevGoals = async (data) => {
    const OwnerUserDomain = await UserRepo.findOne({ "_id": data.empId });
    let evaluationYear = await EvaluationUtils.GetOrgEvaluationYear(OwnerUserDomain.Organization);
    console.log(`evaluationYear = ${evaluationYear}`);

    try {
        const Kpi = await KpiRepo.find({ 'Owner': data.empId,
        'IsDraft': false,
        'EvaluationYear' :evaluationYear })
            .populate('MeasurementCriteria.measureId Owner')
            .sort({ UpdatedOn: -1 });


        return Kpi
    } catch (error) {
        logger.error(err)

        console.log(err);
        throw (err);

    }


};






exports.GetAllDevGoals = async (data) => {
try{

    var allEvaluation = await EvaluationRepo.find({
        Employees: { $elemMatch: { _id: Mongoose.Types.ObjectId(data.empId) } },
        Company: data.orgId
    }).sort({ CreatedDate: -1 });
    let currEvaluation = allEvaluation[0];
    let preEvaluation = allEvaluation[1];

    // if (!currEvaluation || allEvaluation.length==0) {
    //   throw Error("KPI Setting Form Not Activeted");
    // }
    let {CreatedYear} = data;
    let preGoalsCreatedYear = ""+new Date().getFullYear()-1;
    let devGoalsCreatedYear = ""+new Date().getFullYear();
    if(CreatedYear){
        preGoalsCreatedYear = Number(CreatedYear)-1;
        devGoalsCreatedYear = CreatedYear;
    }
    var preDevGoals = [];
    // if (preEvaluation && !data.currentOnly) {
    if(!data.currentOnly) {
        //    preDevGoals = await DevGoalsRepo.find({'Owner':data.empId, 'EvaluationId':preEvaluation._id})
        preDevGoals = await DevGoalsRepo.find({ 'Owner': data.empId ,  'MakePrivate': data.fetchAll||false, 'CreatedYear': ""+preGoalsCreatedYear})
             //  .populate('Kpi')
            .sort({ UpdatedOn: -1 });
    }


    //   const Kpi = await KpiRepo.find({'Owner':data.empId,'IsDraftByManager':false, 'EvaluationId':currEvaluation._id})
    const devGoals = await DevGoalsRepo.find({ 'Owner': data.empId, 
            'MakePrivate': {$in: [false,data.fetchAll ] },   'IsDraftByManager': false ,'CreatedYear': ""+devGoalsCreatedYear })
           .populate('Kpi')
        .sort({ UpdatedOn: -1 });


    return [...devGoals, ...preDevGoals];


} catch (error) {
    logger.error(err)

    console.log(err);
    throw (err);

}
};




exports.GetAllDevGoalsByManger = async (data) => {

    try{
    
      
    
        //   const Kpi = await KpiRepo.find({'Owner':data.empId,'IsDraftByManager':false, 'EvaluationId':currEvaluation._id})
        const devGoals = await DevGoalsRepo.find({ 'Owner': data.empId, 
                'MakePrivate': {$in: [false,data.fetchAll ] },  
                 'IsDraftByManager': false ,
                 'IsDraft': false ,
                 'IsGoalSubmited':true,
                 'CreatedYear': ""+new Date().getFullYear() })
               .populate('Kpi')
            .sort({ UpdatedOn: -1 });
    
    
        return devGoals;
    
    
    } catch (error) {
        logger.error(err)
    
        console.log(err);
        throw (err);
    
    }
    };

    

exports.GetAllStrengthsByManger = async (data) => {

    try{
    
      
    
        //   const Kpi = await KpiRepo.find({'Owner':data.empId,'IsDraftByManager':false, 'EvaluationId':currEvaluation._id})
        const devGoals = await strengthRepo.find({ 'Owner': data.empId, 
                
                 'IsDraft': false ,
                 'IsStrengthSubmited':true,
                 'CreatedYear': ""+new Date().getFullYear() } )
            .sort({ UpdatedOn: -1 });
    
    
        return devGoals;
    
    
    } catch (error) {
        logger.error(err)
    
        console.log(err);
        throw (err);
    
    }
    };





exports.UpdateDevGoalById = async (devGoalData) => {
    try {

        devGoalData.Action = 'Update';
        if (devGoalData.IsManaFTSubmited) {
            const Manager = await UserRepo.findById(devGoalData.UpdatedBy);
           devGoalData.ManagerFTSubmitedOn=new Date()
            devGoalData.ManagerSignOff={SignOffBy:Manager.FirstName+" "+Manager.LastName,SignOffOn:new Date()}

          const kpiOwnerInfo=  await UserRepo.findById(devGoalData.empId);
              this.sendEmailOnManagerSignoff(Manager,kpiOwnerInfo);


        }

        if (devGoalData.ViewedByManagerOn) {
            const Manager1 = await UserRepo.findById(devGoalData.UpdatedBy);
            const kpiOwnerInfo1=  await UserRepo.findById(devGoalData.empId);
            devGoalData.ViewedByManagerOn= new Date();
            this.sendEmailEmpOnManagerViewed(Manager1,kpiOwnerInfo1);

        }
      
        devGoalData.UpdatedOn = new Date();
       await DevGoalsRepo.findByIdAndUpdate(devGoalData.devGoalId, devGoalData);

       this.addDevGoalTrack(devGoalData);
     

        return true;
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


}





exports.SubmitAllActionPlan = async (data) => {
    try {

        const User = await UserRepo.find({ "_id": data.empId })
            .populate('Manager');

        let submited = await DevGoalsRepo.updateMany({
            'Owner': Mongoose.Types.ObjectId(data.empId),
            'IsDraft': false,
            'CreatedYear': data.currentEvaluationYear,
            'IsGoalSubmited': false
        },
            {
                $set: {
                    'IsGoalSubmited': true,
                    'EmpFTSubmitedOn': new Date(),
                    'Signoff': { SignOffBy: User[0].FirstName+" "+User[0].LastName, SignOffOn: new Date() }
                }
            });


            let submitedStrengths = await strengthRepo.updateMany({
                'Owner': Mongoose.Types.ObjectId(data.empId),
                'IsDraft': false,
                'CreatedYear': data.currentEvaluationYear,
                'IsStrengthSubmited': false
            },
                {
                    $set: {
                        'IsStrengthSubmited': true,
                        'EmpFTSubmitedOn': new Date(),
                        'Signoff': { SignOffBy: User[0].FirstName+" "+User[0].LastName, SignOffOn: new Date() }
                    }
                });

        if (submited.nModified >0 || submitedStrengths.nModified>0) {
            this.sendEmailOnDevGoalSubmit(User[0].Manager,User[0]);
        }

        return true
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


};




exports.UpdateStrengthById = async (strenthData) => {
    try {

        strenthData.Action = 'Update';
        if (strenthData.IsManaFTSubmited) {
            const Manager = await UserRepo.findById(strenthData.UpdatedBy);
           strenthData.ManagerFTSubmitedOn=new Date()
            strenthData.ManagerSignOff={SignOffBy:Manager.FirstName+" "+Manager.LastName,SignOffOn:new Date()}

          const kpiOwnerInfo=  await UserRepo.findById(strenthData.empId);
              this.sendEmailOnManagerSignoff(Manager,kpiOwnerInfo);


        }

        if (strenthData.ViewedByManagerOn) {
         
            strenthData.ViewedByManagerOn= new Date();
        }
      
        strenthData.UpdatedOn = new Date();
       await strengthRepo.findByIdAndUpdate(strenthData.StrengthId, strenthData);

      // this.addDevGoalTrack(strenthData);
     

        return true;
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


}


exports.AddDevGoal = async (devGoalModel) => {
    try {
        var devGoal = new DevGoalsRepo(devGoalModel);
        //devGoal.CreatedYear= new Date().getFullYear();
        devGoal = await devGoal.save();

        devGoalModel.Action = 'Create';
        devGoalModel.devGoalId = devGoal.id;
        this.addDevGoalTrack(devGoalModel);

        if (!devGoalModel.IsDraft) {
         const Manager = await UserRepo.findById(devGoalModel.ManagerId);
        const emp = await UserRepo.findById(devGoalModel.Owner);
        this.sendEmailOnDevGoalSubmit(Manager,emp);
        }
        return true;
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }

}



exports.sendEmailOnDevGoalSubmit = async (manager,devGoalOwnerInfo) => {

    // if ( devGoalOwnerInfo) {
    if (manager && devGoalOwnerInfo) {
        
        // send email to User 

        fs.readFile("./EmailTemplates/EmailTemplate.html", async function read(err, bufcontent) {
            var content = bufcontent.toString();
    
            let des= `You have successfully submitted the action plan.
            To view details, <a href="${config.APP_BASE_REDIRECT_URL}=/employee/action-plan">click here</a>.`
            content = content.replace("##FirstName##",devGoalOwnerInfo.FirstName);
            content = content.replace("##ProductName##", config.ProductName);
            content = content.replace("##Description##", des);
            content = content.replace("##Title##", "Action Plan Submitted");

        var mailObject = SendMail.GetMailObject(
            devGoalOwnerInfo.Email,
                  "Action Plan Submitted",
                  content,
                  null,
                  null
                );

        await SendMail.SendEmail(mailObject, function (res) {
            console.log(res);
        });

    });


        // send email to manager 
       
        fs.readFile("./EmailTemplates/EmailTemplate.html", async function read(err, bufcontent) {
            var content = bufcontent.toString();
    
            let des= `  Your direct report, ${devGoalOwnerInfo.FirstName} ${devGoalOwnerInfo.LastName}, has submitted the action plan.
            You may login to review. To view details, <a href="${config.APP_BASE_REDIRECT_URL}=/em/review-action-plan">click here</a>.
               `
            content = content.replace("##FirstName##",manager.FirstName);
            content = content.replace("##ProductName##", config.ProductName);
            content = content.replace("##Description##", des);
            content = content.replace("##Title##", `${devGoalOwnerInfo.FirstName} ${devGoalOwnerInfo.LastName}, has submitted the action plan`);

      
            var mailObject = SendMail.GetMailObject(
            manager.Email,
            `${devGoalOwnerInfo.FirstName} ${devGoalOwnerInfo.LastName}, has submitted the action plan`,
                 content,
                  null,
                  null
                );

        await SendMail.SendEmail(mailObject, function (res) {   });
    

    });
    }

}


exports.sendEmailOnManagerSignoff = async (manager, kpiOwnerInfo) => {


    if (manager) {
        // send email to manager 
        let mailBody= "Dear "+ manager.FirstName +", <br><br>"
        mailBody = mailBody + "You have successfully added comments to the action plan for  " + kpiOwnerInfo.FirstName +" "+ kpiOwnerInfo.LastName + ".<br><br>"
        mailBody=mailBody + "<br>To view details  "+ " <a href="+ config.APP_BASE_REDIRECT_URL +"=/employee/review-action-plan-list"+ ">click here</a><br><br>Thank you,<br>" + config.ProductName + " Administrator <br>"
        var mailObject = SendMail.GetMailObject(
            manager.Email,
            "Action Plan ("+ kpiOwnerInfo.FirstName +" "+ kpiOwnerInfo.LastName +") comments have been added",
            mailBody,
            null,
            null
        );

        await SendMail.SendEmail(mailObject, function (res) {
            console.log(res);
        });


        // send email to User 
        if (kpiOwnerInfo) {
       let mailBody = "Dear "+ kpiOwnerInfo.FirstName +", <br><br>"
        mailBody = mailBody + "Your manager "+ manager.FirstName + " successfully added comments. <br><br>"
        mailBody = mailBody +"<br>To view details  "+ " <a href="+ config.APP_BASE_REDIRECT_URL +"=/employee/review-action-plan-list"+ ">click here</a><br> Thank you, <br>" +config.ProductName+  " Administrator<br>"
        var mailObject = SendMail.GetMailObject(
            kpiOwnerInfo.Email,
            "Developmental Goal sign-off",
          mailBody,
            null,
            null
        );

        await SendMail.SendEmail(mailObject, function (res) {
            console.log(res);
        });
    }
    }

}


exports.sendEmailEmpOnManagerViewed = async (manager, kpiOwnerInfo) => {


    if (kpiOwnerInfo) {
       
        // send email to User
                mailBody= "Dear "+kpiOwnerInfo.FirstName + ", <br><br>Your manager  has opened your action plan. You may want to initiate a offline discussion for this.<br><br>" 
                mailBody = mailBody + "<br>To view details  "+ " <a href="+ config.APP_BASE_REDIRECT_URL +"=/employee/review-action-plan-list"+ ">click here</a><br> Thank you,<br>"+config.ProductName+" Administrator <br>"
        var mailObject = SendMail.GetMailObject(
            kpiOwnerInfo.Email,
            "Your manager has viewed you action plan",
            mailBody,
            null,
            null
        );

        await SendMail.SendEmail(mailObject, function (res) {
            console.log(res);
        });
    }

}



exports.addDevGoalTrack = async (devGoalModel) => {

    var reportOBJ = await DevGoalsRepo.findOne({
        _id: Mongoose.Types.ObjectId(devGoalModel.devGoalId)
    });
    reportOBJ.tracks = reportOBJ.tracks || [];

    const actor = await UserRepo.findOne({ "_id": devGoalModel.UpdatedBy })

    var track = {
        actorId: devGoalModel.UpdatedBy,
        CreatedOn: new Date(),
        action: devGoalModel.Action,
        comment: actor.FirstName + " " + "has " + devGoalModel.Action + " at " + moment().format('lll')
        
    }
    reportOBJ.tracks.push(track);
    return await reportOBJ.save();

}




exports.GetEAReporteeReleasedKpiForm = async (manager) => {
    try {
        let {currentEvaluation} = manager;
        const ManagerUserDomain = await UserRepo.findOne({ "_id": manager.id });
        let evaluationYear="";
        if(!currentEvaluation){
            evaluationYear = await EvaluationUtils.GetOrgEvaluationYear(ManagerUserDomain.Organization);
        }else{
            evaluationYear=currentEvaluation;
        }
        console.log(`GetReporteeReleasedKpiForm:evaluationYear = ${evaluationYear}`);

        const reportees = await UserRepo.aggregate([
            { $match: { Organization: ObjectId(manager.orgId) } },
            { $addFields: { EmployeeId: "$_id" } },
            {
                $project: {
                    FirstName: 1,
                    LastName: 1,
                    Email: 1,
                    EmployeeId: 1,
                    Manager:1
                }
            }
            ,
            {
                $lookup: {
                    from: "kpiforms",
                    localField: "EmployeeId",
                    foreignField: "EmployeeId",
                    as: "ReleasedKpiList"
                }
            },
            {$match:{"ReleasedKpiList.IsActive": true, "ReleasedKpiList.KPIFor": "EA", "ReleasedKpiList.EvaluationYear": evaluationYear+""  }},
           {$unwind:"$ReleasedKpiList"},
          
            
            {
                $lookup: {
                    from: "kpis",
                    localField: "EmployeeId",
                    foreignField: "Owner",
                    as: "KpiList"
                }
            },
            { $addFields: { ReleasedKpis: "$ReleasedKpiList" } },
            { $addFields: { KpiExist: { $gt: [{ $size: "$KpiList" }, 0] } } },
            //{$match:{"Evalaution.Status":"Active"}},
            {
                $project: {
                    //KpiList: 1,
                    Email: 1,
                    FirstName: 1,
                    LastName: 1,
                    EmployeeId: 1,     
                    Manager:1,               
                    KpiExist: 1,
                    ReleasedKpis:1,
                    KpiList: {
                        "$filter": {
                            "input": "$KpiList",
                            "as": "result",
                            "cond": {
                                "$and": [
                                    { "$eq": ["$$result.EvaluationYear", evaluationYear] },
                                    { "$eq": ["$$result.IsDraft", false] },
                                    { "$eq": ["$$result.IsSubmitedKPIs", true] }
                                ]
                            }
                        }
                    }
                }
            }
        ])


       
return reportees;
   

    } catch (error) {
        console.log('error', error)
        logger.error(error);
    }
}






exports.GetReporteeReleasedKpiForm = async (manager) => {
    try {
        let {currentEvaluation} = manager;
        const ManagerUserDomain = await UserRepo.findOne({ "_id": manager.id });
        let evaluationYear="";
        if(!currentEvaluation){
            evaluationYear = await EvaluationUtils.GetOrgEvaluationYear(ManagerUserDomain.Organization);
        }else{
            evaluationYear=currentEvaluation;
        }
        console.log(`GetReporteeReleasedKpiForm:evaluationYear = ${evaluationYear}`);

        const reportees = await UserRepo.aggregate([
            { $match: { Manager: ObjectId(manager.id) } },
            { $addFields: { EmployeeId: "$_id" } },
            {
                $project: {
                    FirstName: 1,
                    LastName: 1,
                    Email: 1,
                    EmployeeId: 1,
                    Manager:1
                }
            }
            ,
            {
                $lookup: {
                    from: "kpiforms",
                    localField: "EmployeeId",
                    foreignField: "EmployeeId",
                    as: "ReleasedKpiList"
                }
            },
            {$match:{"ReleasedKpiList.IsActive": true,"ReleasedKpiList.EvaluationYear": evaluationYear+""  }},
           {$unwind:"$ReleasedKpiList"},
          
            
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
                    from: "accomplishments",
                    localField: "EmployeeId",
                    foreignField: "Owner",
                    as: "AccompList",
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
            { $addFields: { ReleasedKpis: "$ReleasedKpiList" } },
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
                                    //{ "$eq": ["$$goalresult.CreatedYear", new Date().getFullYear()+""] },
                                    { "$eq": ["$$goalresult.CreatedYear", currentEvaluation+""] },
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
                                    //{ "$eq": ["$$strresult.CreatedYear", new Date().getFullYear()+""] },
                                    { "$eq": ["$$strresult.CreatedYear", currentEvaluation+""] },
                                    { "$eq": ["$$strresult.IsDraft", false] },
                                    { "$eq": ["$$strresult.IsStrengthSubmited", true] }
                                ]
                            }
                        }
                    },
                     AccompList: {
                        "$filter": {
                            "input": "$AccompList",
                            "as": "accompresult",
                            "cond": {
                                "$and": [
                                    { "$eq": ["$$accompresult.EvaluationYear", evaluationYear+""] },
                                    { "$eq": ["$$accompresult.IsDraft", false] },
                                    { "$eq": ["$$accompresult.ShowToManager", true] }
                                ]
                            }
                        }
                    },
                    Email: 1,
                    FirstName: 1,
                    LastName: 1,
                    EmployeeId: 1,     
                    Manager:1,               
                    KpiExist: 1,
                    ReleasedKpis:1,
                    KpiList: {
                        "$filter": {
                            "input": "$KpiList",
                            "as": "result",
                            "cond": {
                                "$and": [
                                    { "$eq": ["$$result.EvaluationYear", evaluationYear] },
                                    { "$eq": ["$$result.IsDraft", false] },
                                    { "$eq": ["$$result.IsSubmitedKPIs", true] }
                                ]
                            }
                        }
                    }
                }
            }
        ])


        var evReportees=[];
      evReportees=  await   EvaluationService.GetReporteeEvaluations(manager);
      evReportees = await filterEmployeePG(evReportees);
return [...reportees,...evReportees];
   

    } catch (error) {
        console.log('error', error)
        logger.error(error);
    }
}

const filterEmployeePG = async (pglist) => {
    console.log("inside:filterEmployeePG: "+pglist.length);
    for(var i=0;i<pglist.length;i++){
        let employeePg = {} ;
        employeePg = pglist[i];
        let pgSignoffDomain = await PGSignoffSchema.findOne({Owner:ObjectId(employeePg._id)});
        if(pgSignoffDomain){
            if(employeePg && employeePg.KpiList && employeePg.KpiList.length>0){
                let {FinalSignoff,FinalSignoffOn} = pgSignoffDomain;
                let {KpiList} = employeePg;
                let pgDraftGoals = [];
                let _KpiList = [];
                for(var j=0;j<KpiList.length;j++){
                    let kpiObj = KpiList[j];
                    let {ManagerSignOff,IsActive,isFinalSignoff} = kpiObj;
                    console.log(`${kpiObj.Kpi} => ${FinalSignoff} - ${isFinalSignoff} - ${IsActive} - ${ManagerSignOff.submited}`)
                    if(FinalSignoff && isFinalSignoff && !ManagerSignOff.submited && IsActive){
                        pgDraftGoals.push(kpiObj)
                    }else{
                        _KpiList.push(kpiObj)
                    }
                }
                employeePg.pgDraftGoals=pgDraftGoals;
                employeePg.KpiList=_KpiList;
            }
        }else{
            employeePg.pgDraftGoals=[];
        }
        pglist[i]=employeePg;
    }
    return pglist;
}



exports.GetTSReleasedKpiForm = async (manager) => {
    try {
        const reportees = await UserRepo.aggregate([
            { $match: { ThirdSignatory: ObjectId(manager.id) } },
            { $addFields: { EmployeeId: "$_id" } },
            {
                $project: {
                    FirstName: 1,
                    LastName: 1,
                    Email: 1,
                    EmployeeId: 1,
                    Manager:1
                }
            }
            ,
            {
                $lookup: {
                    from: "kpiforms",
                    localField: "EmployeeId",
                    foreignField: "EmployeeId",
                    as: "ReleasedKpiList"
                }
            },
            {$match:{"ReleasedKpiList.IsActive": true,"ReleasedKpiList.EvaluationYear": new Date().getFullYear()+""  }},
           {$unwind:"$ReleasedKpiList"},
          
            
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
                    from: "accomplishments",
                    localField: "EmployeeId",
                    foreignField: "Owner",
                    as: "AccompList",
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
            { $addFields: { ReleasedKpis: "$ReleasedKpiList" } },
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
                    AccompList: {
                        "$filter": {
                            "input": "$AccompList",
                            "as": "accompresult",
                            "cond": {
                                "$and": [
                                    { "$eq": ["$$accompresult.EvaluationYear", new Date().getFullYear()+""] },
                                    { "$eq": ["$$accompresult.IsDraft", false] },
                                    { "$eq": ["$$accompresult.ShowToManager", true] }
                                ]
                            }
                        }
                    },
                    Email: 1,
                    FirstName: 1,
                    LastName: 1,
                    EmployeeId: 1,     
                    Manager:1,               
                    KpiExist: 1,
                    ReleasedKpis:1,
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
                    }
                }
            }
        ])


       
    var evReportees=[];
      evReportees=   await EvaluationService.GetTSReporteeEvaluations(manager);
return [...reportees,...evReportees];
   

    } catch (error) {
        console.log('error', error)
        logger.error(error);
    }
}


