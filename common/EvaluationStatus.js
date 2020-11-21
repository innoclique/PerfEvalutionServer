const EvaluationStatus = {};
EvaluationStatus['Initiated'] = 5;
EvaluationStatus['InProgress'] = 10;
EvaluationStatus['Half-way'] = 35;
EvaluationStatus['EmployeeSubmission'] = 50;
EvaluationStatus['ManagerStarted'] = 65;
EvaluationStatus['ManagerHalf-way'] = 75;
EvaluationStatus['ManagerSubmission'] = 85;
EvaluationStatus['RevisionProgress'] = 90;
EvaluationStatus['AwaitingPeer Review'] = 90;
EvaluationStatus['RevisionSubmitted'] = 95;
EvaluationStatus['EvaluationComplete'] = 100;

module.exports = EvaluationStatus;