const Validation_Helper = require('../Helpers/Validation_Helper');
const Joi = require('joi');
const OrganizaionService = require('../DataServices/OrganizationService');
const logger = require('../logger');



exports.AddOrganization = async (req, res, next) => {
    try {
        if (req.body.IsDraft) {
            await OrganizaionService.CreateOrganization(req.body)
                .then((Response) => {
                    res.status(200).json({ message: " Organization added Succeesfully" });
                })
                .catch(err => { next(err) });
        } else {
            Joi.validate(req.body, Validation_Helper.OrganizationSchema(req.body), async (err, result) => {
                if (err) { res.status(400).json({ message: err.details.map(i => i.message).join(" / ") }) }
                else {
                    await OrganizaionService.CreateOrganization(req.body)
                        .then((Response) => {
                            res.status(200).json({ message: " Organization added Succeesfully" });
                        })
                        .catch(err => { next(err) });
                }
            });
        }

    } catch (error) {
        next(error)
    }
}
exports.UpdateOrganization = async (req, res, next) => {
    Joi.validate(req.body, Validation_Helper.UpdateOrganizationSchema(req.body), async (err, result) => {
        if (err) { res.status(400).json({ message: err.details.map(i => i.message).join(" / ") }) }
        else {
            await OrganizaionService.UpdateOrganization(req.body)
                .then((Response) => {
                    res.status(200).json({ message: " Organization added Succeesfully" });
                })
                .catch(err => { next(err) });
        }
    });
}

exports.UpdateOrgProfile = async (req, res, next) => {
    console.log('inside UpdateOrgProfile : ', req.body);
    if (!req.body.IsDraft) {
        if (req.body.ClientType === 'Client') {
            console.log('client update : ');
            Joi.validate(req.body, Validation_Helper.UpdateOrganizationSchema(req.body), async (err, result) => {
                if (err) { res.status(400).json({ message: err.details.map(i => i.message).join(" / ") }) }
                else {
                    await OrganizaionService.UpdateOrganization(req.body)
                        .then((Response) => {
                            res.status(200).json({ message: " Organization added Succeesfully" });
                        })
                        .catch(err => { next(err) });
                }
            });
        } else {
            console.log('reseller update : ');
            Joi.validate(req.body, Validation_Helper.ValidateUpdateReseller(req.body), async (err, result) => {
                if (err) { res.status(400).json({ message: err.details.map(i => i.message).join(" / ") }) }
                else {
                    await OrganizaionService.UpdateReseller(req.body)
                        .then((Response) => {
                            res.status(200).json({ message: " Reseller updated Succeesfully" });
                        })
                        .catch(err => { next(err) });
                }
            });
        }
    } else {
        await OrganizaionService.UpdateOrgProfile(req.body)
            .then((Response) => {
                res.status(200).json({ message: " Reseller updated Succeesfully" });
            })
            .catch(err => { next(err) });
    }
}

exports.GetOrgProfile = async (req, res, next) => {
    var orgProfile = await OrganizaionService.getOrgProfile(req.body);
    console.log('getOrgProfile :: ', JSON.stringify(orgProfile));
    res.json(orgProfile);
}
exports.GetOrganizationDataById = async (req, res, next) => {
    Joi.validate(req.body.id, Validation_Helper.ValidateString(), async (err, Result) => {
        if (err) { res.status(442).json({ mgs: err.details.map(i => i.message).join(" / ") }) }
        else {
            const Id = req.body.id;
            await OrganizaionService.GetOrganizationDataById(Id)
                .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Organization Not Found"))
                .catch(err => next(err => { next(err) }));
        }
    });
}
exports.GetAllOrganizations = async (req, res, next) => {
    await OrganizaionService.GetAllOrganizations(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Organizations Not Found"))
        .catch(err => next(err => { next(err) }));

}

exports.GetAllOrganizationsForReseller = async (req, res, next) => {
    await OrganizaionService.GetAllOrganizationsForReseller(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Organizations Not Found"))
        .catch(err => next(err => { next(err) }));

}

exports.SuspendOrg = async (req, res, next) => {
    await OrganizaionService.SuspendOrg(req.body)
        .then(Response => Response ? res.status(200).json(Response) :
            res.status(404).json("Organization Suspended Successfully"))
        .catch(err => next(err => { logger.error(err); next(err) }));
}
exports.ActivateOrg = async (req, res, next) => {
    await OrganizaionService.ActivateOrg(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Organization Activated Successfully"))
        .catch(err => next(err => { logger.error(err); next(err) }));
}
exports.AddNote = async (req, res, next) => {

    Joi.validate(req.body, Validation_Helper.ValidateNote(req.body), async (err, result) => {
        if (err) { res.status(400).json({ message: err.details.map(i => i.message).join(" / ") }) }
        else {
            

            await OrganizaionService.AddNotes(req.body)
                .then((Response) => {
                    res.status(200).json({ message: "Success" });
                })
                .catch(err => { next(err) });
        }

    });
}
exports.GetAllNotes = async (req, res, next) => {
    await OrganizaionService.GetAllNotes(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Note Not Found"))
        .catch(err => next(err => { next(err) }));

}
exports.GetNoteDataById = async (req, res, next) => {
    Joi.validate(req.body.id, Validation_Helper.ValidateString(), async (err, Result) => {
        if (err) { res.status(442).json({ mgs: err.details.map(i => i.message).join(" / ") }) }
        else {
            const Id = req.body.id;
            await OrganizaionService.GetNoteDataById(Id)
                .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Note Not Found"))
                .catch(err => next(err => { next(err) }));
        }
    });
}
exports.UpdateNoteDataById = async (req, res, next) => {

    Joi.validate(req.body, Validation_Helper.ValidateNote(req.body), async (err, result) => {
        if (err) { res.status(400).json({ message: err.details.map(i => i.message).join(" / ") }) }
        else {
            
            await OrganizaionService.UpdateNote(req.body)
                .then((Response) => {
                    res.status(200).json({  message: "Success" });
                })
                .catch(err => { next(err) });
        }
    });
}



exports.AddReseller = async (req, res, next) => {

    if (req.body.IsDraft) {
        await OrganizaionService.AddReseller(req.body)
            .then((Response) => {
                res.status(200).json({ message: " Reseller added Succeesfully" });
            })
            .catch(err => { next(err) });
    } else {
    Joi.validate(req.body, Validation_Helper.ValidateAddReseller(req.body), async (err, result) => {
        if (err) { res.status(400).json({ message: err.details.map(i => i.message).join(" / ") }) }
        else {
            await OrganizaionService.AddReseller(req.body)
                .then((Response) => {
                    res.status(200).json({ message: " Reseller added Succeesfully" });
                })
                .catch(err => { next(err) });
        }
    });
}
}
exports.UpdateReseller = async (req, res, next) => {
    Joi.validate(req.body, Validation_Helper.ValidateUpdateReseller(req.body), async (err, result) => {
        if (err) { res.status(400).json({ message: err.details.map(i => i.message).join(" / ") }) }
        else {
            await OrganizaionService.UpdateReseller(req.body)
                .then((Response) => {
                    res.status(200).json({ message: " Reseller updated Succeesfully" });
                })
                .catch(err => { next(err) });
        }
    });
}
