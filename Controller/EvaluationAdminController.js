const Express = require("express");
const Validation = require('../Helpers/EvaluationValidations');
const UserService = require('../DataServices/UserService');
const EvaluationService=require('../DataServices/EvaluationService');
const Joi = require('joi');
var logger = require('../logger');
const { response } = require("express");


exports.CreateEvaluation = async (req, res, next) => {
    
    Joi.validate(req.body, Validation.ValidateEvaluationForm(req.body), async (err, result) => {
        if (err) { res.status(400).json({ message: err.details.map(i => i.message).join(" / ") }) }
        else {
            await EvaluationService.AddEvaluation( req.body)
            .then(Response => res.status(200).json(Response))
            .catch(error =>{
                logger.error(error)
                 next(error)});
        }
    });

    //const CurrentUserId = req.user.Id;
    
}
exports.DraftEvaluation = async (req, res, next) => {
    
    Joi.validate(req.body, Validation.ValidateDraftEvaluationForm(req.body), async (err, result) => {
        if (err) { res.status(400).json({ message: err.details.map(i => i.message).join(" / ") }) }
        else {
            await EvaluationService.DraftEvaluation( req.body)
            .then(Response => res.status(200).json(Response))
            .catch(error =>{
                logger.error(error)
                 next(error)});
        }
    });

    //const CurrentUserId = req.user.Id;
    
}

exports.GetEvaluations = async (req,res,next)=>{
    
    Joi.validate(req.body, Validation.ValidateClientId(req.body), async (err, result) => {
        if (err) { res.status(400).json({ message: err.details.map(i => i.message).join(" / ") }) }
        else {
            await EvaluationService.GetEvaluations( req.body)
            .then(Response => res.status(200).json(Response))
            .catch(error =>{
                logger.error(error)
                 next(error)});
        }
    });
}
