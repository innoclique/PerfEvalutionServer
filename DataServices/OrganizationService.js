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
        //save user account for this organization
        const pwd = Bcrypt.hashSync(AuthHelper.GenerateRandomPassword(), 10);
        const userRecord = {
            Email: organization.AdminEmail,
            ContactPhone: organization.AdminPhone,
            Role: 'Client',
            Password: Bcrypt.hashSync(pwd, 10),
            FirstName: organization.AdminFirstName,
            LastName: organization.AdminLastName,
            MiddleName: organization.AdminMiddleName,
            Address: organization.Address,            
            PhoneNumber: organization.AdminPhone
        }
        // const UserNameUser = await UserRepo.findOne({ Email: UserModel.Username });
        const EmailUser = await UserRepo.findOne({ Email: userRecord.Email });
        const PhoneNumberUser = await UserRepo.findOne({ PhoneNumber: userRecord.PhoneNumber });

        if (EmailUser !== null) { throw Error("Admin Email Already Exist"); }
        if (PhoneNumberUser !== null) { throw Error("Admin PhoneNumberUser Already Exist"); }


        const organizationName = await OrganizationRepo.findOne({ Name: organization.Name });
        const organizationEmail = await OrganizationRepo.findOne({ Email: organization.Email });
        const organizationPhone = await OrganizationRepo.findOne({ Phone: organization.Phone });

        if (organizationName !== null) { throw Error("Organization Name Already Exist"); }
        if (organizationEmail !== null) { throw Error("Organization Email Already Exist "); }
        if (organizationPhone !== null) { throw Error("Organization Phone Number Already Exist"); }

        const user = new UserRepo(userRecord)
        var createdUser = await user.save()
        organization.Admin = createdUser.id;

        const Organization = new OrganizationRepo(organization);
        await Organization.save();



        //send email to admin user
        return true;
    }
    catch (err) {
        logger.error(err)
        console.log(err);
        throw (err);
    }
}
exports.UpdateOrganization = async (organization) => {
    try {
        const organizationName = await OrganizationRepo.findOne({ Name: organization.Name });
        const organizationEmail = await OrganizationRepo.findOne({ Email: organization.Email });
        const organizationPhone = await OrganizationRepo.findOne({ Phone: organization.Phone });

        if (organizationName !== null) { throw Error("Organization Name Already Exist"); }
        if (organizationEmail !== null) { throw Error("Organization Email Already Exist "); }
        if (organizationPhone !== null) { throw Error("Organization Phone Number Already Exist"); }
        const Organization = new OrganizationRepo.findByIdAndUpdate(organization);
        await Organization.save();
        //save user account for this organization
        //     const pwd = Bcrypt.hashSync(AuthHelper.GenerateRandomPassword(), 10);
        //     const userRecord = {
        //         Email: organization.AdminEmail,
        //         ContactPhone: organization.AdminPhone,
        //         Role: 'Client',
        //         Password: Bcrypt.hashSync(pwd, 10),
        //         FirstName: organization.AdminName,
        //         Address: organization.Address,
        //         LastName: organization.AdminName,
        //         PhoneNumber: organization.Phone
        //     }
        //    // const UserNameUser = await UserRepo.findOne({ Email: UserModel.Username });
        //     const EmailUser = await UserRepo.findOne({ Email: userRecord.Email });
        //     //const PhoneNumberUser = await UserRepo.findOne({ PhoneNumber: UserModel.PhoneNumber });

        //     if (EmailUser !== null) { throw Error("Email Already Exist"); }
        //     const user = new UserRepo(userRecord)
        //     await user.save();
        //send email to admin user
        return true;
    }
    catch (err) {
        logger.error(err)
        console.log(err);
        throw (err);
    }
}
exports.GetOrganizationDataById = async (Id) => {
    const Organization = await OrganizationRepo.findById(Id);
    return Organization;
};
exports.GetAllOrganizations = async () => {
    
    const Organizations = await OrganizationRepo.find().sort({CreatedOn:-1});
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
const org=await OrganizationRepo.findOne({'Name':orgName});
return org;
}


