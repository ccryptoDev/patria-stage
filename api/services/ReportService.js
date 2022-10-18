/* global CubeListService, ReportHistory, ReportTemplate, PracticeManagement, S3Service */

module.exports = {
	lookupPayments: lookupPayments,
	history: history
};

async function lookupPayments( columnTypeList, matchCriteria, searchValue = null, searchFilters = [], orderObj = null, offset = "1", limit = "100" ) {
	const columnsToShow = CubeListService.getColumnsToShow( columnTypeList );
	return await CubeListService.lookupDataWithAggregate(
		[
			{
				$lookup: {
					from: "user",
					localField: "user",
					foreignField: "_id",
					as: "userData"
				}
			},
			{
				$unwind: {
					path: "$userData",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$lookup: {
					from: "paymentmanagement",
					localField: "paymentmanagement",
					foreignField: "_id",
					as: "paymentmanagementData"
				}
			},
			{
				$unwind: {
					path: "$paymentmanagementData",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$lookup: {
					from: "practicemanagement",
					localField: "practicemanagement",
					foreignField: "_id",
					as: "practicemanagementData"
				}
			},
			{
				$unwind: {
					path: "$practicemanagementData",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$lookup: {
					from: "employmenthistory",
					localField: "paymentmanagementData.employmenthistory",
					foreignField: "_id",
					as: "employmenthistoryData"
				}
			},
			{
				$unwind: {
					path: "$employmenthistoryData",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$match: CubeListService.processFiltering( matchCriteria, searchFilters, searchValue, columnsToShow )
			},
			{
				$facet: {
					overallTotal: [ { $count: "overallTotalCount" } ],
					paymentData: [ { $sort: CubeListService.processListSort( orderObj, columnTypeList ) }, { $skip: parseInt( offset || "0" ) }, { $limit: parseInt( limit || "100" ) } ]
				}
			}
		],
		columnTypeList,
		Payment
	);
}

async function history( columnTypeList, matchCriteria, searchValue = null, searchFilters = [], orderObj = null, offset = "1", limit = "100" ) {
	const columnsToShow = CubeListService.getColumnsToShow( columnTypeList );
	return await CubeListService.lookupDataWithAggregate(
		[
			{
				$match: CubeListService.processFiltering( matchCriteria, searchFilters, searchValue, columnsToShow )
			},
			{
				$facet: {
					overallTotal: [ { $count: "overallTotalCount" } ],
					paymentData: [ { $sort: CubeListService.processListSort( orderObj, columnTypeList ) }, { $skip: parseInt( offset || "0" ) }, { $limit: parseInt( limit || "100" ) } ]
				}
			}
		],
		columnTypeList,
		ReportHistory
	);
}
