const DbConnection = require("../Config/DbConfig");
require('dotenv').config();
var env = process.env.NODE_ENV || "dev";
const Mongoose = require("mongoose");
const Bcrypt = require('bcrypt');
const OrganizationRepo = require('../SchemaModels/OrganizationSchema');
const DeliverEmailRepo = require('../SchemaModels/DeliverEmail');
const StrengthRepo = require('../SchemaModels/Strengths');
const AccomplishmentRepo = require('../SchemaModels/Accomplishments');
const DepartmentRepo = require('../SchemaModels/DepartmentSchema');
const JobRoleRepo = require('../SchemaModels/JobRoleSchema');
const JobLevelRepo = require('../SchemaModels/JobLevelSchema');
const RatingScoreRepo = require('../SchemaModels/RatingScore');
const CoachingRemainRepo = require('../SchemaModels/CoachingRemainder');
const IndustryRepo = require('../SchemaModels/Industry');
const AppRoleRepo = require('../SchemaModels/ApplicationRolesSchema');
const RoleRepo = require('../SchemaModels/Roles');
const KpiRepo = require('../SchemaModels/KPI');
const KpiHistoryRepo = require('../SchemaModels/KPIHistory');
const MeasureCriteriaRepo = require('../SchemaModels/MeasurementCriteria');
const IndustriesRepo = require('../SchemaModels/Industry');
const EvaluationRepo = require('../SchemaModels/Evalution');
const AuthHelper = require('../Helpers/Auth_Helper');
const Messages = require('../Helpers/Messages');
const UserRepo = require('../SchemaModels/UserSchema');
const SendMail = require("../Helpers/mail.js");
var logger = require('../logger');
const moment = require("moment");
const ObjectId = Mongoose.Types.ObjectId;
const KpiFormRepo = require('../SchemaModels/KpiForm');
const strengthRepo = require('../SchemaModels/Strengths');
const DevGoalsRepo = require('../SchemaModels/DevGoals');
var fs = require("fs");
var config = require(`../Config/${env}.config`);
const EvaluationStatus = require('../common/EvaluationStatus');
const { boolean } = require("joi");
const EvaluationService = require('./EvaluationService');
const PGSignoffSchema = require('../SchemaModels/PGSignoffSchema');
const EvaluationUtils = require('../utils/EvaluationUtils');
const ModelsRepo=require('../SchemaModels/Model');
const statusesRepo = require('../SchemaModels/Statuses');

exports.AddStrength = async (strength) => {
    try {
        if (strength.StrengthId) {
            let { StrengthId } = strength;
            delete strength.StrengthId;
            let response = await StrengthRepo.updateOne({ _id: ObjectId(StrengthId) }, strength);
        } else {
            let Strength = new StrengthRepo(strength);
            await Strength.save()
        }
        return true;
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


}
exports.GetStrengthById = async (Id) => {

    const Strength = await StrengthRepo.findById(Id);

    return Strength;


};

exports.getCopiesTo = async (userId) => {
    console.log("inside GetCopiesTo service ");
    return await UserRepo
        .find({ "CopiesTo": Mongoose.Types.ObjectId(userId.userId) });
}


//new Date().getFullYear()
exports.getCopiesToWithEV = async (manager) => {
    try {
        let {currentEvaluation} = manager;
        const ManagerUserDomain = await UserRepo.findOne({ "_id": manager.id });
        let evaluationYear="";
        if(!currentEvaluation){
            evaluationYear = await EvaluationUtils.GetOrgEvaluationYear(ManagerUserDomain.Organization);
        }else{
            evaluationYear=currentEvaluation;
        }

        const reportees = await UserRepo.aggregate([
            { $match: { CopiesTo: ObjectId(manager.id)} },
            { $addFields: { EmployeeId: "$_id" } },
            {
                $project: {
                    FirstName: 1,
                    LastName: 1,
                    Email: 1,
                    EmployeeId: 1,
                    Manager: 1
                }
            }
            ,
            {
                $lookup: {
                    from: "evalutions",
                    localField: "EmployeeId",
                    foreignField: "Employees._id",
                    as: "EvaluationList"
                }
            },
            { $unwind: "$EvaluationList" },

            {
                $lookup: {
                    from: "statuses",
                    localField: "EvaluationList.Employees.Status",
                    foreignField: "_id",
                    as: "statuses",
                }
            },

            
            //{$match:{"Evalaution.Status":"Active"}},
            {
                $project: {
                
                    Email: 1,
                    FirstName: 1,
                    LastName: 1,
                    EmployeeId: 1,
                    statuses: 1,
                    EvaluationList:1
                   
                }
            }
        ]);

        let copieList = await UserRepo.find({ "CopiesTo": Mongoose.Types.ObjectId(manager.id) });
        let _reportees = [];
        copieList.forEach((e, i) => {
            let object=e.toJSON();
            let ev = reportees.find(c => c.EmployeeId.toString() === e._id.toString() );
            if(ev){
                  object['EvStatus'] = ev.statuses[0] 
                  object['Evaluation'] = ev.EvaluationList 
                }
            else {object['EvStatus']="NA"
            object['Evaluation']="NA"
        
        }
            _reportees[i] = object;

        });



   return _reportees;

    } catch (error) {
        console.log('error', error)
        logger.error(error);
    }
}

exports.GetAllStrengths = async (options) => {
    let {empId,CreatedYear} = options;
    if(!CreatedYear){
        CreatedYear = ""+new Date().getFullYear()
    }
    const Strengths = await StrengthRepo.find({ 'Employee': empId,
    'CreatedYear':  CreatedYear}).sort({ UpdatedOn: -1 });;
    return Strengths;
};
exports.GetEvaluationsYears = async (empId) => {
    return await EvaluationUtils.GetEmployeeEvaluationYears(empId);
};
exports.AddAccomplishment = async (accomplishment) => {
    try {
        // const organizationName = await strengthRepo.findOne({ Name: organization.Name });
        // const organizationEmail = await strengthRepo.findOne({ Email: organization.Email });
        // const organizationPhone = await OrganizationRepo.findOne({ Phone: organization.Phone });

        // if (organizationName !== null) { throw Error("Organization Name Already Exist"); }

        // if (organizationEmail !== null) { throw Error("Organization Email Already Exist "); }

        // if (organizationPhone !== null) { throw Error("Organization Phone Number Already Exist"); }
        let evaluationYear = new Date().getFullYear();
        if(accomplishment.Owner){
            const OwnerUserDomain = await UserRepo.findOne({ "_id": accomplishment.Owner });
            evaluationYear = await EvaluationUtils.GetOrgEvaluationYear(OwnerUserDomain.Organization);
            console.log(`evaluationYear = ${evaluationYear}`);
        }else if(accomplishment.ManagerId){
            const ManagerUserDomain = await UserRepo.findOne({ "_id": accomplishment.ManagerId });
            evaluationYear = await EvaluationUtils.GetOrgEvaluationYear(ManagerUserDomain.Organization);
            console.log(`evaluationYear = ${evaluationYear}`);
        }
        accomplishment.EvaluationYear = evaluationYear;
        const Accomplishment = new AccomplishmentRepo(accomplishment);
        await Accomplishment.save();
        if (accomplishment.IsDraft=='false') { 
            const Manager = await UserRepo.findById(accomplishment.ManagerId);
           const emp = await UserRepo.findById(accomplishment.Owner);
           this.sendEmailOnAccompCreate(Manager,emp,accomplishment);
           }

           accomplishment.AccompId=Accomplishment._id;
           accomplishment.Action=accomplishment.Action?accomplishment.Action:"Create";
           this.addAccompTrack(accomplishment);
        return true;
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


}

exports.GetAllDepartments = async (empId) => {

    const Departments = await DepartmentRepo.find();
    return Departments;
};

exports.GetEmpSetupBasicData = async (industry) => {



    //  const Industries = await IndustriesRepo.findById('5f6b2acc7d83cd08b8a9ad46');   
    const Industries = await IndustriesRepo.find({ Name: industry });

    //var AppRoles = await RoleRepo.find({ RoleLevel: { $in: ['3', '4', '5', '6'] } })
    var AppRoles = await RoleRepo.find({ RoleLevel: { $in: ['2', '3', '4', '5', '6'] } })
    const JobLevels = await JobLevelRepo.find();
    return { Industries, AppRoles, JobLevels };
};

//Added by Brij - Start 
exports.GetEmpFinalRatingByYear = async (req) => {
    try {
        console.log(req);
        const finalRatings = await EvaluationRepo.findOne({
        Employees: { $elemMatch:{_id: ObjectId(req.EmployeeId)}},
        EvaluationYear: req.EvaluationYear.toString()
       }).select("Employees.FinalRating");
       if (!finalRatings) {
        throw "Final Rating Not Found";
      }
    return finalRatings;
}
    catch(err){
    logger.error(err)
    console.log(err);
    throw (err);    
    }
}


//Added by Brij - Ends

exports.GetKpiSetupBasicData = async (options) => {
    console.log("inside:GetKpiSetupBasicData")
try{
    let {orgId,empId,currentEvaluation} = options;
    let evaluationYear = await EvaluationUtils.GetOrgEvaluationYear(orgId);
    if(!evaluationYear){
        evaluationYear = new Date().getFullYear();
    }
    if(currentEvaluation){
        evaluationYear = currentEvaluation;
    }
    console.log(`GetKpiSetupBasicData:evaluationYear = ${evaluationYear}`);
    const KpiStatus = Messages.constants.KPI_STATUS;
    //const KpiScore = Messages.constants.KPI_SCORE;
    // const coachingRem = Messages.constants.COACHING_REM_DAYS;
    const KpiScore = await RatingScoreRepo.find({ 'organization': Mongoose.Types.ObjectId(orgId) });
    const coachingRem = await CoachingRemainRepo.find();
    var allEvaluation = await EvaluationRepo.find({
        Employees: { $elemMatch: { _id: Mongoose.Types.ObjectId(empId) } },
        EvaluationYear: evaluationYear,
        Company: orgId
    }).sort({ CreatedDate: -1 });  
    let evaluation = allEvaluation[0];
    return { KpiStatus, KpiScore, coachingRem, evaluation };

    

}catch(err){

    logger.error(err)

    console.log(err);
    throw (err);
}
};



exports.GetSetupBasicData = async (data) => {

    try{
    
        const Industries = await IndustryRepo.find({}).sort({Name:1});
        const KpiStatus = Messages.constants.KPI_STATUS;
      
        const KpiScore = await RatingScoreRepo.find();
        const coachingRem = await CoachingRemainRepo.find();
        const Models = await ModelsRepo.find({"IsActive":true},{Name:1,_id:1}).sort({Name:1});
        return { KpiStatus, KpiScore, coachingRem,Industries,Models };
    
        
    
    }catch(err){
    
        logger.error(err)
    
        console.log(err);
        throw (err);
    }
    };

exports.GetAllMeasurementCriterias = async (empId) => {
    const MeasureCriterias = await MeasureCriteriaRepo.find({ 'CreatedBy': empId });
    return MeasureCriterias;

};

exports.CreateMeasurementCriteria = async (measures) => {
    const MeasureCriteria = new MeasureCriteriaRepo(measures);
    return await MeasureCriteria.save();

};


exports.GetAccomplishmentDataById = async (Id) => {

    const Accomplishment = await AccomplishmentRepo.findById(Id);

    return Accomplishment;


};
exports.GetAllAccomplishments = async (data) => {
    const UserDomain = await UserRepo.findOne({ "_id": data.empId });
    let evaluationYear = await EvaluationUtils.GetOrgEvaluationYear(UserDomain.Organization);
    console.log(`evaluationYear = ${evaluationYear}`);

    var Accomplishments;
    if(data.reqFrom=='review'){
    Accomplishments = await AccomplishmentRepo.find(
      
        { 'Owner': data.empId, EvaluationYear: evaluationYear, ShowToManager:true }
        
        ).sort({ UpdatedOn: -1 });
    }else{
        Accomplishments = await AccomplishmentRepo.find(
      
            { 'Owner': data.empId, EvaluationYear: evaluationYear }
            
            ).sort({ UpdatedOn: -1 });
    }
    return Accomplishments;
    
};
exports.UpdateAccomplishmentDataById = async (accompModal) => {

    try {
    accompModal.Action = 'Updated';
    accompModal.UpdatedOn = new Date();
       await AccomplishmentRepo.findByIdAndUpdate(accompModal.AccompId, accompModal);
    const accomp= await AccomplishmentRepo.findById(accompModal.AccompId);
    
    const Manager = await UserRepo.findById(accomp.ManagerId);
        const emp = await UserRepo.findById(accomp.Owner);
    if(accompModal.isFirstTimeCreateing){  
        this.sendEmailOnAccompCreate(Manager,emp,accomp);
    }

    if(accompModal.IsDraft=='false')
    this.sendEmailOnAccompUpdate(Manager,emp,accomp);

    this.addAccompTrack(accompModal);


    return true;
}
catch (err) {
    logger.error(err)

    console.log(err);
    throw (err);
}

};


exports.AddKpi = async (kpiModel) => {
    try {
        console.log(JSON.stringify(kpiModel));
        const OwnerUserDomain = await UserRepo.findOne({ "_id": kpiModel.Owner });
        let evaluationYear = await EvaluationUtils.GetOrgEvaluationYear(OwnerUserDomain.Organization);
        console.log(`evaluationYear = ${evaluationYear}`);
        if(!kpiModel.EvaluationYear){
            kpiModel.EvaluationYear = evaluationYear;
        }else{
            evaluationYear=kpiModel.EvaluationYear;
        }
        //isManagerSubmitted
        if(kpiModel.isFinalSignoff && kpiModel.isManagerSubmitted){
            kpiModel.IsDraft = true;
            const User = await UserRepo.findOne({ "_id": kpiModel.CreatedBy });
            kpiModel.ManagerSignOff = { SignOffBy: User.FirstName+" "+User.LastName, SignOffOn: new Date() ,submited : true};
        }
        
        var Kpi = new KpiRepo(kpiModel);
        Kpi = await Kpi.save();
        await  KpiHistoryRepo.insertMany([ {KpiData:Kpi, CreatedBy:kpiModel.CreatedBy,CreatedOn:new Date(),Action:"Created" } ]);
        
        //Updateing other kpis waiting 
        if (kpiModel.Weighting!='' && kpiModel.IsDraft=='false') {
            let updatedKPIs = await KpiRepo.updateMany({
                'Owner': Mongoose.Types.ObjectId(kpiModel.Owner),
                'EvaluationYear': evaluationYear,
                'IsDraft': false,
            },
                { $set: { 'Weighting': kpiModel.Weighting } });
        }

        kpiModel.Action = 'Create';
        kpiModel.kpiId = Kpi.id;
        this.addKpiTrack(kpiModel);

        return true;
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


}
exports.GetKpiDataById = async (Id) => {

    const Kpi = await KpiRepo.findById(Id)
        .populate({
            path: 'MeasurementCriteria.measureId Owner',
            populate: {
                path: 'JobLevel',
                model: 'JobLevels',
            }
        })

    return Kpi;


};
exports.GetEmployeeCurrentEvaluationYear = async (data) => {
    var kpiFormData = await KpiFormRepo.findOne({
        'EmployeeId': Mongoose.Types.ObjectId(data.empId),
        IsDraft: false, IsActive: true,
    });
    if(kpiFormData){
        let {EvaluationYear} = kpiFormData;
        return EvaluationYear;
    }
    var evaluation = await EvaluationRepo.findOne({
        Employees: { $elemMatch: { _id: Mongoose.Types.ObjectId(data.empId),isEvaluationCompleted:false } },
        Company: data.orgId
    }).sort({ CreatedDate: -1 });
    if(evaluation){
        let {EvaluationYear} = evaluation;
        return EvaluationYear;
    }
    let OrgEvaluationYear = await EvaluationUtils.GetOrgEvaluationYear(data.orgId);
    return OrgEvaluationYear;


}
exports.hasEvaluationPgRollout = async (data) => {
    console.log("inside:hasEvaluationPgRollout");
    console.log(data)
    let {orgId,empId,evaluationYear} = data;
    var evaluation = await EvaluationRepo.countDocuments({
        Employees: { $elemMatch: { _id: Mongoose.Types.ObjectId(empId) } },
        EvaluationYear: evaluationYear,
        Company: orgId
    });
    console.log(`evaluation count : ${evaluation}`);
    var kpiFormData = await KpiFormRepo.countDocuments({
        'EmployeeId': Mongoose.Types.ObjectId(empId),
        IsDraft: false, IsActive: true, EvaluationYear: evaluationYear
    });

    if(evaluation == 0 && kpiFormData==0){
        throw Error("Performance Goal Setting Form Not Activated");
    }else if(evaluation >0){
        return true;
    }else if(kpiFormData >0){
        return true;
    }else{
        return true;
    }
}
exports.GetAllKpis = async (data) => {
    
    let evaluationYear = await EvaluationUtils.GetOrgEvaluationYear(data.orgId);
    if(data && data.evaluationYear){
        evaluationYear = data.evaluationYear;
    }
    console.log(`evaluationYear => ${evaluationYear}`)
    var evaluation = await EvaluationRepo.findOne({
        Employees: { $elemMatch: { _id: Mongoose.Types.ObjectId(data.empId) } },
        EvaluationYear: evaluationYear,
        Company: data.orgId
    }).sort({ CreatedDate: -1 });
    // let currEvaluation = allEvaluation[0];
    // let preEvaluation = allEvaluation[1];

    var kpiFormData = await KpiFormRepo.findOne({
        'EmployeeId': Mongoose.Types.ObjectId(data.empId),
        IsDraft: false, IsActive: true, EvaluationYear: evaluationYear
    });

    if (!kpiFormData) {
        if (evaluation) {

        } else {
            throw Error("Performance Goal Setting Form Not Activated");
        }
    }
    var preKpi = [];
    if (!data.currentOnly) {
        preKpi = await KpiRepo.find({ 'Owner': data.empId, EvaluationYear: parseInt(evaluationYear) - 1 })
            .populate({
                path: 'MeasurementCriteria.measureId Owner',
                populate: {
                    path: 'JobLevel',
                    model: 'JobLevels',
                }
            })
            .sort({ UpdatedOn: -1 });
    }


    const Kpi = await KpiRepo.find({ 'Owner': data.empId, 'IsDraftByManager': false, EvaluationYear: evaluationYear })
        .populate({
            path: 'MeasurementCriteria.measureId Owner',
            populate: {
                path: 'JobLevel',
                model: 'JobLevels',
            }
        })
        .sort({ UpdatedOn: -1 }).populate('EvaluationId');;


    return [...Kpi, ...preKpi];
};



exports.GetKpisHistoryByKpiId = async (data) => {
    

    const Kpi = await KpiHistoryRepo.find({ 'KpiData._id': Mongoose.Types.ObjectId(data.kpiId)})
        .populate('KpiData.MeasurementCriteria.measureId CreatedBy')
        .sort({ CreatedOn: -1 });


    return Kpi;
};

exports.GetKpisByManager = async (data) => {
    let {currentEvaluation} = data;
    const OwnerUserDomain = await UserRepo.findOne({ "_id": data.empId });
    let evaluationYear="";
    if(!currentEvaluation){
        evaluationYear = await EvaluationUtils.GetOrgEvaluationYear(OwnerUserDomain.Organization);
    }else{
        evaluationYear = currentEvaluation;
    }
    
    console.log(`evaluationYear = ${evaluationYear}`);

    var allKpis = []

    var Kpis = await KpiRepo.find({
        'ManagerId': data.managerId,
        'Owner': data.empId,
        'EvaluationYear': evaluationYear,
        'IsDraft': false,
        'IsSubmitedKPIs': true

    })
        .populate({
            path: 'MeasurementCriteria.measureId Owner',
            populate: {
                path: 'JobLevel',
                model: 'JobLevels',
            }
        })
        .sort({ UpdatedOn: -1 });

    var managerDraftsKpis = await KpiRepo.find({
        'ManagerId': data.managerId,
        'Owner': data.empId,
        'IsDraft': false,
        'EvaluationYear': evaluationYear,
        'IsDraftByManager': true,
    })
        .populate({
            path: 'MeasurementCriteria.measureId Owner',
            populate: {
                path: 'JobLevel',
                model: 'JobLevels',
            }
        })
        .sort({ UpdatedOn: -1 });

        if(data.draftSignoff){
            Kpis= await filterEmployeePG(Kpis);
        }

    allKpis = [...Kpis, ...managerDraftsKpis]
    //sgsgggjsr



    return allKpis;
};

const filterEmployeePG = async (KpiList) => {
    console.log("inside:filterEmployeePG");
    console.log(KpiList.length);
    let pgSignoffDomain;
    let _KpiList = [];
    if(KpiList.length>0){
        let _kpiObj = KpiList[0];
        let {Owner} = _kpiObj;
        pgSignoffDomain = await PGSignoffSchema.findOne({Owner:ObjectId(Owner._id)});
    }
    for(var i=0;i<KpiList.length;i++){
        console.log(i)
        let kpiObj = KpiList[i];
        let {ManagerSignOff,isFinalSignoff} = kpiObj;
        if(pgSignoffDomain){
            let {FinalSignoff,FinalSignoffOn} = pgSignoffDomain;
            if(FinalSignoff && isFinalSignoff && !ManagerSignOff.submited){
                _KpiList.push(kpiObj);
            }
        }
    }
    return _KpiList;
}

exports.SubmitKpisByEmployee = async (options) => {
    let {empId,kpi} = options;
    try {

        const User = await UserRepo.find({ "_id": empId })
            .populate('Manager');
            let kpis = await KpiRepo.find({
                '_id': Mongoose.Types.ObjectId(kpi),
            } );

        let submitedKPIs = await KpiRepo.updateMany({
            '_id': Mongoose.Types.ObjectId(kpi),
        },
            {
                $set: {
                    'IsDraft':false,
                    'IsSubmitedKPIs': true,
                    'EmpFTSubmitedOn': new Date(),
                    'Signoff': { SignOffBy: User[0].FirstName+" "+User[0].LastName, SignOffOn: new Date() }
                }
            });

        if (submitedKPIs.nModified>0) {
            // send email to manager 
            
            if (User[0].Manager) {
                let mailBody = "Dear "+ User[0].Manager.FirstName +", <br><br>"
                mailBody = mailBody + "Your Direct Report, "+ User[0].FirstName + " has submitted the Performance Goals."
                mailBody=mailBody + "<br>Please   "+ " <a href="+ config.APP_BASE_REDIRECT_URL+"=/employee/review-perf-goals-list" + ">click here</a> to login and review.<br><br>Thank you,<br> " + config.ProductName+" Administrator<br>"
                var mailObject = SendMail.GetMailObject(
                    User[0].Manager.Email,
                    "Performance Goals submitted by "+ User[0].FirstName +" "+  User[0].LastName ,
                    mailBody,
                    null,
                    null
                );

               await SendMail.SendEmail(mailObject, function (res) {
                    console.log(res);
                });
            }
            var generatedlink = config.APP_BASE_REDIRECT_URL;
            generatedlink = generatedlink+'=/employee/kpi-setup';
            console.log(' generatedlink ::: ',generatedlink);
            // send email to User 
            let emailBody  = "Dear "+ User[0].FirstName +", <br><br>"
            emailBody = emailBody + "Your Performance Goals have been successfully submitted to your manager.<br><br>"
            mailBody=mailBody + "<br>To view details,  "+ " <a href="+ generatedlink + ">click here</a><br><br>Thank you,<br>" + config.ProductName+ " Administrator<br><br>"
            var mailObject = SendMail.GetMailObject(
                User[0].Email,
                "Performance Goals submitted successfully",
                emailBody,
                null,
                null
            );

         await    SendMail.SendEmail(mailObject, function (res) {
                console.log(res);
            });
        }

        if (submitedKPIs.nModified >0 && kpis.length>0) {
            kpis.forEach(e=> {
                e.UpdatedBy=empId;
                e.kpiId=e._id;
                e.Action="Submitted"
                this.addKpiTrack(e)
            })
        }

        return true
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


};

exports.DenyAllEmployeeSignOffKpis = async (options) => {
    try {
        let {empId,currentEvaluation} = options;
        const User = await UserRepo.find({ "_id": empId })
            .populate('Manager');
            let evaluationYear="";
            if(!currentEvaluation){
                evaluationYear = await EvaluationUtils.GetOrgEvaluationYear(User[0].Organization);
            }else{
                evaluationYear=currentEvaluation;
            }
            console.log(`evaluationYear = ${evaluationYear}`);

            let kpis = await KpiRepo.find({
                'Owner': Mongoose.Types.ObjectId(empId),
                'IsDraft': true,
                'EvaluationYear': evaluationYear,
                'IsSubmitedKPIs': false,
                'isFinalSignoff':true
            } );

        let submitedKPIs = await KpiRepo.updateMany({
            'Owner': Mongoose.Types.ObjectId(empId),
            'IsDraft': true,
            'EvaluationYear': evaluationYear,
            'IsSubmitedKPIs': false,
            'isFinalSignoff':true
        },
            {
                $set: {
                    'IsActive': false,
                }
            });

        if (submitedKPIs.nModified >0 && kpis.length>0) {
            kpis.forEach(e=> {
                e.UpdatedBy=empId;
                e.kpiId=e._id;
                e.Action="Submitted"
                this.addKpiTrack(e)
            })
        }

        return true
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


};

exports.SubmitAllSignOffKpis = async (options) => {
    try {
        let {empId,currentEvaluation} = options;
        const User = await UserRepo.find({ "_id": empId })
            .populate('Manager');
            let evaluationYear="";
            if(!currentEvaluation){
                evaluationYear = await EvaluationUtils.GetOrgEvaluationYear(User[0].Organization);
            }else{
                evaluationYear=currentEvaluation;
            }
            console.log(`evaluationYear = ${evaluationYear}`);

            let kpis = await KpiRepo.find({
                'Owner': Mongoose.Types.ObjectId(empId),
                'IsDraft': true,
                'EvaluationYear': evaluationYear,
                'IsSubmitedKPIs': false,
                'isFinalSignoff':true
            } );

        let submitedKPIs = await KpiRepo.updateMany({
            'Owner': Mongoose.Types.ObjectId(empId),
            'IsDraft': true,
            'EvaluationYear': evaluationYear,
            'IsSubmitedKPIs': false,
            'isFinalSignoff':true
        },
            {
                $set: {
                    'IsDraft':false,
                    'IsSubmitedKPIs': true,
                    'EmpFTSubmitedOn': new Date(),
                    'Signoff': { SignOffBy: User[0].FirstName+" "+User[0].LastName, SignOffOn: new Date() }
                }
            });

        if (submitedKPIs.nModified>0) {
            // send email to manager 
            if (User[0].Manager) {
                let mailBody = "Dear "+User[0].Manager.FirstName+",<br>"
                mailBody = mailBody + "Your Direct Report, " + User[0].FirstName + " has submitted the Performance Goals.<br><br>" 
                mailBody=mailBody + "<br>Please  "+ " <a href="+ config.APP_BASE_REDIRECT_URL+"=/employee/review-perf-goals-list" + ">click here</a> to login and review.<br><br>Thank you,<br> " + config.ProductName+" Administrator<br>"
                var mailObject = SendMail.GetMailObject(
                    User[0].Manager.Email,
                    "Performance Goals submited for review",
             mailBody,
                    null,
                    null
                );

               await SendMail.SendEmail(mailObject, function (res) {
                    console.log(res);
                });
            }
            var generatedlink = config.APP_BASE_REDIRECT_URL;
            generatedlink = generatedlink+'=/employee/kpi-setup';
            console.log(' generatedlink ::: ',generatedlink);
            // send email to User 
           let mailBody = "Dear " + User[0].FirstName + ", <br><br>"
            mailBody = mailBody + "Your Performance Goals have been successfully submitted to your manager."
            mailBody=mailBody + "<br>To view details  "+ " <a href=" + generatedlink + ">click here</a><br><br>Thank you,<br> " + config.ProductName+ " Administrator<br>"
            var mailObject = SendMail.GetMailObject(
                User[0].Email,
                "Performance Goals submited for review",
               mailBody,
                null,
                null
            );

         await    SendMail.SendEmail(mailObject, function (res) {
                console.log(res);
            });
        }

        if (submitedKPIs.nModified >0 && kpis.length>0) {
            kpis.forEach(e=> {
                e.UpdatedBy=empId;
                e.kpiId=e._id;
                e.Action="Submitted"
                this.addKpiTrack(e)
            })
        }

        return true
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


};


exports.SubmitAllKpis = async (options) => {
    try {
        let {empId,currentEvaluation} = options;
        const User = await UserRepo.find({ "_id": empId })
            .populate('Manager');
            let evaluationYear="";
            if(!currentEvaluation){
                evaluationYear = await EvaluationUtils.GetOrgEvaluationYear(User[0].Organization);
            }else{
                evaluationYear=currentEvaluation;
            }
            
            console.log(`evaluationYear = ${evaluationYear}`);
        
            let kpis = await KpiRepo.find({
                'Owner': Mongoose.Types.ObjectId(empId),
                'IsDraft': false,
                'EvaluationYear': evaluationYear,
                'IsSubmitedKPIs': false
            } );

        let submitedKPIs = await KpiRepo.updateMany({
            'Owner': Mongoose.Types.ObjectId(empId),
            'IsDraft': false,
            'EvaluationYear': evaluationYear,
            'IsSubmitedKPIs': false
        },
            {
                $set: {
                    'IsSubmitedKPIs': true,
                    'EmpFTSubmitedOn': new Date(),
                    'Signoff': { SignOffBy: User[0].FirstName+" "+User[0].LastName, SignOffOn: new Date() }
                }
            });

        if (submitedKPIs.nModified>0) {
            // send email to manager 
            if (User[0].Manager) {
              let  mailBody = "Dear " + User[0].Manager.FirstName + ", <br>"
                mailBody = mailBody + "Your Direct Report, "+ User[0].FirstName+" has submitted the Performance Goals.<br><br>"
                mailBody=mailBody + "<br>Please   "+ " <a href="+ config.APP_BASE_REDIRECT_URL+"=/employee/review-perf-goals-list" + ">click here</a> to login and review.<br><br>Thank you,<br> " + config.ProductName+" Administrator<br>"
                var mailObject = SendMail.GetMailObject(
                    User[0].Manager.Email,
                    "Performance Goals submitted by "+ User[0].FirstName +" "+  User[0].LastName ,
                   mailBody,
                    null,
                    null
                );

               await SendMail.SendEmail(mailObject, function (res) {
                    console.log(res);
                });
            }

            var generatedlink = config.APP_BASE_REDIRECT_URL;
        generatedlink = generatedlink+'=/employee/kpi-setup';
        console.log(' generatedlink ::: ',generatedlink);

            // send email to User 
          let  mailBody = "Dear " + User[0].FirstName +", <br><br>"
            mailBody = mailBody + "Your Performance Goals have been successfully submitted to your manager."
            mailBody=mailBody + "<br>To view details  "+ " <a href="+ generatedlink +">click here</a><br><br>Thank you,<br> "+config.ProductName+" Administrator<br>"
            var mailObject = SendMail.GetMailObject(
                User[0].Email,
                "Performance Goals submitted successfully",
  mailBody,
                null,
                null
            );

         await    SendMail.SendEmail(mailObject, function (res) {
                console.log(res);
            });
        }

        if (submitedKPIs.nModified >0 && kpis.length>0) {
            kpis.forEach(async e=> {
                e.UpdatedBy=empId;
                e.kpiId=e._id;
                e.Action="Submitted"
                this.addKpiTrack(e)
                const kpiData = await KpiRepo.findById(e._id)
                await  KpiHistoryRepo.insertMany( { KpiData:kpiData, CreatedBy:empId, CreatedOn:new Date(), Action:"Submitted"  } );

            })
        }

        return true
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


};

exports.UpdateKpi = async (kpi) => {
    try {
        let action=kpi.Action;
        kpi.Action = 'Updated';
        console.log(`kpi.Score = ${kpi.Score}`);
        const kpiOwnerInfo = await this.GetKpiDataById(kpi.kpiId)
        const Manager = await UserRepo.findById(kpi.UpdatedBy);
       if (kpi.IsManaFTSubmited) {
            kpi.ManagerFTSubmitedOn = new Date()
            kpi.ManagerSignOff = { SignOffBy: Manager.FirstName+" "+Manager.LastName, SignOffOn: new Date() }

           // const kpiOwnerInfo = this.GetKpiDataById(kpi.kpiId)
            this.sendEmailOnManagerSignoff(Manager, kpiOwnerInfo,kpi);


       }

        if (kpi.ViewedByEmpOn) {

            kpi.ViewedByEmpOn = new Date();
            kpi.Action = 'Viewed By Employee';
        }

        kpi.UpdatedOn = new Date();
        let empKpi = await KpiRepo.findByIdAndUpdate(kpi.kpiId, kpi);
        await  KpiHistoryRepo.insertMany({KpiData:empKpi, CreatedBy:kpi.UpdatedBy,CreatedOn:new Date(),Action:action?action:"Updated" });
        this.addKpiTrack(kpi);

        if (kpi.Weighting!='' && kpiOwnerInfo.Weighting==0) {
            const OwnerUserDomain = await UserRepo.findOne({ "_id": kpiOwnerInfo.Owner._id });
        let evaluationYear = await EvaluationUtils.GetOrgEvaluationYear(OwnerUserDomain.Organization);
        console.log(`evaluationYear = ${evaluationYear}`);
            let updatedKPIs = await KpiRepo.updateMany({
                'Owner': Mongoose.Types.ObjectId(kpiOwnerInfo.Owner._id),
                'EvaluationYear': evaluationYear,
                'IsDraft': false,
            },
                { $set: { 'Weighting': kpi.Weighting } });
        }
        
    if(action=="Review") this.sendEmailOnManagerUpdate(Manager, kpiOwnerInfo,kpi);
    if(action=="DeActive" &&(kpiOwnerInfo.IsSubmitedKPIs|| kpiOwnerInfo.ManagerSignOff.submited ) && kpi.UpdatedBy==kpiOwnerInfo.ManagerId.toString()) this.sendEmailOnDeactivateByManager(Manager, kpiOwnerInfo.Owner,kpi);
    if(action=="DeActive" &&(kpiOwnerInfo.IsSubmitedKPIs|| kpiOwnerInfo.ManagerSignOff.submited ) && kpi.UpdatedBy==kpiOwnerInfo.Owner._id.toString()) this.sendEmailOnDeactivateByEmp(Manager, kpiOwnerInfo.Owner,kpi);

        if(kpi.ManagerScore && kpi.ManagerScore!=""){
            await EvaluationService.UpdateEvaluationStatus(empKpi.Owner.toString(),"MANAGER_SUBMITTED_PG_SCORE");
        }
        if(kpi.UpdatedBy === kpi.Owner && kpi.Score!=""){
            await EvaluationService.UpdateEvaluationStatus(kpi.Owner,"PG_SCORE_SUBMITTED");
        }

        return true;
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


}

exports.DenyAllSignoffKpis = async (options) => {
    try {
        
        let {empId} = options;
        
        let submitedKPIs = await KpiRepo.updateMany({
            'Owner': Mongoose.Types.ObjectId(empId),
            'isFinalSignoff': true,
            "ManagerSignOff.submited":false
        },
            {
                $set: {
                    'IsActive': false,
                }
            });
        
        

        return true;
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


}


exports.addKpiTrack = async (kpi) => {

    var reportOBJ = await KpiRepo.findOne({
        _id: Mongoose.Types.ObjectId(kpi.kpiId)
    });
    reportOBJ.tracks = reportOBJ.tracks || [];

    const actor = await UserRepo.findOne({ "_id": kpi.UpdatedBy })
    let commentTest="";
    if (kpi.Action=='Create') {
        commentTest=`Created by ${actor.FirstName} on ${moment().format('lll')}`
    // } else if (kpi.Action=='Viewed')  {
    //     commentTest=`${actor.FirstName} has viewed ${actor.FirstName} on ${moment().format('lll')}`
    } else if (kpi.Action=='Review')  {
        commentTest=`${actor.FirstName} has reviewed on ${moment().format('lll')}`
    }else{
        commentTest=`${actor.FirstName} has ${kpi.Action} on ${moment().format('lll')}`
    }

    var track = {
        actorId: kpi.UpdatedBy,
        CreatedOn: new Date(),
        action: kpi.Action,
        comment: commentTest, 
        //actor.FirstName + " " + "has been " + kpi.Action=="Review"?"reviewed":kpi.Action + " at "  + moment().format('lll')
    }
    reportOBJ.tracks.push(track);
    return await reportOBJ.save();

}




exports.addAccompTrack = async (accomp) => {

    var reportOBJ = await AccomplishmentRepo.findOne({
        _id: Mongoose.Types.ObjectId(accomp.AccompId)
    });
    reportOBJ.tracks = reportOBJ.tracks || [];

    const actor = await UserRepo.findOne({ "_id": accomp.UpdatedBy })

    var track = {
        actorId: accomp.UpdatedBy,
        CreatedOn: new Date(),
        action: accomp.Action,
        comment: actor.FirstName + " " + "has " + accomp.Action + " at " + moment().format('lll')
    }
    reportOBJ.tracks.push(track);
    return await reportOBJ.save();

}




exports.SubmitAllKpisByManager = async (options) => {
    debugger
    try {
            let {empId,currentEvaluation} = options;
            const User = await UserRepo.find({ "_id": empId })
            .populate('Manager');

            
        if(!currentEvaluation){
            evaluationYear = await EvaluationUtils.GetOrgEvaluationYear(User[0].Organization);
        }else{
            evaluationYear=currentEvaluation;
        }
        console.log(`evaluationYear = ${evaluationYear}`);

            let submitingKpis = await KpiRepo.find({
                'Owner': Mongoose.Types.ObjectId(empId),
                'IsDraft': false,
                'IsDraftByManager': false,
                'EvaluationYear': evaluationYear,
                'IsSubmitedKPIs': true,
                'ManagerSignOff': {submited:false}
            });

        let submitedKPIs = await KpiRepo.updateMany({
            'Owner': Mongoose.Types.ObjectId(empId),
            'IsDraft': false,
            'IsDraftByManager': false,
            'EvaluationYear': evaluationYear,
            'IsSubmitedKPIs': true,
            'ManagerSignOff': {submited:false}
        },
            {
                $set: {
                    'ManagerFTSubmitedOn': new Date(),
                    'ManagerSignOff': { SignOffBy: User[0].Manager.FirstName+" "+User[0].Manager.LastName, SignOffOn: new Date(),submited:true }
                }
            });

        if (submitedKPIs.nModified>0) {
            // send email to manager 
            this.sendEmailOnManagerSignoff(User[0].Manager, User[0]);
           
        }
        if (submitedKPIs.nModified >0 && submitingKpis.length>0) {
            submitingKpis.forEach(async e=> {
                e.UpdatedBy=e.ManagerId;
                e.kpiId=e._id;
                e.Action="Sign-off"
                this.addKpiTrack(e)

                const kpiData = await KpiRepo.findById(e._id)
                await  KpiHistoryRepo.insertMany( { KpiData:kpiData, CreatedBy:ManagerId, CreatedOn:new Date(), Action:"Submitted"  } );

            })
        }

        return true
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


};

exports.SubmitSignoffKpisByManager = async (options) => {
    console.log("Inside:SubmitKpisByManager")
    let {empId} = options;
    try {

            const User = await UserRepo.find({ "_id": empId })
            .populate('Manager');
            console.log(User[0].Manager.FirstName)
            let submitingKpis = await KpiRepo.find({
                'Owner': Mongoose.Types.ObjectId(empId),
                isFinalSignoff:true
            });

        let submitedKPIs = await KpiRepo.updateMany({
            'Owner': Mongoose.Types.ObjectId(empId),
            'isFinalSignoff':true,
            'ManagerSignOff.submited':false

        },
            {
                $set: {
                    'ManagerFTSubmitedOn': new Date(),
                    'ManagerSignOff': { SignOffBy: User[0].Manager.FirstName+" "+User[0].Manager.LastName, SignOffOn: new Date(),submited:true }
                }
            });

        if (submitedKPIs.nModified>0) {
            // send email to manager 
            this.sendEmailOnManagerSignoff(User[0].Manager, User[0]);
           
        }
        if (submitedKPIs.nModified >0 && submitingKpis.length>0) {
            submitingKpis.forEach(e=> {
                e.UpdatedBy=e.ManagerId;
                e.kpiId=e._id;
                e.Action="Sign-off"
                this.addKpiTrack(e)
            })
        }

        return true
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


};

exports.SubmitKpisByManager = async (options) => {
    console.log("Inside:SubmitKpisByManager")
    let {empId,kpi} = options;
    console.log(`${empId} => ${kpi}`)
    try {

            const User = await UserRepo.find({ "_id": empId })
            .populate('Manager');
            console.log(User[0].Manager.FirstName)
            let submitingKpis = await KpiRepo.find({
                '_id': Mongoose.Types.ObjectId(kpi)
            });

        let submitedKPIs = await KpiRepo.updateMany({
            '_id': Mongoose.Types.ObjectId(kpi)
        },
            {
                $set: {
                    'ManagerFTSubmitedOn': new Date(),
                    'ManagerSignOff': { SignOffBy: User[0].Manager.FirstName+" "+User[0].Manager.LastName, SignOffOn: new Date(),submited:true }
                }
            });

        if (submitedKPIs.nModified>0) {
            // send email to manager 
            this.sendEmailOnManagerSignoff(User[0].Manager, User[0]);
           
        }
        if (submitedKPIs.nModified >0 && submitingKpis.length>0) {
            submitingKpis.forEach(e=> {
                e.UpdatedBy=e.ManagerId;
                e.kpiId=e._id;
                e.Action="Sign-off"
                this.addKpiTrack(e)
            })
        }

        return true
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


};


exports.sendEmailOnManagerSignoff = async (manager, kpiOwnerInfo,kpi) => {


    if (manager) {
        // send email to manager 
let mailBody =  "Dear " + manager.FirstName + ",<br><br>"
mailBody = mailBody + "You have successfully signed-off the Performance Goals for " +  kpiOwnerInfo.FirstName+" "+  kpiOwnerInfo.LastName+".<br>"
mailBody=mailBody + "<br>To view details  "+ " <a href="+ config.APP_BASE_REDIRECT_URL+"=/employee/review-perf-goals-list" + ">click here</a><br><br>Thank you,<br> " + config.ProductName+ " Administrator<br>"
        var mailObject = SendMail.GetMailObject(
            manager.Email,
            "Performance Goals successfully signed-off for "+  kpiOwnerInfo.FirstName+" "+  kpiOwnerInfo.LastName,
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
        mailBody = mailBody + "Your manager, "+  manager.FirstName +" "+manager.LastName + " has <edited> and signed-off your Performance Goals.<br><br>"
        mailBody=mailBody + "<br>Please  "+ " <a href="+config.APP_BASE_REDIRECT_URL+"=/employee/kpi-setup" + ">click here</a> to login and review. You may want to discuss the updates, if any, with your manager.<br><br>Thank you,<br> "+config.ProductName+" Administrator<br>"
        var mailObject = SendMail.GetMailObject(
            kpiOwnerInfo.Email,
            "Your Performance Goals are signed off",
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






exports.GetManagers = async (data) => {
    const managers = await UserRepo.find(
        {
            Organization: Mongoose.Types.ObjectId(data.companyId),
            SelectedRoles: { $in: ["EM"] }
        })

    // const csa = await UserRepo.findOne(
    //     {
    //         Organization: Mongoose.Types.ObjectId(data.companyId),
    //         Role: 'CSA'
    //     })
    // managers.push(csa);
    return managers;
}



exports.GetImmediateApprCircle = async (data) => {

    let circle=[];
    const emp = await UserRepo.findById(data.empId).populate("Manager ThirdSignatory"); 

    const csa = await UserRepo.findOne(
        {
            Organization: Mongoose.Types.ObjectId(data.companyId),
            Role: 'CSA'
        })
    circle.push(csa);
    if(csa._id.toString() != emp.Manager._id.toString())
    circle.push(emp.Manager);
    if(emp.ThirdSignatory)
    circle.push(emp.ThirdSignatory || {});
    return circle;
}


exports.GetThirdSignatorys = async (data) => {
    const managers = await UserRepo.find(
        {
            Organization: Mongoose.Types.ObjectId(data.companyId),
            SelectedRoles: { $in: ["TS"] }
        })
    return managers;
}



/**For getting employees who has not been added to evaluation */
exports.GetUnlistedEmployees = async (search) => {
    try {
        console.log('inside GetUnlistedEmployees : ',search.company)
        let evaluationYear = await EvaluationUtils.GetOrgEvaluationYear(search.company);
        console.log(`evaluationYear = ${evaluationYear}`);
        
          var evalCompletedStatusIds = await statusesRepo.find({ 'Status': 'Evaluation Complete' });
        // console.log(`evalCompletedStatusIds = ${evalCompletedStatusIds}`);

        var evalCompletedStatusIds = evalCompletedStatusIds.map(x => Mongoose.Types.ObjectId(x._id));
        console.log(`evalCompletedStatusIds = ${evalCompletedStatusIds}`);
var employees = [];
        var pendingEvaluations = await EvaluationRepo.find(
            {
                'Company': Mongoose.Types.ObjectId(search.company),
                'EvaluationType': { $ne: "Year-end" },
                'EvaluationYear': evaluationYear,
                "Employees": {
                    $elemMatch: {
                        Status: {
                            $nin: evalCompletedStatusIds
                        }
                    }
                }
            }
        ).populate('Employees._id');
        // console.log('pendingEvaluations ::: ', JSON.stringify(pendingEvaluations));
        for (let pendingEvaluation of pendingEvaluations) {
            for (let emp of pendingEvaluation.Employees) {
                // console.log('emp ::: ',emp);
                if (emp.ActivationDate && pendingEvaluation.EvaluationDuration) {
                    var noOfMonths = parseInt(pendingEvaluation.EvaluationDuration.replace("Months","").trim());
                    console.log('emp.ActivationDate ::: ',moment(emp.ActivationDate).add(noOfMonths, "months").startOf("day").toDate(),noOfMonths);
                    var now = moment(); //todays date
                    var end = moment(moment(emp.ActivationDate).add(noOfMonths, "months").startOf("day").toDate())  ; // another date
                    var duration = moment.duration(now.diff(end));
                    console.log(' duration ::: ', duration.asDays());
                    if(duration.asDays()>=0){
                        employees.push(emp._id);
                    }
                }
            }
        }
console.log('employees :  ',employees);

        if (search.allKpi === 'true') {
            var response = await KpiFormRepo.aggregate([{
                $match: {
                    Company: Mongoose.Types.ObjectId(search.company),
                    EvaluationYear: evaluationYear
                }
            },
            {
                $project: {
                    EmployeeId: 1
                }
            }
            ])
            const Employees = await UserRepo.find(
                {
                    Organization: Mongoose.Types.ObjectId(search.company),
                    HasActiveEvaluation: { $ne: "Yes" },
                    Manager:{$ne: null},
                    _id: { $in: response.map(x => { return x.EmployeeId }) }

                }).populate("Manager").sort({ FirstName: 1 })


            return { IsSuccess: true, Message: "", Data: Employees.concat(employees) }



        }
        else {
            let orgData = await OrganizationRepo.findOne({ _id: search.company });
            if (!orgData) {
                return { IsSuccess: true, Message: "No Organization details found", Data: null }
            }
            //let currentUsersCount=await UserRepo.find({Organization:ObjectId(search.company),IsActive:true}).count()
            const checkpoint = await UserRepo.aggregate([
                { $match: { Organization: ObjectId(search.company) } },
                { $group: { _id: "$HasActiveEvaluation", Count: { $sum: 1 } } }
            ])

            if (checkpoint && checkpoint.length > 0) {
                let activeEvaluationCount = checkpoint.find(x => x._id === 'Yes')
                if (activeEvaluationCount) {
                    if (orgData.UsageType=='Employees' &&  parseInt(orgData.UsageCount) === activeEvaluationCount.Count) {
                        return { IsSuccess: true, Message: "Reached Maximum limit", Data: null }
                    }
                }

            }

            const Employees = await UserRepo.find(
                {
                    Organization: Mongoose.Types.ObjectId(search.company),
                    HasActiveEvaluation: { $ne: "Yes" },
                    Manager:{$ne: null}

                }).populate("Manager").sort({ FirstName: 1 })
            return { IsSuccess: true, Message: "", Data: Employees.concat(employees) }
        }
    } catch (error) {
        console.log(error);
        logger.error('Error occurred while checking employee count', error)
        throw error;
    }

};

exports.GetDirectReporteesOfManager = async (manager) => {
    let managers = await UserRepo.aggregate([
        {
            $match: {
                Manager: Mongoose.Types.ObjectId(manager.id),
                Role: 'EO'
            }
        },
        { $addFields: { "EmployeeId": "$_id" } },
        {
            $project: {
                "EmployeeId": 1,
                FirstName: 1,
                LastName: 1,
                Email: 1
            }
        }


    ]).sort({ FirstName: 1 });

    return managers;
}

exports.GetPeers = async (employee) => {
    var peers = await UserRepo.aggregate([
        {
            $match: {
                Organization: Mongoose.Types.ObjectId(employee.company),
                _id: { $ne: Mongoose.Types.ObjectId(employee.id) }
            }
        },
        { $addFields: { "EmployeeId": "$_id" } },
        {
            $project: {
                "EmployeeId": 1,
                FirstName: 1,
                LastName: 1,
                Email: 1
            }
        }


    ]).sort({ FirstName: 1 });;
    // const Employees = await UserRepo.find({
    //     Organization: Mongoose.Types.ObjectId(employee.company),
    //     _id: { $ne: Mongoose.Types.ObjectId(employee.id) }
    // })
    return peers;

};
exports.DashboardData = async (employee) => {
    const response = {};
    try{
    
    let { userId } = employee;
    const evaluationRepo = await peerInfo(userId);
    response['current_evaluation'] = await currentEvaluationProgress(userId);
    response['previous_evaluation'] = await previousEvaluationProgress(userId);
    response['peer_review'] = {};
    let momentNextEvlDate = moment().add(1, 'years').startOf('year');
    response['peer_review']['date'] = momentNextEvlDate.format("MMM Do YYYY");
    response['peer_review']['days'] = momentNextEvlDate.diff(moment(), 'days');
    response['peer_review']['rating_for'] = "N/A";
    let peerReviewList = [];
    if (evaluationRepo && evaluationRepo.length > 0 && evaluationRepo[0].Employees) {
        evaluationRepo.forEach(element => {
            let { Employees,Company } = element;
            let evaluationId = element._id;
            let daysRemaining = caluculateDaysRemaining(Company.EvaluationPeriod,Company.EndMonth,Company.StartMonth);
            Employees.forEach(employeeObj => {
                let { Peers, _id } = employeeObj;
                let peerFoundObject = Peers.find(peerObj => peerObj.EmployeeId == userId);
                if(peerFoundObject){
                let peerReviewObj = {};
                peerReviewObj.EvaluationId = evaluationId;
                peerReviewObj.employeeId = _id._id;
                peerReviewObj.peer = _id.FirstName +" "+_id.LastName;
                peerReviewObj.title = _id.Title || "";
                peerReviewObj.rating = peerFoundObject.CompetencyOverallRating;
                peerReviewObj.deparment = _id.Department?_id.Department:"";
                peerReviewObj.daysRemaining = daysRemaining;
                peerReviewList.push(peerReviewObj);
                }
                
            });
        });
    }
    response['peer_review']['list'] = peerReviewList;
    }
    catch(e){
        console.log(e)
    }
    
    return response;
}

const caluculateDaysRemaining = (evaluationPeriod,endMonth,StartMonth) =>{
    //endMonth = "January";
    let remainingDays = "N/A";
    let currentMoment = moment();
    if(evaluationPeriod === 'CalendarYear'){
        let momentNextEvlDate = moment().add(1, 'years').startOf('year');
        remainingDays = momentNextEvlDate.diff(moment(), 'days');
    }else if(evaluationPeriod === 'FiscalYear'){
        var currentMonth = parseInt(currentMoment.format('M'));
        console.log(`${currentMonth} <= ${StartMonth}`);
        let evaluationStartMoment;
        let evaluationEndMoment;
        if(currentMonth <= StartMonth){
            evaluationStartMoment = moment().month(StartMonth-1).startOf('month').subtract(1, 'years');
            evaluationEndMoment = moment().month(StartMonth-2).endOf('month');
            console.log(`${evaluationStartMoment.format("MM DD,YYYY")} = ${evaluationEndMoment.format("MM DD,YYYY")}`);
          }else{
            evaluationStartMoment = moment().month(StartMonth-1).startOf('month');
            evaluationEndMoment = moment().month(StartMonth-2).endOf('month').add(1, 'years');
            console.log(`${evaluationStartMoment.format("MM DD,YYYY")} = ${evaluationEndMoment.format("MM DD,YYYY")}`);
          }


        /*let currentMonth= moment().format('M');
        let endMonthVal = moment().month(endMonth).format("M");
        let nextYear = moment().add(1, 'years').month(endMonthVal-1).endOf('month');

    if(currentMonth === endMonthVal){
        nextYear = moment().endOf('month');
    }*/
    remainingDays = evaluationEndMoment.diff(moment(), 'days');
    }
    return remainingDays;
    
}
const currentEvaluationProgress = async (userId) => {
    
    let currentYear = moment().format('YYYY');
    if(userId){
        const UserDomain = await UserRepo.findOne({ "_id": userId });
        currentYear = await EvaluationUtils.GetOrgEvaluationYear(UserDomain.Organization);
        console.log(`currentYear = ${currentYear}`);
    }
    let evaluationOb = {};
    let whereObj = {
        "Employees._id": Mongoose.Types.ObjectId(userId),
        "EvaluationYear": currentYear,
        "Employees.Status":{$exists:true,$ne:null}

    };
    let project = {
        "Employees": {
            "$elemMatch": {
                "_id": Mongoose.Types.ObjectId(userId)
            }
        },
        status:1
    };
    let currentEvaluation = await EvaluationRepo.findOne(whereObj, project).populate("Employees.Status");
    let Employees = null;
    if (currentEvaluation && currentEvaluation.Employees) {
        Employees = currentEvaluation.Employees;
        evaluationOb["overall_status"] = currentEvaluation.status || "N/A";
        evaluationOb["KPI_Status"] = await PerformanceGoalStatus(userId,currentYear);
        evaluationOb["ActionPlan_Status"] = await ActionPlanStatus(userId,currentYear);
    } else {
        evaluationOb["status"] = 0;
        evaluationOb["status_title"] = "N/A";
        evaluationOb["overall_status"] = "N/A";
        evaluationOb["ActionPlan_Status"] = await ActionPlanStatus(userId,currentYear);
        evaluationOb["KPI_Status"]="Not Initiated"
    }
    if (Employees && Employees.length > 0) {
        let { Status } = Employees[0];
        if (Status) {
            evaluationOb["status"] = Status.Percentage;
            evaluationOb["status_title"] = Status.Status;
        } else {
            evaluationOb["status"] = 0;
            evaluationOb["status_title"] = "N/A";
        }
    } else {
        evaluationOb["status"] = 0;
        evaluationOb["status_title"] = "N/A";
    }
    return evaluationOb;
}

const PerformanceGoalStatus = async (employeeId,currentYear) =>{
    console.log(`${employeeId} - ${currentYear}`)
    let kpiList = await KpiRepo.find({"Owner":Mongoose.Types.ObjectId(employeeId),"EvaluationYear":""+currentYear}).sort({_id:-1});
    if(kpiList && kpiList.length>0){
        let latestKPI = kpiList[0];
        if(!latestKPI.IsDraft && !latestKPI.IsSubmitedKPIs){
            return "In Progress";
        }
        else if(latestKPI.IsDraft && !latestKPI.IsSubmitedKPIs){
            return "Initiated";
        }
        else if(latestKPI.IsSubmitedKPIs){
            let {ManagerSignOff} =  latestKPI;
            if(!ManagerSignOff.SignOffBy){
                return "Submitted for Sign-off";
            }else{
                return "Signed-off";
            }
            
        }
        else if(latestKPI.IsDraft && !latestKPI.IsSubmitedKPIs){
            return "Initiated";
        }
    }else{
        return "Initiated"
    }
}


const ActionPlanStatus = async (employeeId,currentYear) =>{
    console.log(`${employeeId} - ${currentYear}`)

    const evaluationForm = await EvaluationRepo.findOne(
        {
            Employees: { $elemMatch: { _id: ObjectId(employeeId) }},
            EvaluationYear: currentYear,IsDraft: false
        }
    );

    const kpiFormData = await KpiFormRepo.findOne({
        'EmployeeId': Mongoose.Types.ObjectId(employeeId),
        IsDraft: false, IsActive: true, EvaluationYear: currentYear
    });

    if (evaluationForm || kpiFormData) {
       
        const devGoals = await DevGoalsRepo.findOne({
            'Owner': Mongoose.Types.ObjectId(employeeId),
            CreatedYear: currentYear
        }).sort({CreatedOn:-1});

        const strengths = await strengthRepo.findOne({
            'Owner': Mongoose.Types.ObjectId(employeeId),
            CreatedYear: currentYear
        }).sort({CreatedOn:-1});

        if (devGoals || strengths) {
            
            if ( (devGoals && devGoals.IsGoalSubmited ) || (strengths && strengths.IsGoalSubmited ) ) {

                const devGoalsViewed = await DevGoalsRepo.find({
                    'Owner': Mongoose.Types.ObjectId(employeeId),
                    CreatedYear: currentYear
                })

                if ( (devGoals &&devGoals.ViewedByManagerOn) || (strengths && strengths.ViewedByManagerOn ) || (devGoalsViewed && devGoalsViewed.find(e=> e.ViewedByManagerOn) ) ) {
                    return "Viewed"
                }

                return "Submitted"
            }
            return "In Progress";
        }
       
       
        return "Initiated";
    }else{
        return "N/A"
    }


}

const previousEvaluationProgress = async (userId) => {
    let previousEvaluation = {};
    let prevYearStart = moment().subtract(1, 'years').startOf('year');
    let prevYearEnd = moment().subtract(1, 'years').endOf('year');
    
    const OwnerUserDomain = await UserRepo.findOne({ "_id": userId });
    let evaluationYear = await EvaluationUtils.GetOrgEvaluationYear(OwnerUserDomain.Organization);
    console.log(`evaluationYear = ${evaluationYear}`);
    prevYearStart = parseInt(evaluationYear)-1;
    
    let evaluationYearObj = await EvaluationUtils.getOrganizationStartAndEndDates(OwnerUserDomain.Organization);
    evaluationYearObj.start = evaluationYearObj.start.subtract(1, 'years');
    evaluationYearObj.end = evaluationYearObj.end.subtract(1, 'years');
    previousEvaluation['period'] = evaluationYearObj.start.format("MMM, YYYY") + " - " + evaluationYearObj.end.format("MMM, YYYY");
    let whereObj = {
        "Employees._id": Mongoose.Types.ObjectId(userId),
        "EvaluationYear": prevYearStart,
        //"Employees.Status": "EvaluationComplete"


    };
    let project = {
        "Employees": {
            "$elemMatch": {
                "_id": Mongoose.Types.ObjectId(userId)
            }
        }
    };
    let prevEvaluation = await EvaluationRepo.findOne(whereObj, project).populate("Company");
    if (prevEvaluation) {
        let { Employees } = prevEvaluation;
        let { FinalRating, Peers } = Employees[0];
        if (FinalRating) {
            let { Manager } = FinalRating;
            let { YearEndRating } = Manager;
            if (YearEndRating && YearEndRating != "") {
                previousEvaluation['rating'] = YearEndRating;
            }
            previousEvaluation['rating'] = "N/A";
        }

        /*let peerReview = false;
        for(var i=0;i<Peers.length;i++){
            let peerObj = Peers[i];
            peerReview = peerObj.status || false;
            if(!peerReview){
                break;
            }
        }
        previousEvaluation['peer_review'] = "In progress";
        if(peerReview){
            previousEvaluation['peer_review'] = "Done";
        }*/
        previousEvaluation['peer_review'] = getPeerInfo(Peers);
    } else {
        previousEvaluation['period'] = "N/A";
        previousEvaluation['rating'] = "N/A";
        previousEvaluation['peer_review'] = "N/A";
    }

    return previousEvaluation;
}

const getPeerInfo = (Peers) => {
    let previousEvaluationObj = "";
    let peerReview = false;
    for (var i = 0; i < Peers.length; i++) {
        let peerObj = Peers[i];
        peerReview = peerObj.status || false;
        if (!peerReview) {
            break;
        }
    }
    previousEvaluationObj = "In progress";
    if (peerReview) {
        previousEvaluationObj = "Done";
    }
    return previousEvaluationObj;
}


const peerInfo = async (userId) => {
    const UserDomain = await UserRepo.findOne({ "_id": userId });
    let evaluationYear = await EvaluationUtils.GetOrgEvaluationYear(UserDomain.Organization);
    console.log(`evaluationYear = ${evaluationYear}`);
    return await EvaluationRepo
        .find({
            "Employees.Peers": {
                $elemMatch:
                    { "EmployeeId": Mongoose.Types.ObjectId(userId) }
            },
            "EvaluationYear":evaluationYear
        }).populate("Employees._id").populate("Company");
}


exports.GetKpisForTS = async (ThirdSignatory) => {
    var allKpis = []
    var tsusers = await UserRepo.find({
        ThirdSignatory: Mongoose.Types.ObjectId(ThirdSignatory)
    });
    const TSUserDomain = await UserRepo.findOne({ "_id": ThirdSignatory });
        let evaluationYear = await EvaluationUtils.GetOrgEvaluationYear(TSUserDomain.Organization);
        console.log(`evaluationYear = ${evaluationYear}`);
        
    var Kpis = await KpiRepo.find({
        Owner: { $in: tsusers.map(x => x._id) },
        IsSubmitedKPIs: true,
        'EvaluationYear': evaluationYear,
        ManagerSignOff: { $ne: null }
    }).populate({
        path: 'MeasurementCriteria.measureId Owner',
        populate: {
            path: 'JobLevel',
            model: 'JobLevels',
        }
    })
        .sort({ UpdatedOn: -1 });

    allKpis = [...Kpis]
    return allKpis;
};


exports.SaveCompetencyQnA = async (qna) => {
    try {
        for (let index = 0; index < qna.QnA.length; index++) {
            const element = qna.QnA[index];
            var fg = await EvaluationRepo.updateOne({
                _id: Mongoose.Types.ObjectId(qna.EvaluationId),
                "Employees._id": Mongoose.Types.ObjectId(qna.EmployeeId),
                "Employees.Competencies.Questions": { $elemMatch: { _id: Mongoose.Types.ObjectId(element.QuestionId) } }
            }, {
                $set: {
                    "Employees.$[e].Competencies.$[c].Questions.$[q].SelectedRating": element.Answer,
                    "Employees.$[e].Competencies.$[c].Comments": element.Comments,
                    "Employees.$[e].Competencies.$[c].CompetencyAvgRating": element.CompetencyAvgRating,
                }
            },
                {
                    "arrayFilters": [
                        { "e._id": ObjectId(qna.EmployeeId) },
                        { "c._id": ObjectId(element.CompetencyRowId) },
                        { "q._id": ObjectId(element.QuestionId) }]
                }
            )
        }
        var updateCompetencyList = await EvaluationRepo.updateOne({
            _id: Mongoose.Types.ObjectId(qna.EvaluationId),
            "Employees._id": Mongoose.Types.ObjectId(qna.EmployeeId)
        }, {
            $set: {
                "Employees.$[e].CompetencyComments": qna.Comments,
                "Employees.$[e].CompetencyOverallRating": qna.OverallRating,
                "Employees.$[e].CompetencySubmitted": !qna.IsDraft,
                "Employees.$[e].CompetencySubmittedOn": qna.IsDraft ? null : new Date()
            }
        },
            {
                "arrayFilters": [
                    { "e._id": ObjectId(qna.EmployeeId) }
                ]
            }
        );

        if(!qna.IsDraft){
            await EvaluationService.UpdateEvaluationStatus(qna.EmployeeId,"COMPETENCY_SUBMITTED");
        }else{
            await EvaluationService.UpdateEvaluationStatus(qna.EmployeeId,"COMPETENCY_SAVED_EMP");
        }

        if (updateCompetencyList) {
            return { IsSuccess: true }
        } else {
            return { IsSuccess: false }
        }
    } catch (error) {
        logger.error('Error Occurred while saving Competency', error);
        throw error;
    }


};

exports.GetPendingPeerReviewsList = async (emp) => {
    try {
        var list = await EvaluationRepo.aggregate([
            //{ $match: { "Employees.Peers.EmployeeId": ObjectId(emp.EmployeeId), "Employees.Status": "Active" } },
            { $match: { "Employees.Peers.EmployeeId": ObjectId(emp.EmployeeId),/*"Employees.FinalRating.Manager.SignOff":{$exists:true,$eq:""} */} },
            {
                $addFields: {
                    EvaluationId: "$_id"
                }
            },
            { $unwind: '$Employees' },
            { $unwind: '$Employees.Peers' },
            { $match: { "Employees.Peers.EmployeeId": ObjectId(emp.EmployeeId), /*"Employees.FinalRating.Manager.SignOff":{$exists:true,$eq:""} */} },
            {
                $project: {
                    _id: 0,
                    "EvaluationId": 1,
                    "Employees._id": 1,
                    "EvaluationPeriod": 1,
                    "EvaluationDuration": 1,
                    "Peers": "$Employees.Peers"
                }
            },
            {
                $lookup:
                {
                    from: "users",
                    localField: "Employees._id",
                    foreignField: "_id",
                    as: "ForEmployee"

                }
            },
            {
                $lookup:
                {
                    from: "users",
                    localField: "ForEmployee.Manager",
                    foreignField: "_id",
                    as: "Manager"

                }
            },
            {
                $project: {
                    "ForEmployee._id": 1,
                    "ForEmployee.FirstName": 1,
                    "ForEmployee.LastName": 1,
                    "ForEmployee.Email": 1,
                    "ForEmployee.Manager": 1,
                    "EvaluationPeriod": 1,
                    "EvaluationDuration": 1,
                    "Manager._id": 1,
                    "Manager.FirstName": 1,
                    "Manager.LastName": 1,
                    "Manager.Email": 1,
                    "Manager.Manager": 1,
                    "EvaluationId": 1,
                    "Peers": 1,
                    IsRatingSubmitted: '$Peers.CompetencySubmitted'

                }
            }
        ]

        )

        return list;
    } catch (error) {
        logger.error('Error Occurred while getting data for Peer Review list:', error)
        return Error(error.message)
    }

}

exports.GetPendingPeerReviewsToSubmit = async (emp) => {
    try {
        var list = await EvaluationRepo.aggregate([
            { $match: { _id: ObjectId(emp.EvaluationId) } },
            { $unwind: '$Employees' },
            { $match: { "Employees._id": ObjectId(emp.ForEmployeeId) } },
            {
                $project: {
                    _id: 0,
                    "Employees._id": 1,
                    'Peer': {
                        $filter: {
                            input: "$Employees.Peers",
                            as: "self",
                            cond: { $eq: ['$$self.EmployeeId', ObjectId(emp.PeerId)] }
                        },
                    },
                    EvaluationPeriod:1,
                    EvaluationDuration:1
                }
            },
            {
                $lookup:
                {
                    from: "competenciesmappings",
                    localField: "Peer.PeersCompetencyList._id",
                    foreignField: "_id",
                    as: "Competencies"
                }
            },
            {
                $lookup:
                {
                    from: "questions",
                    localField: "Competencies.Questions",
                    foreignField: "_id",
                    as: "Questions"
                }
            },
            {
                $lookup:
                {
                    from: "users",
                    localField: "Employees._id",
                    foreignField: "_id",
                    as: "ForEmployee"
                }
            }

        ])
        return list[0];
    } catch (error) {
        logger.error('error occurred while getting emp peer competencies for review:', error)
        throw error;
    }

}

exports.SavePeerReview = async (qna) => {
    try {
        var _update = await EvaluationRepo.updateOne({
            _id: Mongoose.Types.ObjectId(qna.EvaluationId),
            "Employees._id": Mongoose.Types.ObjectId(qna.ForEmployeeId),
            "Employees.Peers": { $elemMatch: { EmployeeId: Mongoose.Types.ObjectId(qna.PeerId) } }
        },
            {
                $set: {
                    "Employees.$[e].Peers.$[p].QnA": qna.QnA,
                    "Employees.$[e].Peers.$[p].CompetencyComments": qna.CompetencyComments,
                    "Employees.$[e].Peers.$[p].CompetencyOverallRating": qna.OverallRating,

                    "Employees.$[e].Peers.$[p].CompetencySubmitted": !qna.IsDraft,
                    "Employees.$[e].Peers.$[p].CompetencySubmittedOn": qna.IsDraft ? null : new Date()
                }
            },
            {
                "arrayFilters": [
                    { "e._id": ObjectId(qna.ForEmployeeId) },
                    { "p.EmployeeId": ObjectId(qna.PeerId) },
                ]
            }
        )
        if (_update && !qna.IsDraft) {
            let _user = await UserRepo.findOne({ _id: ObjectId(qna.PeerId) }, { Email: 1, FirstName: 1 })
            fs.readFile("./EmailTemplates/PeerReviewSubmitted.html", async function read(err, bufcontent) {
                var content = bufcontent.toString();

                let des = `Peer Review has been Successfully Submitted.`
                content = content.replace("##FirstName##", _user.FirstName);
                content = content.replace("##ProductName##", config.ProductName);
                content = content.replace("##Description##", des);
                content = content.replace("##Title##", "Peer Review SUbmitted");

                var mailObject = SendMail.GetMailObject(
                    _user.Email,
                    "Peer Review Submitted",
                    content,
                    null,
                    null
                );

                await SendMail.SendEmail(mailObject, function (res) {
                    console.log(res);
                });

            });
            return { IsSuccess: true }

        }

        await EvaluationService.UpdateEvaluationStatus(qna.ForEmployeeId,"PeerReview");



        return { IsSuccess: true }
    } catch (error) {
        logger.error('error occurred while saving peer review:', error)
        throw error;
    }



}

exports.SaveTSFinalRating = async (finalRating) => {
    try {
        var _update = await EvaluationRepo.updateOne({
            _id: Mongoose.Types.ObjectId(finalRating.EvaluationId),
            "Employees._id": Mongoose.Types.ObjectId(finalRating.EmployeeId)
        },
            {
                $set: {
                    "Employees.$[e].FinalRating.ThirdSignatory.YearEndComments": finalRating.YearEndComments,
                    "Employees.$[e].FinalRating.ThirdSignatory.YearEndRating": finalRating.OverallRating,
                    "Employees.$[e].FinalRating.ThirdSignatory.IsSubmitted": !finalRating.IsDraft ,
                    "Employees.$[e].FinalRating.ThirdSignatory.SubmittedOn": (finalRating.IsDraft) ? null : new Date(),
                    "Employees.$[e].FinalRating.ThirdSignatory.SignOff": finalRating.SignOff,

                    "Employees.$[e].FinalRating.ThirdSignatory.RevComments": finalRating.RevComments,
                    "Employees.$[e].FinalRating.ThirdSignatory.ReqRevision": finalRating.ReqRevision,
                    "Employees.$[e].FinalRating.Manager.IsSubmitted": (finalRating.ReqRevision && !finalRating.FRReqRevision ) ? false : true,
                    "Employees.$[e].FinalRating.Status": `ThirdSignatory ${ (finalRating.ReqRevision && !finalRating.FRReqRevision)? 'Request Revision' : 'Submitted'}`,
                    "Employees.$[e].FinalRating.FRReqRevision": finalRating.ReqRevision,
                    //"Employees.$[e].Status": (finalRating.IsDraft || finalRating.ReqRevision) ? 'InProgress' : 'Completed',
                }
            },
            {
                "arrayFilters": [
                    { "e._id": ObjectId(finalRating.EmployeeId) }
                ]
            }
        );
        
        if(finalRating.ReqRevision && !finalRating.IsDraft){
            await EvaluationService.UpdateEvaluationStatus(finalRating.EmployeeId,"RevisionProgress");
        }else if(!finalRating.ReqRevision && !finalRating.IsDraft){
            await EvaluationService.UpdateEvaluationStatus(finalRating.EmployeeId,"EvaluationComplete");
        }
        if (_update.nModified) {
            var c = await EvaluationRepo.aggregate([
                { $match: { _id: ObjectId(finalRating.EvaluationId) } },
                { $unwind: '$Employees' },
                { $match: { "Employees._id": ObjectId(finalRating.EmployeeId) } },
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "Employees._id",
                        foreignField: "_id",
                        as: "CurrentEmployee"

                    }
                },
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "CurrentEmployee.Manager",
                        foreignField: "_id",
                        as: "CurrentEmployeeManager"

                    }
                },
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "CurrentEmployee.ThirdSignatory",
                        foreignField: "_id",
                        as: "CurrentEmployeeTS"

                    }
                },
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "CurrentEmployee.CopiesTo",
                        foreignField: "_id",
                        as: "CurrentEmployeeCT"

                    }
                },

                {
                    $project: {
                        "CurrentEmployee.FirstName": 1,
                        "CurrentEmployee.LastName": 1,
                        "CurrentEmployee.Email": 1,
                        "CurrentEmployeeManager.FirstName": 1,
                        "CurrentEmployeeManager.LastName": 1,
                        "CurrentEmployeeManager.Email": 1,
                        "CurrentEmployeeTS.FirstName": 1,
                        "CurrentEmployeeTS.LastName": 1,
                        "CurrentEmployeeTS.Email": 1,
                        "CurrentEmployeeCT.FirstName": 1,
                        "CurrentEmployeeCT.LastName": 1,
                        "CurrentEmployeeCT.Email": 1

                    }

                }
            ])
            /**To update employee evaluation status */
            if ((!finalRating.IsDraft && !finalRating.ReqRevision)) {
                var _updateEmployee = await UserRepo.updateOne(
                    { _id: ObjectId(finalRating.EmployeeId) },
                    { $set: { HasActiveEvaluation: 'No' } }
                )
            }


            if (c && c[0] && c[0].CurrentEmployee[0]) {
                var empoyee = c[0].CurrentEmployee[0];
                var manager = c[0].CurrentEmployeeManager[0];
                var ts = c[0].CurrentEmployeeTS[0];
                var ct = c[0].CurrentEmployeeCT[0];
                if (ts) {
                    
                    let mailBody = "Dear "+ ts.FirstName +", <br><br>"
                    mailBody=mailBody+ finalRating.ReqRevision? "Revision request has been successfully sent for "  +empoyee.FirstName+" "+empoyee.LastName 
                     :"You have successfully signed-off the rating for " +empoyee.FirstName+" "+empoyee.LastName
                    mailBody=mailBody + "<br>To view details  "+ " <a href=" +config.APP_BASE_REDIRECT_URL+"=/employee/review-evaluation-list" +">click here</a> <br><br>Thank you,<br> " + config.ProductName + " Administrator<br>"

                    var mailObject = SendMail.GetMailObject(
                        ts.Email,
                        //Revision Request for <employee first name last name> has been sent
                        finalRating.ReqRevision? "Revision Request for "+empoyee.FirstName+" "+empoyee.LastName+" has been sent"
                        :"Evaluation for "+empoyee.FirstName+" "+empoyee.LastName+" successfully signed-off",
                        mailBody,
                        null,
                        null
                    );

                    await SendMail.SendEmail(mailObject, function (res) {
                        console.log(res);
                    });
                }
                if (empoyee) {
                    
                 let   mailBody="Dear " + empoyee.FirstName + ", <br><br>"
                    mailBody = mailBody + finalRating.ReqRevision?"Revision has been requested for your rating.":"Your evaluation has been signed-off."
                    mailBody=mailBody + "<br>To view details  "+ " <a href=" +config.APP_BASE_REDIRECT_URL+"=/employee/current-evaluation" +">click here</a> <br><br>Thank you,<br> " + config.ProductName + " Administrator<br>"

                    var mailObject = SendMail.GetMailObject(
                        empoyee.Email,
                        finalRating.ReqRevision?  "Revision has been requested for your rating"
                        :"Evaluation signed-off",
                       mailBody,
                        null,
                        null
                    );

                    await SendMail.SendEmail(mailObject, function (res) {
                        console.log(res);
                    });
                }


                if (manager) {
                  let  mailBody = "Dear " + manager.FirstName + ", <br><br>"
                    mailBody = mailBody + finalRating.ReqRevision? ts.FirstName+" "+ts.LastName+" has requested a revision in the rating for "+empoyee.FirstName+" "+empoyee.LastName :
                    ts.FirstName+" "+ts.LastName+" has signed-off the rating for "+empoyee.FirstName+" "+empoyee.LastName+""
                   
                    if(finalRating.ReqRevision)  mailBody=mailBody + "<br>Please "+ " <a href=" +config.APP_BASE_REDIRECT_URL+"=/employee/review-evaluation-list" +">click here</a> to make the changes. <br><br>Thank you,<br> " + config.ProductName + " Administrator<br>"
                    else  mailBody=mailBody + "<br>To view details  "+ " <a href=" +config.APP_BASE_REDIRECT_URL+"=/employee/review-evaluation-list" +">click here</a> <br><br>Thank you,<br> " + config.ProductName + " Administrator<br>"

                    var mailObject = SendMail.GetMailObject(
                        manager.Email,
                        finalRating.ReqRevision?  "Rating Revision has been requested for "+empoyee.FirstName+" "+empoyee.LastName
                        : "Evaluation for "+empoyee.FirstName+" "+empoyee.LastName+" has been signed-off",
                       mailBody,
                        null,
                        null
                    );

                    await SendMail.SendEmail(mailObject, function (res) {
                        console.log(res);
                    });
                }

                if (ct && !finalRating.ReqRevision && !finalRating.IsDraft ) {



                    fs.readFile("./EmailTemplates/EmailTemplate.html", async function read(err, bufcontent) {
                        var content = bufcontent.toString();
                
                        let des= "Evaluation for" + empoyee.FirstName +" "+empoyee.LastName+" has been completed."+ ` <br>
                        To view details, <a href="${config.APP_BASE_URL}#/employee/copiesTo">click here</a>.
                           `
                        content = content.replace("##FirstName##",ct.FirstName);
                        content = content.replace("##ProductName##", config.ProductName);
                        content = content.replace("##Description##", des);
                        content = content.replace("##Title##", "Evaluation for" + empoyee.FirstName +" "+empoyee.LastName+" has been signed off");
            
                    var mailObject = SendMail.GetMailObject(
                        ct.Email,
                        "Evaluation for" + empoyee.FirstName +" "+empoyee.LastName+" has been signed off",
                              content,
                              null,
                              null
                            );
            
                    await SendMail.SendEmail(mailObject, function (res) {
                        console.log(res);
                    });
            
                });


            }


            }
            
            return { IsSuccess: true }
        }
        else
            return { IsSuccess: false, Message: 'No Reocrd got updated' }
    } catch (error) {
        logger.error('error occurred while saving peer review:', error)
        throw error;
    }

}
exports.SaveManagerFinalRating = async (finalRating) => {
    try {

        var _update = await EvaluationRepo.updateOne({
            _id: Mongoose.Types.ObjectId(finalRating.EvaluationId),
            "Employees._id": Mongoose.Types.ObjectId(finalRating.EmployeeId)
        },
            {
                $set: {
                    "Employees.$[e].FinalRating.Manager.YearEndComments": finalRating.YearEndComments,
                    "Employees.$[e].FinalRating.Manager.YearEndRating": finalRating.OverallRating,
                    "Employees.$[e].FinalRating.Manager.IsSubmitted": !finalRating.IsDraft,
                    "Employees.$[e].FinalRating.Manager.SubmittedOn": finalRating.IsDraft ? null : new Date(),
                    "Employees.$[e].FinalRating.Manager.SignOff": finalRating.SignOff,

                    "Employees.$[e].FinalRating.Manager.RevComments": finalRating.RevComments,
                    //"Employees.$[e].FinalRating.Manager.ReqRevision": finalRating.ReqRevision,
                    // "Employees.$[e].FinalRating.Self.IsSubmitted": (finalRating.ReqRevision) ? false : true,
                    "Employees.$[e].FinalRating.Self.IsSubmitted": false,
                    // "Employees.$[e].FinalRating.Status": `Manager ${finalRating.ReqRevision ? 'Request Revision' : 'Submitted'}`,
                    "Employees.$[e].FinalRating.Status": `Manager Submitted`,


                    //"Employees.$[e].FinalRating.ThirdSignatory.IsSubmitted": false,

                }
            },
            {
                "arrayFilters": [
                    { "e._id": ObjectId(finalRating.EmployeeId) }
                ]
            }
        );
        if(!finalRating.IsDraft){
            await EvaluationService.UpdateEvaluationStatus(finalRating.EmployeeId,"EmployeeManagerSignOff");
        }
        if (_update.nModified) {
            var c = await EvaluationRepo.aggregate([
                { $match: { _id: ObjectId(finalRating.EvaluationId) } },
                { $unwind: '$Employees' },
                { $match: { "Employees._id": ObjectId(finalRating.EmployeeId) } },
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "Employees._id",
                        foreignField: "_id",
                        as: "CurrentEmployee"

                    }
                },
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "CurrentEmployee.Manager",
                        foreignField: "_id",
                        as: "CurrentEmployeeManager"

                    }
                },
                {
                    $project: {
                        "CurrentEmployee.FirstName": 1,
                        "CurrentEmployee.LastName": 1,
                        "CurrentEmployee.Email": 1,
                        "CurrentEmployeeManager.FirstName": 1,
                        "CurrentEmployeeManager.LastName": 1,
                        "CurrentEmployeeManager.Email": 1

                    }

                }
            ])
            if (c && c[0] && c[0].CurrentEmployee[0]) {
                var empoyee = c[0].CurrentEmployee[0];
                var manager = c[0].CurrentEmployeeManager[0];

                if (finalRating.IsReqRevision) {
                    this.sendMailOnEvMangerRevisionSubmit(empoyee,manager);
                } else {
                    
                if (manager) {
let frate = finalRating?"Request Revision":"Submitted"
let mailBody = "Dear "+ manager.FirstName + ",<br><br>"
mailBody = mailBody + "You have successfully submitted evaluation for "+   empoyee.FirstName+" "+empoyee.LastName+"."
mailBody=mailBody + "<br>To view details  "+ " <a href=" +config.APP_BASE_REDIRECT_URL+"=/employee/review-evaluation-list" +">click here</a> <br><br>Thank you,<br> " + config.ProductName + " Administrator<br>"

                    var mailObject = SendMail.GetMailObject(
                        manager.Email,
                        "Evaluation for "+   empoyee.FirstName+" "+empoyee.LastName+" successfully submitted",
                       mailBody,
                        null,
                        null
                    );

                    await SendMail.SendEmail(mailObject, function (res) {
                        console.log(res);
                    });
                }
                if (empoyee) {
                    let rev = finalRating.ReqRevision ? 'Request Revision' : 'Submitted'
                    let  mailBody = "Dear "+ empoyee.FirstName + ", <br><br>"
                    mailBody = mailBody + "Your manager has submitted your evaluation for final approval."
                    mailBody=mailBody + "<br>To view and sign-off, please  "+ " <a href=" +config.APP_BASE_REDIRECT_URL+"=/employee/current-evaluation" +">click here</a> <br><br>Thank you,<br> " + config.ProductName + " Administrator<br>"
                    var mailObject = SendMail.GetMailObject(
                        empoyee.Email,
                        "Your evaluation has been sent for final approval",
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
            return { IsSuccess: true }
        }
        else
            return { IsSuccess: false, Message: 'No Reocrd got updated' }
    } catch (error) {
        logger.error('error occurred while saving peer review:', error)
        throw error;
    }

}

exports.SaveEmployeeFinalRating = async (finalRating) => {
    try {
        var _update = await EvaluationRepo.updateOne({
            _id: Mongoose.Types.ObjectId(finalRating.EvaluationId),
            "Employees._id": Mongoose.Types.ObjectId(finalRating.EmployeeId)
        },
            {
                $set: {
                    "Employees.$[e].FinalRating.Self.YearEndComments": finalRating.YearEndComments,
                    "Employees.$[e].FinalRating.Self.RevComments": finalRating.RevComments,
                    "Employees.$[e].FinalRating.Self.YearEndRating": finalRating.OverallRating,
                    "Employees.$[e].FinalRating.Self.IsSubmitted": !finalRating.IsDraft ,
                    "Employees.$[e].FinalRating.Self.SubmittedOn": (finalRating.IsDraft && !finalRating.IsSigned) ? null : new Date(),
                    "Employees.$[e].FinalRating.Self.SignOff": finalRating.IsSigned? finalRating.SignOff :"",
                    "Employees.$[e].FinalRating.Status": 'Employee Submitted',

                    "Employees.$[e].FinalRating.ThirdSignatory.IsSubmitted": false,

                }
            },
            {
                "arrayFilters": [
                    { "e._id": ObjectId(finalRating.EmployeeId) }
                ]
            }
        )
        if(!finalRating.IsDraft){
            await EvaluationService.UpdateEvaluationStatus(finalRating.EmployeeId,"EmployeeRatingSubmission");
        }
        if (_update.nModified) {
            var c = await EvaluationRepo.aggregate([
                { $match: { _id: ObjectId(finalRating.EvaluationId) } },
                { $unwind: '$Employees' },
                { $match: { "Employees._id": ObjectId(finalRating.EmployeeId) } },
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "Employees._id",
                        foreignField: "_id",
                        as: "CurrentEmployee"

                    }
                },
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "CurrentEmployee.Manager",
                        foreignField: "_id",
                        as: "CurrentEmployeeManager"

                    }
                },
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "CurrentEmployee.ThirdSignatory",
                        foreignField: "_id",
                        as: "CurrentEmployeeTs"

                    }
                },
                {
                    $project: {
                        "CurrentEmployee.FirstName": 1,
                        "CurrentEmployee.LastName": 1,
                        "CurrentEmployee.Email": 1,
                        "CurrentEmployeeManager.FirstName": 1,
                        "CurrentEmployeeManager.LastName": 1,
                        "CurrentEmployeeManager.Email": 1,
                        "CurrentEmployeeTs.FirstName": 1,
                        "CurrentEmployeeTs.LastName": 1,
                        "CurrentEmployeeTs.Email": 1

                    }

                }
            ])
            if (c && c[0] && c[0].CurrentEmployee[0]) {
                var employee = c[0].CurrentEmployee[0];
                var manager = c[0].CurrentEmployeeManager[0];
                var ts = c[0].CurrentEmployeeTs[0];
               
                if (!finalRating.IsSigned) {

                    this.sendMailOnEvSubmit(employee,manager);
                    
                } else {
                    
                    if (employee) {
                        let mailBody = "Dear " + employee.FirstName +",<br>"
mailBody= mailBody + "Your sign-off for the Final Rating for "+finalRating.EvaluationPeriodText+" has been successfully registered."
mailBody=mailBody + "<br>To view details  "+ " <a href=" +config.APP_BASE_REDIRECT_URL+"=/employee/current-evaluation" +">click here</a> <br><br>Thank you,<br> " + config.ProductName + " Administrator<br>"
                    var mailObject = SendMail.GetMailObject(
                        employee.Email,
                        "Final Rating for "+finalRating.EvaluationPeriodText+" Signed-off",
                       mailBody,
                        null,
                        null
                    );

                    await SendMail.SendEmail(mailObject, function (res) {
                        console.log(res);
                    });
                }
              
                if (manager) {
                    let    mailBody="Dear "+ manager.FirstName +",<br><br>"
                    mailBody = mailBody +  employee.FirstName+" "+employee.LastName+", has signed-off the final rating. <br>"
                    mailBody=mailBody + "<br>To view details  "+ " <a href=" +config.APP_BASE_REDIRECT_URL+"=/employee/review-evaluation-list" +">click here</a> <br><br>Thank you,<br> " + config.ProductName + " Administrator<br>"
                    
                    var mailObject = SendMail.GetMailObject(
                        manager.Email,
                     "Final Rating Signed-off by "+   employee.FirstName+" "+employee.LastName ,
                       mailBody,
                        null,
                        null
                    );

                    await SendMail.SendEmail(mailObject, function (res) {
                        console.log(res);
                    });
                }

                if (ts) {
                    let    mailBody="Dear "+ ts.FirstName +",<br><br>"
                    
                    mailBody = mailBody +"Evaluation for "+  employee.FirstName+" "+employee.LastName+" is ready for your sign-off. <br>"
                    mailBody=mailBody + "<br>To review and sign-off, please "+ " <a href=" +config.APP_BASE_REDIRECT_URL+"=/employee/review-evaluation-list" +">click here</a> <br><br>Thank you,<br> " + config.ProductName + " Administrator<br>"
                    
                    var mailObject = SendMail.GetMailObject(
                        ts.Email,
                        //Evaluation for <employee firstname lastname> ready for sign-off
                     "Evaluation for "+   employee.FirstName+" "+employee.LastName+" ready for sign-off" ,
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
            return { IsSuccess: true }
        }
        else
            return { IsSuccess: false, Message: 'No Reocrd got updated' }
    } catch (error) {
        logger.error('error occurred while saving peer review:', error)
        throw error;
    }

}

exports.GetPeerAvgRating = async (emp) => {

    try {
        var list = await EvaluationRepo.aggregate([
            { $match: { _id: ObjectId(emp.EvaluationId), "Employees._id": Mongoose.Types.ObjectId(emp.EmployeeId) } },
            { $unwind: "$Employees" },
            {
                $project: {
                    _id: 0,
                    "EvaluationId": 1,
                    "Employees._id": 1,
                    "EvaluationPeriod": 1,
                    "EvaluationDuration": 1,
                    "Employees.Peers.EmployeeId": 1,
                    "Employees.Peers.CompetencyOverallRating": 1
                }

            },
            {
                $lookup:
                {
                    from: "users",
                    localField: "Employees.Peers.EmployeeId",
                    foreignField: "_id",
                    as: "PeerList"

                }
            }
            ,
            {
                $addFields: {
                    averageScore: { $avg: "$Employees.Peers.CompetencyOverallRating" }

                }
            },

            {
                $project: {
                    "PeerList._id": 1,
                    "PeerList.FirstName": 1,
                    "PeerList.LastName": 1,
                    "PeerList.Email": 1,
                    "PeerList.Manager": 1,
                    "EvaluationPeriod": 1,
                    "EvaluationDuration": 1,
                    "EvaluationId": 1,
                    "averageScore": 1

                }
            }
        ]

        )
        return list;
    } catch (error) {
        logger.error('Error Occurred while getting data for Peer Review list:', error)
        return Error(error.message)
    }
}

exports.GetDRReviewsList = async (emp) => {
    try {
        const OwnerUserDomain = await UserRepo.findOne({ "_id": emp.EmployeeId });
        let evaluationYear = await EvaluationUtils.GetOrgEvaluationYear(OwnerUserDomain.Organization);
        console.log(`evaluationYear = ${evaluationYear}`);
        var list =
            await EvaluationRepo.aggregate([
                { $match: { "Employees.DirectReportees.EmployeeId": ObjectId(emp.EmployeeId), "Employees.FinalRating.Manager.SignOff":{$exists:true,$eq:""}, "EvaluationYear": evaluationYear } },
                {
                    $addFields: {
                        EvaluationId: "$_id"
                    }
                },
                { $unwind: '$Employees' },
                { $unwind: '$Employees.DirectReportees' },
                { $match: { "Employees.DirectReportees.EmployeeId": ObjectId(emp.EmployeeId), status: "Active" } },
                {
                    $project: {
                        _id: 0,
                        "EvaluationId": 1,
                        "Employees._id": 1,
                        "EvaluationPeriod": 1,
                        "EvaluationDuration": 1,
                        "DirectReportees": "$Employees.DirectReportees"
                    }
                },
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "Employees._id",
                        foreignField: "_id",
                        as: "ForEmployee"
                    }
                },
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "ForEmployee.Manager",
                        foreignField: "_id",
                        as: "Manager"

                    }
                },
                {
                    $project: {
                        "ForEmployee._id": 1,
                        "ForEmployee.FirstName": 1,
                        "ForEmployee.LastName": 1,
                        "ForEmployee.Email": 1,
                        "ForEmployee.Manager": 1,
                        "EvaluationPeriod": 1,
                        "EvaluationDuration": 1,
                        "Manager._id": 1,
                        "Manager.FirstName": 1,
                        "Manager.LastName": 1,
                        "Manager.Email": 1,
                        "Manager.Manager": 1,
                        "EvaluationId": 1,
                        "DirectReportees": 1,
                        IsRatingSubmitted: '$DirectReportees.CompetencySubmitted'

                    }
                }
            ]

            )

        return list;
    } catch (error) {
        logger.error('Error Occurred while getting data for Peer Review list:', error)
        return Error(error.message)
    }

}

exports.GetPendingDRReviewsToSubmit = async (emp) => {
    try {
        var list = await EvaluationRepo.aggregate([
            { $match: { _id: ObjectId(emp.EvaluationId) } },
            { $unwind: '$Employees' },
            { $match: { "Employees._id": ObjectId(emp.ForEmployeeId) } },
            {
                $project: {
                    _id: 0,
                    "Employees._id": 1,
                    'DirectReportee': {
                        $filter: {
                            input: "$Employees.DirectReportees",
                            as: "self",
                            cond: { $eq: ['$$self.EmployeeId', ObjectId(emp.DirectReport)] }
                        },
                    },
                    'EvaluationPeriod':1,
                    EvaluationDuration:1
                }
            },
            {
                $lookup:
                {
                    from: "competenciesmappings",
                    localField: "DirectReportee.DirectReporteeCompetencyList._id",
                    foreignField: "_id",
                    as: "Competencies"
                }
            },
            {
                $lookup:
                {
                    from: "questions",
                    localField: "Competencies.Questions",
                    foreignField: "_id",
                    as: "Questions"
                }
            },
            {
                $lookup:
                {
                    from: "users",
                    localField: "Employees._id",
                    foreignField: "_id",
                    as: "ForEmployee"
                }
            }

        ])
        return list[0];
    } catch (error) {
        logger.error('error occurred while getting emp peer competencies for review:', error)
        throw error;
    }

}

exports.SaveDRReview = async (qna) => {
    try {
        var _update = await EvaluationRepo.updateOne({
            _id: Mongoose.Types.ObjectId(qna.EvaluationId),
            "Employees._id": Mongoose.Types.ObjectId(qna.ForEmployeeId),
            "Employees.DirectReportees": { $elemMatch: { EmployeeId: Mongoose.Types.ObjectId(qna.DrId) } }
        },
            {
                $set: {
                    "Employees.$[e].DirectReportees.$[p].QnA": qna.QnA,
                    "Employees.$[e].DirectReportees.$[p].CompetencyComments": qna.CompetencyComments,
                    "Employees.$[e].DirectReportees.$[p].CompetencyOverallRating": qna.OverallRating,
                    "Employees.$[e].DirectReportees.$[p].CompetencySubmitted": !qna.IsDraft,
                    "Employees.$[e].DirectReportees.$[p].CompetencySubmittedOn": qna.IsDraft ? null : new Date()
                }
            },
            {
                "arrayFilters": [
                    { "e._id": ObjectId(qna.ForEmployeeId) },
                    { "p.EmployeeId": ObjectId(qna.DrId) },
                ]
            }
        )
        if (_update && !qna.IsDraft) {
            let _user = await UserRepo.findOne({ _id: ObjectId(qna.PeerId) }, { Email: 1, FirstName: 1 })
            fs.readFile("./EmailTemplates/PeerReviewSubmitted.html", async function read(err, bufcontent) {
                var content = bufcontent.toString();

                let des = `Direct Report Review has been Successfully Submitted.`
                content = content.replace("##FirstName##", _user.FirstName);
                content = content.replace("##ProductName##", config.ProductName);
                content = content.replace("##Description##", des);
                content = content.replace("##Title##", "Peer Review SUbmitted");

                var mailObject = SendMail.GetMailObject(
                    _user.Email,
                    "Direct Report Review Submitted",
                    content,
                    null,
                    null
                );

                await SendMail.SendEmail(mailObject, function (res) {
                    console.log(res);
                });

            });
            return { IsSuccess: true }

        }
        if (_update && qna.IsDraft) {
            return { IsSuccess: true }
        } else {
            throw Error('no record got updated with given input')
        }


    } catch (error) {
        logger.error('error occurred while saving peer review:', error)
        throw error;
    }



}


exports.GetDrAvgRating = async (emp) => {

    try {
        var list = await EvaluationRepo.aggregate([
            { $match: { _id: ObjectId(emp.EvaluationId), "Employees._id": Mongoose.Types.ObjectId(emp.EmployeeId) } },
            { $unwind: "$Employees" },
            {
                $project: {
                    _id: 0,
                    "EvaluationId": 1,
                    "Employees._id": 1,
                    "EvaluationPeriod": 1,
                    "EvaluationDuration": 1,
                    "Employees.DirectReportees.EmployeeId": 1,
                    "Employees.DirectReportees.CompetencyOverallRating": 1
                }

            },
            {
                $lookup:
                {
                    from: "users",
                    localField: "Employees.DirectReportees.EmployeeId",
                    foreignField: "_id",
                    as: "DirectReporteesList"

                }
            }
            ,
            {
                $addFields: {
                    averageScore: { $avg: "$Employees.DirectReportees.CompetencyOverallRating" }

                }
            },

            {
                $project: {
                    "DirectReporteesList._id": 1,
                    "DirectReporteesList.FirstName": 1,
                    "DirectReporteesList.LastName": 1,
                    "DirectReporteesList.Email": 1,
                    "DirectReporteesList.Manager": 1,
                    "EvaluationPeriod": 1,
                    "EvaluationDuration": 1,
                    "EvaluationId": 1,
                    "averageScore": 1

                }
            }
        ]

        )
        return list;
    } catch (error) {
        logger.error('Error Occurred while getting data for Peer Review list:', error)
        return Error(error.message)
    }
}




exports.GetCompetenciesForManagerToSubmit = async (emp) => {
    try {
        var list = await EvaluationRepo.aggregate([
            { $match: { _id: ObjectId(emp.EvaluationId) } },
            { $unwind: '$Employees' },
            { $match: { "Employees._id": ObjectId(emp.ForEmployeeId) } },
            {
                $project: {
                    _id: 0,
                    "Employees._id": 1,
                    'DirectReportee': {
                        $filter: {
                            input: "$Employees.DirectReportees",
                            as: "self",
                            cond: { $eq: ['$$self.EmployeeId', ObjectId(emp.DirectReport)] }
                        },
                    }
                }
            },
            {
                $lookup:
                {
                    from: "competenciesmappings",
                    localField: "DirectReportee.DirectReporteeCompetencyList._id",
                    foreignField: "_id",
                    as: "Competencies"
                }
            },
            {
                $lookup:
                {
                    from: "questions",
                    localField: "Competencies.Questions",
                    foreignField: "_id",
                    as: "Questions"
                }
            }

        ])
        return list[0];
    } catch (error) {
        logger.error('error occurred while getting emp peer competencies for review:', error)
        throw error;
    }

}
exports.SaveCompetencyQnAByManager = async (qna) => {
    try {
        for (let index = 0; index < qna.QnA.length; index++) {
            const element = qna.QnA[index];
            var fg = await EvaluationRepo.updateOne({
                _id: Mongoose.Types.ObjectId(qna.EvaluationId),
                "Employees._id": Mongoose.Types.ObjectId(qna.EmployeeId),
                "Employees.Manager.Competencies.Questions": { $elemMatch: { _id: Mongoose.Types.ObjectId(element.QuestionId) } }
            }, {
                $set: {
                    "Employees.$[e].Manager.Competencies.$[c].Questions.$[q].SelectedRating": element.Answer,
                    "Employees.$[e].Manager.Competencies.$[c].Comments": element.Comments,
                    "Employees.$[e].Manager.Competencies.$[c].CompetencyAvgRating": element.CompetencyAvgRating,
                }
            },
                {
                    "arrayFilters": [
                        { "e._id": ObjectId(qna.EmployeeId) },
                        { "c._id": ObjectId(element.CompetencyRowId) },
                        { "q._id": ObjectId(element.QuestionId) }]
                }
            )
        }
        var updateCompetencyList = await EvaluationRepo.updateOne({
            _id: Mongoose.Types.ObjectId(qna.EvaluationId),
            "Employees._id": Mongoose.Types.ObjectId(qna.EmployeeId)
        }, {
            $set: {
                "Employees.$[e].Manager.CompetencySubmitted": !qna.IsDraft,
                "Employees.$[e].Manager.CompetencySubmittedOn": qna.IsDraft ? null : new Date()

            }
        },
            {
                "arrayFilters": [
                    { "e._id": ObjectId(qna.EmployeeId) }
                ]
            }
        );
        if(!qna.IsDraft){
            await EvaluationService.UpdateEvaluationStatus(qna.EmployeeId,"MANAGER_SUBMITTED_COMPETENCY");
        }
        if(qna.IsDraft){
            await EvaluationService.UpdateEvaluationStatus(qna.EmployeeId,"MANAGER_SAVE_COMPETENCY");
        }
        if (updateCompetencyList) {
            return { IsSuccess: true }
        } else {
            return { IsSuccess: false }
        }
    } catch (error) {
        logger.error('Error Occurred while saving Competency', error);
        throw error;
    }


};


exports.GetOverallRatingByCompetency = async (emp) => {
    try {
        var list = await EvaluationRepo.aggregate([
            { $match: { _id: ObjectId(emp.EvaluationId) } },
            { $unwind: '$Employees' },
            { $match: { "Employees._id": ObjectId(emp.ForEmployeeId) } },
            {
                $project: {
                    _id: 0,
                    "Employees": 1
                }
            },
            { $addFields: { "Manager": "$Employees.Manager" } },
            { $addFields: { "Employee": "$Employees" } },
            { $addFields: { "Peers": "$Employees.Peers" } },
            { $addFields: { "DRs": "$Employees.DirectReportees" } },
            {
                $project: {
                    _id: 0,
                    "Employees._id": 1,
                    'Manager': 1,
                    'Employee': 1,
                    'Peers': 1,
                    'DRs': 1


                }

            }
        ]);
        var _clist = [];
        var returnObj = {
            competencyId: "",
            allSubmitted: false,
            overallScore: 0
        };
        var allPeersRatingSubmitted = true;
        var allDrSubmitted = true;
        var managerSubmitted = true;
        if (list[0] && list[0].Employee.Competencies && list[0].Employee.Competencies.length > 0) {
            var clist = list[0].Employee.Competencies.map(x => x.Competency._id);
            for (let index = 0; index < clist.length; index++) {
                const element = clist[index];
                _pcScore = [];
                var _p = list[0].Peers.filter(x => x.CompetencySubmitted === false)
                if (_p && _p.length > 0) {
                    allPeersRatingSubmitted = false;
                    _clist.push({ competencyId: element, allSubmitted: false, overallScore: 0 })
                    continue;
                } else {
                    var allpeers = list[0].Peers.map(x => x.QnA)
                    if (allpeers && allpeers.length > 0) {
                        for (let p = 0; p < allpeers.length; p++) {
                            const currentPeer = allpeers[p];
                            var currentCompetency = currentPeer.filter(x => x.CompetencyId === element)
                            var _avg = calcAverage(currentCompetency.map(x => x.Answer))
                            _pcScore.push(_avg);
                        }
                    }
                }
                //For Direct Reportee
                _drScore = [];
                var _d = list[0].DRs.filter(x => x.CompetencySubmitted === false)
                if (_d && _d.length > 0) {
                    allDrSubmitted = false;
                    _clist.push({ competencyId: element, allSubmitted: false, overallScore: 0 })
                    continue;
                } else {
                    var alldrs = list[0].DRs.map(x => x.QnA)
                    if (alldrs && alldrs.length > 0) {
                        for (let d = 0; d < alldrs.length; p++) {
                            const currentDr = alldrs[d];
                            var currentDrCompetency = currentDr.filter(x => x.CompetencyId === element)
                            var _avg = calcAverage(currentDrCompetency.map(x => x.Answer));
                            _drScore.push(_avg);
                        }
                    }
                }

                //For Manager Rating
                _managerScore = [];
                if (!list[0].Manager.CompetencySubmitted) {
                    managerSubmitted = false;
                    _clist.push({ competencyId: element, allSubmitted: false, overallScore: 0 })
                    continue;
                } else {
                    var _manager = list[0].Manager.Competencies.find(x => x.Competency._id === element)
                    if (_manager ) {
                        var _avg = calcAverage(_manager.Questions.map(x=>x.SelectedRating))
                            _managerScore.push(_avg);
                    }
                }
                var _overallScore=calcAverage(_pcScore)+calcAverage(_drScore)+_managerScore[0];
                let noOfItems=1;
                noOfItems= noOfItems+ (_pcScore.length >0 ?1:0 ) +  (_drScore.length >0 ?1:0);
                _clist.push({ competencyId: element, allSubmitted: true, overallScore: (_overallScore/noOfItems).toFixed(1) })
            }
        }
        return _clist

    } catch (error) {
        logger.error('error occurred while getting emp peer competencies for review:', error)
        throw error;
    }

}



exports.GetReporteeAccomplishments = async (manager) => {
    try {
        const ManagerUserDomain = await UserRepo.findOne({ "_id": manager.id });
        let evaluationYear = await EvaluationUtils.GetOrgEvaluationYear(ManagerUserDomain.Organization);
        console.log(`evaluationYear = ${evaluationYear}`);

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
                    from: "accomplishments",
                    localField: "EmployeeId",
                    foreignField: "Owner",
                    as: "AccompList",
                }
            },
          
            {
                $project: {
                  
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
                   
                }
            }
        ])


       
return reportees;
   

    } catch (error) {
        console.log('error', error)
        logger.error(error);
    }
}



exports.GetTSReleasedAccomplishments = async (manager) => {
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
                    from: "accomplishments",
                    localField: "EmployeeId",
                    foreignField: "Owner",
                    as: "AccompList",
                }
            },
          
            {
                $project: {
                  
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
                   
                }
            }
        ])


       
return reportees;
   

    } catch (error) {
        console.log('error', error)
        logger.error(error);
    }
}






exports.sendEmailOnAccompCreate = async (manager,OwnerInfo,accomplishment) => {
console.log("INNNNNNNNNNNNNNNNN", manager)
    // if ( OwnerInfo) {
    if (manager && OwnerInfo) {
        
        // send email to User 

        fs.readFile("./EmailTemplates/EmailTemplate.html", async function read(err, bufcontent) {
            var content = bufcontent.toString();
    
            let des= `The accomplishment has been added successfully. <br>
            To view details, <a href="${config.APP_BASE_REDIRECT_URL}=/employee/accomplishments-list">click here</a>.
               `
            content = content.replace("##FirstName##",OwnerInfo.FirstName);
            content = content.replace("##ProductName##", config.ProductName);
            content = content.replace("##Description##", des);
            content = content.replace("##Title##", "Accomplishment added successfully");

        var mailObject = SendMail.GetMailObject(
            OwnerInfo.Email,
                  "Accomplishment added successfully",
                  content,
                  null,
                  null
                );

        await SendMail.SendEmail(mailObject, function (res) {
            console.log(res);
        });

    });


        // send email to manager 
        if(accomplishment.ShowToManager){
       
        fs.readFile("./EmailTemplates/EmailTemplate.html", async function read(err, bufcontent) {
            var content = bufcontent.toString();
    
            let des= `Employee ${OwnerInfo.FirstName} ${OwnerInfo.LastName} has added accomplishments
            To view details, <a href="${config.APP_BASE_REDIRECT_URL}=/employee/review-accomplishments">click here</a>.
               `
            content = content.replace("##FirstName##",manager.FirstName);
            content = content.replace("##ProductName##", config.ProductName);
            content = content.replace("##Description##", des);
            content = content.replace("##Title##", `Accomplishments`);

      
            var mailObject = SendMail.GetMailObject(
            manager.Email,
            `Employee ${OwnerInfo.FirstName} ${OwnerInfo.LastName} has added accomplishments`,
                 content,
                  null,
                  null
                );

        await SendMail.SendEmail(mailObject, function (res) {   });
            
    

    });

    }
    }

}


exports.sendEmailOnAccompUpdate = async (manager,OwnerInfo,accomplishment) => {
    console.log("INNNNNNNNNNNNNNNNN", manager)
        // if ( OwnerInfo) {
        if (manager && OwnerInfo) {
            
            // send email to User 
    
            fs.readFile("./EmailTemplates/EmailTemplate.html", async function read(err, bufcontent) {
                var content = bufcontent.toString();
        
                let des= `The accomplishment has been updated successfully.
                 <br> ${accomplishment.Accomplishment} 
                 <br>  ${new Date(accomplishment.CompletionDate).toLocaleDateString()} 
                 <br>  ${accomplishment.Comments} 
                 <br>  ${accomplishment.ShowToManager?'Yes':'No'} <br>

                To view details, <a href="${config.APP_BASE_REDIRECT_URL}=/employee/accomplishments-list">click here</a>.
                   `
                content = content.replace("##FirstName##",OwnerInfo.FirstName);
                content = content.replace("##ProductName##", config.ProductName);
                content = content.replace("##Description##", des);
                content = content.replace("##Title##", "Accomplishment updated successfully");
    
            var mailObject = SendMail.GetMailObject(
                OwnerInfo.Email,
                      "Accomplishment updated successfully",
                      content,
                      null,
                      null
                    );
    
            await SendMail.SendEmail(mailObject, function (res) {
                console.log(res);
            });
    
        });
    
    
            // send email to manager 
            if(accomplishment.ShowToManager){
           
            fs.readFile("./EmailTemplates/EmailTemplate.html", async function read(err, bufcontent) {
                var content = bufcontent.toString();
        
                let des= `Employee ${OwnerInfo.FirstName} ${OwnerInfo.LastName} has updated accomplishments
                <br> ${accomplishment.Accomplishment} 
                <br>  ${new Date(accomplishment.CompletionDate).toLocaleDateString()} 
                <br>  ${accomplishment.Comments} 
               <br>
                To view details, <a href="${config.APP_BASE_REDIRECT_URL}=/employee/review-accomplishments">click here</a>.
                   `
                content = content.replace("##FirstName##",manager.FirstName);
                content = content.replace("##ProductName##", config.ProductName);
                content = content.replace("##Description##", des);
                content = content.replace("##Title##", `Employee ${OwnerInfo.FirstName} ${OwnerInfo.LastName} has updated accomplishments`);
    
          
                var mailObject = SendMail.GetMailObject(
                manager.Email,
                `Employee ${OwnerInfo.FirstName} ${OwnerInfo.LastName} has updated accomplishments`,
                     content,
                      null,
                      null
                    );
    
            await SendMail.SendEmail(mailObject, function (res) {   });
                
        
    
        });
    
        }
        }
    
    }

    
    exports.sendMailOnEvMangerRevisionSubmit= async (employee,manager)=> {
//You have successfully revised the rating for 

if (manager) {
    
    let  mailBody = "Dear "+ manager.FirstName + ",<br><br>"
    mailBody = mailBody + "You have successfully revised the rating for "+   employee.FirstName+" "+employee.LastName+"."
    mailBody=mailBody + "<br>To view details  "+ " <a href=" +config.APP_BASE_REDIRECT_URL+"=/employee/review-evaluation-list" +">click here</a> <br><br>Thank you,<br> " + config.ProductName + " Administrator<br>"
    
                        var mailObject = SendMail.GetMailObject(
                            manager.Email,
                            "Evaluation for "+   employee.FirstName+" "+employee.LastName+" successfully submitted",
                           mailBody,
                            null,
                            null
                        );
    
                        await SendMail.SendEmail(mailObject, function (res) {
                            console.log(res);
                        });
                    }
                    if (employee) {
                      
                        let   mailBody = "Dear "+ employee.FirstName + ", <br><br>"
                        mailBody = mailBody + "Your manager has revised your rating."
                        mailBody=mailBody + "<br>To view and sign-off, please  "+ " <a href=" +config.APP_BASE_REDIRECT_URL+"=/employee/review-evaluation-list" +">click here</a> <br><br>Thank you,<br> " + config.ProductName + " Administrator<br>"
                        var mailObject = SendMail.GetMailObject(
                            employee.Email,
                            "Your evaluation has been sent for final approval",
                           mailBody,
                             null,
                            null
                        );
    
                        await SendMail.SendEmail(mailObject, function (res) {
                            console.log(res);
                        });
                    }
    }




    exports.sendMailOnEvSubmit= async (employee,manager)=> {


        if (employee) {
            let   mailBody = "Dear " + employee.FirstName +",<br>"
            mailBody= mailBody + "You have successfully submitted your evaluation."
            mailBody=mailBody + "<br>To view details  "+ " <a href=" +config.APP_BASE_REDIRECT_URL+"=/employee/current-evaluation" +">click here</a> <br><br>Thank you,<br> " + config.ProductName + " Administrator<br>"
                                var mailObject = SendMail.GetMailObject(
                                    employee.Email,
                                    "Evaluation successfully submitted",
                                   mailBody,
                                    null,
                                    null
                                );
            
                                await SendMail.SendEmail(mailObject, function (res) {
                                    console.log(res);
                                });
                            }

                            if (manager) {
                              let  mailBody="Dear "+ manager.FirstName +",<br><br>"
                                mailBody = mailBody + "Your direct report, " + employee.FirstName+" "+employee.LastName+", has submitted the evaluation.<br>"
                                mailBody=mailBody + "<br>Please  "+ " <a href=" +config.APP_BASE_REDIRECT_URL+"=/employee/review-evaluation-list" +">click here</a> to login and review.<br><br>Thank you,<br> " + config.ProductName + " Administrator<br>"
                                
                                var mailObject = SendMail.GetMailObject(
                                    manager.Email,
                                    employee.FirstName+" "+employee.LastName+ "has submitted the evaluation",
                                   mailBody,
                                    null,
                                    null
                                );
            
                                await SendMail.SendEmail(mailObject, function (res) {
                                    console.log(res);
                                });
                            }
    }


    exports.sendEmailOnManagerUpdate = async (manager, kpiOwnerInfo,kpi) => {
let Owner=kpiOwnerInfo.Owner;

        if (manager) {
    
    
            // send email to User 
            if(Owner){
          let  mailBody = "Dear "+ Owner.FirstName + ", <br><br>"
            mailBody = mailBody + "Your manager, "+  manager.FirstName+" "+manager.LastName + " has updated Performance Goals.<br><br>"
            mailBody=mailBody + "<br>Please  "+ " <a href="+config.APP_BASE_REDIRECT_URL+"=/employee/kpi-setup" + ">click here</a> to login.<br><br>Thank you,<br> "+config.ProductName+" Administrator<br>"
            var mailObject = SendMail.GetMailObject(
                Owner.Email,
                "Your Performance Goal updated",
                mailBody,
                null,
                null
            );

            mailObject.attachments= [
                {
                    filename: kpiOwnerInfo.Kpi+'.pdf',
                    path:kpi.KpiBase64data
                }
              ]

    
            await SendMail.SendEmail(mailObject, function (res) {
                console.log(res);
            });
        }
        }
    
    }

    
    exports.sendEmailOnDeactivateByManager = async (manager, Owner,kpi) => {
       
        
        if (manager) {
    

              // send email to manager  //A performance goal has been deactivated by <first name last name>.
              if(Owner){
                let  mailBody = "Dear "+ manager.FirstName + ", <br><br>"
                  mailBody = mailBody + "A performance goal has been deactivated.<br><br>"
                  mailBody=mailBody + "<br>To view, "+ " <a href="+config.APP_BASE_REDIRECT_URL+"=/employee/review-perf-goals-list" + ">click here</a> <br><br>Thank you,<br> "+config.ProductName+" Administrator<br>"
                  var mailObject = SendMail.GetMailObject(
                      manager.Email,
                      "Performance Goal deactivated",
                      mailBody,
                      null,
                      null
                  );
      
                  await SendMail.SendEmail(mailObject, function (res) {
                      console.log(res);
                  });
    
            // send email to User 
            if(Owner){
          let  mailBody = "Dear "+ Owner.FirstName + ", <br><br>"
            mailBody = mailBody + "A performance goal has been deactivated  by "+  manager.FirstName+" "+manager.LastName + ".<br><br>"
            mailBody=mailBody + "<br>To view, "+ " <a href="+config.APP_BASE_REDIRECT_URL+"=/employee/kpi-setup" + ">click here</a> <br><br>Thank you,<br> "+config.ProductName+" Administrator<br>"
            var mailObject = SendMail.GetMailObject(
                Owner.Email,
                "Performance Goal deactivated",
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

}

    exports.sendEmailOnDeactivateByEmp = async (manager, Owner,kpi) => {
       
        
                if (manager) {
            

                      // send email to manager  //A performance goal has been deactivated by <first name last name>.
                      if(Owner){
                        let  mailBody = "Dear "+ manager.FirstName + ", <br><br>"
                          mailBody = mailBody + "A performance goal has been deactivated by  "+  Owner.FirstName+" "+Owner.LastName + ".<br><br>"
                          mailBody=mailBody + "<br>To view, "+ " <a href="+config.APP_BASE_REDIRECT_URL+"=/employee/review-perf-goals-list" + ">click here</a> <br><br>Thank you,<br> "+config.ProductName+" Administrator<br>"
                          var mailObject = SendMail.GetMailObject(
                              manager.Email,
                              "Performance Goal deactivated",
                              mailBody,
                              null,
                              null
                          );
              
                          await SendMail.SendEmail(mailObject, function (res) {
                              console.log(res);
                          });
            
                    // send email to User 
                    if(Owner){
                  let  mailBody = "Dear "+ Owner.FirstName + ", <br><br>"
                    mailBody = mailBody + "A performance goal has been deactivated.<br><br>"
                    mailBody=mailBody + "<br>To view, "+ " <a href="+config.APP_BASE_REDIRECT_URL+"=/employee/kpi-setup" + ">click here</a> <br><br>Thank you,<br> "+config.ProductName+" Administrator<br>"
                    var mailObject = SendMail.GetMailObject(
                        Owner.Email,
                        "Performance Goal deactivated",
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

        }


    exports.updateNotificationAsRead = async (options) => {
       try{

        console.log('inside updateNotificationAsRead');
        let { id,email } = options
         await DeliverEmailRepo.findByIdAndUpdate(id, {IsRead:true});
        return await DeliverEmailRepo.find({'Email':email,'IsDelivered':true}).sort({ CreatedOn: -1 });;
       }  catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }
    }

function calcAverage(arr) {
    if(arr && arr.length===0){
        return 0;
    }
    var sum = 0;
    for (var i = 0; i < arr.length; i++) {
        sum += parseInt(arr[i], 10); //don't forget to add the base
    }

    var avg = sum / arr.length;
    return parseFloat(avg.toFixed(1));
}



