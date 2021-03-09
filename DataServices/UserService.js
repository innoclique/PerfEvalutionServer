const DbConnection = require("../Config/DbConfig");
require('dotenv').config();
const Mongoose = require("mongoose");
const Bcrypt = require('bcrypt');
const UserRepo = require('../SchemaModels/UserSchema');
const RoleRepo = require('../SchemaModels/Roles');
const UserSettingsRepo = require('../SchemaModels/UserAppSettings');
const AuthHelper = require('../Helpers/Auth_Helper');
const Messages = require('../Helpers/Messages');
const SendMail = require("../Helpers/mail.js");
var logger = require('../logger');
var permissions=require('../SchemaModels/Permissions');
const Permissions = require("../SchemaModels/Permissions");
const { messages } = require("../Helpers/Messages");
const OrganizationRepo = require('../SchemaModels/OrganizationSchema');

var env = process.env.NODE_ENV || "dev";
var config = require(`../Config/${env}.config`);
const {FindPaymentReleaseByOrgId} = require('../DataServices/PaymentConfigService');
const SubscriptionsSchema = require('../SchemaModels/SubscriptionsSchema');
const moment = require('moment');
exports.GetAllUsers = async () => {


    const Users = await UserRepo.find();

    return Users;
};

exports.GetUserById = async (Id) => {

    const User = await UserRepo.findById(Id);

    return User;


};

exports.GetUserByEmail = async (Email) => {

    return await UserRepo.findOne({ Email });

};

exports.GetUserByEmail = async (email) => {
    return await UserRepo.findOne({ Email: email });
};


exports.GetUserByPhoneNumber = async (PhoneNumber) => {
    return await UserRepo.findOne({ PhoneNumber: PhoneNumber });
};


exports.ManageUserRole = async (id, Model) => {
    const User = await UserRepo.findById(id);
    if (User == null) { throw Error("User Not Found"); }
    User.Role = Model.Role;
    User.save();

};


exports.CreateAccount = async (UserModel) => {

    try {

        const UserNameUser = await UserRepo.findOne({ UserName: UserModel.Username });
        const EmailUser = await UserRepo.findOne({ Email: UserModel.Email });
        const PhoneNumberUser = await UserRepo.findOne({ PhoneNumber: UserModel.PhoneNumber });

        if (EmailUser !== null) { throw Error("Email Already Exist"); }

        if (UserNameUser !== null) { throw Error("UserName Already Exist "); }

        if (PhoneNumberUser !== null) { throw Error("Phone Number Already Exist"); }
        const User = new UserRepo(UserModel);

        User.Password = Bcrypt.hashSync(UserModel.Password, 10);

        await User.save();

    }
    catch (err) {
        console.log(err);
        throw (err);
    }


}
const checkPayment = async (User)=>{
    console.log("Inside:checkPayment");
    console.log(User.Role);
    let {Organization} = User;
    let organizationDomain=await OrganizationRepo.findOne({_id:Organization._id}).populate("ParentOrganization");
    console.log(organizationDomain.ParentOrganization.ClientType);
    if(organizationDomain && organizationDomain.ParentOrganization && organizationDomain.ParentOrganization.ClientType){
        if(organizationDomain.ParentOrganization.ClientType === "Reseller" && User.Role ==='CSA'){
            return {
                initialPayment:true,
                renewal:true
            };
        }
    }
        
    let options = {
        Organization:Organization._id,
        "Type" : "Initial",
        "Status" : "Complete",
    };
    let paymentConfig = await FindPaymentReleaseByOrgId(options);
    if(!paymentConfig){
        if(User.Role!='CSA' && User.Role!='RSA'){
            throw "Account suspended";
        }
        return {
            initialPaymentRequired:true,
            renewalRequired:false
        };
        
    }else{
        let Subscriptions = await SubscriptionsSchema.findOne({Organization:Organization._id}).sort({_id:-1});
        if(!Subscriptions){
            if(User.Role!='CSA' && User.Role!='RSA'){
                throw "Account suspended";
            }
            return {
                initialPaymentRequired:false,
                renewalRequired:true
            };
        }else{
            let {ValidTill} = Subscriptions;
            let validTillMoment = moment(ValidTill);
            let isBeforeDuedate = validTillMoment.isBefore(moment())
            if(!Subscriptions.IsActive || isBeforeDuedate){
                if(User.Role!='CSA' && User.Role!='RSA'){
                    throw "Account suspended";
                }
                return {
                    initialPaymentRequired:false,
                    renewalRequired:true
                };
            }else{
                return {
                    initialPayment:true,
                    renewal:true
                };
            }
        }
    }
}
exports.Authenticate = async (LoginModel) => {
    Email = LoginModel.Email;
    Password = LoginModel.Password;
    console.log('came into login method', Email)
    try {        
        const User = await  UserRepo.findOne({ 'Email': Email }) .populate('ThirdSignatory CopiesTo DirectReports Manager Organization JobLevel').select("+Password");
        let payInfo;
        if(User && User.Role!='PSA'){
            payInfo = await checkPayment(User);
        }
        if (User && Bcrypt.compareSync(Password, User.Password)) {
            if (!User.IsActive)  throw "User not found";
            var AccesToken = AuthHelper.CreateShortAccesstoken(User);
            if (User.IsLoggedIn) {
                logger.info(`User ::${User.Email} has loggedin already`);
                return {
                    Valid: false,
                    ID: User._id,
                    Error: 'DuplicateSession',
                    UserName: User.UserName,
                    AccessToken: AccesToken,
                    User: User
                };
            }
            AccesToken = AuthHelper.CreateAccesstoken(User);
            const RefreshToken = AuthHelper.CreateRefreshtoken(User);
            User.RefreshToken = RefreshToken;
            User.LastLogin = Date();
            User.IsLoggedIn = true;
            User.save();
            
            var permissions=await RoleRepo.findOne({RoleCode:User.Role}).populate("Permissions")
            const adminId=User.ParentUser?User.ParentUser:User._id;
            var OrganizationData;
            if(User.Role=='PSA'){
             OrganizationData=await OrganizationRepo.findOne({Admin:adminId})
            }else{
             OrganizationData=await OrganizationRepo.findOne({Admin:adminId, IsActive:true})
            }
            if (User.Role!='PSA' && OrganizationData==null)  throw "User not found";
            return {
                ID: User._id,SelectedRoles:User.SelectedRoles, Role: User.Role, Email: User.Email,
                UserName: User.UserName, AccessToken: AccesToken,
                RefreshToken: User.RefreshToken, IsPswChangedOnFirstLogin: User.IsPswChangedOnFirstLogin,
                User: User,
                Permissions:permissions.Permissions||[],
                NavigationMenu:permissions.NavigationMenu||[],
                OrganizationData:OrganizationData,
                pi:payInfo
            };
        } else {
            console.log('not found')
            throw "Invalid Credentials";
        }
    } catch (error) {
        console.log(error);
        logger.error(error);
        throw error;
    }

}

exports.AuthenticateAdmin = async (LoginModel) => {
    try {
        Email = LoginModel.Email;
        Password = LoginModel.Password;

        const User = await UserRepo.findOne({ Email: Email }).select("+Password");

        if (User && Bcrypt.compareSync(Password, User.Password)) {

            if (User.Role === "User") { throw Error("Invalid Login"); }
            const AccesToken = AuthHelper.CreateAccesstoken(User);
            const RefreshToken = AuthHelper.CreateRefreshtoken(User);
            User.RefreshToken = RefreshToken;
            User.LastLogin = Date();
            User.save();

            return { ID: User._id, Role: User.Role, Email: User.Email, UserName: User.UserName, AccessToken: AccesToken, RefreshToken: User.RefreshToken };
        }
    }

    catch (err) {
        console.log(err);
    }

}

exports.SendResetPsw = async (LoginModel) => {
    Email = LoginModel.Email;
    const User = await UserRepo.findOne({ 'Email': Email }).select("+Password");
//Bcrypt.hashSync(resetModel.password, 10)
    let pwd=AuthHelper.GenerateRandomPassword();
    let cPass = Bcrypt.hashSync(pwd, 10)
    if (User && true) {

        User.Password = cPass;
        User.IsPswChangedOnFirstLogin = false;
        User.IsActive = false;
        User.IsLoggedIn = false;
        User.save();
        mailObject = SendMail.GetMailObject(
            Email,
            "Password Reset",
            `Hey!  Your password has been updated. <br>
            Here are the details of Password : ${pwd}    `,
            null,
            null
        );

         await SendMail.SendEmail(mailObject, function (res) {
             console.log(res);
         });

        return { status: "success" };
    } else { throw Error("No user found"); }


}


// update user password by id
exports.UpdatePassword = async (resetModel) => {
    id = resetModel.userId;

    const User = await UserRepo.findById(id).select("+Password");
    if (User) {
        if (!Bcrypt.compareSync(resetModel.oldPassword, User.Password)) {
            throw Error("Invalid old password");
        }
        await   User.updateOne({$set:{
                IsPswChangedOnFirstLogin : true,
                IsActive :true,
                PswUpdatedOn : new Date(),
                Password : Bcrypt.hashSync(resetModel.password, 10)
        }})

        if (resetModel.isChangePassword) {
            const curUser = await UserRepo.findById(id);

            if (curUser) {
                let mailBody = "Dear " + curUser.FirstName + ", <br><br>"
                mailBody = mailBody + "Your " + config.ProductName + " password was changed successfully. If you did not make this change, please contact your administrator immediately.<br><br>"
                mailBody = mailBody + "<br>To login," + " <a href=" + config.APP_BASE_REDIRECT_URL + "=/dashboard" + ">click here</a><br><br> Thank you,<br> " + config.ProductName + " Administrator<br><br>"

                var mailObject = SendMail.GetMailObject(
                    curUser.Email,
                    config.ProductName + " Password Changed",
                    mailBody,
                    null,
                    null
                );

                await SendMail.SendEmail(mailObject, function (res) {
                    console.log(res);
                });
            }
        }

        return { status: "success" };
    } else { throw Error("No user found"); }



}


exports.ManageAccount = async (id, Model) => {

    const USertoUpdate = await UserRepo.findById(id).select("+Password");

    if (USertoUpdate === null) { throw Error("User Not Found"); }

    if (Bcrypt.compareSync(Model.Old_Password, USertoUpdate.Password) == false) { throw Error("Invalid Password"); }

    const Hashpassword = Bcrypt.hashSync(Model.Password, 10);

    USertoUpdate.Password = Hashpassword;
    USertoUpdate.LastUpdated = Date();
    USertoUpdate.save();


}

exports.ManageProfile = async (id, Model) => {


    const USertoUpdate = await UserRepo.findById(id);

    if (USertoUpdate === null) { throw Error("User Not Found"); }

    const UserName = await UserRepo.findOne({ UserName: Model.UserName });

    if (UserName !== null && USertoUpdate.UserName !== Model.UserName) { throw Error("User Name Already exist"); }

    USertoUpdate.FirstName = Model.FirstName;
    USertoUpdate.LastName = Model.LastName;
    USertoUpdate.UserName = Model.UserName;
    USertoUpdate.Address = Model.Address;
    USertoUpdate.PhoneNumber = Model.PhoneNumber
    USertoUpdate.UpdatedDate = Date();
    USertoUpdate.save();



}


exports.DeleteUser = async (id) => {
    const User = await UserRepo.findById(id);
    if (User == null) { throw Error("User Not Found"); }
    User.remove();
};

exports.Log_Out = async (id) => {
    const UsertoLogOut = await UserRepo.findById(id);
    if (UsertoLogOut === null) { throw Error('User Not Found '); } else {
        UsertoLogOut.RefreshToken = null;
        UsertoLogOut.IsLoggedIn = false;
        UsertoLogOut.save();

        return ("Logout");


    }

}
/**to add user application level settings */
exports.AddAppSettings = async (appSettings) => {
    try {
        const settings = new UserSettingsRepo(appSettings);
        await settings.save();
    } catch (error) {

        console.log(err);
        throw (err);
    }


}

/**to add user application level settings */
exports.ConfirmTnC = async (id) => {
    const userTnC = await UserRepo.findById(id);
    if (userTnC === null) { throw Error('User Not Found '); } else {
     await   userTnC.updateOne({$set:{TnCAccepted:true,TnCAcceptedOn:new Date()}})
        //userTnC.TnCAccepted = true;
        //userTnC.TnCAcceptedOn = new Date();
       //await userTnC.save();
        return await UserRepo.findById(id).populate('ThirdSignatory CopiesTo DirectReports Manager Organization JobLevel');
    }

}

exports.CreateEmployee = async (employee) => {
    try {
//console.log(employee)
        const EmployeeName = await UserRepo.findOne({ FirstName: employee.FirstName, LastName: employee.LastName });
        const EmployeeEmail = await UserRepo.findOne({ Email: employee.Email });
        const EmployeePhone = await UserRepo.findOne({ Phone: employee.PhoneNumber });

      //  if (EmployeeName !== null) { throw Error("Employee Name Already Exist"); }

        if (employee.Email!="" && EmployeeEmail !== null) { throw Error("Employee Email Already Exist "); }

        //if (employee.PhoneNumber!="" && EmployeePhone !== null) { throw Error("Employee Phone Number Already Exist"); }

        // need to do some other impl should not use ids
        const EvalAdminFound = await UserRepo.findOne({ ParentUser: employee.ParentUser, ApplicationRole: Messages.constants.EA_ID });

     

        if (EvalAdminFound) {
console.clear();
            console.log("INNNNNNNNNNNNNNN", EvalAdminFound.Email)
          //  this.sendEmailCreateToEA()
        }
        else if (!employee.IgnoreEvalAdminCreated && employee.ApplicationRole == Messages.constants.EO_ID && EvalAdminFound == null) {
            throw Error("Evaluation Administrator Not Found");
        }
        var _temppwd="";
        if(employee.IsDraft=='false'){
         _temppwd=AuthHelper.GenerateRandomPassword()
        employee.Password = Bcrypt.hashSync(_temppwd, 10);
        }

        employee.CreatedOn = new Date();
        employee.UpdatedOn = new Date();
        const newemp = new UserRepo(employee);
        await newemp.save();

        //updating manager dir repotes
        const managerObj = await UserRepo.findOne({ _id: employee.Manager });
        if(managerObj.DirectReports!=null){
       await UserRepo.update({ _id: employee.Manager }, {$push:{'DirectReports':newemp._id}});
        } else {
            let dirReport=[];
             dirReport.push(newemp._id);
         await UserRepo.update({ _id: employee.Manager }, {$set:{'DirectReports':dirReport }});
        }

        //send email to employee
         //send email to  user
         if(employee.IsDraft=='false'){
             this.sendEmpCreateEmails(newemp,_temppwd);
        
        }
        
        return true;
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


}



exports.UpdateEmployee = async (employee) => {
    try {
        let empId = employee._id;
        const EmployeeName = await UserRepo.findOne({ FirstName: employee.FirstName, LastName: employee.LastName });

        const EmployeePhone = await UserRepo.findOne({ PhoneNumber: employee.PhoneNumber });
        delete employee._id;
        employee.UpdatedOn = new Date();
        const emp = await UserRepo.findOneAndUpdate({_id:empId}, employee)  .select("+Password");;

        if(employee.IsDraft=='false'&& emp.Password==''){
            var _temppwd=AuthHelper.GenerateRandomPassword()
            await UserRepo.update({_id:empId}, {Password:Bcrypt.hashSync(_temppwd, 10)} );
            this.sendEmpCreateEmails(emp, _temppwd);
        }
        else{
            this.sendEmpUpdateEmails(emp)
        }
        return true;
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


}


exports.getEmpProfile = async (req) => {
    try {
        console.log('inside getEmpProfile :: ',req);
        var emp = await UserRepo.findOne({ _id: Mongoose.Types.ObjectId(req.empId) })
        .populate('ThirdSignatory DirectReports ApplicationRole');
        if (!emp.IsProfileUpToDate) {
            emp.IsDraft = true;
        }
        return emp;
    } catch (error) {
        logger.error(err)
        console.log(err);
        throw (err);
    }
}

exports.UpdateEmployeeProfile = async (employee) => {
    try {
        employee.UpdatedOn = new Date();
        
        if (employee.IsDraft) {
            const emp = await UserRepo.update({ _id: employee._id }, {$set:{'profile':employee,'IsProfileUpToDate':false}});
        } else {
            employee.IsProfileUpToDate = true;
            employee.profile = null;
            var empId = employee._id;
            delete employee._id;
            const emp = await UserRepo.update({ _id: Mongoose.Types.ObjectId(empId) }, {$set:employee});
        }

        if (!employee.IsDraft) {
             const emp = await UserRepo.findOne({ _id: empId });
            await this.sendEmpProfileUpdated(emp);
            
        }
        return true;
    }
    catch (err) {
        logger.error(err)
        console.log(err);
        throw (err);
    }
}


exports.sendEmpProfileUpdated = async (emp) => {

    // let mailBody = `<p>Dear ${emp.FirstName},<p

    // You have successfully updated your profile.

    // <updates>

    // To view details, click here.

    // Thank you,
    // <product name> Administrator
    // `;
    let mailBody = "Dear " + emp.FirstName + ",<br><br>"
    mailBody = mailBody + "You have successfully updated your profile." + "<br><br>"
    mailBody = mailBody + "<br>To view details  " + " <a href=" + config.APP_BASE_REDIRECT_URL+"=/ea/profile" + ">click here</a> to login<br><br>Thank you,<br>" + config.ProductName + " Administrator <br>"
    var mailObject = SendMail.GetMailObject(
        emp.Email,
        "Profile updated successfully",
        mailBody
        ,
        null,
        null
    );
    await SendMail.SendEmail(mailObject, function (res) {
        console.log("emp profile updated mail :: ", res);
    });
}



exports.sendEmpUpdateEmails = async (newemp) =>{
// MAIL TO CSA
let csaDetails = await UserRepo.findById(newemp.CreatedBy);
let mailBody= "Dear " + csaDetails.FirstName +",<br><br>"
mailBody = mailBody + "You have successfully updated the details for <b>" + newemp.FirstName + " "+ newemp.LastName + "</b>.<br><br>"
mailBody=mailBody + "<br>To view details  "+ " <a href=" +config.APP_BASE_REDIRECT_URL+"=/ea/setup-employee" +">click here</a> <br><br>Thank you,<br> " + config.ProductName + " Administrator<br>"

var mailObject = SendMail.GetMailObject(
    csaDetails.Email,
    "Employee successfully updated",
mailBody
          ,
          null,
          null
        );

        

await SendMail.SendEmail(mailObject, function (res) {
    console.log("mail to CSA", res);
});

// END CSA MAIL

 // SEND EMAIL TO EA
 if(csaDetails.Role=="CSA") {

    const EvalAdmin = await UserRepo.findOne({ ParentUser: newemp.ParentUser, SelectedRoles: { $in: ['EA'] } });

   if (EvalAdmin) {
       
   
   
    let  mailBody="Dear " + EvalAdmin.FirstName +",<br>"
   mailBody = mailBody + "The Client Super Admin has updated the details for <b>" + newemp.FirstName + " " + newemp.LastName  + ".<br>"
   mailBody=mailBody + "<br>To view details,  "+ " <a href="+ config.APP_BASE_REDIRECT_URL+"=/ea/setup-employee" + ">click here</a> <br><br>Thank you,<br> "+config.ProductName+" Administrator<br><br>"
   var mailObject = SendMail.GetMailObject(
    EvalAdmin.Email,
             "Employee details updated by Admin",
mailBody
            ,
             null,
             null
           );


   await SendMail.SendEmail(mailObject, function (res) {
       console.log(res);
   });

   }
}else{
    

    const CSA = await UserRepo.findOne({ ParentUser: newemp.ParentUser, Role: "CSA" });

   if (CSA) {
       
   
   
    let  mailBody="Dear " + csaDetails.FirstName +",<br>"
   mailBody = mailBody + "The Evaluation Administrator has updated the details for <b>" + newemp.FirstName + " " + newemp.LastName  + ".<br>"
   mailBody=mailBody + "<br>To view details,  "+ " <a href="+ config.APP_BASE_REDIRECT_URL+"=/ea/setup-employee" + ">click here</a> <br><br>Thank you,<br> "+config.ProductName+" Administrator<br><br>"
   var mailObject = SendMail.GetMailObject(
       csaDetails.Email,
             "Employee details updated by Evaluations Administrator",
mailBody
            ,
             null,
             null
           );


   await SendMail.SendEmail(mailObject, function (res) {
       console.log(res);
   });
   
   }
}
   // END EA MAIL

// MAIL TO EMPLOYEE START
if(newemp){
let  mailBody= "Dear " + newemp.FirstName +",<br><br>"
 mailBody = mailBody + "Your details have been updated by admin.<br><br>"
 mailBody=mailBody + "<br>To view details  "+ " <a href="+ config.APP_BASE_REDIRECT_URL+"=/dashboard" +">click here</a><br><br>Thank you,<br> " + config.ProductName + " Administrator<br>"

 var mailObject = SendMail.GetMailObject(
    newemp.Email,
    newemp.FirstName+" account has been updated.",
mailBody
          ,
          null,
          null
        );

        

await SendMail.SendEmail(mailObject, function (res) {
    
});

}

// MAIL TO EMPLOYEE END
}

exports.sendEmpCreateEmails = async (newemp,_temppwd) =>{
    if (newemp) { 
        let mailBody = "Dear " + newemp.FirstName +",<br><br> Congratulations, your "+config.ProductName +" employee account has been created. Your login id is your email. You will receive a separate email with the password. Please change your password when you login first time."
    mailBody= mailBody + "<br><br>Email:<a href=mailto:"+newemp.Email+">"+ newemp.Email + "</a><br>"
    mailBody=mailBody + "<br>Please  "+ " <a href="+ config.APP_BASE_REDIRECT_URL+"=/dashboard" +">click here</a> to login<br><br>Thank you,<br> " + config.ProductName + " Administrator<br>"

    var mailObject = SendMail.GetMailObject(
        newemp.Email,
        config.ProductName+" account created",
mailBody
              ,
              null,
              null
            );

            

    await SendMail.SendEmail(mailObject, function (res) {
        console.log(res);
    });
}

if (newemp) { 
   let   mailBody = "Dear " + newemp.FirstName + "<br><br>"
mailBody=mailBody + " Congratulations, Employee account has been created. Please change your password when you login first time.<br><br>" 
mailBody = mailBody + "<b>Password:</b> " + _temppwd + " <br><br>"
mailBody=mailBody + "<br>Please  "+ " <a href=" + config.APP_BASE_REDIRECT_URL+"=/dashboard" +">click here</a> to login<br><br> Thank you,<br> " +config.ProductName +  " Administrator<br><br>"

    var mailObject = SendMail.GetMailObject(
        newemp.Email,
        config.ProductName + " account password",
mailBody
             ,
              null,
              null
            );


    await SendMail.SendEmail(mailObject, function (res) {
        console.log(res);
    });

}

   // SEND EMAIL TO CSA
   let csaDetails = await UserRepo.findById(newemp.CreatedBy);
  let  mailBody="Dear " + csaDetails.FirstName +",<br>"
    mailBody = mailBody + "Congratulations, you have successfully added <b>" + newemp.FirstName + " " + newemp.LastName  + "</b> to the system.<br>"
    mailBody=mailBody + "<br>To view details,  "+ " <a href="+ config.APP_BASE_REDIRECT_URL+"=/ea/setup-employee" + ">click here</a> to login<br><br>Thank you,<br> "+config.ProductName+" Administrator<br><br>"
    var mailObject = SendMail.GetMailObject(
        csaDetails.Email,
              "Employee successfully added",
mailBody
             ,
              null,
              null
            );


    await SendMail.SendEmail(mailObject, function (res) {
        console.log(res);
    });
    // END CSA MAIL


     // SEND EMAIL TO EA
   if(csaDetails.Role=="CSA") {

    const EvalAdmin = await UserRepo.findOne({ ParentUser: newemp.ParentUser, SelectedRoles: { $in: ['EA'] } });

   if (EvalAdmin) {
       
   
   
  let mailBody="Dear " + EvalAdmin.FirstName +",<br>"
   mailBody = mailBody + "The Client Super Admin has added <b>" + newemp.FirstName + " " + newemp.LastName  + "</b> to the system.<br>"
   mailBody=mailBody + "<br>To view details,  "+ " <a href="+ config.APP_BASE_REDIRECT_URL+"=/ea/setup-employee" + ">click here</a> <br><br>Thank you,<br> "+config.ProductName+" Administrator<br><br>"
   var mailObject = SendMail.GetMailObject(
    EvalAdmin.Email,
             "Employee successfully added by Admin",
mailBody
            ,
             null,
             null
           );


   await SendMail.SendEmail(mailObject, function (res) {
       console.log(res);
   });

   }
}else{
    

    const CSA = await UserRepo.findOne({ ParentUser: newemp.ParentUser, Role: "CSA" });

   if (CSA) {
       
   
   
 let  mailBody="Dear " + csaDetails.FirstName +",<br>"
   mailBody = mailBody + "The Evaluation Administrator has added <b>" + newemp.FirstName + " " + newemp.LastName  + "</b> to the system.<br>"
   mailBody=mailBody + "<br>To view details,  "+ " <a href="+ config.APP_BASE_REDIRECT_URL+"=/ea/setup-employee" + ">click here</a> <br><br>Thank you,<br> "+config.ProductName+" Administrator<br><br>"
   var mailObject = SendMail.GetMailObject(
       csaDetails.Email,
             "Employee successfully added by Evaluation Administrator",
mailBody
            ,
             null,
             null
           );


   await SendMail.SendEmail(mailObject, function (res) {
       console.log(res);
   });
   
   }
}
   // END EA MAIL
}


exports.GetEmployeeDataById = async (Id) => {
    
    const GetEmployee = await UserRepo.findById(Id).populate("JobLevel Manager ThirdSignatory");

    return GetEmployee;


};
exports.GetAllEmployees = async (employee) => {  
     const Employees = await UserRepo.find({ 
        
         $or: [ { Role:'EO',}, { SelectedRoles: { $in: ['EO'] } } ] ,
         Organization:Mongoose.Types.ObjectId(employee.companyId)})     
     .populate('ThirdSignatory CopiesTo DirectReports Manager')
     .sort({ UpdatedOn: -1 })  
     return Employees;    

};



exports.SearchEmployee = async (search) => {  
    
    const Employees = await UserRepo.find(
    {Company:Mongoose.Types.ObjectId(search.company)},
    {$text:{$search:search.searchterm}},
    {Password:-1}
    )
    return Employees;    

};
