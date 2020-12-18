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
exports.Authenticate = async (LoginModel) => {
    Email = LoginModel.Email;
    Password = LoginModel.Password;
    console.log('came into login metho')
    try {        
        const User = await  UserRepo.findOne({ 'Email': Email }) .populate('ThirdSignatory CopiesTo DirectReports Manager Organization JobLevel').select("+Password");
        if (User && Bcrypt.compareSync(Password, User.Password)) {
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
                OrganizationData:OrganizationData
            };
        } else {
            console.log('not found')
            throw "User not found";
        }
    } catch (error) {
        console.log(error);
        logger.error(error);
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

    if (User && true) {

        User.Password = AuthHelper.GenerateRandomPassword();
        User.IsPswChangedOnFirstLogin = false;
        User.IsActive = false;
        User.IsLoggedIn = false;
        User.save();

        mailObject = SendMail.GetMailObject(
            Email,
            "Password Reset",
            `Hey!  Your password has been updated. <br>
            Here are the details of Password : ${User.Password}    `,
            null,
            null
        );

        // await SendMail.SendEmail(mailObject, function (res) {
        //     console.log(res);
        // });

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
        return await UserRepo.findById(id);
    }

}

exports.CreateEmployee = async (employee) => {
    try {

        const EmployeeName = await UserRepo.findOne({ FirstName: employee.FirstName, LastName: employee.LastName });
        const EmployeeEmail = await UserRepo.findOne({ Email: employee.Email });
        const EmployeePhone = await UserRepo.findOne({ Phone: employee.PhoneNumber });

      //  if (EmployeeName !== null) { throw Error("Employee Name Already Exist"); }

        if (employee.Email!="" && EmployeeEmail !== null) { throw Error("Employee Email Already Exist "); }

        if (employee.PhoneNumber!="" && EmployeePhone !== null) { throw Error("Employee Phone Number Already Exist"); }

        // need to do some other impl should not use ids
        const EvalAdminFound = await UserRepo.findOne({ ParentUser: employee.ParentUser, ApplicationRole: Messages.constants.EA_ID });


        if (EvalAdminFound) {
            //send email to Evalution admin
        }
        else if (!employee.IgnoreEvalAdminCreated && employee.ApplicationRole == Messages.constants.EO_ID && EvalAdminFound == null) {
            throw Error("Evaluation Administrator Not Found");
        }
        var _temppwd="";
        if(employee.IsDraft=='false'){
         _temppwd=AuthHelper.GenerateRandomPassword()
        employee.Password = Bcrypt.hashSync(_temppwd, 10);
        }

        const newemp = new UserRepo(employee);
        await newemp.save();

        //send email to employee
         //send email to  user
         if(employee.IsDraft=='false'){
             this.sendEmpCreateEamils(newemp,_temppwd);
        
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

       // if (EmployeeName !== null && EmployeeName._id != employee._id) { throw Error("Employee Name Already Exist"); }

        if (employee.PhoneNumber!="" && EmployeePhone !== null && EmployeePhone._id != employee._id) { throw Error("Employee Phone Number Already Exist"); }

      

        delete employee._id;
        employee.UpdatedOn = new Date();
        const emp = await UserRepo.findOneAndUpdate({_id:empId}, employee)  .select("+Password");;

        if(employee.IsDraft=='false'&& emp.Password==''){
            var _temppwd=AuthHelper.GenerateRandomPassword()
           // emp.Password = Bcrypt.hashSync(_temppwd, 10);
            await UserRepo.update({_id:empId}, {Password:Bcrypt.hashSync(_temppwd, 10)} );
            this.sendEmpCreateEamils(emp,_temppwd);
        }
        return true;
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


}


exports.sendEmpCreateEamils = async (newemp,_temppwd) =>{
    
    var mailObject = SendMail.GetMailObject(
        newemp.Email,
        "Employee account created",

              `Dear ${newemp.FirstName},

              <br> Congratulations, Employee account has been created. Your login id is your email. You will receive a separate email for password. Please change your password when you login first time.
              
              Email: ${newemp.Email},
              
              <br> Please click here to login.
              
              <br> Thank you,
              Administrator
              `,
              null,
              null
            );

            //Password: ${_temppwd}

    await SendMail.SendEmail(mailObject, function (res) {
        console.log(res);
    });

    var mailObject = SendMail.GetMailObject(
        newemp.Email,
              "Employee account created",

              `Dear ${newemp.FirstName},

              <br>  Congratulations, Employee account has been created. Please change your password when you login first time.
              
              Password: ${_temppwd},
              
              <br> Please click here to login.
              
              <br> Thank you,
              Administrator
              `,
              null,
              null
            );


    await SendMail.SendEmail(mailObject, function (res) {
        console.log(res);
    });
}


exports.GetEmployeeDataById = async (Id) => {
    
    const GetEmployee = await UserRepo.findById(Id);

    return GetEmployee;


};
exports.GetAllEmployees = async (employee) => {  
     const Employees = await UserRepo.find({ 
        Role:'EO',
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
