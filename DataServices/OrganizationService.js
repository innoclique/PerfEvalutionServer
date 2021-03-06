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
const RsaAccountDetailsSchema = require('../SchemaModels/RsaAccountDetailsSchema');
const RatingScores = require('../SchemaModels/RatingScore');
const RoleRepo = require('../SchemaModels/Roles');
const NoteRepo = require('../SchemaModels/Notes');
const AuthHelper = require('../Helpers/Auth_Helper');
const SendMail = require("../Helpers/mail.js");
const logger = require('../logger');
const ObjectId = Mongoose.Types.ObjectId;
var env = process.env.NODE_ENV || "dev";
var config = require(`../Config/${env}.config`);
var fs = require("fs");
const EvaluationUtils = require("../utils/EvaluationUtils");

exports.CreateOrganization = async (organization) => {
    try {
        //save user account for this organization
        let allowPhone=false;
        let allowAdminPhone=false;
        //const _temppwd = AuthHelper.GenerateRandomPassword();
        //const pwd = Bcrypt.hashSync(_temppwd, 10);
        var AppRoles = await RoleRepo.find({ RoleLevel: { $in: ['4', '5','2'] } })
        const userRecord = {
            Email: organization.AdminEmail,
            ContactPhone: organization.AdminPhone,
            Role: organization.ClientType === 'Client' ? 'CSA' : 'RSA',
            ApplicationRole:[AppRoles[0]._id,AppRoles[1]._id,AppRoles[2]._id ],
            SelectedRoles:[AppRoles[0].RoleCode, AppRoles[1].RoleCode, AppRoles[2].RoleCode],
            //Password: pwd,
            FirstName: organization.AdminFirstName,
            LastName: organization.AdminLastName,
            MiddleName: organization.AdminMiddleName,
            Address: organization.Address,
            PhoneNumber: organization.AdminPhone,
            Country: organization.Country,
            State: organization.State,
            ZipCode: organization.ZipCode,
            City: organization.City,
            IsActive: false
        }
        // const UserNameUser = await UserRepo.findOne({ Email: UserModel.Username });

        const organizationPhone = await OrganizationRepo.findOne({ Phone: organization.Phone }).sort({ CreatedOn: -1 });
        if (organization.Phone && organizationPhone !== null) { 

            if(organizationPhone.ClientType == 'Reseller')
            allowPhone=true;

            let _PhoneNumberUser = await UserRepo.findOne({Organization:organizationPhone._id, PhoneNumber: userRecord.PhoneNumber });
            if(organizationPhone.ClientType == 'Reseller' && _PhoneNumberUser!==null)
            allowAdminPhone=true;
           
        }
        const EmailUser = await UserRepo.findOne({ Email: userRecord.Email });
        const PhoneNumberUser = await UserRepo.findOne({ PhoneNumber: userRecord.PhoneNumber });

        if (userRecord.Email!="" && EmailUser !== null) { throw Error("Admin Email Already Exist"); }
        if ( userRecord.PhoneNumber && PhoneNumberUser !== null) { 
            if(allowAdminPhone==false)
            throw Error("Admin Phone Number Already Exist"); 
        }


        const organizationName = await OrganizationRepo.findOne({ Name: organization.Name });
        const organizationEmail = await OrganizationRepo.findOne({ Email: organization.Email });
        // const organizationPhone = await OrganizationRepo.findOne({ Phone: organization.Phone }).sort({ CreatedOn: -1 });

        if (organizationName !== null) { throw Error("Organization Name Already Exist"); }
        if (organizationEmail !== null) { throw Error("Organization Email Already Exist "); }
        if (organization.Phone && organizationPhone !== null) { 
            //if(organizationPhone.ClientType == 'Client')
            if(allowPhone==false)
            throw Error("Organization Phone Number Already Exist"); 
        }
        const session = await Mongoose.startSession();
        session.startTransaction();
        try {
            const user = new UserRepo(userRecord)
            var createdUser = await user.save()
            organization.Admin = createdUser.id;

            const _Organization = new OrganizationRepo(organization);
            let _orgDomain = await _Organization.save();
            const userObj = await UserRepo.findByIdAndUpdate(createdUser.id, { 'Organization': _Organization._id });
            let updatedBy = await UserRepo.findById(organization.CreatedBy);
            console.log(`${_orgDomain._id} : ${organization.IsDraft}`);
             if(_orgDomain._id && !organization.IsDraft){
                 console.log("Creating models");
                  await loadOrganizationRatingScores(_orgDomain._id);
                 if (updatedBy.Role && updatedBy.Role=="RSA") {
                    await updateResellerAccountDetails(organization)
                 }
                await loadOrganizationModels(_orgDomain._id,organization.EvaluationModels)
            }else{
                console.log("Models are not created ");
            }
            // If all queries are successfully executed then session commit the transactions and changes get refelected
            await session.commitTransaction();

            // After the successfull transaction sesstion gets ended and connection must be closed
            session.endSession();



            
            if (updatedBy.Role=="PSA") {
                
            
            let mailBody= "Dear " + updatedBy.FirstName +",<br><br>"
            mailBody = mailBody + "Congratulations, you have successfully set up an account for <b>" + organization.Name  + "</b>.<br><br>"
            mailBody=mailBody + "<br>To view details  "+ " <a href=" +config.APP_BASE_REDIRECT_URL+"=/psa/list" +">click here</a> <br><br> Thank you,<br> " + config.ProductName + " Administrator<br>"
            
    
    
            var mailObject = SendMail.GetMailObject(
                updatedBy.Email,
                "Client successfully added",
                mailBody,
                null,
                null
            );
    
            await SendMail.SendEmail(mailObject, function (res) {
                console.log(res);
            });
    
        }


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


        

        return true;
    }
    catch (err) {
        logger.error(err)
        console.log(err);
        throw (err);
    }
}
const updateResellerAccountDetails = async (Organization)=>{
    console.log("Inside:updateResellerAccountDetails");
    let {UsageType,ParentOrganization,Range} = Organization;
    let whereObj = {UsageType};
    whereObj.RangeId = Range;
    whereObj.Organization = ParentOrganization;
    console.log(whereObj);
    await RsaAccountDetailsSchema.findOneAndUpdate(whereObj,{ $inc: { Balance: -1}});

}
const loadOrganizationModels = async (OrganizationId,ModelsList)=>{
    console.log("Inside:loadOrganizationModels");
    let modelMappingList = [];
    let competencyMappingList = [];
    for(var i=0;i<ModelsList.length;i++){
        let modelId = ModelsList[i];
        let _modelDomain = await ModelRepo.findOne({_id:Mongoose.Types.ObjectId(modelId)});
        let {Competencies} = _modelDomain;
        let competencyIdList = [];
        for(var j=0;j<Competencies.length;j++){
            let competency = Competencies[j];
            console.log(`competency.toString() : `+competency.toString())
            let competencyDomain = await CompetencyRepo.findOne({"_id":""+competency.toString()},{_id:0});
            console.log(competencyDomain)
            if(competencyDomain){
                competencyDomain = competencyDomain.toObject();
                //delete competencyDomain._id;
                competencyDomain['Organization'] = OrganizationId;
                let id = Mongoose.Types.ObjectId().toString();
                competencyDomain['_id']=id;
                competencyIdList.push(id);
                competencyMappingList.push(competencyDomain);
            }
            
        }
        _modelDomain = _modelDomain.toObject();
        delete _modelDomain._id;
        _modelDomain._id = Mongoose.Types.ObjectId();
        _modelDomain.Competencies = competencyIdList;
        _modelDomain.Organization = OrganizationId;
        modelMappingList.push(_modelDomain);
    }
    //console.log(modelMappingList);
    console.log(competencyMappingList.length);
    //ModelMappingRepo,CompetencyMappingRepo
    await ModelMappingRepo.insertMany(modelMappingList);
    await CompetencyMappingRepo.insertMany(competencyMappingList);
    await updateOrganizationModels(OrganizationId,modelMappingList);

    
}
const updateOrganizationModels = async (OrganizationId,modelMappingList)=>{
    let modelsArray = modelMappingList.map(m=>""+m._id);
    await OrganizationRepo.update({_id:OrganizationId},{$set:{EvaluationModels:modelsArray}})
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
        let updatedBy = await UserRepo.findById(organization.UpdatedBy);
        if (updatedBy.Role=="PSA") {
            
        
        let mailBody= "Dear " + updatedBy.FirstName +",<br><br>"
        mailBody = mailBody + "You have successfully updated the details for <b>" + organization.Name  + "</b>.<br><br>"
        mailBody=mailBody + "<br>To view details  "+ " <a href=" +config.APP_BASE_REDIRECT_URL+"=/psa/list" +">click here.</a> <br><br>Thank you,<br> " + config.ProductName + " Administrator<br>"
        


        var mailObject = SendMail.GetMailObject(
            updatedBy.Email,
            "Client successfully updated",
            mailBody,
            null,
            null
        );

        await SendMail.SendEmail(mailObject, function (res) {
            console.log(res);
        });

    }
        return true;
    }
    catch (err) {
        logger.error(err)
        console.log(err);
        throw (err);
    }
}


exports.getOrgProfile = async (req) => {
    try {
        console.log('inside getOrgProfile :: ', req);
        var org = await OrganizationRepo.findOne({ _id: Mongoose.Types.ObjectId(req.orgId) });
        if (!org.IsProfileUpToDate) {
            org.IsDraft = true;
        }
        return org;
    } catch (error) {
        logger.error(err)
        console.log(err);
        throw (err);
    }
}

exports.UpdateOrgProfile = async (organization) => {
    try {
        if (organization.IsDraft) {
            var toupdateOrg = await OrganizationRepo.findOne({ _id: Mongoose.Types.ObjectId(organization.id) });
            toupdateOrg.profile = organization;
            toupdateOrg.IsProfileUpToDate = false;
            await OrganizationRepo.update({ _id: Mongoose.Types.ObjectId(organization.id) }, toupdateOrg);
            return true;
        } else {
            console.log( 'inside if ',organization);
            organization.profile = null;
            organization.IsProfileUpToDate = true;
            if (organization.ClientType === 'Client') {
                const toupdateOrg = await OrganizationRepo.findOne({ _id: Mongoose.Types.ObjectId(organization.id) });
                Object.assign(toupdateOrg, organization);
                var ff = await toupdateOrg.save();
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
                await UserRepo.findOneAndUpdate({ id: ff.Admin }, { userRecord });
            } else {
                const toupdateOrg = await OrganizationRepo.findOne({ _id: Mongoose.Types.ObjectId(organization.id) });
                Object.assign(toupdateOrg, organization);
                var ff = await toupdateOrg.save();
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
                await UserRepo.findOneAndUpdate({ id: ff.Admin }, { userRecord });
            }
            const user = await UserRepo.findOne({ Email: organization.AdminEmail });
            let mailBody = "Dear " + user.FirstName + ",<br><br>"
            mailBody = mailBody + "You have successfully updated your organization’s profile." + "<br><br>"
             if (organization.ClientType === 'Client') {
            mailBody = mailBody + "<br>To view details  " + " <a href=" + config.APP_BASE_REDIRECT_URL+"=/csa/profile" + ">click here</a> to login<br><br>Thank you,<br>Administrator " + config.ProductName + "<br>"
             }else{
                mailBody = mailBody + "<br>To view details  " + " <a href=" + config.APP_BASE_REDIRECT_URL+"=/rsa/profile" + ">click here</a> to login<br><br>Thank you,<br>Administrator " + config.ProductName + "<br>"
             }
            var mailObject = SendMail.GetMailObject(
                user.Email,
                "Organization’s Profile updated successfully",
                mailBody
                ,
                null,
                null
            );
            await SendMail.SendEmail(mailObject, function (res) {
                console.log("org profile updated mail :: ", res);
            });
            return true;
        }
    }
    catch (err) {
        logger.error(err)
        console.log(err);
        throw (err);
    }
}




exports.GetOrganizationDataById = async (Id) => {
    const Organization = await OrganizationRepo.findById(Id);
    if(Organization && Organization.EvaluationModels && Organization.EvaluationModels.length>0){
        let modelNames = [];
        for(var i=0;i<Organization.EvaluationModels.length;i++){
            console.log(Organization.EvaluationModels[i]);
            let modelMappingRepo = await ModelMappingRepo.findOne({_id:ObjectId(Organization.EvaluationModels[i])});
            let {Name} = modelMappingRepo;
            modelNames.push(Name);
        }
        Organization.EvaluationModels = modelNames;
    }
    return Organization;
};
exports.GetAllOrganizations = async (parent) => {

    try {


        var allReseller = await OrganizationRepo.find({ ClientType: "Client" });
        var Organizations = await OrganizationRepo.find({ ParentOrganization: ObjectId(parent.companyId) }).sort({ CreatedOn: -1 });
    
        return Organizations.map(e => {
            let licenceType = allReseller.filter(k => k.ParentOrganization && k.ParentOrganization.toString() == e._id.toString() && k.UsageType == 'License').length;
            let empType = allReseller.filter(k => k.ParentOrganization && k.ParentOrganization.toString() == e._id.toString() && k.UsageType == 'Employees').length;
            e.LicenceTypeCount = licenceType;
            e.EmpTypeCount = empType;
            return e;
        });

    } catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);

    }
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
    const note= await NoteRepo.findByIdAndUpdate(noteModel.NoteId, noteModel).populate('DiscussedWith');
    const emp = await UserRepo.findById(note.Owner);
    if(noteModel.isFirstTimeCreateing){
        this.sendEmailOnNoteCreate(emp);
    }
    if(noteModel.IsDraft=='false')
    this.sendEmailOnNoteUpdate(emp,note);
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


        /*fs.readFile("./EmailTemplates/EmailTemplate.html", async function read(err, bufcontent) {
            var content = bufcontent.toString();

            var des = "Congratulations, you have successfully set up an account for " + organization.Name + "<br><br> "
            des = des + " <a href="+ config.APP_URL + ">+Click here to login.<br>   Thank you,<br>Administrator" + config.ProductName + "<br>"
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

            des = "Dear " + userRecord.FirstName +", <br> Please use below temporary password to login into portal. <br><br>Password: "+ _temppwd+"<br><br>"
des = des + "You will be redirected to change password upon your First Login.  "
 des = des + "Please " +" <a href="+ config.APP_URL + ">+Click here to login.<br>   Thank you,<br>Administrator" + config.ProductName + "<br>"

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

        });*/

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






exports.sendEmailOnNoteUpdate = async (OwnerInfo,note) => {

    // if ( OwnerInfo) {
    if (OwnerInfo && note) {
        
        // send email to User 

        fs.readFile("./EmailTemplates/EmailTemplate.html", async function read(err, bufcontent) {
            var content = bufcontent.toString();
    
            let des= `You have successfully updated a note. <br> <br> ${note.DiscussedWith.FirstName} <br>  ${note.Note} <br> <br>
            To view details, <a href="${config.APP_BASE_REDIRECT_URL}=/employee/private-notes-list">click here</a>.
               `
            content = content.replace("##FirstName##",OwnerInfo.FirstName);
            content = content.replace("##ProductName##", config.ProductName);
            content = content.replace("##Description##", des);
            content = content.replace("##Title##", "Note updated successfully");

        var mailObject = SendMail.GetMailObject(
            OwnerInfo.Email,
                  "Note updated successfully",
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

const loadOrganizationRatingScores = async (OrganizationId)=>{
    console.log("Inside:loadOrganizationRatingScores : ",OrganizationId,config.ProductOrgId);
    var ratings = [];
        let _psaRatingScores = await RatingScores.find({'organization':Mongoose.Types.ObjectId(config.ProductOrgId)});
        
        for(var j=0;j<_psaRatingScores.length;j++){
            let rating = _psaRatingScores[j];
           
            if(rating){
                rating = rating.toObject();
                delete rating._id;
                rating['organization'] = Mongoose.Types.ObjectId(OrganizationId);
                ratings.push(rating);
            }
            
        }
       
    await RatingScores.insertMany(ratings);
    
}

exports.sendEmailOnNoteCreate = async (OwnerInfo) => {

    // if ( OwnerInfo) {
    if (OwnerInfo) {
        
        // send email to User 

        fs.readFile("./EmailTemplates/EmailTemplate.html", async function read(err, bufcontent) {
            var content = bufcontent.toString();
    
            let des= `The note has been added successfully. <br>
            To view details, <a href="${config.APP_BASE_REDIRECT_URL}=/employee/private-notes-list">click here</a>.
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
