const UserActivityRepo = require('../SchemaModels/UserActivity');

const logUserActivity = async (activity) => {
    console.log('inside logUserActivity');
    var res = await UserActivityRepo.insertMany(activity);
    console.log(res);
    return true;
}

module.exports = {
    LogUserActivity: logUserActivity
}
