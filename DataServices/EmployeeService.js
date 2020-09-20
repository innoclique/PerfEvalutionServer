const DbConnection = require("../Config/DbConfig");
require('dotenv').config();
const Mongoose = require("mongoose");
const Bcrypt = require('bcrypt');
const OrganizationRepo = require('..');
const StrengthRepo = require('../SchemaModels/Strengths');
const AccomplishmentRepo = require('../SchemaModels/Accomplishments');
const AuthHelper = require('../Helpers/Auth_Helper');
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
            // const organizationName = await strengthRepo.findOne({ Name: organization.Name });
            // const organizationEmail = await strengthRepo.findOne({ Email: organization.Email });
            // const organizationPhone = await OrganizationRepo.findOne({ Phone: organization.Phone });
    
            // if (organizationName !== null) { throw Error("Organization Name Already Exist"); }
    
            // if (organizationEmail !== null) { throw Error("Organization Email Already Exist "); }
    
            // if (organizationPhone !== null) { throw Error("Organization Phone Number Already Exist"); }
            const Kpi = new KpiRepo(kpi);
            await Kpi.save();
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
    exports.GetAllKpis= async (empId) => {
        
            const Kpi = await KpiRepo.find({'Employee':empId});    
            return Kpi;   
        };
     exports.UpdateKpi=async(Id)   =>{

     };
       