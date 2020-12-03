const EmployeeManagerService = require('../DataServices/EmployeeManagerService')

exports.Dashboard = async (req,res,next)=>{
    await EmployeeManagerService.EMDashboardData(req.body)
        .then(Response => Response ? res.status(200).json(Response) : res.status(404).json(""))
        .catch(err => next(err => { next(err) }));
}