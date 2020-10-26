const Joi = require('joi');



exports.ValidateDevGoal = ( data)=>{
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
         DevGoal: Joi.string().required(),
         MeasurementCriteria: Joi.required(),
         TargetCompletionDate: Joi.string().required(),
         Score: Joi.optional(),
         kpiId:Joi.optional(),
         devGoalId:Joi.optional(),
         ManagerComments:Joi.optional(),



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
   