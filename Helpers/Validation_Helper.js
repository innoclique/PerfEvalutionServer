const Joi = require('joi');


exports.ValidateManageAccount = ( data)=>{

   const schema = Joi.object().keys({
      Password: Joi.string().required(),
      Old_Password: Joi.string().required(),
      ConfirmPassword: Joi.string().required()
    });

  return schema;

}


exports.ValidateAuthenticationInput = ( data)=>{

   const schema = Joi.object().keys({
      // email is required
      // email must be a valid email string
      Email: Joi.string().email().required().trim(),
      Password: Joi.string().required(),
  });

  return schema;

}


exports.ValidatePasswordUpdate = ( data)=>{

   const schema = Joi.object().keys({
      // userId is required
      // userId must be a valid  string
      userId: Joi.string().required().trim(),
      password: Joi.string().required(),
      oldPassword: Joi.string().required(),
  });

  return schema;

}



exports.ValidateEmail = (data)=>{


   const schema = Joi.object().keys({

      // email is required
      // email must be a valid email string
      Email: Joi.string().email().required().trim(),
 

  });

  return schema;
}

exports.ValidateUserName = (data)=>{


   const schema = Joi.object().keys({

      // email is required
      // email must be a valid email string
      UserName: Joi.string().required().trim(),
 

  });

  return schema;
}

exports.ValidatePhoneNumber = (data)=>{


   const schema = Joi.object().keys({

      // email is required
      // email must be a valid email string
      PhoneNumber: Joi.string().required().trim(),
 

  });

  return schema;
}



exports.ValidateInteger = ()=>{


   const schema =  Joi.number().required();
 

 
  return schema;
}


exports.ValidateCreateAccountModel = ( data)=>{

   const schema = Joi.object().keys({
      FirstName: Joi.string().required(),
      LastName: Joi.string().required(),
      Email: Joi.string().email().required(),
      UserName: Joi.string().required(),
      PhoneNumber: Joi.string().required(),
      Address: Joi.string().required(),
      Password: Joi.string().required()
  });

  return schema;

}

exports.ValidateManageprofileAccountModel = ( data)=>{

  const schema = Joi.object().keys({

     // email is required
     // email must be a valid email string
   

     LastName: Joi.string().required(),

     
     UserName: Joi.string().required(),

     PhoneNumber: Joi.string().required(),

     Address: Joi.string().required(),
   
     FirstName: Joi.string().required(),

    

 });

 return schema;

}

exports.ValidateString = ()=>{


   const schema =  Joi.string().required().trim(); 

 
  return schema;
}


exports.ValidateRoleModel =  (data)=>{


  const schema = Joi.object().keys({

     // email is required
     // email must be a valid email string
     Role: Joi.string().required().trim(),


 });

 return schema;
}


exports.CreateJobSchema = (schema) =>{

 const CreateJobschema =  Joi.object().keys({

       CompanyName: Joi.string().required().trim(),

       JobTitle : Joi.string().required().trim(),


     //  PostedDate :Joi.string().required().trim(),


       ExpiringDate :Joi.string().required().trim(),

       Location : Joi.string().required().trim(),

       Discription : Joi.string().required().trim(),

       Requirement : Joi.string().required().trim(),

      JobType : Joi.string().required().trim(),

       Qualification : Joi.string().required().trim(),

       YearsOfExperience : Joi.string().required().trim(),

       JobField : Joi.string().required().trim(),

       Responsibility : Joi.string().required().trim(),

   });

   return CreateJobschema;
}

exports.ApplicationSchema = (schema) =>{

   const Applicationchema =  Joi.object().keys({

 
      
       FirstName: Joi.string().required().trim(),
       LastName : Joi.string().required().trim(),
     //  StateOfResidence: Joi.string().required().trim(),
       Email: Joi.string().required().trim(),
       Address:Joi.string().required().trim(),
       StateOfResidence:Joi.string().required().trim(),
       LGA:Joi.string().required().trim(),
        PhoneNumber : Joi.string().required().trim(),
         AlternativePhoneNumber: Joi.string().required().trim(),

Cv :Joi.string().required().trim(),

Age :Joi.number().required(),

Qualification: Joi.string().required().trim(),

YearsOfExperience :Joi.number().required(),

Gender: Joi.string().required().trim(),

NyscYear :Joi.string().required().trim(),

DateOfBirth: Joi.string().required().trim(),

InstitutionName :  Joi.string().required().trim(),

Program : Joi.string().required().trim(),

Course : Joi.string().required().trim(),

GraduationYear :  Joi.string().required().trim(),

ClassOfDegree : Joi.string().required().trim(),
CompanyName :  Joi.string().required().trim(),

WorkStartedDate :  Joi.string().required().trim(),

AcademicStartedDate :  Joi.string().required().trim(),

Position :  Joi.string().required().trim(),

Responsibility :  Joi.string().required().trim(),

WorkEndDate :  Joi.string().required().trim(),

AcademicEndDate :  Joi.string().required().trim(),


  });

  return Applicationchema;


}

exports.OrganizationSchema=(schema)=>{
   const organization =  Joi.object().keys({
      Name: Joi.string().required().trim(),
      Industry : Joi.string().required().trim(),    
      Email: Joi.string().required().email(),
      Phone: Joi.string().required().trim(),
      Address:Joi.string().required().trim(),
      State:Joi.string().required().trim(),
      City:Joi.string().required().trim(),
      Country:Joi.string().required().trim(),
      ZipCode:Joi.string().required().trim(),
      UsageType:Joi.string().required().trim(),
      IsAtive:Joi.boolean().required(),
      Role:Joi.string().required().trim(),
      OrganizationType:Joi.string().required().trim(),
      UsageCount:Joi.string().required().trim(),
      ContactName:Joi.string().required().trim(),
      ContactEmail:Joi.string().required().trim(),
      ContactPhone:Joi.string().required().trim(),
      ContactPersonSameAsAdmin:Joi.boolean().required(),
      AdminName:Joi.when('ContactPersonSameAsAdmin',{
         is:true,
         then:Joi.string().required().trim()
      }),
      AdminEmail:Joi.when('ContactPersonSameAsAdmin',{
         is:true,
         then:Joi.string().required().trim()
      }),
      AdminPhone:Joi.when('ContactPersonSameAsAdmin',{
         is:true,
         then:Joi.string().required().trim()
      }),
      EvaluationPeriod:Joi.string().required().trim(),
      EvaluationDuration:Joi.string().required().trim(),
      MaxEvaluationDays:Joi.string().required().trim(),



      
 });

 return organization;

}

exports.ValidateStrength = ( data)=>{

   const schema = Joi.object().keys({
      Strength: Joi.string().required(),
      Leverage: Joi.string().required(),
      TeamBenifit: Joi.string().required(),
      SelfBenifit: Joi.string().required(),
      Status: Joi.string().required(),
      Comments: Joi.string().required(),
      Employee: Joi.string().required()
  });
  return schema;
}

exports.ValidateAccomplishment = ( data)=>{

   const schema = Joi.object().keys({
      Accomplishment: Joi.string().required(),
      CompletionDate: Joi.string().required(),
      Comments: Joi.string().required(),
      ShowToManager: Joi.bool().required(),
      Employee:Joi.string().required(),
      CreatedBy:Joi.string().required()
  });
  return schema;
}
exports.ValidateKpi = ( data)=>{

   const schema = Joi.object().keys({
      Kpi: Joi.string().required(),
      MeasurementCriteria: Joi.string().required(),
      TargetCompletionDate: Joi.string().required(),
      Score: Joi.number().required(),
      YearEndComments:Joi.string().required(),
      Weighting:Joi.number().required(),
      Signoff:Joi.string().required(),
    Status:Joi.string().required(),
    IsDraft:Joi.boolean().required(),
    CreatedOn:Joi.string().required(),
    CreatedBy:Joi.string().required(),
    UpdatedOn:Joi.string().required(),
    UpdatedBy:Joi.string().required()

  });
  return schema;
}
exports.ValidateNote = ( data)=>{

   const schema = Joi.object().keys({
      Notes: Joi.string().required(),
      Discussedwith: Joi.string().required(),
      Comments: Joi.string().required(),
      User: Joi.string().required(),
  });
  return schema;
}