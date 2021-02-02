const DbConnection = require("../Config/DbConfig");
require('dotenv').config();
const Mongoose = require("mongoose");
const Bcrypt = require('bcrypt');
const OrganizationRepo = require('../SchemaModels/OrganizationSchema');
const UserRepo = require('../SchemaModels/UserSchema');
const ModelRepo = require('../SchemaModels/Model');
const CompetencyRepo = require('../SchemaModels/Competency');
const ModelMappingRepo = require('../SchemaModels/ModelMappings');
const CompetencyMappingRepo = require('../SchemaModels/CompetencyMappings');
const RoleRepo = require('../SchemaModels/Roles');
const NoteRepo = require('../SchemaModels/Notes');
const AuthHelper = require('../Helpers/Auth_Helper');
const SendMail = require("../Helpers/mail.js");
const logger = require('../logger');
const ObjectId = Mongoose.Types.ObjectId;
var env = process.env.NODE_ENV || "dev";
var config = require(`../Config/${env}.config`);
var fs = require("fs");
const EvaluationUtils = require("../utils/EvaluationUtils")

exports.CreateOrganization = async (organization) => {
    try {
        //save user account for this organization
        const _temppwd = AuthHelper.GenerateRandomPassword();
        const pwd = Bcrypt.hashSync(_temppwd, 10);
        var AppRoles = await RoleRepo.find({ RoleLevel: { $in: ['4', '5'] } })
        const userRecord = {
            Email: organization.AdminEmail,
            ContactPhone: organization.AdminPhone,
            Role: organization.ClientType === 'Client' ? 'CSA' : 'RSA',
            ApplicationRole:[AppRoles[0]._id,AppRoles[1]._id ],
            SelectedRoles:[AppRoles[0].RoleCode, AppRoles[1].RoleCode],
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
            IsActive: true
        }
        // const UserNameUser = await UserRepo.findOne({ Email: UserModel.Username });
        const EmailUser = await UserRepo.findOne({ Email: userRecord.Email });
        const PhoneNumberUser = await UserRepo.findOne({ PhoneNumber: userRecord.PhoneNumber });

        if (userRecord.Email!="" && EmailUser !== null) { throw Error("Admin Email Already Exist"); }
        if ( userRecord.PhoneNumber && PhoneNumberUser !== null) { throw Error("Admin Phone Number Already Exist"); }


        const organizationName = await OrganizationRepo.findOne({ Name: organization.Name });
        const organizationEmail = await OrganizationRepo.findOne({ Email: organization.Email });
        const organizationPhone = await OrganizationRepo.findOne({ Phone: organization.Phone });

        if (organizationName !== null) { throw Error("Organization Name Already Exist"); }
        if (organizationEmail !== null) { throw Error("Organization Email Already Exist "); }
        if (organization.Phone && organizationPhone !== null) { throw Error("Organization Phone Number Already Exist"); }
        const session = await Mongoose.startSession();
        session.startTransaction();
        try {
            const user = new UserRepo(userRecord)
            var createdUser = await user.save()
            organization.Admin = createdUser.id;

            const Organization = new OrganizationRepo(organization);
            await Organization.save();
            const userObj = await UserRepo.findByIdAndUpdate(createdUser.id, { 'Organization': Organization._id });
           
             if(Organization._id && !organization.IsDraft){
            //if(!organization.IsDraft){
                loadOrganizationModels(Organization._id,organization.EvaluationModels)
            }
            // If all queries are successfully executed then session commit the transactions and changes get refelected
            await session.commitTransaction();

            // After the successfull transaction sesstion gets ended and connection must be closed
            session.endSession();


        } catch (error) {
            console.log('came here samba', error)
            // If an error occurred, abort the whole transaction and undo any changes that might have happened
            await session.abortTransaction();
            session.endSession();

            throw error; // Rethrow so calling function sees error
        }
        if (organization.IsDraft) {
            return true;
        }


        fs.readFile("./EmailTemplates/EmailTemplate.html", async function read(err, bufcontent) {
            var content = bufcontent.toString();

            var des = `Congratulations, you have successfully set up an account for ${organization.Name}
    To view details, click here
    `
            content = content.replace("##FirstName##", "PSA");
            content = content.replace("##ProductName##", config.ProductName);
            content = content.replace("##Description##", des);
            content = content.replace("##Title##", "New Organization added");

            var mailObject = SendMail.GetMailObject(
                config.PSAEmail,
                "New Organization added",
                content,
                null,
                null
            );

            await SendMail.SendEmail(mailObject, function (res) {
                console.log(res);
            });

            var content = bufcontent.toString();

            des = `Congratulations, Organization:  ${organization.Name} has been added successfully. 
    Email: ${userRecord.Email}
    You will receive another email having temporary password to login.
    `

            content = content.replace("##FirstName##", userRecord.FirstName);
            content = content.replace("##ProductName##", config.ProductName);
            content = content.replace("##Description##", des);
            content = content.replace("##Title##", "New Organization added");


            var mailObject = SendMail.GetMailObject(
                userRecord.Email,
                "Oraganization Added",
                content,
                null,
                null
            );

            await SendMail.SendEmail(mailObject, function (res) {
                console.log(res);
            });
            var content = bufcontent.toString();
            des = `Dear ${userRecord.FirstName}, <br>

    Please use below temporary password to login into portal. 
    Password: ${_temppwd}
    <br/>
    You will be redirected to change password upon your First Login.

    
    Please click here to login.
    
    <br> Thank you,
    Administrator
    `

            content = content.replace("##FirstName##", userRecord.FirstName);
            content = content.replace("##ProductName##", config.ProductName);
            content = content.replace("##Description##", des);
            content = content.replace("##Title##", "New Organization added");


            var mailObject = SendMail.GetMailObject(
                userRecord.Email,
                "Organization Created-Temporary Password",
                content,
                null,
                null
            );
            await SendMail.SendEmail(mailObject, function (res) {
                console.log(res);
            });

        });

        return true;
    }
    catch (err) {
        logger.error(err)
        console.log(err);
        throw (err);
    }
}
const loadOrganizationModels = async (OrganizationId,ModelsList)=>{
    let modelMappingList = [];
    let competencyMappingList = [];
    for(var i=0;i<ModelsList.length;i++){
        let modelId = ModelsList[i];
        let _modelDomain = await ModelRepo.findOne({_id:Mongoose.Types.ObjectId(modelId)});
        let {Competencies} = _modelDomain;
        let competencyIdList = [];
        for(var j=0;j<Competencies.length;j++){
            let competency = Competencies[j];
            let competencyDomain = await CompetencyRepo.findOne({"_id":""+competency.toString()},{_id:0});
            if(competencyDomain){
                competencyDomain = competencyDomain.toObject();
                competencyDomain['Organization'] = OrganizationId;
                let id = Mongoose.Types.ObjectId().toString();
                competencyDomain['_id']=id;
                competencyIdList.push(id);
                competencyMappingList.push(competencyDomain);
            }
            
        }
        _modelDomain = _modelDomain.toObject();
        delete _modelDomain._id;
        _modelDomain.Competencies = competencyIdList;
        _modelDomain.Organization = OrganizationId;
        modelMappingList.push(_modelDomain);
    }
    //console.log(modelMappingList);
    //console.log(competencyMappingList);
    //ModelMappingRepo,CompetencyMappingRepo
    await ModelMappingRepo.insertMany(modelMappingList);
    await CompetencyMappingRepo.insertMany(competencyMappingList);
    
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
            Role: organization.ClientType === 'Client' ? 'CSA' : 'RSA',
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
            "Oraganization updated successfully <br> Thank you",
            null,
            null
        );

        await SendMail.SendEmail(mailObject, function (res) {
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
exports.GetAllOrganizations = async (parent) => {
    const Organizations = await OrganizationRepo.find({ ParentOrganization: ObjectId(parent.companyId) }).sort({ CreatedOn: -1 });
    return Organizations;
};
exports.GetAllOrganizationsForReseller = async (parent) => {
    const Organizations = await OrganizationRepo.find({ ParentOrganization: ObjectId(parent.companyId) }).sort({ CreatedOn: -1 });
    return Organizations;
};
exports.SuspendOrg = async (client) => {
    const Organization = await OrganizationRepo.findByIdAndUpdate({ _id: Mongoose.Types.ObjectId(client.id) }, { IsActive: false })
    var mailObject = SendMail.GetMailObject(
        Organization.Email,
        "Oraganization Suspended",
        "Thank you",
        null,
        null
    );

    await SendMail.SendEmail(mailObject, function (res) {
        console.log(res);
    });
    return { Success: true };
};
exports.ActivateOrg = async (client) => {
    const Organization = await OrganizationRepo.findByIdAndUpdate({ _id: Mongoose.Types.ObjectId(client.id) }, { IsActive: true })
    var mailObject = SendMail.GetMailObject(
        Organization.Email,
        "Oraganization Activated",
        "Thank you",
        null,
        null
    );

    await SendMail.SendEmail(mailObject, function (res) {
        console.log(res);
    });
    return { Success: true };
};

exports.AddNotes = async (note) => {
    try {
        const OwnerUserDomain = await UserRepo.findOne({ "_id": note.Owner });
        let evaluationYear = await EvaluationUtils.GetOrgEvaluationYear(OwnerUserDomain.Organization);
        console.log(`evaluationYear = ${evaluationYear}`);
        note.EvaluationYear=evaluationYear;
        const Note = new NoteRepo(note);
        await Note.save();
        if (note.IsDraft=='false') { 
           // const Manager = await UserRepo.findById(accomplishment.ManagerId);
           const emp = await UserRepo.findById(note.Owner);
           this.sendEmailOnNoteCreate(emp);
           }

        
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
exports.GetAllNotes = async (data) => {
    

    const Note = await NoteRepo.find(
        { 'Owner': data.empId }
    ).populate('DiscussedWith')
    .sort({ UpdatedOn: -1 });
    return Note;
};


exports.UpdateNote = async (noteModel) => {

   try  {
    noteModel.Action = 'Updated';
    noteModel.UpdatedOn = new Date();
    const note= await NoteRepo.findByIdAndUpdate(noteModel.NoteId, noteModel);
    if(noteModel.isFirstTimeCreateing){
        const emp = await UserRepo.findById(note.Owner);
        this.sendEmailOnNoteCreate(emp);
    }

   // this.addNoteTrack(noteModel);


    return true;
   }catch(err){
    logger.error(err)

    console.log(err);
    throw (err);

   }

};

exports.IsOrgExist = async (orgName) => {
    const org = await OrganizationRepo.findOne({ 'Name': orgName });
    return org;
}

exports.AddReseller = async (organization) => {
    try {
        //save user account for this organization
        const _temppwd = AuthHelper.GenerateRandomPassword();
        const pwd = Bcrypt.hashSync(_temppwd, 10);
        const userRecord = {
            Email: organization.AdminEmail,
            ContactPhone: organization.AdminPhone,
            Role: 'RSA',
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
            IsActive: true
        }
        // const UserNameUser = await UserRepo.findOne({ Email: UserModel.Username });
        const EmailUser = await UserRepo.findOne({ Email: userRecord.Email });
        const PhoneNumberUser = await UserRepo.findOne({ PhoneNumber: userRecord.PhoneNumber });

        if (userRecord.Email!="" && EmailUser !== null) { throw Error("Admin Email Already Exist"); }
        if (userRecord.PhoneNumber  && PhoneNumberUser !== null) { throw Error("Admin Phone Number Already Exist"); }


        const organizationName = await OrganizationRepo.findOne({ Name: organization.Name });
        const organizationEmail = await OrganizationRepo.findOne({ Email: organization.Email });
        const organizationPhone = await OrganizationRepo.findOne({ Phone: organization.Phone });

        if (organizationName !== null) { throw Error("Organization Name Already Exist"); }
        if (organizationEmail !== null) { throw Error("Organization Email Already Exist "); }
        if ( organization.Phone && organizationPhone !== null) { throw Error("Organization Phone Number Already Exist"); }
        const session = await Mongoose.startSession();
        session.startTransaction();
        try {
          
            const user = new UserRepo(userRecord)
            var createdUser = await user.save()
            organization.Admin = createdUser.id;

            const Organization = new OrganizationRepo(organization);
            await Organization.save();
            const userObj = await UserRepo.findByIdAndUpdate(createdUser.id, { 'Organization': Organization._id });

            // If all queries are successfully executed then session commit the transactions and changes get refelected
            await session.commitTransaction();

            // After the successfull transaction sesstion gets ended and connection must be closed
            session.endSession();


        } catch (error) {
            console.log('came here samba', error)
            // If an error occurred, abort the whole transaction and undo any changes that might have happened
            await session.abortTransaction();
            session.endSession();

            throw error; // Rethrow so calling function sees error
        }
        if (organization.IsDraft) {
            return true;
        }


        fs.readFile("./EmailTemplates/EmailTemplate.html", async function read(err, bufcontent) {
            var content = bufcontent.toString();

            var des = `Congratulations, you have successfully set up an account for ${organization.Name}
    To view details, click here
    `
            content = content.replace("##FirstName##", "PSA");
            content = content.replace("##ProductName##", config.ProductName);
            content = content.replace("##Description##", des);
            content = content.replace("##Title##", "New Organization added");

            var mailObject = SendMail.GetMailObject(
                config.PSAEmail,
                "New Organization added",
                content,
                null,
                null
            );

            await SendMail.SendEmail(mailObject, function (res) {
                console.log(res);
            });

            var content = bufcontent.toString();

            des = `Congratulations, Organization:  ${organization.Name} has been added successfully. 
    Email: ${userRecord.Email}
    You will receive another email having temporary password to login.
    `

            content = content.replace("##FirstName##", userRecord.FirstName);
            content = content.replace("##ProductName##", config.ProductName);
            content = content.replace("##Description##", des);
            content = content.replace("##Title##", "New Organization added");


            var mailObject = SendMail.GetMailObject(
                userRecord.Email,
                "Oraganization Added",
                content,
                null,
                null
            );

            await SendMail.SendEmail(mailObject, function (res) {
                console.log(res);
            });
            var content = bufcontent.toString();

            des = `Dear ${userRecord.FirstName}, <br>
    Please use below temporary password to login into portal. 
    Password: ${_temppwd}
    <br/>
    You will be redirected to change password upon your First Login.
    Please click here to login.    
    <br> Thank you,
    Administrator
    `
            content = content.replace("##FirstName##", userRecord.FirstName);
            content = content.replace("##ProductName##", config.ProductName);
            content = content.replace("##Description##", des);
            content = content.replace("##Title##", "New Organization added");

            var mailObject = SendMail.GetMailObject(
                userRecord.Email,
                "Organization Created-Temporary Password",
                content,
                null,
                null
            );
            await SendMail.SendEmail(mailObject, function (res) {
                console.log(res);
            });

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
            Role: 'RSA',
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






exports.sendEmailOnNoteCreate = async (OwnerInfo) => {

    // if ( OwnerInfo) {
    if (OwnerInfo) {
        
        // send email to User 

        fs.readFile("./EmailTemplates/EmailTemplate.html", async function read(err, bufcontent) {
            var content = bufcontent.toString();
    
            let des= `The note has been added successfully. <br>
            To view details, <a href="${config.APP_BASE_URL}#/employee/private-notes-list">click here</a>.
               `
            content = content.replace("##FirstName##",OwnerInfo.FirstName);
            content = content.replace("##ProductName##", config.ProductName);
            content = content.replace("##Description##", des);
            content = content.replace("##Title##", "Note added successfully");

        var mailObject = SendMail.GetMailObject(
            OwnerInfo.Email,
                  "Note added successfully",
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