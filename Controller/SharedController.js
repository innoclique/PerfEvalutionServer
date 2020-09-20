const Express = require("express");
const Validation_Helper = require('../Helpers/Validation_Helper');
const AuthHelper = require('../Helpers/Auth_Helper');
const UserService = require('../DataServices/UserService');
const Joi = require('joi');
var logger = require('../logger');
const { response } = require("express");


exports.ConfirmTnC = async (req, res, next) => {
    const CurrentUserId = req.user.Id;
    await UserService.ConfirmTnC(CurrentUserId, req.body)
    .then(Response => res.status(200).json(Response))
    .catch(err => next(err));
}