require('dotenv').config();
var env = process.env.NODE_ENV || "dev";
const Mongoose = require("mongoose");
const DevGoalsRepo = require('../SchemaModels/DevGoals');
const UserRepo = require('../SchemaModels/UserSchema');
const KpiRepo = require('../SchemaModels/KPI');
const EvaluationRepo = require('../SchemaModels/Evalution');
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





exports.UpdateDevGoalById = async (devGoalData) => {
    try {

        devGoalData.Action = 'Update';
        if (devGoalData.IsManaFTSubmited) {
            const Manager = await UserRepo.findById(devGoalData.UpdatedBy);
           devGoalData.ManagerFTSubmitedOn=new Date()
            devGoalData.ManagerSignOff={SignOffBy:Manager.FirstName,SignOffOn:new Date()}

          const kpiOwnerInfo=  this.GetKpiDataById(devGoalData.devGoalId)
              this.sendEmailOnManagerSignoff(Manager,kpiOwnerInfo);


        }

        if (devGoalData.ViewedByEmpOn) {
         
            devGoalData.ViewedByEmpOn= new Date();
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
            To view details, <a href="${config.APP_BASE_URL}#/employee/goals">click here</a>.`
            content = content.replace("##FirstName##",devGoalOwnerInfo.FirstName);
            content = content.replace("##ProductName##", config.ProductName);
            content = content.replace("##Description##", des);
            content = content.replace("##Title##", "Devlopment Goal Submitted");

        var mailObject = SendMail.GetMailObject(
            devGoalOwnerInfo.Email,
                  "Devlopment Goal Submitted",
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
    
            let des= `  Your direct report, ${devGoalOwnerInfo.FirstName} ${devGoalOwnerInfo.LastName}, has submitted the action plan(Devlopment Goal).
            You may login to review. To view details, <a href="${config.APP_BASE_URL}#/em/goals">click here</a>.
               `
            content = content.replace("##FirstName##",manager.FirstName);
            content = content.replace("##ProductName##", config.ProductName);
            content = content.replace("##Description##", des);
            content = content.replace("##Title##", "Devlopment Goal Submitted");

      
            var mailObject = SendMail.GetMailObject(
            manager.Email,
                  "Devlopment Goal Submitted",
                 content,
                  null,
                  null
                );

        SendMail.SendEmail(mailObject, function (res) {   });
    

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


