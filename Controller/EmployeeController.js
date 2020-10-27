const Validation_Helper = require('../Helpers/Validation_Helper');
const Joi = require('joi');
const UserService = require('../DataServices/UserService');
const EmployeeService = require('../DataServices/EmployeeService')



exports.CreateEmployee = async (req, res, next) => {
    Joi.validate(req.body, Validation_Helper.ValidateCreateEmployeeModel(req.body), async (err, result) => {
        if (err) { res.status(400).json({ message: err.details.map(i => i.message).join(" / ") }) }
        else {
            
            await UserService.CreateEmployee(req.body)
                .then((Response) => {
                    res.status(200).json({ message: "Success" });
                })
                .catch(err => { next(err) });
        }
    });
}


exports.UpdateEmployee = async (req, res, next) => {
    Joi.validate(req.body, Validation_Helper.ValidateCreateEmployeeModel(req.body), async (err, result) => {
        if (err) { res.status(400).json({ message: err.details.map(i => i.message).join(" / ") }) }
        else {
            
            await UserService.UpdateEmployee(req.body)
                .then((Response) => {
                    res.status(200).json({ message: "Success" });
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

// Get All Departments
exports.GetAllDepartments = async (req, res, next) => {
    await EmployeeService.GetAllDepartments(req.body.empId)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Accomplishments Not Found"))
        .catch(err => next(err => { next(err) }));

}

exports.GetEmpSetupBasicData = async (req, res, next) => {
    await EmployeeService.GetEmpSetupBasicData(req.body.industry)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Accomplishments Not Found"))
        .catch(err => next(err => { next(err) }));

}


exports.GetKpiSetupBasicData = async (req, res, next) => {
    await EmployeeService.GetKpiSetupBasicData(req.body.empId,req.body.orgId)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Accomplishments Not Found"))
        .catch(err => next(err => { next(err) }));

}



exports.GetAllMeasurementCriterias = async (req, res, next) => {
    await EmployeeService.GetAllMeasurementCriterias(req.body.empId)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Accomplishments Not Found"))
        .catch(err => next(err => { next(err) }));

}




exports.CreateMeasurementCriteria = async (req, res, next) => {
    Joi.validate(req.body, Validation_Helper.ValidateCommonModel(req.body), async (err, result) => {
        if (err) { res.status(400).json({ message: err.details.map(i => i.message).join(" / ") }) }
        else {
            
            await EmployeeService.CreateMeasurementCriteria(req.body)
                .then((Response) => {
                    res.status(200).json({ message: "Success" });
                })
                .catch(err => { next(err) });
        }
    });
}



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
exports.GetAllStrengths = async (req, res, next) => {
    await EmployeeService.GetAllStrengths(req.body.empId)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Strengths Not Found"))
        .catch(err => next(err => { next(err) }));

}
exports.AddAccomplishment = async (req, res, next) => {
    
    Joi.validate(req.body, Validation_Helper.ValidateAccomplishment(req.body), async (err, result) => {
        if (err) { res.status(400).json({ message: err.details.map(i => i.message).join(" / ") }) }
        else {
            
            await EmployeeService.AddAccomplishment(req.body)
                .then((Response) => {
                    res.status(200).json({ message: " Accomplishment added Succeesfully" });
                })
                .catch(err => { next(err) });
        }
    });
}
exports.GetAllAccomplishments = async (req, res, next) => {
    await EmployeeService.GetAllAccomplishments(req.body.empId)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Accomplishments Not Found"))
        .catch(err => next(err => { next(err) }));

}
exports.GetAccomplishmentDataById = async (req, res, next) => {
    Joi.validate(req.body.id, Validation_Helper.ValidateString(), async (err, Result) => {
        if (err) { res.status(442).json({ mgs: err.details.map(i => i.message).join(" / ") }) }
        else {
            const Id = req.body.id;
            await EmployeeService.GetAccomplishmentDataById(Id)
                .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Accomplishment Not Found"))
                .catch(err => next(err => { next(err) }));
        }
    });
}
exports.UpdateAccomplishmentDataById = async (req, res, next) => {
}
exports.AddKpi = async (req, res, next) => {
    
    Joi.validate(req.body, Validation_Helper.ValidateKpi(req.body), async (err, result) => {
        if (err) { res.status(400).json({ message: err.details.map(i => i.message).join(" / ") }) }
        else {
            
            await EmployeeService.AddKpi(req.body)
                .then((Response) => {
                    res.status(200).json({  message: "Success" });
                })
                .catch(err => { next(err) });
        }
    });
}
exports.GetAllKpis = async (req, res, next) => {
    await EmployeeService.GetAllKpis(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Kpi Not Found"))
        .catch(err => next(err));

      

}


exports.GetKpisByManager = async (req, res, next) => {
    await EmployeeService.GetKpisByManager(req.body.managerId)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Kpi Not Found"))
        .catch(err => next(err));

      

}



exports.SubmitKpisForEvaluation = async (req, res, next) => {
    await EmployeeService.SubmitAllKpis(req.body.empId)
        .then(Response => Response ? res.status(200).json({message: "The KPIs have been submitted successfully and your sign-off registered."}) : res.status(404).json("Kpi Not Found"))
        .catch(err => next(err));

      

}


exports.GetKpiDataById = async (req, res, next) => {
    Joi.validate(req.body.id, Validation_Helper.ValidateString(), async (err, Result) => {
        if (err) { res.status(442).json({ mgs: err.details.map(i => i.message).join(" / ") }) }
        else {
            const Id = req.body.id;
            await EmployeeService.GetKpiDataById(Id)
                .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Kpi Not Found"))
                .catch(err => next(err => { next(err) }));
        }
    });
}



exports.UpdateKpiDataById = async (req, res, next) => {
    
    Joi.validate(req.body, Validation_Helper.ValidateKpi(req.body), async (err, result) => {
        if (err) { res.status(400).json({ message: err.details.map(i => i.message).join(" / ") }) }
        else {
            
            await EmployeeService.UpdateKpi(req.body)
                .then((Response) => {
                    res.status(200).json({  message: "Success" });
                })
                .catch(err => { next(err) });
        }
    });
}




exports.GetUnlistedEmployees=async (req,res,next)=>{
    await EmployeeService.GetUnlistedEmployees(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json(""))
        .catch(err => next(err => { next(err) }));
}

exports.GetDirectReporteesOfManager=async (req,res,next)=>{
    await EmployeeService.GetDirectReporteesOfManager(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json(""))
        .catch(err => next(err => { next(err) }));
}

exports.GetPeers=async (req,res,next)=>{
    await EmployeeService.GetPeers(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json(""))
        .catch(err => next(err => { next(err) }));
}


exports.GetKpisForTS = async (req, res, next) => {
    await EmployeeService.GetKpisForTS(req.body.TsId)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Kpi Not Found"))
        .catch(err => next(err));

      

}