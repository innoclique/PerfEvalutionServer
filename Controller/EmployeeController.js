const Validation_Helper = require('../Helpers/Validation_Helper');
const Joi = require('joi');
const UserService = require('../DataServices/UserService');
const EmployeeService = require('../DataServices/EmployeeService')
const EvaluationService=require('../DataServices/EvaluationService');
const PGSignoffService=require('../DataServices/PGSignoffService');

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
    await UserService.GetAllEmployees(req.body)
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


exports.GetSetupBasicData = async (req, res, next) => {
    await EmployeeService.GetSetupBasicData(req.body)
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
                    res.status(200).json(Response);
                })
                .catch(err => { next(err) });
        }
    });
}



exports.AddStrength = async (req, res, next) => {
    
    Joi.validate(req.body, Validation_Helper.ValidateStrength(req.body), async (err, result) => {
        if (err) { res.status(400).json({ message: err.details.map(i => i.message).join(" / ") }) }
        else {
            
            await EmployeeService.AddStrength(req.body)
                .then((Response) => {
                    res.status(200).json({  message: "Success" });
                })
                .catch(err => { ogger.error(err);next(err) });
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
                    res.status(200).json({ message: "Success" });
                })
                .catch(err => { next(err) });
        }
    });
}
exports.GetAllAccomplishments = async (req, res, next) => {
    await EmployeeService.GetAllAccomplishments(req.body)
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

    Joi.validate(req.body, Validation_Helper.ValidateAccomplishment(req.body), async (err, result) => {
        if (err) { res.status(400).json({ message: err.details.map(i => i.message).join(" / ") }) }
        else {
            
            await EmployeeService.UpdateAccomplishmentDataById(req.body)
                .then((Response) => {
                    res.status(200).json({  message: "Success" });
                })
                .catch(err => { next(err) });
        }
    });
}


exports.GetReporteeAccomplishments= async (req, res, next) => {
    await EmployeeService.GetReporteeAccomplishments(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("No Accomplishments Review found"))
        .catch(err => next(err));
}


exports.GetTSReleasedAccomplishments= async (req, res, next) => {
    await EmployeeService.GetTSReleasedAccomplishments(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("No Accomplishments Review found"))
        .catch(err => next(err));
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

exports.GetCopiesTo = async (req, res, next) => {
    console.log("inside GetCopiesTo:::::")
    await EmployeeService.getCopiesTo(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("copies to Not Found"))
        .catch(err => next(err));
}

exports.GetAllKpis = async (req, res, next) => {
    await EmployeeService.GetAllKpis(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Kpi Not Found"))
        .catch(err => next(err));

      

}


exports.GetKpisByManager = async (req, res, next) => {
    await EmployeeService.GetKpisByManager(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Kpi Not Found"))
        .catch(err => next(err));

      

}



exports.GetKpisByManagerId = async (req, res, next) => {
    await EmployeeService.GetKpisByManagerId(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Kpi Not Found"))
        .catch(err => next(err));

      

}


exports.SubmitAllKpisByManager = async (req, res, next) => {
    await EmployeeService.SubmitAllKpisByManager(req.body.empId)
        .then(Response => Response ? res.status(200).json({message: "Your sign-off is successful."}) : res.status(404).json("Kpi Not Found"))
        .catch(err => next(err));
}

exports.SubmitKpisByManager = async (req, res, next) => {
    await EmployeeService.SubmitKpisByManager(req.body)
        .then(Response => Response ? res.status(200).json({message: "Your sign-off is successful."}) : res.status(404).json("Kpi Not Found"))
        .catch(err => next(err));
}

exports.SubmitSignoffKpisByManager = async (req, res, next) => {
    await EmployeeService.SubmitSignoffKpisByManager(req.body)
        .then(Response => Response ? res.status(200).json({message: "Your sign-off is successful."}) : res.status(404).json("Kpi Not Found"))
        .catch(err => next(err));
}





exports.SubmitKpisForEvaluation = async (req, res, next) => {
    await EmployeeService.SubmitAllKpis(req.body.empId)
        .then(Response => Response ? res.status(200).json({message: "The Performance Goals have been submitted successfully and your sign-off registered."}) : res.status(404).json("Kpi Not Found"))
        .catch(err => next(err));
}

exports.SubmitAllSignOffKpis = async (req, res, next) => {
    await EmployeeService.SubmitAllSignOffKpis(req.body.empId)
        .then(Response => Response ? res.status(200).json({message: "The Performance Goals have been submitted successfully and your sign-off registered."}) : res.status(404).json("Kpi Not Found"))
        .catch(err => next(err));
}

exports.DenyAllSignOffKpis = async (req, res, next) => {
    await EmployeeService.DenyAllSignOffKpis(req.body.empId)
        .then(Response => Response ? res.status(200).json({message: "The Performance Goals have been submitted successfully and your sign-off registered."}) : res.status(404).json("Kpi Not Found"))
        .catch(err => next(err));
}


exports.SubmitKpisByEmployee = async (req, res, next) => {
    await EmployeeService.SubmitKpisByEmployee(req.body)
        .then(Response => Response ? res.status(200).json({message: "The Performance Goals have been submitted successfully and your sign-off registered."}) : res.status(404).json("Kpi Not Found"))
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

exports.DenyAllSignoffKpis = async (req, res, next) => {
    await EmployeeService.DenyAllSignoffKpis(req.body)
    .then((Response) => {
        res.status(200).json({  message: "Success" });
    })
    .catch(err => { next(err) });
}






exports.GetUnlistedEmployees=async (req,res,next)=>{
    await EmployeeService.GetUnlistedEmployees(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json(""))
        .catch(err => next(err => { next(err) }));
}

// FOR ADHOC PAYMENT DATA

exports.GetPaymentInfo=async (req,res,next)=>{
    await EmployeeService.GetPaymentInfo(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json(""))
        .catch(err => next(err => { next(err) }));
}

exports.GetManagers=async (req,res,next)=>{
    await EmployeeService.GetManagers(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json(""))
        .catch(err => next(err => { next(err) }));
}

exports.GetImmediateApprCircle=async (req,res,next)=>{
    await EmployeeService.GetImmediateApprCircle(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json(""))
        .catch(err => next(err => { next(err) }));
}

exports.GetThirdSignatorys=async (req,res,next)=>{
    await EmployeeService.GetThirdSignatorys(req.body)
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
exports.Dashboard = async (req,res,next)=>{
    await EmployeeService.DashboardData(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json(""))
        .catch(err => next(err => { next(err) }));
}


exports.GetKpisForTS = async (req, res, next) => {
    await EmployeeService.GetKpisForTS(req.body.TsId)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Kpi Not Found"))
        .catch(err => next(err));
}

exports.SaveCompetencyQnA= async (req, res, next) => {
    await EmployeeService.SaveCompetencyQnA(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Kpi Not Found"))
        .catch(err => next(err));
}
exports.GetPendingPeerReviewsList= async (req, res, next) => {
    await EmployeeService.GetPendingPeerReviewsList(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("No Peer Review found"))
        .catch(err => next(err));
}
exports.GetPendingPeerReviewsToSubmit= async (req, res, next) => {
    await EmployeeService.GetPendingPeerReviewsToSubmit(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("No Peer Review found"))
        .catch(err => next(err));
}

exports.SavePeerReview= async (req, res, next) => {
    await EmployeeService.SavePeerReview(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("No Peer Review found"))
        .catch(err => next(err));
}
exports.SaveEmployeeFinalRating= async (req, res, next) => {
    await EmployeeService.SaveEmployeeFinalRating(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("No Peer Review found"))
        .catch(err => next(err));
}


exports.SaveManagerFinalRating= async (req, res, next) => {
    await EmployeeService.SaveManagerFinalRating(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("No Peer Review found"))
        .catch(err => next(err));
}


exports.SaveTSFinalRating= async (req, res, next) => {
    await EmployeeService.SaveTSFinalRating(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("No Peer Review found"))
        .catch(err => next(err));
}

exports.GetPeerAvgRating= async (req, res, next) => {
    await EmployeeService.GetPeerAvgRating(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("No Peer Review found"))
        .catch(err => next(err));
}
exports.GetReporteeEvaluations= async (req, res, next) => {
    await EvaluationService.GetReporteeEvaluations(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("No Peer Review found"))
        .catch(err => next(err));
}
exports.GetTSReporteeEvaluations= async (req, res, next) => {
    await EvaluationService.GetTSReporteeEvaluations(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("No Peer Review found"))
        .catch(err => next(err));
}
exports.GetDRReviewsList= async (req, res, next) => {
    await EmployeeService.GetDRReviewsList(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("No Peer Review found"))
        .catch(err => next(err));
}
exports.GetPendingDRReviewsToSubmit= async (req, res, next) => {
    await EmployeeService.GetPendingDRReviewsToSubmit(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("No Peer Review found"))
        .catch(err => next(err));
}

exports.SaveDRReview= async (req, res, next) => {
    await EmployeeService.SaveDRReview(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("No Peer Review found"))
        .catch(err => next(err));
}

exports.SaveCompetencyQnAByManager= async (req, res, next) => {
    await EmployeeService.SaveCompetencyQnAByManager(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("No Peer Review found"))
        .catch(err => next(err));
}
exports.GetOverallRatingByCompetency= async (req, res, next) => {
    await EmployeeService.GetOverallRatingByCompetency(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("No Peer Review found"))
        .catch(err => next(err));
}

exports.PGSignoffCtrl= async (req, res, next) => {
    await PGSignoffService.PGSignOffSave(req.body)
        .then(Response => Response ? res.status(200).json({description:'PG Signoff Submitted'}) : res.status(404).json("Error in save singoff"))
        .catch(err => next(err));
}

exports.GetPGSignoffByOwnerCtrl= async (req, res, next) => {
    let response = await PGSignoffService.GetPGSignoffByOwner(req.body);
    res.json(response);
}
