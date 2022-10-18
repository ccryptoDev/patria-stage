/**
 * Achdocuments.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var Q = require('q'),
   moment = require('moment');
const ObjectId = require("mongodb").ObjectID;
module.exports = {

  attributes: {
		docname: {
      type: "string"
    },
    proofdocument: {
      model: 'Asset'
    },
		paymentManagement: {
      model: 'PaymentManagement'
    },
	  screenTracking: {
		  type: 'string'
	  },
	  otherDescription: {
			type: 'string'
	  },
		user: {
      model: 'User'
    },
	  docType: {
			type: "string"
	  },
		status: {
			type: 'integer',
			defaultsTo: 1
    }
  },
  createAchDocuments: createAchDocuments,
  updateDocumentProof: updateDocumentProof,
	getUserAchUploadDocuments: getUserAchUploadDocuments,
	getAllAchUploadDocumentsForDocTypes: getAllAchUploadDocumentsForDocTypes,
	getEmploymentAchUploadDocuments: getEmploymentAchUploadDocuments,
	getAllEmploymentAchUploadDocuments: getAllEmploymentAchUploadDocuments
};


function createAchDocuments(data,payID,userid) {
  return Q.promise(function(resolve, reject) {

		  Achdocuments.create(data)
		  .then(function(achdocuments) {
			return resolve(achdocuments);
		  })
		  .catch(function(err) {
			sails.log.error('AchDocuments#createAchDocuments :: err :', err);
			return reject(err);
		  });



  });
}

function updateDocumentProof(achdocuments, assetEntity){

	 return Q.promise(function(resolve, reject) {
		if (!achdocuments || !assetEntity) {
		  sails.log.error("Achdocuments#updateDocumentProof :: Error :: insufficient data");

		  return reject({
			code: 500,
			message: 'INTERNAL_SERVER_ERROR'
		  });
		}
		var searchCriteria = {
			id: achdocuments.id
		  },
		  updates = {
			proofdocument: assetEntity.id
		  };
		Achdocuments
		  .update(searchCriteria, updates)
		  .then(function(data) {

			return resolve(data);
		  })
		  .catch(function(err) {
			sails.log.error("Achdocuments#updateDocumentProof :: err : ", err);
			return reject(err);
		  });
	  });


}
function getUserAchUploadDocuments(userId, docTypes = sails.config.loanDetailsConfig.getUserUploadDocTypes()) {
	return new Promise((resolve,reject) => {
		Achdocuments.native(function(err, collection) {
			collection.aggregate(
				[
					{
						$lookup: {
							from: "asset",
							localField: "proofdocument",
							foreignField: "_id",
							as: "assetData"
						}
					},
					{
						$unwind: "$assetData"
					},
					{
						$match: {
							user: new ObjectId(userId),
							docType: {$in: Object.keys(docTypes)}
						}
					},
					{
						$sort: {createdAt: 1}
					},
					{
						$group: {
							_id: "$docType",
							data: {$last: "$$ROOT"}
						}
					}
				],
				function(err,result) {
					if(err) {
						sails.log.error( "HomeController#dashboardAction UserCatch :: err", err );
						return reject(err);
					}else {
						const documents = [];
						if(result && result.length > 0) {
							result.forEach( ( results ) => {
								const documentvalue = results.data;
								documentvalue["id"] = documentvalue._id.toString();
								if( documentvalue && documentvalue.assetData && documentvalue.assetData.isImageProcessed ) {
									const assetData = documentvalue.assetData;
									documentvalue["documentUrl"] = Utils.getS3Url( assetData.standardResolution );
									documents.push(documentvalue);
								}
							});
						}
						return resolve(documents);
					}
				});
		});
	});
}
function getAllAchUploadDocumentsForDocTypes(userId, docTypes) {
	return new Promise((resolve,reject) => {
		Achdocuments.native(function(err, collection) {
			collection.aggregate(
				[
					{
						$lookup: {
							from: "asset",
							localField: "proofdocument",
							foreignField: "_id",
							as: "assetData"
						}
					},
					{
						$unwind: "$assetData"
					},
					{
						$match: {
							user: new ObjectId(userId),
							docType: {$in: Object.keys(docTypes)}
						}
					}
				],
				function(err,result) {
					if(err) {
						sails.log.error( "HomeController#dashboardAction UserCatch :: err", err );
						return reject(err);
					}else {
						const documents = [];
						if(result && result.length > 0) {
							result.forEach( ( results ) => {
								const documentvalue = results;
								documentvalue["id"] = documentvalue._id.toString();
								if( documentvalue && documentvalue.assetData && documentvalue.assetData.isImageProcessed ) {
									const assetData = documentvalue.assetData;
									documentvalue["documentUrl"] = Utils.getS3Url( assetData.standardResolution );
									documents.push(documentvalue);
								}
							});
						}
						return resolve(documents);
					}
				});
		});
	});
}
function getEmploymentAchUploadDocuments(userId) {
	return getUserAchUploadDocuments(userId, sails.config.loanDetailsConfig.getEmploymentDocTypes())
}
function getAllEmploymentAchUploadDocuments(userId){
	return getAllAchUploadDocumentsForDocTypes(userId, sails.config.loanDetailsConfig.getEmploymentDocTypes())
}
