const DbConnection = require("../Config/DbConfig");
require('dotenv').config();
const Mongoose = require("mongoose");
const Bcrypt = require('bcrypt');
const OrganizationRepo = require('../SchemaModels/OrganizationSchema');
const UserRepo = require('../SchemaModels/UserSchema');
const AuthHelper = require('../Helpers/Auth_Helper');
const SendMail = require("../Helpers/mail.js");
const logger = require('../logger');

exports.CreateOrganization = async (organization) => {
    try {
        //save user account for this organization
        const _temppwd=AuthHelper.GenerateRandomPassword();
        const pwd = Bcrypt.hashSync(_temppwd, 10);
        const userRecord = {
            Email: organization.AdminEmail,
            ContactPhone: organization.AdminPhone,
            Role: organization.ClientType==='Client'?'CSA':'RSA',
            Password: pwd,
            FirstName: organization.AdminFirstName,
            LastName: organization.AdminLastName,
            MiddleName: organization.AdminMiddleName,
            Address: organization.Address,
            PhoneNumber: organization.AdminPhone,
            Country: organization.Country,
            State: organization.State,
            ZipCode: organization.ZipCode,
            City: organization.City,
            IsActive:true
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
        const session =await Mongoose.startSession();
    session.startTransaction();
try {
    const user = new UserRepo(userRecord)
        var createdUser = await user.save()
        organization.Admin = createdUser.id;

        const Organization = new OrganizationRepo(organization);
        await Organization.save();
        const userObj = await UserRepo.findByIdAndUpdate( createdUser.id , {  'Organization':Organization._id});

        // If all queries are successfully executed then session commit the transactions and changes get refelected
        await session.commitTransaction();
        
        // After the successfull transaction sesstion gets ended and connection must be closed
        session.endSession();
   
        
} catch (error) {
    console.log('came here samba',error)
    // If an error occurred, abort the whole transaction and undo any changes that might have happened
    await session.abortTransaction();
    session.endSession();
   
    throw error; // Rethrow so calling function sees error
}
    
        
        var mailObject = SendMail.GetMailObject(
            userRecord.Email,
                  "Oraganization Added",
                  `New Organization has been added. Your login details are given below.
                  Email: ${userRecord.Email},
                  Password: ${_temppwd}
                  <br/>
                  Note: You will be redirected to reset password page on first login
                  `,
                  null,
                  null
                );

        SendMail.SendEmail(mailObject, function (res) {
            console.log(res);
        });
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
        const toupdateOrg = await OrganizationRepo.findOne({ _id: Mongoose.Types.ObjectId(organization.id) });
        Object.assign(toupdateOrg, organization);
        var ff = await toupdateOrg.save();
        //var _g=await Organization.save();
        //save user account for this organization
        const userRecord = {
            Email: organization.AdminEmail,
            ContactPhone: organization.AdminPhone,
            Role: 'Client',
            FirstName: organization.AdminFirstName,
            LastName: organization.AdminLastName,
            MiddleName: organization.AdminMiddleName,
            Address: organization.Address,
            PhoneNumber: organization.AdminPhone,
            Country: organization.Country,
            State: organization.State,
            ZipCode: organization.ZipCode,
            City: organization.City
            
        }
        const user = await UserRepo.findOneAndUpdate({ id: ff.Admin }, { userRecord });
        var mailObject = SendMail.GetMailObject(
            userRecord.Email,
                  "Oraganization Updated",
                  "Thank you",
                  null,
                  null
                );

        SendMail.sendEmail(mailObject, function (res) {
            console.log(res);
        });
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
    const Organizations = await OrganizationRepo.find().sort({ CreatedOn: -1 });
    return Organizations;
};
exports.SuspendOrg = async (client) => {
    const Organizations = await OrganizationRepo.findByIdAndUpdate({_id: Mongoose.Types.ObjectId(client.id)},{IsActive:false})
    var mailObject = SendMail.GetMailObject(
        userRecord.Email,
              "Oraganization Suspended",
              "Thank you",
              null,
              null
            );

    SendMail.sendEmail(mailObject, function (res) {
        console.log(res);
    });
    return {Success:true};
};
exports.ActivateOrg = async (client) => {
    const Organizations = await OrganizationRepo.findByIdAndUpdate({_id:Mongoose.Types.ObjectId(client.id)},{IsActive:true})
    var mailObject = SendMail.GetMailObject(
        userRecord.Email,
              "Oraganization Activated",
              "Thank you",
              null,
              null
            );

    SendMail.sendEmail(mailObject, function (res) {
        console.log(res);
    });
    return {Success:true};
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

exports.IsOrgExist = async (orgName) => {
    const org = await OrganizationRepo.findOne({ 'Name': orgName });
    return org;
}

exports.AddReseller = async (organization) => {
    try {
        //save user account for this organization
        const _temppwd=AuthHelper.GenerateRandomPassword();
        const pwd = Bcrypt.hashSync(_temppwd, 10);
        const userRecord = {
            Email: organization.AdminEmail,
            ContactPhone: organization.AdminPhone,
            Role: organization.ClientType,
            Password: pwd,
            FirstName: organization.AdminFirstName,
            LastName: organization.AdminLastName,
            MiddleName: organization.AdminMiddleName,
            Address: organization.Address,
            PhoneNumber: organization.AdminPhone,
            Country: organization.Country,
            State: organization.State,
            ZipCode: organization.ZipCode,
            City: organization.City,
            IsActive:true
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

        const userObj = await UserRepo.findByIdAndUpdate( createdUser.id , {  'Organization':Organization._id});



        //send email to admin user
        var mailObject = SendMail.GetMailObject(
            userRecord.Email,
                  "Oraganization Added",
                  `New Organization has been added. Your login details are given below.
                  Email: ${userRecord.Email},
                  Password: ${_temppwd}
                  <br/>
                  Note: You will be redirected to reset password page on first login
                  `,
                  null,
                  null
                );

        SendMail.SendEmail(mailObject, function (res) {
            console.log(res);
        });
        return true;
    }
    catch (err) {
        logger.error(err)
        console.log(err);
        throw (err);
    }
}
exports.UpdateReseller = async (organization) => {
    try {
        const toupdateOrg = await OrganizationRepo.findOne({ _id: Mongoose.Types.ObjectId(organization.id) });
        Object.assign(toupdateOrg, organization);
        var ff = await toupdateOrg.save();
        //var _g=await Organization.save();
        //save user account for this organization
        const userRecord = {
            Email: organization.AdminEmail,
            ContactPhone: organization.AdminPhone,
            Role: 'Client',
            FirstName: organization.AdminFirstName,
            LastName: organization.AdminLastName,
            MiddleName: organization.AdminMiddleName,
            Address: organization.Address,
            PhoneNumber: organization.AdminPhone,
            Country: organization.Country,
            State: organization.State,
            ZipCode: organization.ZipCode,
            City: organization.City
        }
        const user = await UserRepo.findOneAndUpdate({ id: ff.Admin }, { userRecord });

        return true;
    }
    catch (err) {
        logger.error(err)
        console.log(err);
        throw (err);
    }
}

