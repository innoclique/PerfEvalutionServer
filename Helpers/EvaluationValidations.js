const Joi = require('joi');
exports.ValidateEvaluationForm = (data) => {
    const schema = Joi.object().keys({
        Employees: Joi.string().required(),
        EvaluationPeriod: Joi.string().required(),
        EvaluationDuration: Joi.string().optional(),
        ActivateKPI: Joi.bool().optional(),
        ActivateActionPlan: Joi.bool().optional(),
        EvaluationForRole: Joi.string().optional(),

        EvaluationDuration: Joi.string().optional(),
        Model: Joi.string().required(),
        PeerRatingNeeded: Joi.bool().optional(),
        DirectReportRateNeeded: Joi.bool().optional(),
        Peers: Joi.optional(),
        PeersComptency: Joi.string().optional(),
        PeersMessage: Joi.string().optional(),
        DirectReports: Joi.string().optional(),
        DirectReportsCompetency: Joi.string().optional(),
        
        DirectReportMessage: Joi.string().optional(),
        PeerCompetency: Joi.string().optional(),
        PeerComptencyMessage: Joi.string().optional(),
        DirectReportRateNeeded:Joi.bool().optional(),
        
    });
    return schema;

}