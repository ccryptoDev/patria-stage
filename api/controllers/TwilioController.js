/**
 * Twilio Controller
 *
 * @description :: Server-side logic for managing Ach details
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/

const TwilioService = require('../services/TwilioService');


module.exports = {
	startverification: startverification,
	validate: validate
};


function startverification( req, res ) {
	if( ! req.isSocket ) {
		return res.badRequest();
	}

	var socketId = sails.sockets.getId( req );
	sails.log.verbose( "startVerification socketId:", socketId );
	const phoneString = req.body? req.body.phoneNumber: "";

	TwilioService.startPhoneVerification( phoneString )
	.then( ( results ) => {
		sails.sockets.broadcast(socketId,"startVerification", results);

	} ).catch((errorObj) => {

		 if(errorObj) {
			 errorObj["errorMessage"] = errorObj.message;
		 }
		 sails.sockets.broadcast(socketId,"startVerification", errorObj);
		});

	 res.json( { success: true, socketId: socketId } );
}


function validate( req, res ) {
	const userId = req.param('userId');
	const screenId = req.param('screenId');
	const phoneNumber = req.param('phoneNumber');

	if( ! req.isSocket ) {
		return res.badRequest();
	}
	var socketId = sails.sockets.getId( req );
	sails.log.verbose( "validate socketId:", socketId );

	const body = req.body;
	if(!body || !body.phoneNumber || !body.verificationCode) {
		sails.sockets.broadcast(socketId,"verifyPhoneCode", { errorMessage: "Missing verification code or phone number" , code: 400});
	}else {

		TwilioService.verifyCode( body.verificationCode, body.phoneNumber )
			.then( ( results ) => {
				User.update({ id: userId }, { isPhoneVerified: true }).then( result => { sails.log.info("Is phone number verified? ", true) } );
				sails.sockets.broadcast(socketId,"verifyPhoneCode", results); 																			// Notice browser.
			} ).catch((errorObj) => {
				if(errorObj) {
					errorObj["errorMessage"] = errorObj.message;
				}
				sails.sockets.broadcast(socketId,"verifyPhoneCode", errorObj);
				res.json({
					status: 200,
					message: 'denied',
				})
			});

		TwilioService.validationSequence({
			userId: userId,
			screenId: screenId,
			phoneNumber: phoneNumber,
		})
		.then( success => {
			const successObj = {
				code: success.code,
				message: success.message
			}
			sails.sockets.broadcast(socketId,"allVerifyPass", successObj);
			res.json({
				status: 200
			})
		})
		.catch( err => {
			const errObj = {
				code: err.code,
				message: err.message
			}
			sails.sockets.broadcast(socketId,"verifyFailed", err);
			res.json({
				status: err.code
			})
		})
	}
}