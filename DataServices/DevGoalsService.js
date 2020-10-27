require('dotenv').config();
const Mongoose = require("mongoose");
const DevGoalsRepo = require('../SchemaModels/DevGoals');
const UserRepo = require('../SchemaModels/UserSchema');
const KpiRepo = require('../SchemaModels/KPI');
const EvaluationRepo = require('../SchemaModels/Evalution');
var logger = require('../logger');


exports.GetKpisForDevGoals = async (data) => {


    try {
        const Kpi = await KpiRepo.find({ 'Owner': data.empId })
            .populate('MeasurementCriteria.measureId Owner')
            .sort({ UpdatedOn: -1 });


        return Kpi
    } catch (error) {
        logger.error(err)

        console.log(err);
        throw (err);

    }


};






exports.GetAllDevGoals = async (data) => {

try{

    var allEvaluation = await EvaluationRepo.find({
        Employees: { $elemMatch: { _id: Mongoose.Types.ObjectId(data.empId) } },
        Company: data.orgId
    }).sort({ CreatedDate: -1 });
    let currEvaluation = allEvaluation[0];
    let preEvaluation = allEvaluation[1];

    // if (!currEvaluation || allEvaluation.length==0) {
    //   throw Error("KPI Setting Form Not Activeted");
    // }

    var preDevGoals = [];
    if (preEvaluation && !data.currentOnly) {
        //    preDevGoals = await DevGoalsRepo.find({'Owner':data.empId, 'EvaluationId':preEvaluation._id})
        preDevGoals = await DevGoalsRepo.find({ 'Owner': data.empId })
            //   .populate('')
            .sort({ UpdatedOn: -1 });
    }


    //   const Kpi = await KpiRepo.find({'Owner':data.empId,'IsDraftByManager':false, 'EvaluationId':currEvaluation._id})
    const devGoals = await DevGoalsRepo.find({ 'Owner': data.empId, 'IsDraftByManager': false })
        //   .populate('MeasurementCriteria.measureId Owner')
        .sort({ UpdatedOn: -1 });


    return [...devGoals, ...preDevGoals];


} catch (error) {
    logger.error(err)

    console.log(err);
    throw (err);

}
};






exports.AddDevGoal = async (devGoalModel) => {
    try {
        var devGoal = new DevGoalsRepo(devGoalModel);
        devGoal = await devGoal.save();

        devGoalModel.Action = 'Create';
        devGoalModel.devGoalId = devGoal.id;
        this.addDevGoalTrack(devGoalModel);

        return true;
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }

}






exports.addDevGoalTrack = async (devGoalModel) => {

    var reportOBJ = await DevGoalsRepo.findOne({
        _id: Mongoose.Types.ObjectId(devGoalModel.devGoalId)
    });
    reportOBJ.tracks = reportOBJ.tracks || [];

    const actor = await UserRepo.findOne({ "_id": devGoalModel.UpdatedBy })

    var track = {
        actorId: devGoalModel.UpdatedBy,
        action: devGoalModel.Action,
        comment: actor.FirstName + " " + "has " + devGoalModel.Action + " at " + new Date().toLocaleDateString()
    }
    reportOBJ.tracks.push(track);
    return await reportOBJ.save();

}


