require('dotenv').config();
var env = process.env.NODE_ENV || "dev";
const PGSignoffSchema = require("../SchemaModels/PGSignoffSchema");
const UserRepo = require("../SchemaModels/UserSchema");
const SendMail = require("../Helpers/mail.js");
var config = require(`../Config/${env}.config`);
const moment = require("moment");
const Mongoose = require("mongoose");
const { UserRepository } = require("../Config/DbConfig");

exports.PGSignOffSave =  async (options)=>{
    let {Owner,ManagerId,Manager,submittedBy,EvaluationYear} = options;
    let secondSignBy;
    let pgSignoffDomain = await PGSignoffSchema.findOne({Owner,EvaluationYear,ManagerId});
    if(pgSignoffDomain){
        let {ManagerSignOff,SignOff} = pgSignoffDomain;
        let PGModel={};
        if(submittedBy === "Manager"){
            PGModel.ManagerSignOff={};
            PGModel.ManagerSignOff.submited=true;

            if(SignOff.submited){
                PGModel.FinalSignoff=true;
                PGModel.FinalSignoffOn=new Date();
                secondSignBy="Manager";
            }

        }else if(submittedBy === "Employee"){
            PGModel.SignOff={};
            PGModel.SignOff.submited=true;

            if(ManagerSignOff.submited){
                PGModel.FinalSignoff=true;
                PGModel.FinalSignoffOn=new Date();
                secondSignBy="Employee";
            }
        }

        await PGSignoffSchema.update({Owner,ManagerId,EvaluationYear},PGModel);

        if(submittedBy === "Manager"){
            this.sendEmailOnManagerSignoff(Manager,Owner,secondSignBy);
        }else if(submittedBy === "Employee"){
            this.sendEmailOnEmpSignoff(Manager,Owner,secondSignBy);
        }

    }else{
        let PGModel = {Owner,ManagerId,EvaluationYear};
        if(submittedBy === "Manager"){
            PGModel.ManagerSignOff={};
            PGModel.ManagerSignOff.submited=true;
        }else if(submittedBy === "Employee"){
            PGModel.SignOff={};
            PGModel.SignOff.submited=true;
        }
        var PGModelDomain = new PGSignoffSchema(PGModel);
         await PGModelDomain.save();

         if(submittedBy === "Manager"){
            this.sendEmailOnManagerSignoff(Manager,Owner,secondSignBy);
        }else if(submittedBy === "Employee"){
            this.sendEmailOnEmpSignoff(Manager,Owner,secondSignBy);
        }

    }
    return true;
}



exports.sendEmailOnManagerSignoff = async (managerId, kpiOwnerInfoId,secondSignBy) => {

    const manager = await UserRepo.findById(managerId);
        const kpiOwnerInfo = await UserRepo.findById(kpiOwnerInfoId);

    if (manager) {
        // send email to manager 
let mailBody =  "Dear " + manager.FirstName + ",<br><br>"
mailBody = mailBody + "You have signed-off performance goals for " +  kpiOwnerInfo.FirstName+" "+  kpiOwnerInfo.LastName+".<br>"
mailBody=mailBody + "<br>To view, "+ " <a href="+config.APP_BASE_REDIRECT_URL+"=/employee/review-perf-goals-list" + ">click here</a>.<br><br>Thank you,<br> "+config.ProductName+" Administrator<br>"
        var mailObject = SendMail.GetMailObject(
            manager.Email,
            "Performance Goals signed-off",
           mailBody,
            null,
            null
        );

        
        await SendMail.SendEmail(mailObject, function (res) {
            console.log(res);
        });


        // send email to User 
        if(kpiOwnerInfo){
      let  mailBody = "Dear "+ kpiOwnerInfo.FirstName + ", <br><br>"
      //<first name last name> has signed-off your performance evaluation.
        mailBody = mailBody +  manager.FirstName +" "+manager.LastName+ " has signed-off your performance evaluation.<br><br>"
        if(secondSignBy)
        mailBody = mailBody + "“Your Performance Goals are now signed-off.”<br><br>"
        mailBody=mailBody + "<br>To view, "+ " <a href="+config.APP_BASE_REDIRECT_URL+"=/employee/kpi-setup" + ">click here</a>.<br><br>Thank you,<br> "+config.ProductName+" Administrator<br>"
        var mailObject = SendMail.GetMailObject(
            kpiOwnerInfo.Email,
            "Performance Goals signed-off",
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




exports.sendEmailOnEmpSignoff = async (managerId, kpiOwnerInfoId,secondSignBy) => {


    const manager = await UserRepo.findById(managerId);
    const kpiOwnerInfo = await UserRepo.findById(kpiOwnerInfoId);
    if (manager) {
        // send email to manager 
let mailBody =  "Dear " + manager.FirstName + ",<br><br>"
//<first name last name> has signed-off their performance evaluation.
//“Your Performance Goals are now signed-off.”
mailBody = mailBody  +  kpiOwnerInfo.FirstName+" "+  kpiOwnerInfo.LastName+" has signed-off their performance evaluation.<br>"
mailBody=mailBody + "<br>To view, "+ " <a href="+config.APP_BASE_REDIRECT_URL+"=/employee/review-perf-goals-list" + ">click here</a>.<br><br>Thank you,<br> "+config.ProductName+" Administrator<br>"
        var mailObject = SendMail.GetMailObject(
            manager.Email,
            "Performance Goals signed-off",
           mailBody,
            null,
            null
        );

        
        await SendMail.SendEmail(mailObject, function (res) {
            console.log(res);
        });


        // send email to User 
        if(kpiOwnerInfo){
      let  mailBody = "Dear "+ kpiOwnerInfo.FirstName + ", <br><br>"
        mailBody = mailBody + "You have signed-off your performance goals.<br><br>"
        if(secondSignBy)
        mailBody = mailBody + "“Your Performance Goals are now signed-off.”<br><br>"
        mailBody=mailBody + "<br>To view, "+ " <a href="+config.APP_BASE_REDIRECT_URL+"=/employee/kpi-setup" + ">click here</a>.<br><br>Thank you,<br> "+config.ProductName+" Administrator<br>"
        var mailObject = SendMail.GetMailObject(
            kpiOwnerInfo.Email,
            "Performance Goals signed-off",
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


exports.GetPGSignoffByOwner =  async (options)=>{
    console.log("Inside:GetPGSignoffByOwner")
    console.log(options);
    return await PGSignoffSchema.findOne(options);
}
