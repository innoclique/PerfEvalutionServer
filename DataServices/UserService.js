const DbConnection = require("../Config/DbConfig");
require('dotenv').config();
const Mongoose = require("mongoose");
const Bcrypt = require('bcrypt');
const UserRepo = require('../SchemaModels/UserSchema');
const UserSettingsRepo = require('../SchemaModels/UserAppSettings');
const AuthHelper = require('../Helpers/Auth_Helper');
const SendMail = require("../Helpers/mail.js");
var logger = require('../logger');



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
try{
debugger
    const User = await UserRepo.findOne({ 'Email': Email });

    if (User && Bcrypt.compareSync(Password,User.Password)){        
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

        return {
            ID: User._id, Role: User.Role, Email: User.Email,
            UserName: User.UserName, AccessToken: AccesToken,
            RefreshToken: User.RefreshToken, IsPswChangedOnFirstLogin: User.IsPswChangedOnFirstLogin,
            User: User
        };
    }else{
        console.log('not found')
throw "User not found";
    }
}catch(error){
    console.log(error);
    logger.error(error);
}

}

exports.AuthenticateAdmin = async (LoginModel) => {
    try {
        Email = LoginModel.Email;
        Password = LoginModel.Password;

        const User = await UserRepo.findOne({ Email: Email });

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
    const User = await UserRepo.findOne({ 'Email': Email });

    if (User && true) {

        User.Password = AuthHelper.GenerateRandomPassword();
        User.IsPswChangedOnFirstLogin = false;
        User.IsActive = false;
        User.IsLoggedIn = false;
        User.save();

        mailObject = SendMail.GetMailObject(
            Email,
            "Password Reset",
            `Hey!  Your password has been updated.
            Here are the details of Password : ${User.Password}    `,
            null,
            null
        );

        // SendMail.SendEmail(mailObject, function (res) {
        //     console.log(res);
        // });

        return { status: "success" };
    } else { throw Error("No user found"); }


}


// update user password by id
exports.UpdatePassword = async (resetModel) => {
    id = resetModel.userId;

    const User = await UserRepo.findById(id);

    if (User) {

        if (User.Password !== resetModel.oldPassword) {
            throw Error("Invalid old password");
        }

        User.IsPswChangedOnFirstLogin = true;
        User.IsActive = true;
        User.PswUpdatedOn = new Date();
        User.Password = resetModel.password;
        User.save();

        return { status: "success" };
    } else { throw Error("No user found"); }



}


exports.ManageAccount = async (id, Model) => {

    const USertoUpdate = await UserRepo.findById(id);

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
        userTnC.TnCAccepted = true;
        userTnC.TnCAcceptedOn = new Date();
        userTnC.save();
        return (true);
    }

}

exports.CreateEmployee = async (employee) => {
    try {
        
        const EmployeeName = await UserRepo.findOne({ FirstName: employee.FirstName, LastName: employee.LastName });
        const EmployeeEmail = await UserRepo.findOne({ Email: employee.Email });
        const EmployeePhone = await UserRepo.findOne({ Phone: employee.PhoneNumber });

        if (EmployeeName !== null) { throw Error("Employee Name Already Exist"); }

        if (EmployeeEmail !== null) { throw Error("Employee Email Already Exist "); }

        if (EmployeePhone !== null) { throw Error("Employee Phone Number Already Exist"); }

        const ApplicationRole = await UserRepo.findOne({ParentUser:employee.ParentUser, ApplicationRole: '5f60e0919a4e1b15986bc251' });
       
        // if (employee.ApplicationRole=='5f60e09c9a4e1b15986bc252' && ApplicationRole==null  ) {
        //     throw Error("Evaluation Administrator Not Found"); 
        // }

        employee.Role = "EMPLOYEE";
        employee.UserName = employee.FirstName + " " + employee.LastName;
        employee.Password = Bcrypt.hashSync(AuthHelper.GenerateRandomPassword(), 10);

        const newemp = new UserRepo(employee);
        await newemp.save();
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
        
        let empId= employee._id;
        const EmployeeName = await UserRepo.findOne({ FirstName: employee.FirstName, LastName: employee.LastName });
        
        const EmployeePhone = await UserRepo.findOne({ PhoneNumber: employee.PhoneNumber });

        if (EmployeeName !== null && EmployeeName._id!= employee._id)  { throw Error("Employee Name Already Exist"); }

        if (EmployeePhone !== null && EmployeePhone._id!= employee._id ) { throw Error("Employee Phone Number Already Exist"); }
      
        employee.UserName = employee.FirstName + " " + employee.LastName;

        delete employee._id;
        employee.UpdatedOn= new Date();
         const emp = await UserRepo.findByIdAndUpdate(empId,employee);

        return true;
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


}

exports.GetEmployeeDataById = async (Id) => {
    debugger
    const GetEmployee = await UserRepo.findById(Id);

    return GetEmployee;


};
exports.GetAllEmployees = async (parentId) => {
  
     // const Employees = await UserRepo.find({Role:'EMPLOYEE',ParentUser:parentId});        
     const Employees = await UserRepo.find({Role:'EMPLOYEE'})
     .populate('ThirdSignatory CopiesTo DirectReports');        
     return Employees;    

};

