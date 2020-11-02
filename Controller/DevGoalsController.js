const DevGoalsValidations = require('../Helpers/DevGoalsValidations');
const Joi = require('joi');
const UserService = require('../DataServices/UserService');
const DevGoalsService = require('../DataServices/DevGoalsService')


exports.GetKpisForDevGoals = async (req, res, next) => {
    await DevGoalsService.GetKpisForDevGoals(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Kpi Not Found"))
        .catch(err => next(err));

      

}


exports.GetAllDevGoals = async (req, res, next) => {
    await DevGoalsService.GetAllDevGoals(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Kpi Not Found"))
        .catch(err => next(err));

      

}



exports.UpdateDevGoalById = async (req, res, next) => {
    
    Joi.validate(req.body, DevGoalsValidations.ValidateDevGoal(req.body), async (err, result) => {
        if (err) { res.status(400).json({ message: err.details.map(i => i.message).join(" / ") }) }
        else {
            
            await DevGoalsService.UpdateDevGoalById(req.body)
                .then((Response) => {
                    res.status(200).json({  message: "Success" });
                })
                .catch(err => { next(err) });
        }
    });
}


exports.AddDevGoal = async (req, res, next) => {
    
    Joi.validate(req.body, DevGoalsValidations.ValidateDevGoal(req.body), async (err, result) => {
        if (err) { res.status(400).json({ message: err.details.map(i => i.message).join(" / ") }) }
        else {
            
            await DevGoalsService.AddDevGoal(req.body)
                .then((Response) => {
                    res.status(200).json({  message: "Success" });
                })
                .catch(err => { next(err) });
        }
    });
}