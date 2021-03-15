const { LogUserActivity } = require('../DataServices/ActivityService');

const userActivityCtrl = async (req, res, next) => {
    console.log('inside userActivityCtrl ', req.body);
    await LogUserActivity(req.body)
        .then(Response => res.status(200).json(Response))
        .catch(error => {
            console.log(error);
            next(error)
        });
}

module.exports = {
    UserActivityCtrl: userActivityCtrl
}