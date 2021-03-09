const EmployeeManagerService = require('../DataServices/EmployeeManagerService')

exports.Dashboard = async (req,res,next)=>{
    await EmployeeManagerService.EMDashboardData(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json(""))
        .catch(err => next(err => { next(err) }));
}

exports.DirectReposrtsCtrl = async (req,res,next)=>{
    await EmployeeManagerService.DirectReports(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json(""))
        .catch(err => next(err => { next(err) }));
}
exports.SavePeerDirectReportRequestCtrl = async (req,res,next)=>{
    console.log("Inside:SavePeerDirectReportRequestCtrl");
    await EmployeeManagerService.SavePeerDirectReportRequest(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json(""))
        .catch(err => next(err => { next(err) }));
}

exports.FindPeerDirectReportRequestCtrl = async (req,res,next)=>{
    console.log("Inside:FindPeerDirectReportRequestCtrl");
    let requestList =  await EmployeeManagerService.FindPeerDirectReportRequest(req.body);
    res.status(200).json(requestList);
}
exports.FindPeerDirectReportRequestByEmployeeCtrl = async (req,res,next)=>{
    console.log("Inside:FindPeerDirectReportRequestByEmployeeCtrl");
    let requestList =  await EmployeeManagerService.FindPeerDirectReportRequestByEmployee(req.body);
    res.status(200).json(requestList);
}
