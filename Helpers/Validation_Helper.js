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
      Organization:Joi.optional(),
      UpdatedBy:Joi.optional(),
      CreatedBy:Joi.string(),
      ParentUser:Joi.string(),

      _id:Joi.optional(),
      JobLevel:Joi.string().required(),
      JobRole:Joi.string().required(),
      Department:Joi.string().required(),
      ApplicationRole:Joi.required(),

      Role:Joi.string().optional(),
      SelectedRoles:Joi.optional(),
      Title:Joi.string().required(),
      ThirdSignatory:Joi.optional(),
      CopiesTo:Joi.optional(),
      DirectReports:Joi.optional(),
      Manager:Joi.optional(),
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
      
      EvaluationModels:Joi.array().items(Joi.string().required()).min(1).required(),
      PhoneExt:Joi.string().allow(['']),
      EvaluationMaximumDays:Joi.string(),
      EmployeeBufferCount:Joi.string().optional(),
      DownloadBufferDays:Joi.string().optional(),
      CoachingReminder:Joi.string().optional(),
      IsActive:Joi.optional(),
      CreatedBy:Joi.string().required().trim(),
      CreatedOn:Joi.optional(),
      StartMonth:Joi.when('EvaluationPeriod',{
         is:"FiscalYear",
         then:Joi.string().required().trim()
      }),
      EndMonth:Joi.optional(),
      IsDraft:Joi.optional(),
      ParentOrganization:Joi.string().required()
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
      
      EvaluationModels:Joi.array().items(Joi.string().required()).min(1).required(),
      PhoneExt:Joi.string().allow(['']),
      EmployeeBufferCount:Joi.string().optional(),
      DownloadBufferDays:Joi.string().optional(),
      CoachingReminder:Joi.string().optional(),
      IsActive:Joi.optional(),
      UpdatedBy:Joi.string().required().trim(),
      UpdatedOn:Joi.optional(),
      StartMonth:Joi.when('EvaluationPeriod',{
         is:"FiscalYear",
         then:Joi.string().required().trim()
      }),
      EndMonth:Joi.optional(),
      IsDraft:Joi.optional()
 });

 return organization;

}
exports.ValidateAddReseller=(schema)=>{
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
      
      ClientType:Joi.string().required().trim(),
      
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
      
      
      
      PhoneExt:Joi.string().allow(['']),
      IsActive:Joi.optional(),
      CreatedBy:Joi.string().required().trim(),
      CreatedOn:Joi.optional(),
      
      IsDraft:Joi.optional()
 });

 return organization;

}
exports.ValidateUpdateReseller=(schema)=>{
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
      
      ClientType:Joi.string().required().trim(),
      
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
      PhoneExt:Joi.string().allow(['']),
      IsActive:Joi.optional(),
      UpdatedBy:Joi.string().required().trim(),
      UpdatedOn:Joi.optional(),
      
      IsDraft:Joi.optional()
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
if (data.Action=='Active' || data.Action=='DeActive') {
   

   const schema = Joi.object().keys({
      kpiId: Joi.required(),
      Action: Joi.string().required(),
      UpdatedBy: Joi.string().required(),
      IsActive: Joi.any().required()
   });
   return schema;

}
   else if (data.Action=='Viewed') {
   

   const schema = Joi.object().keys({
      kpiId: Joi.required(),
      ViewedByEmpOn: Joi.required(),
      Action: Joi.string().required(),
      });
   return schema;

}

else if (data.Action=='Review') {
   

   const schema = Joi.object().keys({
      kpiId: Joi.required(),
      Action: Joi.string().required(),
      ManagerScore: Joi.number().optional(),
      YECommManager: Joi.optional(),
      CoachingReminder: Joi.string().optional(),
      IsManaFTSubmited: Joi.any().optional(),
      UpdatedBy: Joi.string().required(),
      IsActive: Joi.any().required()
   });
   return schema;

} else if (data.Action=='Draft') {
   

   const schema = Joi.object().keys({
      Kpi: Joi.required(),
      Action: Joi.string().required(),
     
   }).unknown(true);;
   return schema;

}  else {
   
   const schema = Joi.object().keys({
      Kpi: Joi.string().required(),
      MeasurementCriteria: Joi.required(),
      TargetCompletionDate: Joi.string().required(),
      Score: Joi.optional(),
      kpiId:Joi.optional(),
      YearEndComments:Joi.optional(),
      Weighting:Joi.required(),
      Signoff:Joi.optional(),
    Status:Joi.string().required(),
    YECommManager:Joi.optional(),
    
     ManagerId:Joi.optional(),
     ViewedByEmpOn:Joi.optional(),
    IsDraft:Joi.boolean().required(),
    IsDraftByManager:Joi.optional(),
 
    CreatedBy:Joi.string().required(),
    Owner:Joi.string().required(),
    EvaluationId:Joi.string().required(),
  
    UpdatedBy:Joi.string().required()



  });
  return schema;
}
}



exports.ValidateCommonModel = ( data)=>{

   const schema = Joi.object().keys({
      Name: Joi.string().required(),
      CreatedBy:Joi.optional(),
      UpdatedBy:Joi.optional(),
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