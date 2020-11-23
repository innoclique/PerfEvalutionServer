const DbConnection = require("../Config/DbConfig");
require('dotenv').config();
var env = process.env.NODE_ENV || "dev";
const Mongoose = require("mongoose");
const Bcrypt = require('bcrypt');
const OrganizationRepo = require('../SchemaModels/OrganizationSchema');
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
const moment = require("moment");
const ObjectId = Mongoose.Types.ObjectId;
const KpiFormRepo = require('../SchemaModels/KpiForm');
const strengthRepo = require('../SchemaModels/Strengths');
var fs = require("fs");
var config = require(`../Config/${env}.config`);
const EvaluationStatus = require('../common/EvaluationStatus');
const { boolean } = require("joi");

exports.AddStrength = async (strength) => {
    try {
        if (strength.StrengthId) {
            let { StrengthId } = strength;
            delete strength.StrengthId;
            let response = await StrengthRepo.updateOne({ _id: ObjectId(StrengthId) }, strength);
        } else {
            strength.CreatedYear = new Date().getFullYear();
            let Strength = new StrengthRepo(strength);
            await Strength.save()
        }
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
    return await MeasureCriteria.save();

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



    var evaluation = await EvaluationRepo.findOne({
        Employees: { $elemMatch: { _id: Mongoose.Types.ObjectId(data.empId) } },
        EvaluationYear: new Date().getFullYear(),
        Company: data.orgId
    }).sort({ CreatedDate: -1 });
    // let currEvaluation = allEvaluation[0];
    // let preEvaluation = allEvaluation[1];

    var kpiFormData = await KpiFormRepo.findOne({
        'EmployeeId': Mongoose.Types.ObjectId(data.empId),
        IsDraft: false, IsActive: true, EvaluationYear: new Date().getFullYear()
    });

    if (!kpiFormData) {
        if (evaluation) {

        } else {
            throw Error("Performance Goal Setting Form Not Activeted");
        }
    }
    var preKpi = [];
    if (!data.currentOnly) {
        preKpi = await KpiRepo.find({ 'Owner': data.empId, EvaluationYear: new Date().getFullYear() - 1 })
            .populate({
                path: 'MeasurementCriteria.measureId Owner',
                populate: {
                    path: 'JobLevel',
                    model: 'JobLevels',
                }
            })
            .sort({ UpdatedOn: -1 });
    }


    const Kpi = await KpiRepo.find({ 'Owner': data.empId, 'IsDraftByManager': false, EvaluationYear: new Date().getFullYear() })
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



exports.GetKpisByManager = async (data) => {

    var allKpis = []

    var Kpis = await KpiRepo.find({
        'ManagerId': data.managerId,
        'Owner': data.empId,
        'EvaluationYear': new Date().getFullYear(),
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
        'ManagerId': data.managerId,
        'Owner': data.empId,
        'IsDraft': false,
        'EvaluationYear': new Date().getFullYear(),
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
            'EvaluationYear': new Date().getFullYear(),
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
                    "Performance Goals submited for review",
                    `Dear ${User[0].Manager.FirstName},

                                  Your Direct Report, ${User[0].FirstName} has submitted the Performance Goals.

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
                "Performance Goals submited for review",
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




exports.SubmitAllKpisByManager = async (empId) => {
    debugger
    try {

            const User = await UserRepo.find({ "_id": empId })
            .populate('Manager');

        let submitedKPIs = await KpiRepo.updateMany({
            'Owner': Mongoose.Types.ObjectId(empId),
            'IsDraft': false,
            'IsDraftByManager': false,
            'EvaluationYear': new Date().getFullYear(),
            'IsSubmitedKPIs': true,
            'ManagerSignOff': {submited:false}
        },
            {
                $set: {
                    'ManagerFTSubmitedOn': new Date(),
                    'ManagerSignOff': { SignOffBy: User[0].Manager.FirstName, SignOffOn: new Date() }
                }
            });

        if (submitedKPIs.nModified>0) {
            // send email to manager 
            this.sendEmailOnManagerSignoff(User[0].Manager, User[0]);
           
        }

        return true
    }
    catch (err) {
        logger.error(err)

        console.log(err);
        throw (err);
    }


};


exports.sendEmailOnManagerSignoff = async (manager, kpiOwnerInfo) => {


    if (manager) {
        // send email to manager 

        var mailObject = SendMail.GetMailObject(
            manager.Email,
            "Performance Goals signed-off",
            `Dear ${manager.FirstName},

                          You have successfully signed-off the Performance Goals for ${kpiOwnerInfo.FirstName}.

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
            kpiOwnerInfo.Email,
            "Performance Goals sign-off",
            `Dear ${kpiOwnerInfo.FirstName},

                          Your manager, ${manager.FirstName} has <edited> and signed-off your Performance Goals.

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
            Organization: Mongoose.Types.ObjectId(data.companyId),
            SelectedRoles: { $in: ["EM"] }
        })

    const csa = await UserRepo.findOne(
        {
            Organization: Mongoose.Types.ObjectId(data.companyId),
            Role: 'CSA'
        })
    managers.push(csa);
    return managers;
}



exports.GetThirdSignatorys = async (data) => {
    const managers = await UserRepo.find(
        {
            Organization: Mongoose.Types.ObjectId(data.companyId),
            SelectedRoles: { $in: ["TS"] }
        })
    return managers;
}



/**For getting employees who has not been added to evaluation */
exports.GetUnlistedEmployees = async (search) => {
    try {
        if (search.allKpi === 'true') {
            var response = await KpiFormRepo.aggregate([{
                $match: {
                    Company: Mongoose.Types.ObjectId(search.company),
                    EvaluationYear: new Date().getFullYear().toString()
                }
            },
            {
                $project: {
                    EmployeeId: 1
                }
            }
            ])
            const Employees = await UserRepo.find(
                {
                    Organization: Mongoose.Types.ObjectId(search.company),
                    HasActiveEvaluation: { $ne: "Yes" },
                    _id: { $in: response.map(x => { return x.EmployeeId }) }

                }).populate("Manager").sort({ CreatedOn: -1 })


            return { IsSuccess: true, Message: "", Data: Employees }



        }
        else {
            let orgData = await OrganizationRepo.findOne({ _id: search.company });
            if (!orgData) {
                return { IsSuccess: true, Message: "No Organization details found", Data: null }
            }
            //let currentUsersCount=await UserRepo.find({Organization:ObjectId(search.company),IsActive:true}).count()
            const checkpoint = await UserRepo.aggregate([
                { $match: { Organization: ObjectId(search.company) } },
                { $group: { _id: "$HasActiveEvaluation", Count: { $sum: 1 } } }
            ])

            if (checkpoint && checkpoint.length > 0) {
                let activeEvaluationCount = checkpoint.find(x => x._id === 'Yes')
                if (activeEvaluationCount) {
                    if (parseInt(orgData.UsageCount) === activeEvaluationCount.Count) {
                        return { IsSuccess: true, Message: "Reached Maximum limit", Data: null }
                    }
                }

            }

            const Employees = await UserRepo.find(
                {
                    Organization: Mongoose.Types.ObjectId(search.company),
                    HasActiveEvaluation: { $ne: "Yes" }

                }).populate("Manager").sort({ CreatedOn: -1 })
            return { IsSuccess: true, Message: "", Data: Employees }
        }
    } catch (error) {
        logger.error('Error occurred while checking employee count', error)
        throw error;
    }

};

exports.GetDirectReporteesOfManager = async (manager) => {
    let managers = await UserRepo.aggregate([
        {
            $match: {
                Manager: Mongoose.Types.ObjectId(manager.id),
                Role: 'EO'
            }
        },
        { $addFields: { "EmployeeId": "$_id" } },
        {
            $project: {
                "EmployeeId": 1,
                FirstName: 1,
                LastName: 1,
                Email: 1
            }
        }


    ]);

    return managers;
}

exports.GetPeers = async (employee) => {
    var peers = await UserRepo.aggregate([
        {
            $match: {
                Organization: Mongoose.Types.ObjectId(employee.company),
                _id: { $ne: Mongoose.Types.ObjectId(employee.id) }
            }
        },
        { $addFields: { "EmployeeId": "$_id" } },
        {
            $project: {
                "EmployeeId": 1,
                FirstName: 1,
                LastName: 1,
                Email: 1
            }
        }


    ]);
    // const Employees = await UserRepo.find({
    //     Organization: Mongoose.Types.ObjectId(employee.company),
    //     _id: { $ne: Mongoose.Types.ObjectId(employee.id) }
    // })
    return peers;

};
exports.DashboardData = async (employee) => {
    const response = {};
    let { userId } = employee;
    const evaluationRepo = await peerInfo(userId);
    response['current_evaluation'] = await currentEvaluationProgress(userId);
    response['previous_evaluation'] = await previousEvaluationProgress(userId);
    response['peer_review'] = {};
    let momentNextEvlDate = moment().add(1, 'years').startOf('year');
    response['peer_review']['date'] = momentNextEvlDate.format("MMM Do YYYY");
    response['peer_review']['days'] = momentNextEvlDate.diff(moment(), 'days');
    response['peer_review']['rating_for'] = "N/A";
    let peerReviewList = [];
    if (evaluationRepo && evaluationRepo.length > 0 && evaluationRepo[0].Employees) {
        evaluationRepo.forEach(element => {
            let { Employees } = element;
            Employees.forEach(employeeObj => {
                let { Peers, _id } = employeeObj;
                let peerList = Peers.filter(peerObj => peerObj.EmployeeId == userId);
                let peerReviewObj = {};
                peerReviewObj.title = peerList[0].displayTemplate;
                peerReviewObj.rating = peerList[0].CompetencyOverallRating;
                peerReviewObj.deparment = _id.Department || 'N/A';
                peerReviewList.push(peerReviewObj);
            });
        });
    }
    response['peer_review']['list'] = peerReviewList;
    return response;
}
const currentEvaluationProgress = async (userId) => {
    console.log("currentEvaluationProgress");
    let currentYear = moment().format('YYYY');
    let evaluationOb = {};
    let whereObj = {
        "Employees._id": Mongoose.Types.ObjectId(userId),
        "EvaluationYear": currentYear

    };
    let project = {
        "Employees": {
            "$elemMatch": {
                "_id": Mongoose.Types.ObjectId(userId)
            }
        }
    };
    let currentEvaluation = await EvaluationRepo.findOne(whereObj, project);
    let Employees = null;
    if (currentEvaluation && currentEvaluation.Employees) {
        Employees = currentEvaluation.Employees;
    } else {
        evaluationOb["status"] = 0;
        evaluationOb["FinalRating"] = "N/A";
    }
    if (Employees && Employees.length > 0) {
        let { Status, FinalRating } = Employees[0];
        let { Manager, ThirdSignatory } = FinalRating;
        if (ThirdSignatory && ThirdSignatory.IsSubmitted) {
            evaluationOb["ThirdSignatory"] = "Submitted";
        } else {
            evaluationOb["ThirdSignatory"] = "Pending";
        }
        if (Manager && Manager.IsSubmitted) {
            evaluationOb["Manager"] = "Done";
        } else {
            evaluationOb["Manager"] = "Pending";
        }
        if (FinalRating && FinalRating.Status && FinalRating.Status != "") {
            evaluationOb["FinalRating"] = FinalRating.Status;
        } else {
            evaluationOb["FinalRating"] = "Pending";
        }
        if (EvaluationStatus[Status]) {
            evaluationOb["status"] = EvaluationStatus[Status];
        } else {
            evaluationOb["status"] = 0;
        }
    } else {
        evaluationOb["status"] = 0;
        evaluationOb["FinalRating"] = "N/A";
        evaluationOb["Manager"] = "N/A";
        evaluationOb["ThirdSignatory"] = "N/A";
    }
    return evaluationOb;
}

const previousEvaluationProgress = async (userId) => {
    let previousEvaluation = {};
    let prevYearStart = moment().subtract(1, 'years').startOf('year');
    let prevYearEnd = moment().subtract(1, 'years').endOf('year');
    previousEvaluation['period'] = prevYearStart.format("MMM") + " - " + prevYearEnd.format("MMM, YYYY");
    let whereObj = {
        "Employees._id": Mongoose.Types.ObjectId(userId),
        "CreatedDate": {
            "$gte": prevYearStart,
            "$lt": prevYearEnd
        },
        "Employees.Status": "EvaluationComplete"


    };
    let project = {
        "Employees": {
            "$elemMatch": {
                "_id": Mongoose.Types.ObjectId(userId)
            }
        }
    };
    let prevEvaluation = await EvaluationRepo.findOne(whereObj, project);
    if (prevEvaluation) {
        let { Employees } = prevEvaluation;
        let { FinalRating, Peers } = Employees[0];
        if (FinalRating) {
            let { Manager } = FinalRating;
            let { YearEndRating } = Manager;
            if (YearEndRating && YearEndRating != "") {
                previousEvaluation['rating'] = YearEndRating;
            }
            previousEvaluation['rating'] = "N/A";
        }

        /*let peerReview = false;
        for(var i=0;i<Peers.length;i++){
            let peerObj = Peers[i];
            peerReview = peerObj.status || false;
            if(!peerReview){
                break;
            }
        }
        previousEvaluation['peer_review'] = "In progress";
        if(peerReview){
            previousEvaluation['peer_review'] = "Done";
        }*/
        previousEvaluation['peer_review'] = getPeerInfo(Peers);
    } else {
        previousEvaluation['rating'] = "N/A";
        previousEvaluation['peer_review'] = "N/A";
    }

    return previousEvaluation;
}

const getPeerInfo = (Peers) => {
    let previousEvaluationObj = "";
    let peerReview = false;
    for (var i = 0; i < Peers.length; i++) {
        let peerObj = Peers[i];
        peerReview = peerObj.status || false;
        if (!peerReview) {
            break;
        }
    }
    previousEvaluationObj = "In progress";
    if (peerReview) {
        previousEvaluationObj = "Done";
    }
    return previousEvaluationObj;
}


const peerInfo = async (userId) => {
    return await EvaluationRepo
        .find({
            "Employees.Peers": {
                $elemMatch:
                    { "EmployeeId": Mongoose.Types.ObjectId(userId) }
            }
        }).populate("Employees._id");
}


exports.GetKpisForTS = async (ThirdSignatory) => {
    var allKpis = []
    var tsusers = await UserRepo.find({
        ThirdSignatory: Mongoose.Types.ObjectId(ThirdSignatory)
    });
    var Kpis = await KpiRepo.find({
        Owner: { $in: tsusers.map(x => x._id) },
        IsSubmitedKPIs: true,
        'EvaluationYear': new Date().getFullYear(),
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
    try {
        for (let index = 0; index < qna.QnA.length; index++) {
            const element = qna.QnA[index];
            var fg = await EvaluationRepo.updateOne({
                _id: Mongoose.Types.ObjectId(qna.EvaluationId),
                "Employees._id": Mongoose.Types.ObjectId(qna.EmployeeId),
                "Employees.Competencies.Questions": { $elemMatch: { _id: Mongoose.Types.ObjectId(element.QuestionId) } }
            }, {
                $set: {
                    "Employees.$[e].Competencies.$[c].Questions.$[q].SelectedRating": element.Answer,
                    "Employees.$[e].Competencies.$[c].Comments": element.Comments,
                    "Employees.$[e].Competencies.$[c].CompetencyAvgRating": element.CompetencyAvgRating,
                }
            },
                {
                    "arrayFilters": [
                        { "e._id": ObjectId(qna.EmployeeId) },
                        { "c._id": ObjectId(element.CompetencyRowId) },
                        { "q._id": ObjectId(element.QuestionId) }]
                }
            )
        }
        var updateCompetencyList = await EvaluationRepo.updateOne({
            _id: Mongoose.Types.ObjectId(qna.EvaluationId),
            "Employees._id": Mongoose.Types.ObjectId(qna.EmployeeId)
        }, {
            $set: {
                "Employees.$[e].CompetencyComments": qna.Comments,
                "Employees.$[e].CompetencyOverallRating": qna.OverallRating,
                "Employees.$[e].CompetencySubmitted": !qna.IsDraft,
                "Employees.$[e].CompetencySubmittedOn": qna.IsDraft ? null : new Date()
            }
        },
            {
                "arrayFilters": [
                    { "e._id": ObjectId(qna.EmployeeId) }
                ]
            }
        )
        if (updateCompetencyList) {
            return { IsSuccess: true }
        } else {
            return { IsSuccess: false }
        }
    } catch (error) {
        logger.error('Error Occurred while saving Competency', error);
        throw error;
    }


};

exports.GetPendingPeerReviewsList = async (emp) => {
    try {
        var list = await EvaluationRepo.aggregate([
            { $match: { "Employees.Peers.EmployeeId": ObjectId(emp.EmployeeId), "Employees.Status": "Active" } },
            {
                $addFields: {
                    EvaluationId: "$_id"
                }
            },
            { $unwind: '$Employees' },
            { $unwind: '$Employees.Peers' },
            { $match: { "Employees.Peers.EmployeeId": ObjectId(emp.EmployeeId), "Employees.Status": "Active" } },
            {
                $project: {
                    _id: 0,
                    "EvaluationId": 1,
                    "Employees._id": 1,
                    "EvaluationPeriod": 1,
                    "EvaluationDuration": 1,
                    "Peers": "$Employees.Peers"
                }
            },
            {
                $lookup:
                {
                    from: "users",
                    localField: "Employees._id",
                    foreignField: "_id",
                    as: "ForEmployee"

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
                    "Peers": 1,
                    IsRatingSubmitted: '$Peers.CompetencySubmitted'

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
        if (_update && !qna.IsDraft) {
            let _user = await UserRepo.findOne({ _id: ObjectId(qna.PeerId) }, { Email: 1, FirstName: 1 })
            fs.readFile("./EmailTemplates/PeerReviewSubmitted.html", async function read(err, bufcontent) {
                var content = bufcontent.toString();

                let des = `Peer Review has been Successfully Submitted.`
                content = content.replace("##FirstName##", _user.FirstName);
                content = content.replace("##ProductName##", config.ProductName);
                content = content.replace("##Description##", des);
                content = content.replace("##Title##", "Peer Review SUbmitted");

                var mailObject = SendMail.GetMailObject(
                    _user.Email,
                    "Peer Review Submitted",
                    content,
                    null,
                    null
                );

                SendMail.SendEmail(mailObject, function (res) {
                    console.log(res);
                });

            });
            return { IsSuccess: true }

        }


    } catch (error) {
        logger.error('error occurred while saving peer review:', error)
        throw error;
    }



}

exports.SaveTSFinalRating = async (finalRating) => {
    try {
        var _update = await EvaluationRepo.updateOne({
            _id: Mongoose.Types.ObjectId(finalRating.EvaluationId),
            "Employees._id": Mongoose.Types.ObjectId(finalRating.EmployeeId)
        },
            {
                $set: {
                    "Employees.$[e].FinalRating.ThirdSignatory.YearEndComments": finalRating.YearEndComments,
                    "Employees.$[e].FinalRating.ThirdSignatory.YearEndRating": finalRating.OverallRating,
                    "Employees.$[e].FinalRating.ThirdSignatory.IsSubmitted": (finalRating.IsDraft || finalRating.ReqRevision) ? false : true,
                    "Employees.$[e].FinalRating.ThirdSignatory.SubmittedOn": (finalRating.IsDraft || finalRating.ReqRevision) ? null : new Date(),
                    "Employees.$[e].FinalRating.ThirdSignatory.SignOff": finalRating.SignOff,

                    "Employees.$[e].FinalRating.ThirdSignatory.RevComments": finalRating.RevComments,
                    "Employees.$[e].FinalRating.ThirdSignatory.ReqRevision": finalRating.ReqRevision,
                    "Employees.$[e].FinalRating.Manager.IsSubmitted": (finalRating.ReqRevision) ? false : true,
                    "Employees.$[e].FinalRating.Status": `ThirdSignatory ${finalRating.ReqRevision ? 'Request Revision' : 'Submitted'}`,
                    "Employees.$[e].Status": (finalRating.IsDraft || finalRating.ReqRevision) ? 'InProgress' : 'Completed',
                }
            },
            {
                "arrayFilters": [
                    { "e._id": ObjectId(finalRating.EmployeeId) }
                ]
            }
        )
        if (_update.nModified) {
            var c = await EvaluationRepo.aggregate([
                { $match: { _id: ObjectId(finalRating.EvaluationId) } },
                { $unwind: '$Employees' },
                { $match: { "Employees._id": ObjectId(finalRating.EmployeeId) } },
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "Employees._id",
                        foreignField: "_id",
                        as: "CurrentEmployee"

                    }
                },
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "CurrentEmployee.Manager",
                        foreignField: "_id",
                        as: "CurrentEmployeeManager"

                    }
                },
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "CurrentEmployee.ThirdSignatory",
                        foreignField: "_id",
                        as: "CurrentEmployeeTS"

                    }
                },
                {
                    $project: {
                        "CurrentEmployee.FirstName": 1,
                        "CurrentEmployee.LastName": 1,
                        "CurrentEmployee.Email": 1,
                        "CurrentEmployeeManager.FirstName": 1,
                        "CurrentEmployeeManager.LastName": 1,
                        "CurrentEmployeeManager.Email": 1,
                        "CurrentEmployeeTS.FirstName": 1,
                        "CurrentEmployeeTS.LastName": 1,
                        "CurrentEmployeeTS.Email": 1

                    }

                }
            ])
            /**To update employee evaluation status */
            if ((!finalRating.IsDraft && !finalRating.ReqRevision)) {
                var _updateEmployee = await UserRepo.updateOne(
                    { _id: ObjectId(finalRating.EmployeeId) },
                    { $set: { HasActiveEvaluation: 'No' } }
                )
            }


            if (c && c[0] && c[0].CurrentEmployee[0]) {
                var empoyee = c[0].CurrentEmployee[0];
                var manager = c[0].CurrentEmployeeManager[0];
                var ts = c[0].CurrentEmployeeTS[0];
                if (ts) {

                    var mailObject = SendMail.GetMailObject(
                        ts.Email,
                        `Final Rating ${finalRating.ReqRevision ? 'Request Revision' : 'Submitted'}`,
                        `Dear ${ts.FirstName},

                          You have successfully ${finalRating.ReqRevision ? 'Request Revision' : 'Submitted'} your year-end review
                          
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
                if (empoyee) {
                    var mailObject = SendMail.GetMailObject(
                        empoyee.Email,
                        `Final Rating ${finalRating.ReqRevision ? 'Request Revision' : 'Submitted'}`,
                        `Dear ${empoyee.FirstName},

                          Your Third Signatory ${manager.FirstName} has successfully ${finalRating.ReqRevision ? 'Request Revision' : 'Submitted'}  year-end review.
                          Kindly access portal to review the year-end review.
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


                if (manager) {
                    var mailObject = SendMail.GetMailObject(
                        manager.Email,
                        `Final Rating ${finalRating.ReqRevision ? 'Request Revision' : 'Submitted'}`,
                        `Dear ${manager.FirstName},

                        ${empoyee.FirstName} Third Signatory ${ts.FirstName} has successfully ${finalRating.ReqRevision ? 'Request Revision' : 'Submitted'}  year-end review.
                          Kindly access portal to review the year-end review.
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
            return { IsSuccess: true }
        }
        else
            return { IsSuccess: false, Message: 'No Reocrd got updated' }
    } catch (error) {
        logger.error('error occurred while saving peer review:', error)
        throw error;
    }

}
exports.SaveManagerFinalRating = async (finalRating) => {
    try {
        var _update = await EvaluationRepo.updateOne({
            _id: Mongoose.Types.ObjectId(finalRating.EvaluationId),
            "Employees._id": Mongoose.Types.ObjectId(finalRating.EmployeeId)
        },
            {
                $set: {
                    "Employees.$[e].FinalRating.Manager.YearEndComments": finalRating.YearEndComments,
                    "Employees.$[e].FinalRating.Manager.YearEndRating": finalRating.OverallRating,
                    "Employees.$[e].FinalRating.Manager.IsSubmitted": !finalRating.IsDraft,
                    "Employees.$[e].FinalRating.Manager.SubmittedOn": finalRating.IsDraft ? null : new Date(),
                    "Employees.$[e].FinalRating.Manager.SignOff": finalRating.SignOff,

                    "Employees.$[e].FinalRating.Manager.RevComments": finalRating.RevComments,
                    "Employees.$[e].FinalRating.Manager.ReqRevision": finalRating.ReqRevision,
                    "Employees.$[e].FinalRating.Self.IsSubmitted": (finalRating.ReqRevision) ? false : true,
                    "Employees.$[e].FinalRating.Status": `Manager ${finalRating.ReqRevision ? 'Request Revision' : 'Submitted'}`,


                    "Employees.$[e].FinalRating.ThirdSignatory.IsSubmitted": false,

                }
            },
            {
                "arrayFilters": [
                    { "e._id": ObjectId(finalRating.EmployeeId) }
                ]
            }
        )
        if (_update.nModified) {
            var c = await EvaluationRepo.aggregate([
                { $match: { _id: ObjectId(finalRating.EvaluationId) } },
                { $unwind: '$Employees' },
                { $match: { "Employees._id": ObjectId(finalRating.EmployeeId) } },
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "Employees._id",
                        foreignField: "_id",
                        as: "CurrentEmployee"

                    }
                },
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "CurrentEmployee.Manager",
                        foreignField: "_id",
                        as: "CurrentEmployeeManager"

                    }
                },
                {
                    $project: {
                        "CurrentEmployee.FirstName": 1,
                        "CurrentEmployee.LastName": 1,
                        "CurrentEmployee.Email": 1,
                        "CurrentEmployeeManager.FirstName": 1,
                        "CurrentEmployeeManager.LastName": 1,
                        "CurrentEmployeeManager.Email": 1

                    }

                }
            ])
            console.log('ccc', c);
            if (c && c[0] && c[0].CurrentEmployee[0]) {
                var empoyee = c[0].CurrentEmployee[0];
                var manager = c[0].CurrentEmployeeManager[0];
                if (manager) {

                    var mailObject = SendMail.GetMailObject(
                        manager.Email,
                        `Final Rating ${finalRating.ReqRevision ? 'Request Revision' : 'Submitted'}`,
                        `Dear ${manager.FirstName},

                          You have successfully ${finalRating.ReqRevision ? 'Request Revision' : 'Submitted'} your year-end review
                          
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
                if (empoyee) {
                    var mailObject = SendMail.GetMailObject(
                        empoyee.Email,
                        `Final Rating ${finalRating.ReqRevision ? 'Request Revision' : 'Submitted'}`,
                        `Dear ${empoyee.FirstName},

                          Your Manager ${manager.FirstName} has successfully ${finalRating.ReqRevision ? 'Request Revision' : 'Submitted'}  year-end review.
                          Kindly access portal to review the year-end review.
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
            return { IsSuccess: true }
        }
        else
            return { IsSuccess: false, Message: 'No Reocrd got updated' }
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
                    "Employees.$[e].FinalRating.Self.RevComments": finalRating.RevComments,
                    "Employees.$[e].FinalRating.Self.YearEndRating": finalRating.OverallRating,
                    "Employees.$[e].FinalRating.Self.IsSubmitted": (finalRating.IsDraft || finalRating.ReqRevision) ? false : true,
                    "Employees.$[e].FinalRating.Self.SubmittedOn": finalRating.IsDraft ? null : new Date(),
                    "Employees.$[e].FinalRating.Self.SignOff": finalRating.SignOff,
                    "Employees.$[e].FinalRating.Status": 'Employee Submitted',

                    "Employees.$[e].FinalRating.Manager.IsSubmitted": false,

                }
            },
            {
                "arrayFilters": [
                    { "e._id": ObjectId(finalRating.EmployeeId) }
                ]
            }
        )
        if (_update.nModified) {
            var c = await EvaluationRepo.aggregate([
                { $match: { _id: ObjectId(finalRating.EvaluationId) } },
                { $unwind: '$Employees' },
                { $match: { "Employees._id": ObjectId(finalRating.EmployeeId) } },
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "Employees._id",
                        foreignField: "_id",
                        as: "CurrentEmployee"

                    }
                },
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "CurrentEmployee.Manager",
                        foreignField: "_id",
                        as: "CurrentEmployeeManager"

                    }
                },
                {
                    $project: {
                        "CurrentEmployee.FirstName": 1,
                        "CurrentEmployee.LastName": 1,
                        "CurrentEmployee.Email": 1,
                        "CurrentEmployeeManager.FirstName": 1,
                        "CurrentEmployeeManager.LastName": 1,
                        "CurrentEmployeeManager.Email": 1

                    }

                }
            ])
            console.log('ccc', c);
            if (c && c[0] && c[0].CurrentEmployee[0]) {
                var employee = c[0].CurrentEmployee[0];
                var manager = c[0].CurrentEmployeeManager[0];
                if (employee) {

                    var mailObject = SendMail.GetMailObject(
                        employee.Email,
                        "Final Rating Submitted",
                        `Dear ${employee.FirstName},

                          You have successfully submitted your year-end review
                          
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
                if (manager) {
                    var mailObject = SendMail.GetMailObject(
                        manager.Email,
                        "Final Rating Submitted",
                        `Dear ${manager.FirstName},

                          Your reportee ${employee.FirstName} has successfully submitted  year-end review.
                          Kindly access portal to review the year-end review.
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
            return { IsSuccess: true }
        }
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
            { $unwind: "$Employees" },
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
                    averageScore: { $avg: "$Employees.Peers.CompetencyOverallRating" }

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
                    "averageScore": 1

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

exports.GetDRReviewsList = async (emp) => {
    try {
        var list =
            await EvaluationRepo.aggregate([
                { $match: { "Employees.DirectReportees.EmployeeId": ObjectId(emp.EmployeeId), "Employees.Status": "Active", "EvaluationYear": new Date().getFullYear().toString() } },
                {
                    $addFields: {
                        EvaluationId: "$_id"
                    }
                },
                { $unwind: '$Employees' },
                { $unwind: '$Employees.DirectReportees' },
                { $match: { "Employees.DirectReportees.EmployeeId": ObjectId(emp.EmployeeId), status: "Active" } },
                {
                    $project: {
                        _id: 0,
                        "EvaluationId": 1,
                        "Employees._id": 1,
                        "EvaluationPeriod": 1,
                        "EvaluationDuration": 1,
                        "DirectReportees": "$Employees.DirectReportees"
                    }
                },
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "Employees._id",
                        foreignField: "_id",
                        as: "ForEmployee"
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
                        "DirectReportees": 1,
                        IsRatingSubmitted: '$DirectReportees.CompetencySubmitted'

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

exports.GetPendingDRReviewsToSubmit = async (emp) => {
    try {
        var list = await EvaluationRepo.aggregate([
            { $match: { _id: ObjectId(emp.EvaluationId) } },
            { $unwind: '$Employees' },
            { $match: { "Employees._id": ObjectId(emp.ForEmployeeId) } },
            {
                $project: {
                    _id: 0,
                    "Employees._id": 1,
                    'DirectReportee': {
                        $filter: {
                            input: "$Employees.DirectReportees",
                            as: "self",
                            cond: { $eq: ['$$self.EmployeeId', ObjectId(emp.DirectReport)] }
                        },
                    }
                }
            },
            {
                $lookup:
                {
                    from: "competencies",
                    localField: "DirectReportee.DirectReporteeCompetencyList._id",
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

exports.SaveDRReview = async (qna) => {
    try {
        var _update = await EvaluationRepo.updateOne({
            _id: Mongoose.Types.ObjectId(qna.EvaluationId),
            "Employees._id": Mongoose.Types.ObjectId(qna.ForEmployeeId),
            "Employees.DirectReportees": { $elemMatch: { EmployeeId: Mongoose.Types.ObjectId(qna.DrId) } }
        },
            {
                $set: {
                    "Employees.$[e].DirectReportees.$[p].QnA": qna.QnA,
                    "Employees.$[e].DirectReportees.$[p].CompetencyComments": qna.CompetencyComments,
                    "Employees.$[e].DirectReportees.$[p].CompetencyOverallRating": qna.OverallRating,
                    "Employees.$[e].DirectReportees.$[p].CompetencySubmitted": !qna.IsDraft,
                    "Employees.$[e].DirectReportees.$[p].CompetencySubmittedOn": qna.IsDraft ? null : new Date()
                }
            },
            {
                "arrayFilters": [
                    { "e._id": ObjectId(qna.ForEmployeeId) },
                    { "p.EmployeeId": ObjectId(qna.DrId) },
                ]
            }
        )
        if (_update && !qna.IsDraft) {
            let _user = await UserRepo.findOne({ _id: ObjectId(qna.PeerId) }, { Email: 1, FirstName: 1 })
            fs.readFile("./EmailTemplates/PeerReviewSubmitted.html", async function read(err, bufcontent) {
                var content = bufcontent.toString();

                let des = `Direct Report Review has been Successfully Submitted.`
                content = content.replace("##FirstName##", _user.FirstName);
                content = content.replace("##ProductName##", config.ProductName);
                content = content.replace("##Description##", des);
                content = content.replace("##Title##", "Peer Review SUbmitted");

                var mailObject = SendMail.GetMailObject(
                    _user.Email,
                    "Direct Report Review Submitted",
                    content,
                    null,
                    null
                );

                SendMail.SendEmail(mailObject, function (res) {
                    console.log(res);
                });

            });
            return { IsSuccess: true }

        }
        if (_update && qna.IsDraft) {
            return { IsSuccess: true }
        } else {
            throw Error('no record got updated with given input')
        }


    } catch (error) {
        logger.error('error occurred while saving peer review:', error)
        throw error;
    }



}


exports.GetDrAvgRating = async (emp) => {

    try {
        var list = await EvaluationRepo.aggregate([
            { $match: { _id: ObjectId(emp.EvaluationId), "Employees._id": Mongoose.Types.ObjectId(emp.EmployeeId) } },
            { $unwind: "$Employees" },
            {
                $project: {
                    _id: 0,
                    "EvaluationId": 1,
                    "Employees._id": 1,
                    "EvaluationPeriod": 1,
                    "EvaluationDuration": 1,
                    "Employees.DirectReportees.EmployeeId": 1,
                    "Employees.DirectReportees.CompetencyOverallRating": 1
                }

            },
            {
                $lookup:
                {
                    from: "users",
                    localField: "Employees.DirectReportees.EmployeeId",
                    foreignField: "_id",
                    as: "DirectReporteesList"

                }
            }
            ,
            {
                $addFields: {
                    averageScore: { $avg: "$Employees.DirectReportees.CompetencyOverallRating" }

                }
            },

            {
                $project: {
                    "DirectReporteesList._id": 1,
                    "DirectReporteesList.FirstName": 1,
                    "DirectReporteesList.LastName": 1,
                    "DirectReporteesList.Email": 1,
                    "DirectReporteesList.Manager": 1,
                    "EvaluationPeriod": 1,
                    "EvaluationDuration": 1,
                    "EvaluationId": 1,
                    "averageScore": 1

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




exports.GetCompetenciesForManagerToSubmit = async (emp) => {
    try {
        var list = await EvaluationRepo.aggregate([
            { $match: { _id: ObjectId(emp.EvaluationId) } },
            { $unwind: '$Employees' },
            { $match: { "Employees._id": ObjectId(emp.ForEmployeeId) } },
            {
                $project: {
                    _id: 0,
                    "Employees._id": 1,
                    'DirectReportee': {
                        $filter: {
                            input: "$Employees.DirectReportees",
                            as: "self",
                            cond: { $eq: ['$$self.EmployeeId', ObjectId(emp.DirectReport)] }
                        },
                    }
                }
            },
            {
                $lookup:
                {
                    from: "competencies",
                    localField: "DirectReportee.DirectReporteeCompetencyList._id",
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
exports.SaveCompetencyQnAByManager = async (qna) => {
    try {
        for (let index = 0; index < qna.QnA.length; index++) {
            const element = qna.QnA[index];
            var fg = await EvaluationRepo.updateOne({
                _id: Mongoose.Types.ObjectId(qna.EvaluationId),
                "Employees._id": Mongoose.Types.ObjectId(qna.EmployeeId),
                "Employees.Manager.Competencies.Questions": { $elemMatch: { _id: Mongoose.Types.ObjectId(element.QuestionId) } }
            }, {
                $set: {
                    "Employees.$[e].Manager.Competencies.$[c].Questions.$[q].SelectedRating": element.Answer,
                    "Employees.$[e].Manager.Competencies.$[c].Comments": element.Comments,
                    "Employees.$[e].Manager.Competencies.$[c].CompetencyAvgRating": element.CompetencyAvgRating,
                }
            },
                {
                    "arrayFilters": [
                        { "e._id": ObjectId(qna.EmployeeId) },
                        { "c._id": ObjectId(element.CompetencyRowId) },
                        { "q._id": ObjectId(element.QuestionId) }]
                }
            )
        }
        var updateCompetencyList = await EvaluationRepo.updateOne({
            _id: Mongoose.Types.ObjectId(qna.EvaluationId),
            "Employees._id": Mongoose.Types.ObjectId(qna.EmployeeId)
        }, {
            $set: {
                "Employees.$[e].Manager.CompetencySubmitted": !qna.IsDraft,
                "Employees.$[e].Manager.CompetencySubmittedOn": qna.IsDraft ? null : new Date()

            }
        },
            {
                "arrayFilters": [
                    { "e._id": ObjectId(qna.EmployeeId) }
                ]
            }
        )
        if (updateCompetencyList) {
            return { IsSuccess: true }
        } else {
            return { IsSuccess: false }
        }
    } catch (error) {
        logger.error('Error Occurred while saving Competency', error);
        throw error;
    }


};


exports.GetOverallRatingByCompetency = async (emp) => {
    try {
        var list = await EvaluationRepo.aggregate([
            { $match: { _id: ObjectId(emp.EvaluationId) } },
            { $unwind: '$Employees' },
            { $match: { "Employees._id": ObjectId(emp.ForEmployeeId) } },
            {
                $project: {
                    _id: 0,
                    "Employees": 1
                }
            },
            { $addFields: { "Manager": "$Employees.Manager" } },
            { $addFields: { "Employee": "$Employees" } },
            { $addFields: { "Peers": "$Employees.Peers" } },
            { $addFields: { "DRs": "$Employees.DirectReportees" } },
            {
                $project: {
                    _id: 0,
                    "Employees._id": 1,
                    'Manager': 1,
                    'Employee': 1,
                    'Peers': 1,
                    'DRs': 1


                }

            }
        ]);
        var _clist = [];
        var returnObj = {
            competencyId: "",
            allSubmitted: false,
            overallScore: 0
        };
        var allPeersRatingSubmitted = true;
        var allDrSubmitted = true;
        var managerSubmitted = true;
        if (list[0] && list[0].Employee.Competencies && list[0].Employee.Competencies.length > 0) {
            var clist = list[0].Employee.Competencies.map(x => x.Competency._id);
            for (let index = 0; index < clist.length; index++) {
                const element = clist[index];
                _pcScore = [];
                var _p = list[0].Peers.filter(x => x.CompetencySubmitted === false)
                if (_p && _p.length > 0) {
                    allPeersRatingSubmitted = false;
                    _clist.push({ competencyId: element, allSubmitted: false, overallScore: 0 })
                    continue;
                } else {
                    var allpeers = list[0].Peers.map(x => x.QnA)
                    if (allpeers && allpeers.length > 0) {
                        for (let p = 0; p < allpeers.length; p++) {
                            const currentPeer = allpeers[p];
                            var currentCompetency = currentPeer.filter(x => x.CompetencyId === element)
                            var _avg = calcAverage(currentCompetency.map(x => x.Answer))
                            _pcScore.push(_avg);
                        }
                    }
                }
                //For Direct Reportee
                _drScore = [];
                var _d = list[0].DRs.filter(x => x.CompetencySubmitted === false)
                if (_d && _d.length > 0) {
                    allDrSubmitted = false;
                    _clist.push({ competencyId: element, allSubmitted: false, overallScore: 0 })
                    continue;
                } else {
                    var alldrs = list[0].DRs.map(x => x.QnA)
                    if (alldrs && alldrs.length > 0) {
                        for (let d = 0; d < alldrs.length; p++) {
                            const currentDr = alldrs[d];
                            var currentDrCompetency = currentDr.filter(x => x.CompetencyId === element)
                            var _avg = calcAverage(currentDrCompetency.map(x => x.Answer))
                            _drScore.push(_avg);
                        }
                    }
                }

                //For Manager Rating
                _managerScore = [];
                if (!list[0].Manager.CompetencySubmitted) {
                    managerSubmitted = false;
                    _clist.push({ competencyId: element, allSubmitted: false, overallScore: 0 })
                    continue;
                } else {
                    var _manager = list[0].Manager.map(x => x.Competencies)
                    if (_manager && _manager.length > 0) {
                        for (let m = 0; m < _manager.length; p++) {
                            const currentM = _manager[m];
                            var currentMCompetency = currentM.filter(x => x._id === element)
                            var _avg = calcAverage(currentMCompetency.map(x => x.Answer))
                            _managerScore.push(_avg);
                        }
                    }
                }
                var _overallScore=calcAverage(_pcScore)+calcAverage(_drScore)+_managerScore
                _clist.push({ competencyId: element, allSubmitted: true, overallScore: _overallScore })
            }
        }
        return _clist

    } catch (error) {
        logger.error('error occurred while getting emp peer competencies for review:', error)
        throw error;
    }

}

function calcAverage(arr) {
    var sum = 0;
    for (var i = 0; i < arr.length; i++) {
        sum += parseInt(arr[i], 10); //don't forget to add the base
    }

    var avg = sum / arr.length;
    return avg || 0;
}



