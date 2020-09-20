const DbConnection = require("../Config/DbConfig");
require('dotenv').config();
const Mongoose = require("mongoose");
const Bcrypt = require('bcrypt');
const OrganizationRepo = require('../SchemaModels/OrganizationSchema');
const UserRepo = require('../SchemaModels/UserSchema');
const AuthHelper = require('../Helpers/Auth_Helper');
const SendMail = require("../Helpers/mail.js");
var logger = require('../logger');

exports.CreateOrganization = async (organization) => {
    try {
        const organizationName = await OrganizationRepo.findOne({ Name: organization.Name });
        const organizationEmail = await OrganizationRepo.findOne({ Email: organization.Email });
        const organizationPhone = await OrganizationRepo.findOne({ Phone: organization.Phone });

        if (organizationName !== null) { throw Error("Organization Name Already Exist"); }

        if (organizationEmail !== null) { throw Error("Organization Email Already Exist "); }

        if (organizationPhone !== null) { throw Error("Organization Phone Number Already Exist"); }
        const Organization = new OrganizationRepo(organization);
        await Organization.save();
        return true;
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


};
exports.GetOrganizationDataById = async (Id) => {
    debugger
    const Organization = await OrganizationRepo.findById(Id);

    return Organization;


};
exports.GetAllOrganizations = async () => {
    debugger
    const Organizations = await OrganizationRepo.find();

    return Organizations;


};
exports.AddNotes = async (note) => {
    try {
        // const organizationName = await strengthRepo.findOne({ Name: organization.Name });
        // const organizationEmail = await strengthRepo.findOne({ Email: organization.Email });
        // const organizationPhone = await OrganizationRepo.findOne({ Phone: organization.Phone });

        // if (organizationName !== null) { throw Error("Organization Name Already Exist"); }

        // if (organizationEmail !== null) { throw Error("Organization Email Already Exist "); }

        // if (organizationPhone !== null) { throw Error("Organization Phone Number Already Exist"); }
        const Note = new NoteRepo(note);
        await Note.save();
        return true;
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


}
exports.GetNoteDataById = async (Id) => {

    const Note = await NoteRepo.findById(Id);

    return Note;


};
exports.GetAllNotes = async (empId) => {

    const Note = await NoteRepo.find({ 'Employee': empId });
    return Note;
};
exports.UpdateNote = async (Id) => {

};

exports.IsOrgExist=async (orgName)=>{
const orgName=await OrganizationRepo.findOne({'Name':orgName});
return orgName;
}


