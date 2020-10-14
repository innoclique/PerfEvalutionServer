const DbConnection = require("../Config/DbConfig");
require('dotenv').config();
const Mongoose = require("mongoose");
const Bcrypt = require('bcrypt');
const OrganizationRepo = require('..');
const StrengthRepo = require('../SchemaModels/Strengths');
const AccomplishmentRepo = require('../SchemaModels/Accomplishments');
const DepartmentRepo = require('../SchemaModels/DepartmentSchema');
const JobRoleRepo = require('../SchemaModels/JobRoleSchema');
const JobLevelRepo = require('../SchemaModels/JobLevelSchema');
const AppRoleRepo = require('../SchemaModels/ApplicationRolesSchema');
const RoleRepo = require('../SchemaModels/Roles');
const KpiRepo = require('../SchemaModels/KPI');
const MeasureCriteriaRepo = require('../SchemaModels/MeasurementCriteria');
const IndustriesRepo = require('../SchemaModels/Industry');
const EvaluationRepo = require('../SchemaModels/Evalution');
const AuthHelper = require('../Helpers/Auth_Helper');
const Messages = require('../Helpers/Messages');
const UserRepo = require('../SchemaModels/UserSchema');
const SendMail = require("../Helpers/mail.js");
var logger = require('../logger');

exports.AddStrength = async (strength) => {
    try {        
        // const organizationName = await strengthRepo.findOne({ Name: organization.Name });
        // const organizationEmail = await strengthRepo.findOne({ Email: organization.Email });
        // const organizationPhone = await OrganizationRepo.findOne({ Phone: organization.Phone });

        // if (organizationName !== null) { throw Error("Organization Name Already Exist"); }

        // if (organizationEmail !== null) { throw Error("Organization Email Already Exist "); }

        // if (organizationPhone !== null) { throw Error("Organization Phone Number Already Exist"); }
        const Strength = new strengthRepo(strength);
        await Strength.save();
return true;
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


}
exports.GetStrengthById= async (Id) => {

    const Strength = await StrengthRepo.findById(Id);

    return Strength;


};
exports.GetAllStrengths= async (empId) => {
    
        const Strengths = await StrengthRepo.find({'Employee':empId});    
        return Strengths;   
    };
    exports.AddAccomplishment = async (accomplishment) => {
        try {        
            // const organizationName = await strengthRepo.findOne({ Name: organization.Name });
            // const organizationEmail = await strengthRepo.findOne({ Email: organization.Email });
            // const organizationPhone = await OrganizationRepo.findOne({ Phone: organization.Phone });
    
            // if (organizationName !== null) { throw Error("Organization Name Already Exist"); }
    
            // if (organizationEmail !== null) { throw Error("Organization Email Already Exist "); }
    
            // if (organizationPhone !== null) { throw Error("Organization Phone Number Already Exist"); }
            const Accomplishment = new AccomplishmentRepo(accomplishment);
            await Accomplishment.save();
    return true;
        }
        catch (err) {
            logger.error(err)
    
            console.log(err);
            throw (err);
        }
    
    
    }

    exports.GetAllDepartments= async (empId) => {
      
        const Departments = await DepartmentRepo.find();    
        return Departments;   
    };

    exports.GetEmpSetupBasicData= async (industry) => {
       
       
      
       //  const Industries = await IndustriesRepo.findById('5f6b2acc7d83cd08b8a9ad46');   
         const Industries = await IndustriesRepo.find( { Name: industry});
                  
        var AppRoles=await RoleRepo.find({RoleLevel:{$in: ['3','4','5','6' ] }})
        const JobLevels = await JobLevelRepo.find();    
        return {Industries,AppRoles,JobLevels};   
    };


    exports.GetKpiSetupBasicData= async (empId,orgId) => {
             
        const KpiStatus =  Messages.constants.KPI_STATUS;
        const KpiScore =  Messages.constants.KPI_SCORE;
        const coachingRem =  Messages.constants.COACHING_REM_DAYS;
      var allEvaluation=await EvaluationRepo.find( { Employees: { $elemMatch:{_id: Mongoose.Types.ObjectId(empId)} },
                                                      Company:orgId
                                               }).sort({CreatedDate:-1}); 
       let evaluation=  allEvaluation[0];
       return {KpiStatus,KpiScore,coachingRem,evaluation };  
   };

   exports.GetAllMeasurementCriterias= async (empId) => {
    const MeasureCriterias = await MeasureCriteriaRepo.find({'CreatedBy':empId});    
    return MeasureCriterias;     
   
   };

   exports.CreateMeasurementCriteria= async (measures) => {
    const MeasureCriteria = new MeasureCriteriaRepo(measures);
    await MeasureCriteria.save();
   
   };


    exports.GetAccomplishmentDataById= async (Id) => {
    
        const Accomplishment = await AccomplishmentRepo.findById(Id);
    
        return Accomplishment;
    
    
    };
    exports.GetAllAccomplishments= async (empId) => {
        
            const Accomplishments = await AccomplishmentRepo.find({'Employee':empId});    
            return Accomplishments;   
        };
     exports.UpdateAccomplishments=async(Id)   =>{

     };


exports.AddKpi = async (kpi) => {
    try {


        const Kpi = new KpiRepo(kpi);
        await Kpi.save();

        //Updateing other kpis waiting 
        if (!kpi.IsDraft) {       
        let updatedKPIs = await KpiRepo.updateMany({
            'Owner': Mongoose.Types.ObjectId(kpi.CreatedBy),
            'IsDraft': false,
        },
            { $set: { 'Weighting': kpi.Weighting } });
       }

        return true;
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


}
    exports.GetKpiDataById= async (Id) => {
    
        const Kpi = await KpiRepo.findById(Id);
    
        return Kpi;
    
    
    };
    exports.GetAllKpis= async (data) => {
        
       

      var allEvaluation=await EvaluationRepo.find( { Employees: { $elemMatch:{_id: Mongoose.Types.ObjectId(data.empId)} },
      Company:data.orgId
      }).sort({CreatedDate:-1}); 
      let currEvaluation=  allEvaluation[0];
      let preEvaluation=  allEvaluation[1];

      if (!currEvaluation || allEvaluation.length==0) {
        throw Error("KPI Setting Form Not Activeted");
      }
      var preKpi=[];
      if (preEvaluation && !data.currentOnly) {
         preKpi = await KpiRepo.find({'Owner':data.empId, 'EvaluationId':preEvaluation._id})
        .populate('MeasurementCriteria.measureId Owner')
        .sort({UpdatedOn:-1});    
      }
  

            const Kpi = await KpiRepo.find({'Owner':data.empId, 'EvaluationId':currEvaluation._id})
            .populate('MeasurementCriteria.measureId Owner')
            .sort({UpdatedOn:-1});    


            return [...Kpi,...preKpi];   
        };



        exports.GetKpisByManager= async (managerId) => {
        
          
                  var Kpis = await KpiRepo.find({'ManagerId':managerId, 
                  'IsDraft':false 
                 // ,'IsSubmitedKPIs':true  
                 })
                  .populate('MeasurementCriteria.measureId Owner')
                  .sort({UpdatedOn:-1});     


//sgsgggjsr

 const kpiGroup=  Kpis.reduce((acc, obj) => {
    const key = obj.Owner.FirstName;
    if (!acc[key]) {
       acc[key] = [];
    }
    // Add object to list for given key's value
    acc[key].push(obj);
    return acc;
 }, {});


                  return kpiGroup;   
              };


        exports.SubmitAllKpis = async (empId) => {
            try {

                const User = await UserRepo.find({"_id":empId})
                .populate('Manager');
        
                let submitedKPIs = await KpiRepo.updateMany({
                    'Owner': Mongoose.Types.ObjectId(empId),
                    'IsDraft':false,
                    'IsSubmitedKPIs':false
                },
                    { $set: { 
                        'IsSubmitedKPIs': true,
                        'EmpFTSubmitedOn': new Date(),
                        'Signoff':{SignOffBy:User[0].FirstName,SignOffOn:new Date()}
                   } });

                    if (submitedKPIs) {
                        // send email to manager 
                        if (User[0].Manager) {
                        var mailObject = SendMail.GetMailObject(
                            User[0].Manager.Email,
                                  "Kpi Submited for review",
                                  "Thank you",
                                  null,
                                  null
                                );
                
                        SendMail.SendEmail(mailObject, function (res) {
                            console.log(res);
                        });
                    }
                        
                        // send email to User 
                        var mailObject = SendMail.GetMailObject(
                            User[0].Email,
                                  "Kpi Submited for review",
                                  "Thank you",
                                  null,
                                  null
                                );
                
                        SendMail.SendEmail(mailObject, function (res) {
                            console.log(res);
                        });
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
        
                if (kpi.IsManaFTSubmited) {
                    const Manager = await UserRepo.findById(kpi.UpdatedBy);
                   kpi.ManagerFTSubmitedOn=new Date()
                    kpi.ManagerSignOff={SignOffBy:Manager.FirstName,SignOffOn:new Date()}
                }
              
                kpi.UpdatedOn = new Date();
               await KpiRepo.findByIdAndUpdate(kpi.kpiId, kpi);
        
                return true;
            }
            catch (err) {
                logger.error(err)
        
                console.log(err);
                throw (err);
            }
        
        
        }


       