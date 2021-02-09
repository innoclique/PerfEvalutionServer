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


exports.ValidateEmployeeProfile = ( data)=>{
   if(!data.IsDraft){
      const schema = Joi.object().keys({
         FirstName: Joi.string().required(),
         LastName: Joi.string().required(),
         PhoneNumber: Joi.optional(),
         Address: Joi.string().required(),
         MiddleName: Joi.optional(),
         ExtNumber:Joi.optional(),
         AltPhoneNumber:Joi.optional(),
         MobileNumber:Joi.optional(),
         IsDraft:Joi.optional(),
         _id:Joi.optional(),
         CoachingReminder:Joi.optional(),
     });
     return schema;
   }else{
      const schema = Joi.object().keys({
         FirstName: Joi.string().required(),
//          Email: Joi.string().email().required(),
         CreatedBy:Joi.optional() 
      }).unknown(true);
      return schema;
   }
   }

exports.ValidateCreateEmployeeModel = ( data)=>{

if(data.IsDraft!='true'){

   const schema = Joi.object().keys({
      FirstName: Joi.string().required(),
      LastName: Joi.string().required(),
      Email: Joi.string().email().required(),
      PhoneNumber: Joi.optional(),
      Address: Joi.string().required(),
      JoiningDate: Joi.string().required(),
      RoleEffFrom: Joi.optional(),

      MiddleName: Joi.optional(),
      EmployeeId: Joi.optional(),
      ExtNumber:Joi.optional(),
      AltPhoneNumber:Joi.optional(),
      MobileNumber:Joi.optional(),
      IsActive:Joi.string(),
      IsDraft:Joi.optional(),
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
}else{
  
   const schema = Joi.object().keys({
      FirstName: Joi.string().required(),
      Email: Joi.string().email().required(),
      CreatedBy:Joi.optional()

      // LastName: Joi.optional(),
      // Email: Joi.email().optional(),
      // PhoneNumber: Joi.optional(),
      // Address: Joi.optional(),
      // JoiningDate: Joi.optional(),
      // RoleEffFrom: Joi.optional(),

      // MiddleName: Joi.optional(),
      // ExtNumber:Joi.optional(),
      // AltPhoneNumber:Joi.optional(),
      // MobileNumber:Joi.optional(),
      // IsActive:Joi.optional(),
      // IsDraft:Joi.optional(),
      // IsSubmit:Joi.optional(),
      // IgnoreEvalAdminCreated:Joi.optional(),
      // Organization:Joi.optional(),
      // UpdatedBy:Joi.optional(),
      
      // ParentUser:Joi.optional(),

      // _id:Joi.optional(),
      // JobLevel:Joi.optional(),
      // JobRole:Joi.optional(),
      // Department:Joi.optional(),
      // ApplicationRole:Joi.optional(),

      // Role:Joi.optional(),
      // SelectedRoles:Joi.optional(),
      // Title:Joi.optional(),
      // ThirdSignatory:Joi.optional(),
      // CopiesTo:Joi.optional(),
      // DirectReports:Joi.optional(),
      // Manager:Joi.optional(),
      // Country:Joi.optional(),
      // State:Joi.optional(),
      // City:Joi.optional(),
      // ZipCode:Joi.optional(),

   }).unknown(true);

   return schema;

}
 


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
      PhoneExt:Joi.string().allow(['',null]),
      EvaluationMaximumDays:Joi.string(),
      EmployeeBufferCount:Joi.optional(),
      DownloadBufferDays:Joi.optional(),
      CoachingReminder:Joi.string().allow(['']),
      IsActive:Joi.optional(),
      CreatedBy:Joi.string().required().trim(),
      CreatedOn:Joi.optional(),
      StartMonth:Joi.when('EvaluationPeriod',{
         is:"FiscalYear",
         then:Joi.string().required().trim()
      }),
      EndMonth:Joi.optional(),
      IsDraft:Joi.optional(),
      ParentOrganization:Joi.string().required(),
      Range:Joi.optional(),
 });

 return organization;

}
exports.UpdateOrganizationSchema=(schema)=>{

   if(!schema.IsDraft){
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
      PhoneExt:Joi.string().allow(['',null]),
      EmployeeBufferCount:Joi.optional(),
      DownloadBufferDays:Joi.optional(),
      CoachingReminder:Joi.string().allow(['']),
      IsActive:Joi.optional(),
      UpdatedBy:Joi.string().required().trim(),
      UpdatedOn:Joi.optional(),
      StartMonth:Joi.when('EvaluationPeriod',{
         is:"FiscalYear",
         then:Joi.string().required().trim()
      }),
      EndMonth:Joi.optional(),
      IsDraft:Joi.optional(),
      ParentOrganization:Joi.optional(),
      Range:Joi.optional()
 });

 return organization;

}else{

   const organization = Joi.object().keys({
     id:Joi.string().required().trim(),
    
  }).unknown(true);;
  return organization;
  
   }

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
      
      
      
      PhoneExt:Joi.string().allow(['',null]),
      IsActive:Joi.optional(),
      CreatedBy:Joi.string().optional().trim(),
      CreatedOn:Joi.optional(),
      
      IsDraft:Joi.optional(),
      ParentOrganization:Joi.string().required()
 });

 return organization;

}
exports.ValidateUpdateReseller=(schema)=>{

   if(!schema.IsDraft){
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
      PhoneExt:Joi.string().allow(['',null]),
      IsActive:Joi.optional(),
      UpdatedBy:Joi.string().required().trim(),
      UpdatedOn:Joi.optional(),
      
      IsDraft:Joi.optional(),
      ParentOrganization:Joi.optional()
 });

 return organization;

}else{

 const organization = Joi.object().keys({
   id:Joi.string().required().trim(),
  
}).unknown(true);;
return organization;

 }

}
exports.ValidateStrength = ( data)=>{
   console.log("ValidateStrength:ValidateStrength")

   if (data.Action=='Review') {
      
   
      const schema = Joi.object().keys({
       
         Action: Joi.string().required(),
         StrengthId:Joi.required(),
         ManagerComments:Joi.optional(),
         IsDraftByManager:Joi.optional(),
         IsManaFTSubmited: Joi.any().optional(),
         UpdatedBy: Joi.string().required(),
         empId: Joi.string().required(),
         CreatedYear:Joi.optional(),
         

      });
      return schema;
   
   }else { 
   const schema = Joi.object().keys({
      StrengthId:Joi.optional(),
      Strength: Joi.string().required(),
      Leverage: Joi.optional(),
      TeamBenifit: Joi.optional(),
      SelfBenifit: Joi.optional(),
      Action: Joi.optional(),
      Status: Joi.optional(),
      ProgressComments: Joi.optional(),
      ManagerComments: Joi.optional(),
      Employee: Joi.string().required(),
      Owner: Joi.string().required(),
      ManagerId: Joi.optional(),
      IsDraft:Joi.optional(),
      IsStrengthSubmited:Joi.optional(),
      CreatedYear:Joi.optional(),
      
  });
  return schema;

   }
}

exports.ValidateAccomplishment = ( data)=>{

    if (data.Action=='Draft' ) {
   

      const schema = Joi.object().keys({
         Accomplishment: Joi.string().required(),
         Action: Joi.string().required(),
         Owner:Joi.string().required(),
         CreatedBy:Joi.string().required(),
        
      }).unknown(true);;
      return schema;
   
   } 
  else if (data.Action=='Update') {
   

      const schema = Joi.object().keys({
         Accomplishment: Joi.string().required(),
        // Action: Joi.string().required(),
        isFirstTimeCreateing: Joi.optional(),
         Action: Joi.string().required(),
         AccompId:Joi.string().required(),
         UpdatedBy:Joi.string().required(),
        
      }).unknown(true);;
      return schema;
   
   }
   
   else {

   const schema = Joi.object().keys({
      Accomplishment: Joi.string().required(),
      CompletionDate: Joi.string().required(),
      ManagerId: Joi.string().required(),
      Comments: Joi.optional(),
      AccompId:Joi.optional(),
      ShowToManager: Joi.optional(),
      IsDraft:Joi.optional(),
      UpdatedBy:Joi.optional(),
      Action: Joi.optional(),
      
     // Employee:Joi.string().required(),
      Owner:Joi.string().required(),
      CreatedBy:Joi.string().required()
      
  });
  return schema;

   }

}




exports.ValidateKpi = ( data)=>{
if (data.Action=='Active' || data.Action=='DeActive') {
   

   const schema = Joi.object().keys({
      kpiId: Joi.required(),
      Action: Joi.string().required(),
      UpdatedBy: Joi.string().required(),
      IsActive: Joi.any().required(),
      empId: Joi.string().optional(),
      
   });
   return schema;

}
   else if (data.Action=='Viewed') {
   

   const schema = Joi.object().keys({
      kpiId: Joi.required(),
      ViewedByEmpOn: Joi.required(),
      UpdatedBy: Joi.string().required(),
      Action: Joi.string().required(),
      });
   return schema;

}

else if (data.Action=='Review') {
   

   const schema = Joi.object().keys({
      kpiId: Joi.required(),
      Action: Joi.string().required(),
      ManagerScore: Joi.optional(),
      YECommManager: Joi.optional(),
      CoachingReminder: Joi.string().optional(),
      ManagerComments: Joi.optional(),
      IsManaFTSubmited: Joi.any().optional(),
      UpdatedBy: Joi.string().required(),
      IsActive: Joi.any().required(),
      EvaluationYear: Joi.string().optional(),
   });
   return schema;

} else if (data.Action=='Draft') {
   

   const schema = Joi.object().keys({
      Kpi: Joi.required(),
      Action: Joi.string().required(),
      EvaluationYear: Joi.string().optional(),
     
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
    EvaluationId:Joi.string().optional(),
    isFinalSignoff:Joi.boolean().optional(),
    isManagerSubmitted:Joi.boolean().optional(),
    isFinalSignoff:Joi.boolean().optional(),
    UpdatedBy:Joi.string().required(),
    EvaluationYear: Joi.string().optional(),



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

   if (data.Action=='Draft' ) {
  

     const schema = Joi.object().keys({
        Note: Joi.string().required(),
        Action: Joi.string().required(),
        Owner:Joi.string().required(),
        CreatedBy:Joi.string().required(),
       
     }).unknown(true);;
     return schema;
  
  } 
 else if (data.Action=='Update') {
  

     const schema = Joi.object().keys({
        Note: Joi.string().required(),
       // Action: Joi.string().required(),
       isFirstTimeCreateing: Joi.optional(),
        Action: Joi.string().required(),
        NoteId:Joi.string().required(),
        UpdatedBy:Joi.string().required(),
       
     }).unknown(true);;
     return schema;
  
  }
  
  else {

  const schema = Joi.object().keys({
     Note: Joi.string().required(),
     Comments: Joi.optional(),
     NoteId:Joi.optional(),
     IsDraft:Joi.optional(),
     UpdatedBy:Joi.optional(),
     DiscussedWith:Joi.optional(),
     Action: Joi.optional(),
     Owner:Joi.string().required(),
     CreatedBy:Joi.string().required()
     
 });
 return schema;

  }

}
