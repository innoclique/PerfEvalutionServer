const DeliverEmailRepo = require('../SchemaModels/DeliverEmail');

const getNotificationsByEmail = async (options) => {
    console.log('inside getNotificationsByEmail');
    let { email } = options
    return await DeliverEmailRepo.find({'Email':email,'IsDelivered':true});
}

module.exports = {
    GetNotifications: getNotificationsByEmail
}