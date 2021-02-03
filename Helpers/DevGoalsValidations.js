const Joi = require('joi');



exports.ValidateDevGoal = ( data)=>{
   if (data.Action=='Active' || data.Action=='DeActive') {
      
   
      const schema = Joi.object().keys({
         devGoalId: Joi.required(),
         Action: Joi.string().required(),
         UpdatedBy: Joi.string().required(),
         IsActive: Joi.any().required()
      });
      return schema;
   
   }
      else if (data.Action=='Viewed') {
      
   
      const schema = Joi.object().keys({
         devGoalId: Joi.required(),
        // ViewedByEmpOn: Joi.required(),
        UpdatedBy: Joi.string().required(),
         empId: Joi.string().required(),
         ViewedByManagerOn: Joi.required(),
         Action: Joi.string().required(),
         CreatedYear: Joi.optional(),
         });
      return schema;
   
   }
   
   else if (data.Action=='Review') {
      
   
      const schema = Joi.object().keys({
       
         Action: Joi.string().required(),
         devGoalId:Joi.required(),
         ManagerComments:Joi.optional(),
         IsDraftByManager:Joi.optional(),
         IsManaFTSubmited: Joi.any().optional(),
         UpdatedBy: Joi.string().required(),
         empId: Joi.string().required(),


      });
      return schema;
   
   } else if (data.Action=='Draft') {
      
   
      const schema = Joi.object().keys({
         DevGoal: Joi.required(),
         Action: Joi.string().required(),
         CreatedYear: Joi.optional(),
        
      }).unknown(true);;
      return schema;
   
   }  else {
      
      const schema = Joi.object().keys({
         DevGoal: Joi.string().required(),
         DesiredOutcomes: Joi.string().required(),
         GoalActionItems: Joi.any().required(),
         Kpi: Joi.optional(),
         MakePrivate: Joi.optional(),
        
         devGoalId:Joi.optional(),
         ManagerComments:Joi.optional(),



         Signoff:Joi.optional(),
       YECommManager:Joi.optional(),
       
        ManagerId:Joi.optional(),
        ViewedByEmpOn:Joi.optional(),
       IsDraft:Joi.boolean().required(),
       IsDraftByManager:Joi.optional(),
    
       CreatedBy:Joi.string().optional(),
       Owner:Joi.string().optional(),
       EvaluationId:Joi.string().optional(),
       CreatedYear: Joi.optional(),
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
   