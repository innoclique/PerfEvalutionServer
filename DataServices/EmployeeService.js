const DbConnection = require("../Config/DbConfig");
require('dotenv').config();
const Mongoose = require("mongoose");
const Bcrypt = require('bcrypt');
const OrganizationRepo = require('..');
const StrengthRepo = require('../SchemaModels/Strengths');
const AccomplishmentRepo = require('../SchemaModels/Accomplishments');
const DepartmentRepo = require('../SchemaModels/DepartmentSchema');
const JobRoleRepo = require('../SchemaModels/JobRoleSchema');
const JobLevelRepo = require('../SchemaModels/JobLevelSchema');
const AppRoleRepo = require('../SchemaModels/ApplicationRolesSchema');
const RoleRepo = require('../SchemaModels/Roles');
const KpiRepo = require('../SchemaModels/KPI');
const MeasureCriteriaRepo = require('../SchemaModels/MeasurementCriteria');
const IndustriesRepo = require('../SchemaModels/Industry');
const EvaluationRepo = require('../SchemaModels/Evalution');
const AuthHelper = require('../Helpers/Auth_Helper');
const Messages = require('../Helpers/Messages');
const UserRepo = require('../SchemaModels/UserSchema');
const SendMail = require("../Helpers/mail.js");
var logger = require('../logger');
const { add } = require("../logger");
const ObjectId = Mongoose.Types.ObjectId;
exports.AddStrength = async (strength) => {
    try {
        // const organizationName = await strengthRepo.findOne({ Name: organization.Name });
        // const organizationEmail = await strengthRepo.findOne({ Email: organization.Email });
        // const organizationPhone = await OrganizationRepo.findOne({ Phone: organization.Phone });

        // if (organizationName !== null) { throw Error("Organization Name Already Exist"); }

        // if (organizationEmail !== null) { throw Error("Organization Email Already Exist "); }

        // if (organizationPhone !== null) { throw Error("Organization Phone Number Already Exist"); }
        const Strength = new strengthRepo(strength);
        await Strength.save();
        return true;
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


}
exports.GetStrengthById = async (Id) => {

    const Strength = await StrengthRepo.findById(Id);

    return Strength;


};
exports.GetAllStrengths = async (empId) => {

    const Strengths = await StrengthRepo.find({ 'Employee': empId });
    return Strengths;
};
exports.AddAccomplishment = async (accomplishment) => {
    try {
        // const organizationName = await strengthRepo.findOne({ Name: organization.Name });
        // const organizationEmail = await strengthRepo.findOne({ Email: organization.Email });
        // const organizationPhone = await OrganizationRepo.findOne({ Phone: organization.Phone });

        // if (organizationName !== null) { throw Error("Organization Name Already Exist"); }

        // if (organizationEmail !== null) { throw Error("Organization Email Already Exist "); }

        // if (organizationPhone !== null) { throw Error("Organization Phone Number Already Exist"); }
        const Accomplishment = new AccomplishmentRepo(accomplishment);
        await Accomplishment.save();
        return true;
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


}

exports.GetAllDepartments = async (empId) => {

    const Departments = await DepartmentRepo.find();
    return Departments;
};

exports.GetEmpSetupBasicData = async (industry) => {



    //  const Industries = await IndustriesRepo.findById('5f6b2acc7d83cd08b8a9ad46');   
    const Industries = await IndustriesRepo.find({ Name: industry });

    var AppRoles = await RoleRepo.find({ RoleLevel: { $in: ['3', '4', '5', '6'] } })
    const JobLevels = await JobLevelRepo.find();
    return { Industries, AppRoles, JobLevels };
};


exports.GetKpiSetupBasicData = async (empId, orgId) => {

    const KpiStatus = Messages.constants.KPI_STATUS;
    const KpiScore = Messages.constants.KPI_SCORE;
    const coachingRem = Messages.constants.COACHING_REM_DAYS;
    var allEvaluation = await EvaluationRepo.find({
        Employees: { $elemMatch: { _id: Mongoose.Types.ObjectId(empId) } },
        Company: orgId
    }).sort({ CreatedDate: -1 });
    let evaluation = allEvaluation[0];
    return { KpiStatus, KpiScore, coachingRem, evaluation };
};

exports.GetAllMeasurementCriterias = async (empId) => {
    const MeasureCriterias = await MeasureCriteriaRepo.find({ 'CreatedBy': empId });
    return MeasureCriterias;

};

exports.CreateMeasurementCriteria = async (measures) => {
    const MeasureCriteria = new MeasureCriteriaRepo(measures);
    await MeasureCriteria.save();

};


exports.GetAccomplishmentDataById = async (Id) => {

    const Accomplishment = await AccomplishmentRepo.findById(Id);

    return Accomplishment;


};
exports.GetAllAccomplishments = async (empId) => {

    const Accomplishments = await AccomplishmentRepo.find({ 'Employee': empId });
    return Accomplishments;
};
exports.UpdateAccomplishments = async (Id) => {

};


exports.AddKpi = async (kpiModel) => {
    try {


        var Kpi = new KpiRepo(kpiModel);
        Kpi = await Kpi.save();

        //Updateing other kpis waiting 
        if (!kpiModel.IsDraft) {
            let updatedKPIs = await KpiRepo.updateMany({
                'Owner': Mongoose.Types.ObjectId(kpiModel.CreatedBy),
                'IsDraft': false,
            },
                { $set: { 'Weighting': kpiModel.Weighting } });
        }

        kpiModel.Action = 'Create';
        kpiModel.kpiId = Kpi.id;
        this.addKpiTrack(kpiModel);

        return true;
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


}
exports.GetKpiDataById = async (Id) => {

    const Kpi = await KpiRepo.findById(Id)
        .populate({
            path: 'MeasurementCriteria.measureId Owner',
            populate: {
                path: 'JobLevel',
                model: 'JobLevels',
            }
        })

    return Kpi;


};
exports.GetAllKpis = async (data) => {



    var allEvaluation = await EvaluationRepo.find({
        Employees: { $elemMatch: { _id: Mongoose.Types.ObjectId(data.empId) } },
        Company: data.orgId
    }).sort({ CreatedDate: -1 });
    let currEvaluation = allEvaluation[0];
    let preEvaluation = allEvaluation[1];

    if (!currEvaluation || allEvaluation.length == 0) {
        throw Error("KPI Setting Form Not Activeted");
    }
    var preKpi = [];
    if (preEvaluation && !data.currentOnly) {
        preKpi = await KpiRepo.find({ 'Owner': data.empId, 'EvaluationId': preEvaluation._id })
            .populate({
                path: 'MeasurementCriteria.measureId Owner',
                populate: {
                    path: 'JobLevel',
                    model: 'JobLevels',
                }
            })
            .sort({ UpdatedOn: -1 });
    }


    const Kpi = await KpiRepo.find({ 'Owner': data.empId, 'IsDraftByManager': false, 'EvaluationId': currEvaluation._id })
        .populate({
            path: 'MeasurementCriteria.measureId Owner',
            populate: {
                path: 'JobLevel',
                model: 'JobLevels',
            }
        })
        .sort({ UpdatedOn: -1 });


    return [...Kpi, ...preKpi];
};



exports.GetKpisByManager = async (managerId) => {

    var allKpis = []

    var Kpis = await KpiRepo.find({
        'ManagerId': managerId,
        'IsDraft': false,
        'IsSubmitedKPIs': true

    })
        .populate({
            path: 'MeasurementCriteria.measureId Owner',
            populate: {
                path: 'JobLevel',
                model: 'JobLevels',
            }
        })
        .sort({ UpdatedOn: -1 });

    var managerDraftsKpis = await KpiRepo.find({
        'ManagerId': managerId,
        'IsDraft': false,
        'IsDraftByManager': true,
    })
        .populate({
            path: 'MeasurementCriteria.measureId Owner',
            populate: {
                path: 'JobLevel',
                model: 'JobLevels',
            }
        })
        .sort({ UpdatedOn: -1 });

    allKpis = [...Kpis, ...managerDraftsKpis]
    //sgsgggjsr



    return allKpis;
};


exports.SubmitAllKpis = async (empId) => {
    try {

        const User = await UserRepo.find({ "_id": empId })
            .populate('Manager');

        let submitedKPIs = await KpiRepo.updateMany({
            'Owner': Mongoose.Types.ObjectId(empId),
            'IsDraft': false,
            'IsSubmitedKPIs': false
        },
            {
                $set: {
                    'IsSubmitedKPIs': true,
                    'EmpFTSubmitedOn': new Date(),
                    'Signoff': { SignOffBy: User[0].FirstName, SignOffOn: new Date() }
                }
            });

        if (submitedKPIs) {
            // send email to manager 
            if (User[0].Manager) {
                var mailObject = SendMail.GetMailObject(
                    User[0].Manager.Email,
                    "Kpi submited for review",
                    `Dear ${User[0].Manager.FirstName},

                                  Your Direct Report, ${User[0].FirstName} has submitted the KPIs.

                                    Please click here to login and review.

                                  
                                  Thank you,
                                  <product name> Administrator
                                  `,
                    null,
                    null
                );

                SendMail.SendEmail(mailObject, function (res) {
                    console.log(res);
                });
            }

            // send email to User 
            var mailObject = SendMail.GetMailObject(
                User[0].Email,
                "Kpi submited for review",
                `Dear ${User[0].FirstName},

                                  Your KPIs have been successfully submitted to your manager.
                                  
                                  To view details, click here.
                                  
                                  Thank you,
                                 Administrator
                                  `,
                null,
                null
            );

            SendMail.SendEmail(mailObject, function (res) {
                console.log(res);
            });
        }

        return true
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


};

exports.UpdateKpi = async (kpi) => {
    try {

        if (kpi.IsManaFTSubmited) {
            const Manager = await UserRepo.findById(kpi.UpdatedBy);
            kpi.ManagerFTSubmitedOn = new Date()
            kpi.ManagerSignOff = { SignOffBy: Manager.FirstName, SignOffOn: new Date() }

            const kpiOwnerInfo = this.GetKpiDataById(kpi.kpiId)
            this.sendEmailOnManagerSignoff(Manager, kpiOwnerInfo);


        }

        if (kpi.ViewedByEmpOn) {

            kpi.ViewedByEmpOn = new Date();
        }

        kpi.UpdatedOn = new Date();
        await KpiRepo.findByIdAndUpdate(kpi.kpiId, kpi);

        this.addKpiTrack(kpi);


        return true;
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


}


exports.addKpiTrack = async (kpi) => {

    var reportOBJ = await KpiRepo.findOne({
        _id: Mongoose.Types.ObjectId(kpi.kpiId)
    });
    reportOBJ.tracks = reportOBJ.tracks || [];

    const actor = await UserRepo.findOne({ "_id": kpi.UpdatedBy })

    var track = {
        actorId: kpi.UpdatedBy,
        action: kpi.Action,
        comment: actor.FirstName + " " + "has " + kpi.Action + " at " + new Date().toLocaleDateString()
    }
    reportOBJ.tracks.push(track);
    return await reportOBJ.save();

}

exports.sendEmailOnManagerSignoff = async (manager, kpiOwnerInfo) => {


    if (manager) {
        // send email to manager 

        var mailObject = SendMail.GetMailObject(
            manager.Email,
            "Kpi signed-off",
            `Dear ${manager.FirstName},

                          You have successfully signed-off the KPIs for ${kpiOwnerInfo.Owner.FirstName}.

                        To view details, click here.


                          
                          Thank you,
                          Administrator
                          `,
            null,
            null
        );

        SendMail.SendEmail(mailObject, function (res) {
            console.log(res);
        });


        // send email to User 
        var mailObject = SendMail.GetMailObject(
            kpiOwnerInfo.Owner.Email,
            "Kpi sign-off",
            `Dear ${kpiOwnerInfo.Owner.FirstName},

                          Your manager, ${manager.FirstName} has <edited> and signed-off your KPIs.

                          Please click here to login and review. You may want to discuss the updates, if any, with your manager.
                          
                          
                          Thank you,
                         Administrator
                          `,
            null,
            null
        );

        SendMail.SendEmail(mailObject, function (res) {
            console.log(res);
        });
    }

}






exports.GetManagers = async (data) => {
    const managers = await UserRepo.find(
        {
            ParentUser: Mongoose.Types.ObjectId(data.parentId),
            SelectedRoles: { $in: ["EM"] }
        })
    return managers;
}



exports.GetThirdSignatorys = async (data) => {
    const managers = await UserRepo.find(
        {
            ParentUser: Mongoose.Types.ObjectId(data.parentId),
            SelectedRoles: { $in: ["TS"] }
        })
    return managers;
}



/**For getting employees who has not been added to evaluation */
exports.GetUnlistedEmployees = async (search) => {

    const Employees = await UserRepo.find(
        {
            Organization: Mongoose.Types.ObjectId(search.company),
            HasActiveEvaluation: { $ne: "Yes" },
            Role: 'EO'
        }).populate("Manager").sort({ CreatedOn: -1 })
    return Employees;
};

exports.GetDirectReporteesOfManager = async (manager) => {
    const Employees = await UserRepo.find(
        {
            Manager: Mongoose.Types.ObjectId(manager.id),

            Role: 'EO'
        })
    return Employees;
}
exports.GetPeers = async (employee) => {
    const Employees = await UserRepo.find({
        Organization: Mongoose.Types.ObjectId(employee.company),
        _id: { $ne: Mongoose.Types.ObjectId(employee.id) }
    }
    )
        .populate('ThirdSignatory CopiesTo DirectReports Manager');
    return Employees;

};

exports.GetKpisForTS = async (ThirdSignatory) => {
    var allKpis = []
    var tsusers = await UserRepo.find({
        ThirdSignatory: Mongoose.Types.ObjectId(ThirdSignatory)
    });
    var Kpis = await KpiRepo.find({
        Owner: { $in: tsusers.map(x => x._id) },
        IsSubmitedKPIs: true,
        ManagerSignOff: { $ne: null }
    }).populate({
        path: 'MeasurementCriteria.measureId Owner',
        populate: {
            path: 'JobLevel',
            model: 'JobLevels',
        }
    })
        .sort({ UpdatedOn: -1 });

    allKpis = [...Kpis]
    return allKpis;
};


exports.SaveCompetencyQnA = async (qna) => {
    // var q= await EvaluationRepo.findOne({ _id: Mongoose.Types.ObjectId(qna.EvaluationId), "Employees._id": Mongoose.Types.ObjectId(qna.EmployeeId) });
    for (let index = 0; index < qna.QnA.length; index++) {
        const element = qna.QnA[index];
        // for (let j = 0; j < q.Competencies.length; j++) {
        //   const c = q.Competencies[j];

        var fg = await EvaluationRepo.updateOne({
            _id: Mongoose.Types.ObjectId(qna.EvaluationId),
            "Employees._id": Mongoose.Types.ObjectId(qna.EmployeeId),
            // "Employees.Competencies.Competency._id": Mongoose.Types.ObjectId(element.CompetencyId),
            "Employees.Competencies.Questions": { $elemMatch: { _id: Mongoose.Types.ObjectId(element.QuestionId) } }
            //"Employees.Competencies.$[].Questions.$[]._id":
        },
            {
                $set: {
                    "Employees.$[e].Competencies.$[c].Questions.$[q].SelectedRating": element.Answer
                }

            },
            {
                "arrayFilters": [
                    { "e._id": ObjectId(qna.EmployeeId) },
                    { "c._id": ObjectId(element.CompetencyRowId) },
                    { "q._id": ObjectId(element.QuestionId) }]
            }
        )

        console.log(fg)
        //}
    }

    var updateCompetencyList = await EvaluationRepo.updateOne({
        _id: Mongoose.Types.ObjectId(qna.EvaluationId),
        "Employees._id": Mongoose.Types.ObjectId(qna.EmployeeId)

    },
        {
            $set: {
                "Employees.$[e].CompetencyComments": qna.Comments,
                "Employees.$[e].CompetencyOverallRating": qna.OverallRating,
                "Employees.$[e].CompetencySubmitted": !qna.IsDraft,
                "Employees.$[e].CompetencySubmittedOn": qna.IsDraft ? null : new Date()
            }

        },
        {
            "arrayFilters": [
                { "e._id": ObjectId(qna.EmployeeId) },
            ]
        }
    )

    console.log(updateCompetencyList)

};

exports.GetPendingPeerReviewsList = async (emp) => {
    try {
        var list = await EvaluationRepo.aggregate([
            { $match: { _id: ObjectId(emp.EvaluationId) } },
            {
                $addFields: {
                    EvaluationId: "$_id"
                }
            },
            { $unwind: '$Employees' },

            {
                $project: {
                    _id: 0,
                    "EvaluationId": 1,
                    "Employees._id": 1,
                    "EvaluationPeriod": 1,
                    "EvaluationDuration": 1,
                    'Peer': {
                        $filter: {
                            input: "$Employees.Peers",
                            as: "self",
                            cond: { $eq: ['$$self.EmployeeId', ObjectId(emp.EmployeeId)] }
                        },

                    }
                }

            },
            {
                $lookup:
                {
                    from: "users",
                    localField: "Employees._id",
                    foreignField: "_id",
                    as: "ForEmployee"
                    //,
                    // "let":{"ManagerId":"ForEmployee.Manager"},
                    // pipeline:[
                    //     {$match:{ "$expr": { "$eq": ["$_id", "$$ManagerId"] }}},
                    //    {$lookup:{
                    //     from: "users",
                    //     as: "Manager",
                    //   //  localField: "Employees._id",
                    // //foreignField: "_id",
                    //    }}
                    // ]
                }
            },
            {
                $lookup:
                {
                    from: "users",
                    localField: "ForEmployee.Manager",
                    foreignField: "_id",
                    as: "Manager"

                }
            },
            {
                $project: {
                    "ForEmployee._id": 1,
                    "ForEmployee.FirstName": 1,
                    "ForEmployee.LastName": 1,
                    "ForEmployee.Email": 1,
                    "ForEmployee.Manager": 1,
                    "EvaluationPeriod": 1,
                    "EvaluationDuration": 1,
                    "Manager._id": 1,
                    "Manager.FirstName": 1,
                    "Manager.LastName": 1,
                    "Manager.Email": 1,
                    "Manager.Manager": 1,
                    "EvaluationId": 1,

                }
            }
        ]

        )

        return list;
    } catch (error) {
        logger.error('Error Occurred while getting data for Peer Review list:', error)
        return Error(error.message)
    }

}

exports.GetPendingPeerReviewsToSubmit = async (emp) => {
    try {
        var list = await EvaluationRepo.aggregate([
            { $match: { _id: ObjectId(emp.EvaluationId) } },
            { $unwind: '$Employees' },
            { $match: { "Employees._id": ObjectId(emp.ForEmployeeId) } },
            {
                $project: {
                    _id: 0,
                    "Employees._id": 1,
                    'Peer': {
                        $filter: {
                            input: "$Employees.Peers",
                            as: "self",
                            cond: { $eq: ['$$self.EmployeeId', ObjectId(emp.PeerId)] }
                        },
                    }
                }
            },
            {
                $lookup:
                {
                    from: "competencies",
                    localField: "Peer.PeersCompetencyList._id",
                    foreignField: "_id",
                    as: "Competencies"
                }
            },
            {
                $lookup:
                {
                    from: "questions",
                    localField: "Competencies.Questions",
                    foreignField: "_id",
                    as: "Questions"
                }
            }

        ])
        return list[0];
    } catch (error) {
        logger.error('error occurred while getting emp peer competencies for review:', error)
        throw error;
    }

}

exports.SavePeerReview = async (qna) => {
    try {
        var _update = await EvaluationRepo.updateOne({
            _id: Mongoose.Types.ObjectId(qna.EvaluationId),
            "Employees._id": Mongoose.Types.ObjectId(qna.ForEmployeeId),
            "Employees.Peers": { $elemMatch: { EmployeeId: Mongoose.Types.ObjectId(qna.PeerId) } }
        },
            {
                $set: {
                    "Employees.$[e].Peers.$[p].QnA": qna.QnA,
                    "Employees.$[e].Peers.$[p].CompetencyComments": qna.CompetencyComments,
                    "Employees.$[e].Peers.$[p].CompetencyOverallRating": qna.OverallRating,
                    "Employees.$[e].Peers.$[p].CompetencySubmitted": !qna.IsDraft,
                    "Employees.$[e].Peers.$[p].CompetencySubmittedOn": qna.IsDraft ? null : new Date()
                }
            },
            {
                "arrayFilters": [
                    { "e._id": ObjectId(qna.ForEmployeeId) },
                    { "p.EmployeeId": ObjectId(qna.PeerId) },
                ]
            }
        )
        return { IsSuccess: true }

    } catch (error) {
        logger.error('error occurred while saving peer review:', error)
        throw error;
    }



}

exports.SaveEmployeeFinalRating = async (finalRating) => {
    try {
        var _update = await EvaluationRepo.updateOne({
            _id: Mongoose.Types.ObjectId(finalRating.EvaluationId),
            "Employees._id": Mongoose.Types.ObjectId(finalRating.EmployeeId)
        },
            {
                $set: {
                    "Employees.$[e].FinalRating.Self.YearEndComments": finalRating.YearEndComments,
                    "Employees.$[e].FinalRating.Self.YearEndRating": finalRating.OverallRating,
                    "Employees.$[e].FinalRating.Self.IsSubmitted": !finalRating.IsDraft,
                    "Employees.$[e].FinalRating.Self.SubmittedOn": finalRating.IsDraft ? null : new Date(),
                    "Employees.$[e].FinalRating.Self.SignOff": finalRating.SignOff,

                }
            },
            {
                "arrayFilters": [
                    { "e._id": ObjectId(finalRating.EmployeeId) }
                ]
            }
        )
        if (_update.nModified)
            return { IsSuccess: true }
        else
            return { IsSuccess: false, Message: 'No Reocrd got updated' }
    } catch (error) {
        logger.error('error occurred while saving peer review:', error)
        throw error;
    }

}

exports.GetPeerAvgRating = async (emp) => {

    try {
        var list = await EvaluationRepo.aggregate([
            { $match: { _id: ObjectId(emp.EvaluationId), "Employees._id": Mongoose.Types.ObjectId(emp.EmployeeId) } },
            {$unwind: "$Employees"},  
            {
                $project: {
                    _id: 0,
                    "EvaluationId": 1,
                    "Employees._id": 1,
                    "EvaluationPeriod": 1,
                    "EvaluationDuration": 1,
                    "Employees.Peers.EmployeeId": 1,
                    "Employees.Peers.CompetencyOverallRating": 1
                }

            },
            {
                $lookup:
                {
                    from: "users",
                    localField: "Employees.Peers.EmployeeId",
                    foreignField: "_id",
                    as: "PeerList"

                }
            }
            ,
            {
                $addFields: {
                    averageScore:{ $avg: "$Employees.Peers.CompetencyOverallRating" }
                   
                }
            },
            
            {
                $project: {
                    "PeerList._id": 1,
                    "PeerList.FirstName": 1,              
                    "PeerList.LastName": 1,
                    "PeerList.Email": 1,
                    "PeerList.Manager": 1,
                    "EvaluationPeriod": 1,
                    "EvaluationDuration": 1,
                    "EvaluationId": 1,
                    "averageScore":1
                    
                }
            }
        ]

        )
        return list;
    } catch (error) {
        logger.error('Error Occurred while getting data for Peer Review list:', error)
        return Error(error.message)
    }
}