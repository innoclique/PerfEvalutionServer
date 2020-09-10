const Validation_Helper = require('../Helpers/Validation_Helper');
const Joi = require('joi');
const OrganizaionService = require('../DataServices/OrganizationService')



exports.AddOrganization = async (req, res, next) => {
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
exports.GetOrganizationDataById = async (req, res, next) => {

    /////validate user input with joi-------------
    Joi.validate(req.body.id, Validation_Helper.ValidateString(), async (err, Result) => {

        if (err) { res.status(442).json({ mgs: err.details.map(i => i.message).join(" / ") }) }

        else {

            const Id = req.body.id;

            await OrganizaionService.GetOrganizationDataById(Id)
                .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Organization Not Found"))


                .catch(err => next("Organization Not Found"));


        }

    });
   
}
exports.GetAllOrganizations = async (req, res, next) => {
    await OrganizaionService.GetAllOrganizations()
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json("Organizations Not Found"))
        .catch(err => next("Organizations Not Found"));

}

