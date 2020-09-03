const DbConnection = require("../Config/DbConfig");
require('dotenv').config();
const Mongoose = require("mongoose");
const Bcrypt = require('bcrypt');
const UserRepo = require('../SchemaModels/UserSchema');
const AuthHelper = require('../Helpers/Auth_Helper');
const SendMail = require("../Helpers/mail.js");
var logger = require('../logger');



exports.GetAllUsers= async ()=>{

    
    const Users = await  UserRepo.find();
    
    return  Users;
};

exports.GetUserById= async (Id)=>{

const User = await UserRepo.findById(Id);

return User;


};

exports.GetUserByEmail= async ( Email)=>{

    return await UserRepo.findOne({Email});

};

exports.GetUserByUserName= async ( Username)=>{

    return await UserRepo.findOne({UserName:Username});
};


exports.GetUserByPhoneNumber= async ( PhoneNumber)=>{

    return await UserRepo.findOne({PhoneNumber:PhoneNumber});
};


exports.MnageUserRole= async (id, Model)=>{

    const User = await UserRepo.findById(id);

    if(User == null){ throw Error("User Not Found");}

    User.Role = Model.Role;
    User.save();



};


exports.CreateAccount = async (UserModel) =>{

try{ 

    const UserNameUser = await UserRepo.findOne({UserName:UserModel.Username});
    const EmailUser =  await UserRepo.findOne({Email:UserModel.Email});
    const PhoneNumberUser = await UserRepo.findOne({PhoneNumber:UserModel.PhoneNumber});

   if(EmailUser !== null){ throw Error("Email Already Exist");}

   if(UserNameUser !== null){ throw Error("UserName Already Exist ");}

   if(PhoneNumberUser !== null){ throw Error("Phone Number Already Exist");}
    const User = new UserRepo(UserModel);

    User.Password = Bcrypt.hashSync(UserModel.Password,10);
 
    await User.save();

}
catch(err)
{ console.log(err);
    throw  (err); }
   

}
exports.Authenticate = async (LoginModel) =>{
Email= LoginModel.Email;
Password = LoginModel.Password;
var ff=await UserRepo.find({}).count();
const User = await UserRepo.findOne({'Email':Email});

if(User  && true ){//Bcrypt.compareSync(Password,User.Password)){

   if(User.IsLoggedIn){ 
    logger.error(`User ::${User.Email} has loggedin already`)  ;
    throw Error("User has loggedin someother browser.");}
   // if(User.Role !== "User"){ throw Error("Invalid Login");}
   const AccesToken = AuthHelper.CreateAccesstoken(User);
   const RefreshToken = AuthHelper.CreateRefreshtoken(User);
   User.RefreshToken = RefreshToken;
   User.LastLogin = Date();
   User.IsLoggedIn=true;
   User.save();

    return {ID:User._id, Role:User.Role, Email:User.Email,
         UserName: User.UserName, AccessToken: AccesToken,
         RefreshToken:User.RefreshToken,IsPswChangedOnFirstLogin:User.IsPswChangedOnFirstLogin};
}


}

exports.AuthenticateAdmin = async (LoginModel) =>{
try{     Email= LoginModel.Email;
    Password = LoginModel.Password;
    
    const User = await UserRepo.findOne({Email:Email});
    
    if(User  && Bcrypt.compareSync(Password,User.Password)){
    
        if(User.Role === "User"){ throw Error("Invalid Login");}
       const AccesToken = AuthHelper.CreateAccesstoken(User);
       const RefreshToken = AuthHelper.CreateRefreshtoken(User);
       User.RefreshToken = RefreshToken;
       User.LastLogin = Date();
       User.save();
    
        return {ID:User._id,Role:User.Role, Email:User.Email, UserName: User.UserName, AccessToken: AccesToken,RefreshToken:User.RefreshToken};
    }
    }

catch(err)
{
    console.log(err);
}
    
    }

exports.SendResetPsw = async (LoginModel) => {
    Email = LoginModel.Email;
    var ff=await UserRepo.find({}).count();
    const User = await UserRepo.findOne({'Email':Email});
    
    if (User && true) {

        User.Password=AuthHelper.GenerateRandomPassword();
        User.IsPswChangedOnFirstLogin = false;
        User.IsActive = false;
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

        return { status: "temp psw email sent" };
    }else { throw Error("User Not Found");}


}

exports.UpdatePassword = async (resetModel) => {
    id = resetModel.userId;
    const User = await UserRepo.findById(id);
    
    if (User) {

        User.IsPswChangedOnFirstLogin = true;
        User.IsActive = true;
        User.PswUpdatedOn= new Date();
        User.Password = resetModel.password;
        User.save();

        return { status: "psw updated" };
    }else { throw Error("User Not Found");}


}


exports.ManageAccount = async ( id, Model) =>{

  const USertoUpdate = await  UserRepo.findById(id);

  if(USertoUpdate === null){ throw Error("User Not Found");  }

  if(  Bcrypt.compareSync(Model.Old_Password,USertoUpdate.Password) == false ){ throw Error("Invalid Password");}

const Hashpassword = Bcrypt.hashSync(Model.Password, 10);

 USertoUpdate.Password = Hashpassword;
 USertoUpdate.LastUpdated = Date();
 USertoUpdate.save();


}

exports.ManageProfile = async ( id, Model) =>{


 const USertoUpdate = await  UserRepo.findById(id);

  if(USertoUpdate === null){ throw Error("User Not Found");  }

  const UserName = await UserRepo.findOne({UserName:Model.UserName});

  if(UserName !== null && USertoUpdate.UserName !== Model.UserName){ throw Error("User Name Already exist");}

 USertoUpdate.FirstName = Model.FirstName;
 USertoUpdate.LastName = Model.LastName;
 USertoUpdate.UserName = Model.UserName;
 USertoUpdate.Address = Model.Address;
 USertoUpdate.PhoneNumber = Model.PhoneNumber
 USertoUpdate.UpdatedDate = Date();
 USertoUpdate.save();


  
  }


  exports.DeleteUser= async (id)=>{

    const User = await UserRepo.findById(id);

    if(User == null){ throw Error("User Not Found");}

   User.remove();


};

exports.Log_Out = async (email) => {


const UsertoLogOut = await UserRepo.find({'Email':email});

if (UsertoLogOut === null ){ throw Error('User Not Found ');}else{

    UsertoLogOut.RefreshToken = null;
UsertoLogOut.IsLoggedIn=false;
     UsertoLogOut.save();

     return ("Logout");


}

}
