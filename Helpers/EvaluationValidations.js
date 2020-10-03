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
        Model: Joi.string().required(),
        PeerRatingNeeded: Joi.bool().optional(),
        
        DirectReportRateNeeded: Joi.bool().optional(),
        Peers:Joi.when('PeerRatingNeeded',{
            is:"true",
            then:Joi.array().items(Joi.string().required()).min(2).required(),
         }),
        PeersComptency: Joi.string().optional(),
        PeersMessage: Joi.string().optional(),
        DirectReports:Joi.when('DirectReportRateNeeded',{
            is:"true",
            then:Joi.array().items(Joi.string().required()).min(2).required(),
         }),
        DirectReportsCompetency: Joi.string().optional(),        
        DirectReportMessage: Joi.string().optional(),
        PeerCompetency: Joi.string().optional(),
        PeerComptencyMessage: Joi.string().optional(),        
        KPIFor:Joi.optional(),
        Department:Joi.string()
        
    });
    return schema;

}