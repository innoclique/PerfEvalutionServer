const Joi = require('joi');
exports.ValidateEvaluationForm = (data) => {
    const schema = Joi.object().keys({
        Employees:Joi.array().items(Joi.object().required()).min(1).required(),
        EvaluationPeriod: Joi.string().required(),
        EvaluationDuration: Joi.string().optional(),
        ActivateKPI: Joi.bool().optional(),
        ActivateActionPlan: Joi.bool().optional(),
        EvaluationForRole: Joi.string().optional(),
        EvaluationDuration: Joi.string().optional(),
        Model:Joi.array().items(Joi.object().required()).min(1).required(),
        PeerRatingNeeded: Joi.bool().optional(),
        
        DirectReportRateNeeded: Joi.bool().optional(),
        Peers:Joi.when('PeerRatingNeeded',{
            is:"true",
            then:Joi.array().min(2).required()
         }),
         PeersCompetency: Joi.when('PeerRatingNeeded',{
            is:"true",
            then:Joi.array().min(1).required()
         }),
         PeersComptencyMessage: Joi.optional(),
        DirectReports:Joi.when('DirectReportRateNeeded',{
            is:"true",
            then:Joi.array().min(2).required()
         }),
        DirectReportsCompetency: Joi.when('DirectReportRateNeeded',{
            is:"true",
            then:Joi.array().min(1).required()
         }),
        DirectReportMessage: Joi.optional(),        
        
        KPIFor:Joi.optional(),
        Department:Joi.string(),
        Company:Joi.string(),
        CreatedBy:Joi.string()
    });
    return schema;

}

exports.ValidateClientId=(data)=>{
    const schema = Joi.object().keys({        
        clientId: Joi.string().required(),
    });
    return schema;   
}