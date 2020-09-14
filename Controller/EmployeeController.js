const Validation_Helper = require('../Helpers/Validation_Helper');
const Joi = require('joi');
const UserService = require('../DataServices/UserService');
const EmployeeService = require('../DataServices/EmployeeService')



exports.CreateEmployee = async (req, res, next) => {
    Joi.validate(req.body, Validation_Helper.ValidateCreateAccountModel(req.body), async (err, result) => {
        if (err) { res.status(400).json({ message: err.details.map(i => i.message).join(" / ") }) }
        else {
            debugger
            await UserService.CreateEmployee(req.body)
                .then((Response) => {
                    res.status(200).json({ message: " Employee added Succeesfully" });
                })
                .catch(err => { next(err) });
        }
    });
}
exports.GetEmployeeDataById = async (req, res, next) => {
    Joi.validate(req.body.id, Validation_Helper.ValidateString(), async (err, Result) => {
        if (err) { res.status(442).json({ mgs: err.details.map(i => i.message).join(" / ") }) }
        else {
            const Id = req.body.id;
            await UserService.GetEmployeeDataById(Id)
                .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Employee Not Found"))
                .catch(err => next(err => { next(err) }));
        }
    });
}
exports.GetAllEmployees = async (req, res, next) => {
    await UserService.GetAllEmployees(req.body.parentId)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Employees Not Found"))
        .catch(err => next(err => { next(err) }));

}

//



exports.AddStrength = async (req, res, next) => {
    debugger
    Joi.validate(req.body, Validation_Helper.ValidateStrength(req.body), async (err, result) => {
        if (err) { res.status(400).json({ message: err.details.map(i => i.message).join(" / ") }) }
        else {
            debugger
            await EmployeeService.AddStrength(req.body)
                .then((Response) => {
                    res.status(200).json({ message: " Strength added Succeesfully" });
                })
                .catch(err => { next(err) });
        }
    });
}