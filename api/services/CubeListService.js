/* eslint-disable prefer-promise-reject-errors */
/* global Utils, PaymentManagement, sails */
"use strict";
const moment = require( "moment-timezone" );
const _ = require( "lodash" );

module.exports = {
	getColumnsToShow: getColumnsToShow,
	processListSort: processListSort,
	processFiltering: processFiltering,
	getResponseObjectBasedOnConfiguredProperties: getResponseObjectBasedOnConfiguredProperties,
	lookupDataWithAggregate: lookupDataWithAggregate
};

function lookupDataWithAggregate( aggregateQueryList, columnTypeList, nativeModelClass = PaymentManagement, mainEntryDataName = "paymentData" ) {
	return new Promise( ( resolve, reject ) => {
		const columnsToShow = getColumnsToShow( columnTypeList );
		if( !aggregateQueryList || aggregateQueryList.length === 0 || !columnsToShow || columnsToShow.length === 0 ) {
			return reject( { message: "Missing required query to look up this list data" } );
		}
		nativeModelClass.native( ( err, collection ) => {
			collection.aggregate(
					aggregateQueryList,
					{ allowDiskUse: true },
					( err, collectionResults ) => {
						if( err ) {
							sails.log.error( "CubeListService#lookupListDataWithAggregate Error: ", err );
							return resolve( {
								error: err.message
							} );
						}
						let paymentManagementData = [];
						let totalRecords = 0;
						if( collectionResults && collectionResults.length > 0 ) {
							const collectionItem = collectionResults[0];
							paymentManagementData = collectionItem[mainEntryDataName];
							if( collectionResults[ 0 ].overallTotal && collectionResults[ 0 ].overallTotal.length > 0 ) {
								totalRecords = collectionResults[ 0 ].overallTotal[ 0 ].overallTotalCount;
							}
						}
						
						const lookupData = _.map( aggregateQueryList, ( aggregate ) => {
							if( aggregate.$lookup && aggregate.$lookup.as ) {
								return aggregate.$lookup.as;
							}
						} );
						
						const responsePaymentManagementList = [];
						_.forEach( paymentManagementData, ( paymentManagementObj, index ) => {
							if( lookupData && lookupData.length > 0 ) {
								_.forEach( lookupData, ( lookupAs ) => {
									if( !!lookupAs && paymentManagementObj[ lookupAs ] && !paymentManagementObj[ lookupAs ].id && paymentManagementObj[ lookupAs ]._id ) {
										paymentManagementObj[ lookupAs ].id = paymentManagementObj[ lookupAs ]._id.toString();
									}
								} );
							}
							const newPaymentManagment = getResponseObjectBasedOnConfiguredProperties( columnsToShow, paymentManagementObj, index );
							
							responsePaymentManagementList.push( newPaymentManagment );
						} );
						
						const responseJson = {
							recordsTotal: totalRecords,
							recordsFiltered: totalRecords,
							data: responsePaymentManagementList
						};
						return resolve( responseJson );
					} );
		} );
	} );
}

function getColumnsToShow( dataFields ) {
	const columnsToShow = [];
	_.forEach( dataFields, ( oldColumn ) => {
		const col = _.assign( {}, oldColumn );
		if( col.dataType && _.isArray( col.dataType ) ) {
			_.forEach( col.dataType, ( oldAdditionalCol ) => {
				const additionalCol = _.assign( {}, oldAdditionalCol );
				additionalCol[ "searchable" ] = convertBoolean( col.searchable );
				additionalCol[ "orderable" ] = convertBoolean( col.orderable );
				columnsToShow.push( additionalCol );
			} );
			col.dataType = "ignore";
		}
		columnsToShow.push( col );
	} );
	return columnsToShow;
}

function getResponseObjectBasedOnConfiguredProperties( columnsToShow, dataObject, index ) {
	const newResponseObject = {};
	const loopId = index + 1;
	_.forEach( columnsToShow, ( dataProperties ) => {
		if( !dataProperties.dataType || dataProperties.dataType.toLowerCase() !== "ignore" ) {
			_.set( newResponseObject, dataProperties.data, formatValue( _.get( dataObject, dataProperties.data ), dataProperties.dataType, !!dataProperties.defaultValue?dataProperties.defaultValue:"--" ) );
		} else {
			newResponseObject[ dataProperties.data ] = "";
		}
	} );
	newResponseObject[ "loopId" ] = loopId;
	newResponseObject[ "id" ] = dataObject.id || dataObject._id.toString();
	
	return newResponseObject;
}

function processFiltering( matchCriteria, searchFilters, searchValue, dataFields ) {
	if( !matchCriteria ) {
		matchCriteria = {};
	}
	const searchArray = processSearch( searchValue, dataFields );
	if( searchArray && searchArray.length > 0 ) {
		const matchOrCriteria = matchCriteria[ "$and" ];
		if( matchOrCriteria && matchOrCriteria.length > 0 ) {
			matchCriteria[ "$and" ].push({$or:  searchArray });
		} else {
			matchCriteria[ "$and" ] = [{$or:  searchArray }];
		}
	}
	if( searchFilters && searchFilters.length > 0 ) {
		const matchOrCriteria = matchCriteria[ "$and" ];
		if( matchOrCriteria && matchOrCriteria.length > 0 ) {
			matchCriteria[ "$and" ] = matchOrCriteria[ "$and" ].concat( searchFilters );
		} else {
			matchCriteria[ "$and" ] = searchFilters;
		}
	}
	return matchCriteria;
}

function processSearch( searchValue, dataFields ) {
	const whereCondition = [];
	if( dataFields.length > 0 && !!searchValue && !!searchValue.toString().trim() ) {
		searchValue = searchValue.toString().trim();
		_.forEach( dataFields, ( dataField ) => {
			if( convertBoolean( dataField.searchable ) && dataField.dataType !== "ignore" ) {
				const dataFieldKey = dataField.data;
				const whereObj = {};
				if( [ "int", "currency" ].indexOf( dataField.dataType ) >= 0 ) {
					whereObj[ dataFieldKey ] = Number( searchValue );
				} else {
					whereObj[ dataFieldKey ] = { "$regex": searchValue, $options: "i" };
				}
				
				
				whereCondition.push( whereObj );
			}
		} );
	}
	return whereCondition;
}

function processListSort( orderByObj, columns ) {
	const sortValue = {};
	const orderObject = Utils.getFirstObjectFromArray( orderByObj );
	if( orderObject && !!orderObject.dir && !!orderObject.column && columns && columns.length > 0 ) {
		const columnIndex = parseInt( orderObject.column );
		const column = columns[ columnIndex ];
		if( convertBoolean( column.orderable ) && ( column.dataType !== "ignore" || ( column.orderByField && !!column.orderByField.data ) ) ) {
			let columnData = column.data;
			if( column.orderByField && !!column.orderByField.data ) {
				columnData = column.orderByField.data;
			}
			sortValue[ columnData ] = orderObject.dir === "desc" ? 1 : -1;
		}
	}
	return sortValue;
}

function convertBoolean( booleanString ) {
	return booleanString !== undefined && booleanString != null && booleanString.toString().trim().toLowerCase() === "true";
}

function formatValue( originalValue, dataType, defaultValue ) {
	if( !!dataType && ( !!originalValue || dataType.toLowerCase() === "blank" ) ) {
		switch( dataType.toLowerCase() ) {
			case "currency":
				return parseFloat( originalValue.toString() ).toLocaleString( "en-US", {
					style: "currency",
					currency: "USD",
					maximumFractionDigits: 2,
					minimumFractionDigits: 0
				} );
			case "int":
				return parseInt( originalValue.toString() );
			case "date":
				return moment( originalValue ).format( "MM-DD-YYYY" );
			case "datetime":
				return moment( originalValue ).format( "MM-DD-YYYY [at] h:mm a" );
			case "phone":
				return Utils.phoneformatForDatatables( originalValue.toString(), true );
			case "percent":
				return  `${parseFloat(originalValue.toString()).toLocaleString( "en-US", {
					currency: "USD",
					maximumFractionDigits: 2,
					minimumFractionDigits: 0
				} )}%`;
			case "array":
			case "object":
				return originalValue;
			case "blank":
				return "";
		}
	} else if( !originalValue && !!defaultValue ) {
		return defaultValue;
	}
	return originalValue;
}
