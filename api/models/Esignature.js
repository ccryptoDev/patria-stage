/**
 * Esignature.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var Q = require('q'),
	moment = require('moment'),
	bcrypt = require('bcrypt');

module.exports = {

	attributes: {
		user_id: {
			model: 'User'
		},
		full_name: {
			type: 'string'
		},
		initial: {
			type: 'string'
		},
		email: {
			type: 'string'
		},
		ip_address: {
			type: 'string'
		},
		device: {
			type: 'string'
		},
		signature: {
			type: 'string'
		},
		password: {
			type: 'text'
		},
		active: {
			type: 'integer',
			defaultsTo: 0
		},
		screentracking: {
			model: 'Screentracking'
		},
		consentID: {
			model: 'UserConsent'
		},
		account: {
			model: 'Account'
		},
		signatureType: {
			type: "string"
		},
		remoteFilePath: {
			type: "string"
		},
	},
	saveSignature: saveSignature,
	generateEncryptedPassword: generateEncryptedPassword,
	getUserAgreements: getUserAgreements
};

function saveSignature(data) {
	return Q.promise(function (resolve, reject) {

		User.findOne({ id: data.user_id })
			.then(async function (userinfo) {
				data.email = userinfo.email;
				try {
					const existingEsignature = await Esignature.findOne({ screentracking: data.screentracking, signatureType: data.signatureType, active: 1 });
					if (existingEsignature) {
						delete data.id;
						await Esignature.update({ id: existingEsignature.id }, data)
						_.assign(existingEsignature, data);
						return resolve(existingEsignature);
					} else {
						const newSignature = await Esignature.create(data)
						return resolve(newSignature);
					}
				} catch (exc) {
					return reject(exc);
				}
			});
	});
}

function generateEncryptedPassword(password, salt) {
	return Q.promise(function (resolve, reject) {
		bcrypt.genSalt(10, function (err, salt) {
			bcrypt.hash(password, salt, function (err, hash) {
				if (err) {
					return reject(err);
				} else {
					return resolve(hash.toString('hex'));
				}
			});
		});
	});
}

async function getUserAgreements(query) {
	try {
		const agreements = await Esignature.find(query);
		return agreements;
	} catch (error) {
		return [];
	}
}
