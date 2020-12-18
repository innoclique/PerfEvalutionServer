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
        Model:Joi.string().allow(['',null]).optional(),
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
        CreatedBy:Joi.string(),
        IsDraft:Joi.optional(),
        EvaluationId:Joi.optional(),
    });
    return schema;

}
exports.ValidateDraftEvaluationForm = (data) => {
    const schema = Joi.object().keys({
        
        Employees:Joi.array().items(Joi.object().required()).min(1).required(),
        EvaluationPeriod: Joi.string().allow('').optional(),
        EvaluationDuration: Joi.string().allow('').optional(),
        ActivateKPI:Joi.bool().allow(false).optional(),
        ActivateActionPlan: Joi.bool().allow(false).optional(),
        EvaluationForRole: Joi.string().allow('').optional(),
        EvaluationDuration: Joi.string().allow('').optional(),
        Model:Joi.string().allow(['',null]).optional(),
        PeerRatingNeeded: Joi.bool().allow(false).optional(),        
        DirectReportRateNeeded: Joi.bool().allow(false).optional(),
        Peers:Joi.when('PeerRatingNeeded',{
            is:"true",
            then:Joi.array().optional()
         }),
         PeersCompetency: Joi.when('PeerRatingNeeded',{
            is:"true",
            then:Joi.array().optional()
         }),
         PeersComptencyMessage: Joi.optional(),
        DirectReports:Joi.when('DirectReportRateNeeded',{
            is:"true",
            then:Joi.array().optional()
         }),
        DirectReportsCompetency: Joi.when('DirectReportRateNeeded',{
            is:"true",
            then:Joi.array().optional()
         }),
        DirectReportMessage: Joi.string().allow('').optional(),        
        
        KPIFor:Joi.string().allow('').optional(),
        
        Company:Joi.string().required(),
        CreatedBy:Joi.string().required(),
        IsDraft:Joi.bool().required()
    });
    return schema;

}
exports.ValidateClientId=(data)=>{
    const schema = Joi.object().keys({        
        clientId: Joi.string().required(),
    });
    return schema;   
}

exports.ValidateUpdateEvaluationForm = (data) => {
    const schema = Joi.object().keys({
        Employees:Joi.array().items(Joi.object().required()).min(1).required(),
        
        
    });
    return schema;

}