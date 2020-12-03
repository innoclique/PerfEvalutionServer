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
var fs = require("fs");
var logger = require('../logger');


exports.GetKpisForDevGoals = async (data) => {


    try {
        const Kpi = await KpiRepo.find({ 'Owner': data.empId,
        'EvaluationYear' :new Date().getFullYear() })
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

    var preDevGoals = [];
    // if (preEvaluation && !data.currentOnly) {
    if(!data.currentOnly) {
        //    preDevGoals = await DevGoalsRepo.find({'Owner':data.empId, 'EvaluationId':preEvaluation._id})
        preDevGoals = await DevGoalsRepo.find({ 'Owner': data.empId ,  'MakePrivate': data.fetchAll||false, 'CreatedYear': ""+new Date().getFullYear()-1})
             //  .populate('Kpi')
            .sort({ UpdatedOn: -1 });
    }


    //   const Kpi = await KpiRepo.find({'Owner':data.empId,'IsDraftByManager':false, 'EvaluationId':currEvaluation._id})
    const devGoals = await DevGoalsRepo.find({ 'Owner': data.empId, 
            'MakePrivate': {$in: [false,data.fetchAll ] },   'IsDraftByManager': false ,'CreatedYear': ""+new Date().getFullYear() })
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
            'CreatedYear': new Date().getFullYear(),
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
                'CreatedYear': new Date().getFullYear(),
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
        devGoal.CreatedYear= new Date().getFullYear();
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
            To view details, <a href="${config.APP_BASE_URL}#/employee/action-plan">click here</a>.`
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

        SendMail.SendEmail(mailObject, function (res) {
            console.log(res);
        });

    });


        // send email to manager 
       
        fs.readFile("./EmailTemplates/EmailTemplate.html", async function read(err, bufcontent) {
            var content = bufcontent.toString();
    
            let des= `  Your direct report, ${devGoalOwnerInfo.FirstName} ${devGoalOwnerInfo.LastName}, has submitted the action plan.
            You may login to review. To view details, <a href="${config.APP_BASE_URL}#/em/review-action-plan">click here</a>.
               `
            content = content.replace("##FirstName##",manager.FirstName);
            content = content.replace("##ProductName##", config.ProductName);
            content = content.replace("##Description##", des);
            content = content.replace("##Title##", "Action Plan Submitted");

      
            var mailObject = SendMail.GetMailObject(
            manager.Email,
                  "Action Plan Submitted",
                 content,
                  null,
                  null
                );

        SendMail.SendEmail(mailObject, function (res) {   });
    

    });
    }

}


exports.sendEmailOnManagerSignoff = async (manager, kpiOwnerInfo) => {


    if (manager) {
        // send email to manager 

        var mailObject = SendMail.GetMailObject(
            manager.Email,
            "Developmental Goal signed-off",
            `Dear ${manager.FirstName}, <br>

            You have successfully added comments to the action plan for  ${kpiOwnerInfo.FirstName}.

                        To view details, click here. <br>


                          
                          Thank you,
                          Administrator
                          `,
            null,
            null
        );

        SendMail.SendEmail(mailObject, function (res) {
            console.log(res);
        });


        // send email to User 
        var mailObject = SendMail.GetMailObject(
            kpiOwnerInfo.Email,
            "Developmental Goal sign-off",
            `Dear ${kpiOwnerInfo.FirstName}, <br>

            Your manager ${manager.FirstName} successfully added comments. <br>
                          
                          
                          Thank you,
                         Administrator
                          `,
            null,
            null
        );

        SendMail.SendEmail(mailObject, function (res) {
            console.log(res);
        });
    }

}


exports.sendEmailEmpOnManagerViewed = async (manager, kpiOwnerInfo) => {


    if (kpiOwnerInfo) {
       
        // send email to User 
        var mailObject = SendMail.GetMailObject(
            kpiOwnerInfo.Email,
            "Action plan viewed",
            `Dear ${kpiOwnerInfo.FirstName}, <br>

            
            Your manager  has opened your action plan. You may want to initiate a offline discussion for this. 
                          
                          
                   <br>       Thank you,
                         Administrator
                          `,
            null,
            null
        );

        SendMail.SendEmail(mailObject, function (res) {
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
        action: devGoalModel.Action,
        comment: actor.FirstName + " " + "has " + devGoalModel.Action + " at " + new Date().toLocaleDateString()
    }
    reportOBJ.tracks.push(track);
    return await reportOBJ.save();

}









exports.GetReporteeReleasedKpiForm = async (manager) => {
    try {
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
      evReportees=  await   EvaluationService.GetReporteeEvaluations(manager);
return [...reportees,...evReportees];
   

    } catch (error) {
        console.log('error', error)
        logger.error(error);
    }
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


