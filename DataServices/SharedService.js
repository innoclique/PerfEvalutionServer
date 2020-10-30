const DbConnection = require("../Config/DbConfig");
require('dotenv').config();
const Mongoose = require("mongoose");

const OrganizationRepo = require('../SchemaModels/OrganizationSchema');
const IndustryRepo = require('../SchemaModels/Industry');
const UserRepo = require('../SchemaModels/UserSchema');
const EvaluationPeriods = require('../SchemaModels/EvaluationPeriod');
const NavigationMenu = require('../SchemaModels/NavigationMenu');
const SendMail = require("../Helpers/mail.js");
const logger = require('../logger');

const Questions=require('../SchemaModels/Questions');
const Competency=require('../SchemaModels/Competency');
const ModelsRepo=require('../SchemaModels/Model');

exports.GetIndustries = async () => {      
    const industries = await IndustryRepo.find({}).sort({Name:1});
    return industries;
};

exports.GetEvaluationCategories = async () => {       
    const evaluationperiods = await EvaluationPeriods.find({}).sort({Name:1});
    return evaluationperiods;
};

exports.GetModelsByIndustry=async (industryId)=>{
    const indId=await IndustryRepo.findOne({Name:industryId.id});
    if(indId){

        const _models=await ModelsRepo.find({Industry:indId.id});
        return _models;
    }else{
        return null;
    }
}
exports.GetCompetencyList=async (company)=>{

var modelAggregation= await ModelsRepo.aggregate([
    {$match:{_id:Mongoose.Types.ObjectId(company.modelId)}},  
{
    $lookup:
       {
         from: "competencies",
         localField: "Competencies",
         foreignField: "_id",
         
         as: "competenciesList"
       }
},
//{$match:{_id:company.modelId}}
])
   // const _comtencyList=await Competency.findById({_id:{$in:comps.Competencies.map(x=>Mongoose.Types.ObjectId(x))}});    
return modelAggregation.find(x=>x._id.toString()===company.modelId).competenciesList;
}

