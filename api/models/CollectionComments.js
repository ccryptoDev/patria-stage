
const collectionCommentType = {
	PROMISE_TO_PAY: "PROMISE_TO_PAY",
	MOVING_BACK_TO_COLLECTING: "MOVING_BACK_TO_COLLECTING",
	CHARGEOFF: "CHARGEOFF",
	SETTLED: "SETTLED",
	MODIFY_LOAN: "MODIFY_LOAN",
	MAKE_PAYMENT: "MAKE_PAYMENT",
	BANKRUPTCY: "BANKRUPTCY",
	LATE_FIRST_PAYMENT: "LATE_FIRST_PAYMENT",
	PERFORMING: "ACTIVE"
};

module.exports = {
	attributes: {
		paymentmanagement: {
			model: "PaymentManagement"
		},

		lastModifiedBy: {
			model:"Adminuser"
		},
		collectionsCommentType: { type: "string", enum: Object.values(collectionCommentType)},

		comment: {
			type:"string"
		},
	},
	collectionCommentTypeEnum: collectionCommentType,
	getQueryFromCollectionCommentType: getQueryFromCollectionCommentType
};

function getQueryFromCollectionCommentType(commentType) {
	const collectionCommentTypes = Object.values(collectionCommentType);
	const responseQuery = {};
	if(!!commentType && collectionCommentTypes.indexOf(commentType) >= 0){
		responseQuery["collectionsCommentType"] = commentType;
	}
	return responseQuery;
}
