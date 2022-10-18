/**
 * BorrowerController
 *
 * @description :: Server-side logic for managing Borrowers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
'use strict';

var passport = require('passport');
var bcrypt = require("bcrypt");
var moment = require('moment');
var _ = require('lodash');
var in_array = require('in_array');
const { SendError, ErrorHandler } = require('../services/ErrorHandling');
const ScreentrackingModel = require('../models/Screentracking');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Esignature = require('../models/Esignature');
const S3Service = require('../services/S3Service');


const BorrowerController = {
	borrowerLogin: async function (req, res) {
		try {
			const { email, password } = req.body;

			const userData = await User.findUserByAttr({ email: email });
			if (!userData) {
				throw new ErrorHandler(404, "User doesn't Exist");
			}

			const isValidPassword = await User.validatePassword(password, userData.password);
			console.log(isValidPassword, " resit ");
			if (!isValidPassword) {
				throw new ErrorHandler(401, "Email or Password Not Valid!");
			}

			const context = {
				user: {
					uid: userData.id,
					email: userData.email,
				}
			}
			const userToken = await jwt.sign(context, sails.config.env.TOKEN_SECRET, { expiresIn: '1y' });
			delete userData.password;
			delete userData.confirmPassword;
			res.json({ accessToken: userToken, userData })
		} catch (error) {
			SendError(error, res)
		}
	},

	getBorrowerData: async function (req, res) {
		try {
			const { uid } = req.user;

			const userData = await User.findUserByAttr({ id: uid });
			if (!userData) {
				throw new ErrorHandler(404, "User doesn't Exist");
			}

			const screentracking = await ScreentrackingModel.getScreenTracking({ user: uid, isCompleted: false });

			delete userData.password;
			delete userData.confirmPassword;
			res.json({
				data: {
					screentracking: screentracking,
					userData: userData
				}
			})
		} catch (error) {
			SendError(error, res);
		}
	},

	getBorrowerAgreements: async function (req, res) {
		try {
			const { id: uid } = req.user;
			const { screenId } = req.params;

			const query = {
				user_id: uid,
				screentracking: screenId
			}
			console.log("query", query);
			const agreements = await Esignature.getUserAgreements(query);
			console.log(agreements);
			const list = [];
			agreements.forEach((item, index) => {
				const context = {
					name: item.signatureType,
					size: 'N/A',
					id: item.id,
				}
				list.push(context);
			});

			res.json({
				data: list,
				ok: true
			})
		} catch (error) {
			SendError(error, res);
		}
	},

	readAgreement: async function (req, res) {
		try {
			const { docId } = req.params;
			const query = {
				id: docId
			}
			console.log("first", docId)
			const agreement = await Esignature.getUserAgreements(query);
			if (!agreement || agreement.length === 0) {
				throw new ErrorHandler(404, "Document Not Found");
			}
			S3Service.s3ReadStream(agreement[0].remoteFilePath, res);
		} catch (error) {
			SendError(error, res);
		}
	}
}

module.exports = BorrowerController;


function formatPhoneNumber(phoneNumberString) {
	var cleaned = ('' + phoneNumberString).replace(/\D/g, '')
	var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
	if (match) {
		return '(' + match[1] + ') ' + match[2] + '-' + match[3]
	}
	return null
}