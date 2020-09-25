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
      Email: Joi.string().email().required().email().trim()
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


exports.ValidateCreateEmployeeModel = ( data)=>{



   const schema = Joi.object().keys({
      FirstName: Joi.string().required(),
      LastName: Joi.string().required(),
      Email: Joi.string().email().required(),
      PhoneNumber: Joi.optional(),
      Address: Joi.string().required(),
      JoiningDate: Joi.string().required(),
      RoleEffFrom: Joi.optional(),

      MiddleName: Joi.optional(),
      ExtNumber:Joi.optional(),
      AltPhoneNumber:Joi.optional(),
      MobileNumber:Joi.optional(),
      IsActive:Joi.string(),
      IsSubmit:Joi.optional(),
      IgnoreEvalAdminCreated:Joi.optional(),
      UpdatedBy:Joi.optional(),
      CreatedBy:Joi.string(),
      ParentUser:Joi.string(),

      _id:Joi.optional(),
      JobLevel:Joi.string().required(),
      JobRole:Joi.string().required(),
      Department:Joi.string().required(),
      ApplicationRole:Joi.string().required(),

      Role:Joi.string().optional(),
      Title:Joi.string().required(),
      ThirdSignatory:Joi.optional(),
      CopiesTo:Joi.optional(),
      DirectReports:Joi.optional(),
      Country:Joi.string().required(),
      State:Joi.string().required(),
      City:Joi.string().required(),
      ZipCode:Joi.string().required(),
      
      
    
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
      ClientType:Joi.string().required().trim(),
      UsageCount:Joi.number().required(),
      AdminFirstName:Joi.string().required().trim(),      
      AdminLastName:Joi.string().required().trim(),
      AdminMiddleName:Joi.optional(),
      AdminEmail:Joi.string().required().email(),
      AdminPhone:Joi.string().required().trim(),
      SameAsAdmin:Joi.boolean().required(),
      ContactPersonFirstName:Joi.when('SameAsAdmin',{
         is:"false",
         then:Joi.string().required().trim()
      }),
      ContactPersonLastName:Joi.when('SameAsAdmin',{
         is:"flase",
         then:Joi.string().required().trim()
      }),
      ContactPersonEmail:Joi.when('SameAsAdmin',{
         is:"false",
         then:Joi.string().required().trim()
      }),
      ContactPersonPhone:Joi.when('SameAsAdmin',{
         is:"false",
         then:Joi.string().required().trim()
      }),
      ContactPersonMiddleName:Joi.optional(),
      EvaluationPeriod:Joi.string().required().trim(),
      EvaluationDuration:Joi.string().required().trim(),
      
      EvaluationModels:Joi.string().required().trim(),
      PhoneExt:Joi.string(),
      EvaluationMaximumDays:Joi.string(),
      EmployeeBufferCount:Joi.string().optional(),
      DownloadBufferDays:Joi.string().optional(),
      CoachingReminder:Joi.string().optional(),
      IsActive:Joi.optional(),
      CreatedBy:Joi.string().required().trim(),
      CreatedOn:Joi.optional()
      
 });

 return organization;

}
exports.UpdateOrganizationSchema=(schema)=>{
   const organization =  Joi.object().keys({
      id:Joi.string().required().trim(),
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
      ClientType:Joi.string().required().trim(),
      UsageCount:Joi.number().required(),
      AdminFirstName:Joi.string().required().trim(),      
      AdminLastName:Joi.string().required().trim(),
      AdminMiddleName:Joi.optional(),
      AdminEmail:Joi.string().required().email(),
      AdminPhone:Joi.string().required().trim(),
      SameAsAdmin:Joi.boolean().required(),
      ContactPersonFirstName:Joi.when('SameAsAdmin',{
         is:"false",
         then:Joi.string().required().trim()
      }),
      ContactPersonLastName:Joi.when('SameAsAdmin',{
         is:"flase",
         then:Joi.string().required().trim()
      }),
      ContactPersonEmail:Joi.when('SameAsAdmin',{
         is:"false",
         then:Joi.string().required().trim()
      }),
      ContactPersonPhone:Joi.when('SameAsAdmin',{
         is:"false",
         then:Joi.string().required().trim()
      }),
      ContactPersonMiddleName:Joi.optional(),
      EvaluationPeriod:Joi.string().required().trim(),
      EvaluationDuration:Joi.string().required().trim(),
      
      EvaluationModels:Joi.string().required().trim(),
      PhoneExt:Joi.string(),
      EvaluationMaximumDays:Joi.string(),
      EmployeeBufferCount:Joi.string().optional(),
      DownloadBufferDays:Joi.string().optional(),
      CoachingReminder:Joi.string().optional(),
      IsActive:Joi.optional(),
      UpdatedBy:Joi.string().required().trim(),
      UpdatedOn:Joi.optional()
      
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