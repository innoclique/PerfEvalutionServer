const PGSignoffSchema = require("../SchemaModels/PGSignoffSchema");
const moment = require("moment");
const Mongoose = require("mongoose");

exports.PGSignOffSave =  async (options)=>{
    let {Owner,ManagerId,submittedBy,EvaluationYear} = options;
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
            }

        }else if(submittedBy === "Employee"){
            PGModel.SignOff={};
            PGModel.SignOff.submited=true;

            if(ManagerSignOff.submited){
                PGModel.FinalSignoff=true;
                PGModel.FinalSignoffOn=new Date();
            }
        }

        await PGSignoffSchema.update({Owner,ManagerId,EvaluationYear},PGModel);

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
    }
    return true;
}

exports.GetPGSignoffByOwner =  async (options)=>{
    console.log("Inside:GetPGSignoffByOwner")
    console.log(options);
    return await PGSignoffSchema.findOne(options);
}
