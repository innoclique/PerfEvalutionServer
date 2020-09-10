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
                .catch(err => {next(err)});
                
        }
    });
}
