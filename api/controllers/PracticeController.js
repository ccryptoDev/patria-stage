'use strict';

var request = require('request'),
Q = require('q'),
_ = require('lodash'),
moment = require('moment');
var request = require('request'), moment = require('moment');
var fs = require('fs');
//var stripe = require("stripe")("sk_test_rwcNedmgXTuf1hqd1Nr07JE6");
//var stripe = require("stripe")("sk_test_JE2NI92frzEP07QHlHjycVN2");
var stripe = require("stripe")(sails.config.stripeSecretKey);

module.exports = {
  practiceList: practiceListAction,
  staffAdminList: staffAdminListAction,
  createpractice:createpracticeAction,
  addnewpractice:addnewpracticeAction,
  ajaxpracticeList:ajaxpracticeListAction,
  editpractice:editpracticeAction,
  updatepractice:updatepracticeAction,
  ajaxstaffAdminUserList:ajaxstaffAdminUserListAction,
  addStaffAdmin:addStaffAdminAction,
  addnewstaffAdminUser:addnewstaffAdminUserAction,
  editstaffAdminuser:editstaffAdminuserAction,
  updatestaffAdminUser:updatestaffAdminUserAction,
  autoFillingUniversity: autoFillingUniversityAction,
  getschoolBranch:getschoolBranchAction,
  startPractice:startPracticeAction,
  practiceinformation: practiceinformationAction,
  addprocedcures: addprocedcuresAction,
  resendinvite: resendinvite,
  updatepracticeinfo: updatepracticeinfoAction,
  addlendermerchantfees: addlendermerchantfeesAction,
	createprocedure: createprocedureAction,
	deleteprocedure: deleteprocedureAction,
	updateprocedure: updateprocedureAction,
  getmerchantfeetemplate:getmerchantfeetemplateAction,
  getvendorinterestrate:getvendorinterestrateAction,
  addstaffmembers:addstaffmembersActtion,
  getstaffmembers:getstaffmembersAction,
  addfinancialinformation:addfinancialinformationAction,
  checkpracticeurl:checkpracticeurlAction,
  viewpracticedetails:viewpracticedetailsAction,
	practicesettingEdit: practicesettingEditAction
};

function practiceListAction(req, res){
		var errorval = '';
		var successval = '';

		if(req.session.Practiceerrormsg!=''){
			errorval =req.session.Practiceerrormsg;
			req.session.Practiceerrormsg = '';
		}

		if(req.session.Practicesuccessmsg!=''){
			successval =req.session.Practicesuccessmsg;
			req.session.Practicesuccessmsg = '';
		}

		var responsedata = {
		  approveerror:errorval,
		  approvesuccess:successval
		};

		// PFI-35; prevent practice admins from seeing the other practices and/or other (super)admin-related functions for all practices
		if( req.session.rolename === 'Admin' ) {
			return res.redirect( "/admin/dashboard" );
		}

		return res.view("admin/practice/practiceList", responsedata);
}

function createpracticeAction(req, res){
   	State
	.getExistingPracticeState()
	.then(function (states) {

		 if ("undefined" !== typeof req.param('providerid') && req.param('providerid') != '' && req.param('providerid') != null)
		 {
			 var providerId = req.param('providerid');
			 Provider
			 .findOne({id:providerId})
			 .then(function(providerData){
				return res.view("admin/practice/createpractice",{stateData:states,stripe:stripe,siteUrl:sails.config.siteBaseUrl,interestTermsArr:sails.config.plaid.interestTermsArr,StateCode:providerData.state,City:providerData.city,contactemail:providerData.email,contactphoneNo:providerData.phonenumber,providername:providerData.providername});
		    })
		 }
		 else
		 {
 	   	   return res.view("admin/practice/createpractice",{stateData:states,stripe:stripe,siteUrl:sails.config.siteBaseUrl,interestTermsArr:sails.config.plaid.interestTermsArr});
		 }
	})
	.catch(function (err) {
	      sails.log.error("PracticeController#createpracticeAction :: err", err);
		  return res.handleError({
			code: 500,
			message: 'INTERNAL_SERVER_ERROR'
		  });
	});
}


function addnewpracticeAction( req, res ) {
		var criteria = {
			PracticeEmail: req.param('PracticeEmail'),
		  	PracticeName: req.param('PracticeName'),
		  	isDeleted: false
		};
		PracticeManagement.findOne(criteria)
	  	.then(function(practicedata) {
			if(practicedata)
			{
				req.session.Practiceerrormsg = "";
				req.session.Practiceerrormsg = "Practice name and email already exist!"
				return res.redirect("/admin/managepractice");
			}
			else
			{
				var PracticeUrl = req.param('PracticeUrl');
				var purlString = PracticeUrl.replace(/[^A-Z0-9]/ig, "-");
				purlString = purlString.toLowerCase();

				var slugcriteria = {
					UrlSlug: purlString
				};

				PracticeManagement.findOne(slugcriteria)
	  			.then(function(slugpracticedata) {

					if(slugpracticedata)
					{
						req.session.Practiceerrormsg = "";
						req.session.Practiceerrormsg = "Practice url already exist!"
						return res.redirect("/admin/managepractice");
					}
					else
					{
						var	stripe_token	=	req.param('stripe_token');
						var stripecustomerRequest={
							email: req.param('PracticeEmail'),
							description: 'Customer for '+req.param('PracticeEmail'),
							source: stripe_token
						}
						stripe.customers.create( stripecustomerRequest, function(err, customer) {
						  // asynchronously called
							if(err)
							{
								req.session.Practiceerrormsg = "";
								req.session.Practiceerrormsg = "Unable to charge stripe for creating practice."
								return res.redirect("/admin/managepractice");
							}
							if(customer.id)
							{
								var stripechargeRequest	=	{
									amount: sails.config.stripeSetupFee,
									currency: "usd",
									customer: customer.id,
									description: sails.config.lender.shortName + " - Setup Fee"
								}

								var practiceFormData	=	req.allParams();
								PracticeManagement.stripePaymentChargeProcess(customer, practiceFormData, stripecustomerRequest, stripechargeRequest)
								.then(function(responsedetails){
									if(responsedetails.code==200)
									{
										var practiceFormData	=	responsedetails.stripeDetails;
										var stripesasschargeRequest	=	{
											amount: sails.config.stripeSaasFee,
											currency: "usd",
											customer: customer.id,
											description: sails.config.lender.shortName + " - Monthly Service Fee"
										}
										var stripeHistroyid1	=	responsedetails.stripehistoryId;

										PracticeManagement.stripePaymentChargeProcess(customer, practiceFormData, stripecustomerRequest, stripesasschargeRequest)
										.then(function(responsedetails1) {

											var stripeInput			=	responsedetails1.stripeDetails;
											var stripeHistroyid2	=	responsedetails1.stripehistoryId;

											PracticeManagement.registerNewPractice(stripeInput)
											.then(function (schoolDetails) {
												if(schoolDetails.code==400)
												{
													req.session.Practiceerrormsg	=	'';
													req.session.Practiceerrormsg	=	"Practice name and email already exist!"
													return res.redirect("/admin/managepractice");
												}
												else
												{
													if(responsedetails1.code==200)
													{

														var practiceTermData 	= 	req.allParams();
														var loanterms			=	practiceTermData.loanTerm;
														var loanTermAmt = practiceTermData.loanTermAmt;

														var	loantermsArray		=	[];
 														if(Array.isArray(loanterms))
														{
															loantermsArray	=	loanterms;
  														}
														else
														{
															loantermsArray.push(loanterms);
 														}
 														var inputData	=	{practiceid:schoolDetails.id,enabledTerms:loantermsArray,loanTermAmt:loanTermAmt};
 														LoanSettings.createPracticeLoansettings(inputData, function(loansetresponse){
															PracticeManagement.update({id: schoolDetails.id}, {loansettingsupdated: 1})
															.exec(function afterwards(err, updated){

															});

															Stripehistory.update({id: stripeHistroyid1}, {practicemanagement: schoolDetails.id})
															.exec(function afterwards(err, updated){

															});

 															Stripehistory.update({id: stripeHistroyid2}, {practicemanagement: schoolDetails.id})
															.exec(function afterwards(err, updated){

															});

															if(loansetresponse.statusCode==200)
															{
																req.session.Practicesuccessmsg = '';
																req.session.Practicesuccessmsg = "Practice has been created Successfully!"
																return res.redirect("/admin/managepractice");
															}
 														});
													}
													else
													{
														req.session.Practiceerrormsg	=	'';
														req.session.Practiceerrormsg	=	"Unable to register new practice.";
														return res.redirect("/admin/managepractice");
													}
												}
											})
											.catch(function (err) {
												sails.log.error('PracticeController#addnewpracticeAction :: err :', err);
												req.session.Practiceerrormsg = "";
												req.session.Practiceerrormsg = "Unable to register new practice."
												return res.redirect("/admin/managepractice");
											});
										});
									}
									else
									{
										req.session.Practiceerrormsg = "";
										req.session.Practiceerrormsg = "Unable to create customer in stripe and creating practice failed."
										return res.redirect("/admin/managepractice");
									}
								})
								.catch(function (err) {
									sails.log.error('PracticeController#addnewpracticeAction :: err :', err);
									req.session.Practiceerrormsg = "";
									req.session.Practiceerrormsg = "Unable to register new practice."
									return res.redirect("/admin/managepractice");
								});
							}
							else
							{
								req.session.Practiceerrormsg = "";
								req.session.Practiceerrormsg = "Unable to create customer in stripe and creating practice failed."
								return res.redirect("/admin/managepractice");
							}
						});
					}
				});
			}
	   	});

	  /*PracticeManagement
		.registerNewPractice(req.allParams())
		.then(function (schoolDetails) {

			if(schoolDetails.code==400)
			{
			    sails.log.info('schoolDetails', schoolDetails);
				req.session.Practiceerrormsg = '';
				req.session.Practiceerrormsg = "Practice name and email already exist!"
				return res.redirect("/admin/managepractice");
			}else{
				sails.log.info('schoolDetails', schoolDetails);
				req.session.Practicesuccessmsg = '';
				req.session.Practicesuccessmsg = "Practice has been created Successfully!"
				return res.redirect("/admin/managepractice");
			}

		})
		.catch(function (err) {
		  sails.log.error('AdminuserController#addnewuserAction :: err :', err);
		  return res.handleError(err);
		});	*/
}

function staffAdminListAction(req, res) {

		var errorval = '';
		var successval = '';
		if(req.session.approveerror!=''){
			errorval =req.session.approveerror;
			req.session.approveerror = '';
		}

		if(req.session.successmsg!=''){
			successval =req.session.successmsg;
			req.session.successmsg = '';
		}

		var responsedata = {
		  approveerror:errorval,
		  approvesuccess:successval
		};

		return res.view("admin/practice/staffAdminList",responsedata);
}

function editpracticeAction(req, res) {
    var errorval = '';
    var successval = '';

    if (req.session.practiceerror != '') {
        errorval = req.session.practiceerror;
        req.session.practiceerror = '';
    }

    if (req.session.practicesuccessmsg != '') {
        successval = req.session.practicesuccessmsg;
        req.session.practicesuccessmsg = '';
    }


    var school_id = req.param('id');

    PracticeManagement.findOne({ id: school_id }).then(function (schoolData) {
        sails.log.info('schoolData:::::::', schoolData);
        if ("undefined" !== typeof schoolData.Accountnumber && schoolData.Accountnumber != '' && schoolData.Accountnumber != null) {
            schoolData.Accountnumber = schoolData.Accountnumber.replace(/\d(?=\d{4})/g, "X");
        }
        if ("undefined" !== typeof schoolData.Accountnumber && schoolData.Verifyaccountnumber != '' && schoolData.Verifyaccountnumber != null) {
            schoolData.Verifyaccountnumber = schoolData.Verifyaccountnumber.replace(/\d(?=\d{4})/g, "X");
        }
        if ("undefined" !== typeof schoolData.Routingnumber && schoolData.Routingnumber != '' && schoolData.Routingnumber != null) {
            schoolData.Routingnumber = schoolData.Routingnumber.replace(/\d(?=\d{4})/g, "X");
        }
        if ("undefined" !== typeof schoolData.CreditCardNumber && schoolData.CreditCardNumber != '' && schoolData.CreditCardNumber != null) {
            schoolData.CreditCardNumber = schoolData.CreditCardNumber.replace(/\d(?=\d{4})/g, "X");
        }

        LoanSettings
            .find({ practicemanagement: school_id })
            .then(function (termData) {

                State
                    //.getExistingState()
                    .getExistingPracticeState()
                    .then(function (states) {
                        return res.view("admin/practice/editpractice", { schoolData: schoolData, termData:termData, errorval: errorval, successval: successval, stateData: states, siteUrl: sails.config.siteBaseUrl, disableValue: 1,interestTermsArr:sails.config.plaid.interestTermsArr });
                    })
                    .catch(function (err) {
                        sails.log.error('PracticeManagement#editpracticeAction :: err', err);
                        return res.handleError(err);
                    });
            })
            .catch(function (err) {
                sails.log.error('LoanSetting#editpracticeAction :: err', err);
                return res.handleError(err);
            });
    })
	.catch(function (err) {
		sails.log.error('PracticeManagement#editpracticeAction :: err', err);
		return res.handleError(err);
	});
}


function updatepracticeAction( req, res ) {
	const practiceData = req.allParams();
    PracticeManagement.findOne( { PracticeEmail: practiceData.PracticeEmail, id: { $ne: practiceData.id }, isDeleted: false } )
	.then( function( emailExists ) {
        if( emailExists ) {
			req.session.practiceerror = "";
			req.session.practiceerror = "Email Already Exist!";
			return res.redirect( `/admin/editpractice/${practiceData.id}` );
        }

		PracticeManagement.findOne( { id: practiceData.id } )
		.then( ( practicemanagement ) => {
			var updateData = {
				ContactName: practiceData.ContactName,
				PracticeEmail: practiceData.PracticeEmail,
				// PracticeName: practiceData.PracticeName,
				LocationName: practiceData.LocationName,
				StreetAddress: practiceData.StreetAddress,
				City: practiceData.City,
				StateCode: practiceData.StateCode,
				ZipCode: practiceData.ZipCode,
				PhoneNo: practiceData.PhoneNo,
				industryCode: practiceData.industryCode,
				memberCode: practiceData.memberCode,
				prefixCode: practiceData.prefixCode,
				apiPassword: practiceData.apiPassword,
				prescreen: {
					prefixCode: practiceData.prescreen.prefixCode,
					industryCode: practiceData.prescreen.industryCode,
					memberCode: practiceData.prescreen.memberCode,
					password: practiceData.prescreen.password
				}
			};

			var	updateccard	=	req.param('updateccard');

			//--Added for ticket no 2872
			var loanTermAmt = practiceData.loanTermAmt;
			var termloop=0;
			var loanTermAmtArray =[];
			_.forEach(sails.config.plaid.interestTermsArr, function (termvalue) {
					//-- Need to change when term 48 is enabled
					/*var  loanTermAmtValue;
					if(termvalue=='48')
					{

						var  loanTermAmtValue  = '0.00';
					}
					else
					{
						var  loanTermAmtValue           =   loanTermAmt[termloop];
					}*/
					var  loanTermAmtValue           =   loanTermAmt[termloop];
					loanTermAmtValue 				= 	loanTermAmtValue.replace("$ ","");
					loanTermAmtValue			    =   loanTermAmtValue.replace(/,/g , "");
					loanTermAmtValue 				= 	loanTermAmtValue.replace(" ","");
					loanTermAmtArray[termvalue]     =   loanTermAmtValue;
					termloop++;
			});

			if(updateccard=='1')
			{
				var cardExp 		= 	practiceData.CardExpiryDate.split("/");
				var	stripe_token	=	req.param('stripe_token');
				var stripecustomerRequest={
					email: req.param('PracticeEmail'),
					source: stripe_token
				}
				stripe.customers.create( stripecustomerRequest, function(err, customer) {

					if(err)
					{
						req.session.practiceerror = '';
						req.session.practiceerror = "Unable to update the stripe details (create stripe cusomter fails!)";
						return res.redirect("/admin/editpractice/"+practiceData.id);
					}

					//Update new card Details
					updateData.customerID			=	customer.id;
					updateData.stripecardID		=	customer.default_source;
					updateData.stripe_token		=	practiceData.stripe_token;
					updateData.Cardholdername		=	practiceData.Cardholdername1;
					updateData.CreditCardNumber	=	practiceData.CreditCardNumber1.replace(/\d(?=\d{4})/g, "X");
					updateData.CardExpiryDate		=	practiceData.CardExpiryDate1.replace(/[0-9 \/]/g, "X");
					updateData.CvvCode			=	practiceData.CvvCode1.replace(/[0-9]/g, "X");


					//Update old card Details
					if (!practicemanagement.oldstripeDetails)
					{
						updateData.oldstripeDetails = [];
					}
					else
					{
						updateData.oldstripeDetails =practicemanagement.oldstripeDetails
					}

					updateData.oldstripeDetails.push({
							stripe_token: practicemanagement.stripe_token,
							customerID: practicemanagement.customerID,
							chargeID:practicemanagement.chargeID,
							stripecardID: practicemanagement.stripecardID,
							date: new Date()
					});

					//--Ticket no 2696 (to process recurring by next day for practice)
					//--Ticket no 2891 starts here
					if (practicemanagement.failedattemptcount>0)
					{
						var todaysDate = moment().startOf('day').toDate().getTime();
						var currentvalidityDate = moment(practicemanagement.validityDate).startOf('day').toDate().getTime();

						if (currentvalidityDate <= todaysDate)
						{
							//var validityDate = moment().startOf('day').add(1, 'days').toDate();
							var nextmonthStartDate = moment().add(1,'months').startOf('month').format('MM-DD-YYYY');
							var nextmonthnoofdays	=	moment(nextmonthStartDate).daysInMonth();
							var practicedate	=	moment(practicemanagement.createdAt).date();
							if(practicedate=='1')
							{
								var paymentDays = 0;
							}
							else
							{
								var paymentDays = moment(practicemanagement.createdAt).subtract(1, 'days').date();
								if(paymentDays > nextmonthnoofdays)
								{
									paymentDays	=	nextmonthnoofdays;
								}

							}
							if(paymentDays==0)
							{
								var validityDate = moment(nextmonthStartDate).startOf('day').toDate();
								//var validityDate = moment(nextmonthStartDate).startOf('day').add(5, 'days').toDate();
							}
							else
							{
								var validityDate = moment(nextmonthStartDate).startOf('day').add(paymentDays, 'days').toDate();
							}
							updateData.validityDate = validityDate;
							updateData.failedattemptcount = 0;
						}
					}
					//--Ticket no 2891 starts here
					var loanterms	=	practiceData['loanTerm[]'];
					PracticeManagement.update({id:practiceData.id},updateData).exec(function afterwards(err, updated){
						LoanSettings.update({practicemanagement:practiceData.id},{loanactivestatus:0}).exec(function afterwards(err, updated){
							if ("undefined" !== typeof loanterms && loanterms!='' && loanterms!=null)
							{
								if(!Array.isArray(loanterms))
								{
									LoanSettings.update({id:loanterms},{loanactivestatus:1}).exec(function afterwards(err, updated){

									});
								}
								else
								{
									_.forEach(loanterms, function(loantermid) {
										LoanSettings.update({id:loantermid},{loanactivestatus:1}).exec(function afterwards(err, updated){

										});
									});
								}
							}

							//--Added for ticket no 2872
							var loanTermAmtValue;
							_.forEach(sails.config.plaid.interestTermsArr, function (term) {

								if(loanTermAmtArray[term])
								{
									loanTermAmtValue = parseFloat(loanTermAmtArray[term]);
									var updatequery= {practicemanagement:practiceData.id,loanterm:term}
									var updateValues= {termsloanamount:loanTermAmtValue}
									LoanSettings.update(updatequery,updateValues).exec(function afterwards(err, updated){

									});
								}
							});

							req.session.practicesuccessmsg = '';
							req.session.practicesuccessmsg = "Practice  has been updated Successfully!";
							var modulename = 'Update the practice details';
							var modulemessage = 'Updated the practice details';
							req.logdata=req.allParams();
							Logactivity.practiceLogActivity(req,modulename,modulemessage);
							return res.redirect("/admin/editpractice/"+practiceData.id);
						});
					});

				});
			}
			else
			{

				var loanterms	=	practiceData.loanTerm;
				PracticeManagement.update({id:practiceData.id},updateData).exec(function afterwards(err, updated){
					LoanSettings.update({practicemanagement:practiceData.id},{loanactivestatus:0}).exec(function afterwards(err, updated){
						if ("undefined" !== typeof loanterms && loanterms!='' && loanterms!=null)
						{
							if(!Array.isArray(loanterms))
							{
								sails.log.info("loanterms: ",loanterms);
								LoanSettings.update({id:loanterms},{loanactivestatus:1}).exec(function afterwards(err, updated){

								});
							}
							else
							{
								_.forEach(loanterms, function(loantermid) {
									LoanSettings.update({id:loantermid},{loanactivestatus:1}).exec(function afterwards(err, updated){

									});
								});
							}
						}

						//--Added for ticket no 2872
						var loanTermAmtValue;
						_.forEach(sails.config.plaid.interestTermsArr, function (term) {

							if(loanTermAmtArray[term])
							{
								loanTermAmtValue = parseFloat(loanTermAmtArray[term]);
								var updatequery= {practicemanagement:practiceData.id,loanterm:term}
								var updateValues= {termsloanamount:loanTermAmtValue}
								LoanSettings.update(updatequery,updateValues).exec(function afterwards(err, updated){

								});
							}
						});

						req.session.practicesuccessmsg = '';
						req.session.practicesuccessmsg = "Practice  has been updated Successfully!";
						var modulename = 'Update the practice details';
						var modulemessage = 'Updated the practice details';
						req.logdata=req.allParams();
						Logactivity.practiceLogActivity(req,modulename,modulemessage);
						return res.redirect("/admin/editpractice/"+practiceData.id);
					});
				});
			}

		});
		})
	    .catch(function (err) {
			 sails.log.error('PracticeManagement#updatepracticeAction :: err', err);
			 return res.handleError(err);
		});
}

function ajaxpracticeListAction(req, res){

	//Sorting
	var colS = "";
	var sorttype=1;
	if(req.query.sSortDir_0=='desc') {
		var sorttype=-1;
	}


	switch( req.query.iSortCol_0 ) {
		case '0':  var sorttypevalue = { '_id': sorttype }; break;
		case '1':  var sorttypevalue = { 'PracticeName': sorttype }; break;
		case '2':  var sorttypevalue = { 'ContactName': sorttype }; break;
		case '3':  var sorttypevalue = { 'PracticeEmail': sorttype }; break;
		case '4':  var sorttypevalue = { 'LocationName': sorttype }; break;
		case '5':  var sorttypevalue = { 'City': sorttype }; break;
		case '6':  var sorttypevalue = { 'StateCode': sorttype }; break;
		case '7':  var sorttypevalue = { 'createdAt': sorttype }; break;
		default: break;
	};

	//Search
	if( req.query.sSearch ) {
		sails.log.info("search value: ",req.query.sSearch);
		var criteria = {
			or: [
				{ PracticeName:  { 'contains': req.query.sSearch } },
				{ ContactName:  { 'contains': req.query.sSearch } },
				{ PracticeEmail:  { 'contains': req.query.sSearch } },
				{ LocationName:  { 'contains': req.query.sSearch } },
				{ City:  { 'contains': req.query.sSearch } },
				{ StateCode:  { 'contains': req.query.sSearch } },
				{ createdAt:  { 'contains': req.query.sSearch } }
			]
		};
	} else {
		var criteria = {};
	}

	var skiprecord =parseInt(req.query.iDisplayStart);
	var iDisplayLength = parseInt(req.query.iDisplayLength);
	var schoolData = [];
	var totalrecords =0;
	var loopid;
	PracticeManagement.count(criteria).exec(function countCB(error, totalrecords) {

		if(totalrecords>0)
		{
			PracticeManagement
			.find(criteria)
			.sort(sorttypevalue)
			.skip(skiprecord)
			.limit(iDisplayLength)
			.then(function(SchoolDetails) {

				SchoolDetails.forEach(function(schoolinfo,loopvalue){
					loopid = loopvalue+skiprecord+1;

					if ("undefined" === typeof schoolinfo.ContactName || schoolinfo.ContactName=='' || schoolinfo.ContactName==null)
					{
						schoolinfo.ContactName= '--';
					}

					if ("undefined" === typeof schoolinfo.PracticeName || schoolinfo.PracticeName=='' || schoolinfo.PracticeName==null)
					{
						schoolinfo.PracticeName= '--';
					}
					if ("undefined" === typeof schoolinfo.PracticeEmail || schoolinfo.PracticeEmail=='' || schoolinfo.PracticeEmail==null)
					{
						schoolinfo.PracticeEmail= '--';
					}
					if ("undefined" === typeof schoolinfo.LocationName || schoolinfo.LocationName=='' || schoolinfo.LocationName==null)
					{
						schoolinfo.LocationName= '--';
					}
					if ("undefined" === typeof schoolinfo.City || schoolinfo.City=='' || schoolinfo.City==null)
					{
						schoolinfo.City= '--';
					}
					if ("undefined" === typeof schoolinfo.StateCode || schoolinfo.StateCode=='' || schoolinfo.StateCode==null)
					{
						schoolinfo.StateCode= '--';
					}
					if ("undefined" === typeof schoolinfo.InvitedDate || schoolinfo.InvitedDate=='' || schoolinfo.InvitedDate==null)
					{
						schoolinfo.InvitedDate= '--';
					}
					if ("undefined" === typeof schoolinfo.Status || schoolinfo.Status=='' || schoolinfo.Status==null)
					{
						schoolinfo.Status= '--';
					}

					if ("undefined" !== typeof schoolinfo.UrlSlug && schoolinfo.UrlSlug!='' && schoolinfo.UrlSlug!=null)
					{
						var PracticeUrl= sails.config.siteBaseUrl+schoolinfo.UrlSlug;
					}
					else
					{
						var PracticeUrl= '--';
					}

					var actiondata ='<a title="Add Admin" href="/admin/editpractice/'+schoolinfo.id+'"><i class="fa fa-edit" aria-hidden="true" style="cursor:pointer; color:#337ab7;"></i></a> &nbsp;<a href="/admin/resendinvite/'+schoolinfo.id+'"><i class="fa fa-envelope" aria-hidden="true"></i></a>&nbsp;<a href="/admin/viewpracticedetails/'+schoolinfo.id+'"><i class="fa fa-eye" aria-hidden="true"></i></a>';

					/*var actiondata ='<a title="Add Admin" href="/admin/editpractice/'+schoolinfo.id+'"><i class="fa fa-edit" aria-hidden="true" style="cursor:pointer; color:#337ab7;"></i></a>';*/

					schoolData.push({ loopid:loopid,PracticeName: schoolinfo.PracticeName, ContactName: schoolinfo.ContactName, PracticeEmail: schoolinfo.PracticeEmail, LocationName: schoolinfo.LocationName, City: schoolinfo.City, StateCode: schoolinfo.StateCode, InvitedDate: schoolinfo.InvitedDate, PracticeUrl: PracticeUrl, Status: schoolinfo.Status, actiondata:actiondata });
				});

				var json = {
						sEcho:req.query.sEcho,
						iTotalRecords: totalrecords,
						iTotalDisplayRecords: totalrecords,
						aaData: schoolData
					};
				res.contentType('application/json');
				res.json(json);
			});
		}
		else
		{
			var json = {
						sEcho:req.query.sEcho,
						iTotalRecords: totalrecords,
						iTotalDisplayRecords: totalrecords,
						aaData: schoolData
					};
				res.contentType('application/json');
				res.json(json);
		}
	});
}

function addStaffAdminAction(req, res){
	//var id = req.param('id');

	var error = '';
	var success = '';
	if(req.session.error!=''){
		error =req.session.error;
		req.session.error = '';
	}

	if(req.session.successmsg!=''){
		success =req.session.successmsg;
		req.session.successmsg = '';
	}

	Roles.findOne({rolename:'Admin'})
	.then(function(roledetails){

		   var id;
		   if ("undefined" !== typeof req.session.adminpracticeID && req.session.adminpracticeID!='' && req.session.adminpracticeID!=null)
		   {
			 id= req.session.adminpracticeID ;
		   }

		   if(id)
		   {
				PracticeManagement.findOne(id)
				.then(function (schoolData){
					return res.view("admin/practice/createstaffAdminuser",{schoolData:schoolData,roledetails:roledetails,error:error,success:success});
				});
			}
			else
			{
				PracticeManagement.find()
				.then(function (schoolData){
					return res.view("admin/practice/createstaffAdminuser",{schoolData:schoolData,roledetails:roledetails,error:error,success:success});
				});
			}
	})
	.catch(function (err) {
		  sails.log.error('AdminuserController#createnewuserAction :: err :', err);
		  var errors = {
						  "code": 404,
						  "message": "Roles not found"
						};
		  res.view("admin/error/404", {
				data: errors.message,
				layout: 'layout'
		  });
	});
}

function addnewstaffAdminUserAction(req, res){

	var schoolAdminData = {
			username:req.param('Username'),
			email:req.param('email'),
			firstname:req.param('firstname'),
			registeredtype:'Rep',
			lastname:req.param('lastname'),
			role:req.param('roleId'),
			practicemanagement:req.param('schoolId'),
			practiceManagementName:req.param('schoolName'),
			phoneNumber:req.param('phoneNumber'),
			BranchName:req.param('BranchName')
	};
    // sails.log.info("schoolAdminData---: ",schoolAdminData);

    var practiecriteria ={
	   PracticeName:req.param('schoolName')
    }
	PracticeManagement.
	findOne(practiecriteria)
	.then(function(StaffAdminData){

		if(StaffAdminData)
		{
			PracticeUser
			.registerNewSchoolAdmin(schoolAdminData,req.param('roleId'))
			.then(function (user) {
				if(user.code==200)
				{
					req.session.successmsg = '';
					req.session.successmsg = "Practice Admin has been created Successfully!"
					return res.redirect("/admin/managestaffAdmin");
				}
				else
				{
					req.session.error = '';
					req.session.error='Email already exist';
					return res.redirect("/admin/addStaffAdmin");
				}
			})
			.catch(function (err) {
			  sails.log.error('AdminuserController#addnewuserAction :: err :', err);
			  return res.handleError(err);
			});
		}
		else
		{
			req.session.error = '';
			req.session.error='Invalid Practice Name';
			return res.redirect("/admin/addStaffAdmin");
		}
	})
	.catch(function (err) {
	  sails.log.error('AdminuserController#addnewuserAction :: err :', err);
	  return res.handleError(err);
	});
}

function ajaxstaffAdminUserListAction(req, res){
	 //Sorting
	var colS = "";
	var sorttype=1;
	var whereConditionAnd =new Array();
	var whereConditionOr = new Array();
	var criteria = new Array();
	if(req.query.sSortDir_0=='desc')
	{
		var sorttype=-1;
	}

	sails.log.info("req.session.adminpracticeID::::",req.session.adminpracticeID);


	switch(req.query.iSortCol_0){
		case '1':  var sorttypevalue = { 'username': sorttype }; break;
		case '2':  var sorttypevalue = { 'firstname': sorttype }; break;
		case '3':  var sorttypevalue = { 'lastname': sorttype }; break;
		case '4':  var sorttypevalue = { 'email': sorttype }; break;
		case '5':  var sorttypevalue = { 'phoneNumber': sorttype }; break;
		case '6':  var sorttypevalue = { 'practiceManagementName': sorttype }; break;
		case '8':  var sorttypevalue = { 'createdAt': sorttype }; break;
		default: break;
	};

	    //Search
		sails.log.info("search value: ",req.query.sSearch);
		//whereConditionAnd.push({registeredtype:'StaffAdmin'});
		if(req.query.sSearch)
		{
			whereConditionOr.push({username:  { 'contains': req.query.sSearch }});
			whereConditionOr.push({firstname:  { 'contains': req.query.sSearch }});
			whereConditionOr.push({lastname:  { 'contains': req.query.sSearch }});
			whereConditionOr.push({email:  { 'contains': req.query.sSearch }});
			whereConditionOr.push({schoolManagementName:  { 'contains': req.query.sSearch }});
			whereConditionOr.push({phoneNumber:  { 'contains': req.query.sSearch }});
			whereConditionOr.push({createdAt:  { 'contains': req.query.sSearch }});
		}

		if(whereConditionOr.length > 0){
			//criteria.push({$and:whereConditionAnd,$or:whereConditionOr});

			if ("undefined" !== typeof req.session.adminpracticeID && req.session.adminpracticeID!='' && req.session.adminpracticeID!=null)
			{
				criteria.push({$or:whereConditionOr,isDeleted : false,practicemanagement:req.session.adminpracticeID});
			}
			else
			{
				criteria.push({$or:whereConditionOr,isDeleted : false});
			}

			var practiccriteria = criteria[0];
		}
		else
		{
			//criteria.push({$and:whereConditionAnd});

			if ("undefined" !== typeof req.session.adminpracticeID && req.session.adminpracticeID!='' && req.session.adminpracticeID!=null)
			{
				var practiccriteria = { isDeleted : false,practicemanagement:req.session.adminpracticeID};
			}
			else
			{
				var practiccriteria = { isDeleted : false};
			}
		}


	sails.log.info("practiccriteria:::",practiccriteria);

	PracticeUser
    .find(practiccriteria)
	.sort( sorttypevalue)
		.populate("roles")
	.populate('practicemanagement')
	.then(function(userDetails) {
				//Filter user details not available
		userDetails=_.filter(userDetails,function(item){
			if(item.email!='' && item.email!=null)
			{
				return true;
			}
		});
		var totalrecords= userDetails.length;

		//Filter by limit records
		var skiprecord =parseInt(req.query.iDisplayStart);
		var checklimitrecords = skiprecord+parseInt(req.query.iDisplayLength);

		if(checklimitrecords>totalrecords)
		{
			var iDisplayLengthvalue=parseInt(totalrecords);
		}
		else
		{
			var iDisplayLengthvalue=parseInt(req.query.iDisplayLength)+parseInt(skiprecord);
		}

		userDetails= userDetails.slice(skiprecord, iDisplayLengthvalue);

		//sails.log.info("userDetails", userDetails);

		var userData = [];
		var userName='';
		var userEmail='';
		var userphoneNumber='';
		var loopid;
		userDetails.forEach(function(userinfo,loopvalue){
			loopid = loopvalue+skiprecord+1;
			userinfo.createdAt = moment(userinfo.createdAt).format('MM-DD-YYYY hh:mm:ss');


			if ("undefined" === typeof userinfo.name || userinfo.name=='' || userinfo.name==null)
			{
				userinfo.name= '--';
			}

			if ("undefined" === typeof userinfo.email || userinfo.email=='' || userinfo.email==null)
			{
				userinfo.email= '--';
			}

			if ("undefined" === typeof userinfo.phoneNumber || userinfo.phoneNumber=='' || userinfo.phoneNumber==null)
			{
				userinfo.phoneNumber= '--';
			}
			if ("undefined" === typeof userinfo.website || userinfo.website=='' || userinfo.website==null)
			{
				userinfo.website= '--';
			}

			if(userinfo.isDeleted)
			{
				var actiondata ='<i class="fa fa-square-o icon-red" aria-hidden="true" style="cursor:pointer; color:red;" onclick="setAdminUserStatus(\''+userinfo.id+'\',\'inactive\');"></i>&nbsp;&nbsp; <a href="/admin/edituser/'+userinfo.id+'"><i class="fa fa-pencil-square-o" aria-hidden="true" style="cursor:pointer; color:#337ab7;"></i></a>';
			}
			else
			{
				//var actiondata ='<i class="fa fa-check-square-o icon-green" aria-hidden="true" style="cursor:pointer; color:green;" onclick="setAdminUserStatus(\''+userinfo.id+'\',\'active\');"></i>&nbsp;&nbsp; <a href="/admin/edituser/'+userinfo.id+'"><i class="fa fa-pencil-square-o" aria-hidden="true" style="cursor:pointer; color:#337ab7;"></i></a>';

				var actiondata ='<a href="/admin/editstaffAdminuser/'+userinfo.id+'"><i class="fa fa-pencil-square-o" aria-hidden="true" style="cursor:pointer; color:#337ab7;"></i></a>';
				//var actiondata = '--';

			}

			if(userinfo.email){
				var emillnk = '<a href="mailto:'+userinfo.email+'">'+userinfo.email+'</a>';
			}

			if ("undefined" === typeof userinfo.roles.rolename || userinfo.roles.rolename=='' || userinfo.roles.rolename==null)
			{
				userinfo.roles.rolename= '--';
			}
			//sails.log.info("userinfo", userinfo);

			userData.push({ loopid:loopid,username: userinfo.username, email: userinfo.email, phoneNumber: userinfo.phoneNumber, firstname: userinfo.firstname,schoolname:userinfo.practiceManagementName,lastname:userinfo.lastname, createdAt:userinfo.createdAt, rolename:userinfo.roles.rolename, actiondata:actiondata });
		});
		 var json = {
				sEcho:req.query.sEcho,
				iTotalRecords: totalrecords,
				iTotalDisplayRecords: totalrecords,
				aaData: userData
			};
		//sails.log.info("json data", json);
		res.contentType('application/json');
		res.json(json);

	});
}

function editstaffAdminuserAction(req, res){

		var errorval = '';
		var successval = '';

		sails.log.info("req.session.approveerror---:",req.session.approveerror);
		sails.log.info("req.session.successmsg---:",req.session.successmsg);

		if(req.session.approveerror!=''){
			errorval =req.session.approveerror;
			req.session.approveerror = '';
		}

		if(req.session.successmsg!=''){
			successval =req.session.successmsg;
			req.session.successmsg = '';
		}



		var user_id = req.param('id');
		sails.log.info("user_id---:",user_id);

		PracticeUser
		 .findOne({id:user_id})
		 .populate('practicemanagement')
		 .then(function(userData){
			sails.log.info("userData---:",userData);
			return res.view("admin/practice/editstaffAdminuser",{userData:userData,approveerror:errorval,approvesuccess:successval});
		})
		 .catch(function (err) {
				 sails.log.error('PracticeController#loandocumentsAction :: err', err);
				 return res.handleError(err);
	});
 }

function updatestaffAdminUserAction(req,res){

		var userId = req.param('id');
		var username = req.param('Username');
		var firstname = req.param('firstname');
		var lastname = req.param('lastname');
		var email = req.param('email');
		var phoneNumber = req.param('phoneNumber');

		 if(userId)
	     {
		    var uniid = {
					id: userId
			};

			PracticeUser
			.findOne(uniid)
			.populate('roles')
			.then(function(userdata){

				 //-- check in admin user table before proceeding
				 var previousAdminemail = userdata.email;
				 Adminuser.findOne({email: email})
		 		 .then(function(adminuserdata){

				   if (adminuserdata && email != userdata.email)
				   {
					    req.session.approveerror = '';
						req.session.approveerror = "Email Already Exist!";
						return res.redirect("/admin/editstaffAdminuser/"+userId);
				   }
				   else
				   {
					   var checkcriteria = {
							email: email,
							isDeleted: false
					   };

				  	   PracticeUser.findOne(checkcriteria)
					  .then(function(userdetails) {

						if (userdetails && email != userdata.email)
						{
							req.session.approveerror = '';
							req.session.approveerror = "Email Already Exist!";
							return res.redirect("/admin/editstaffAdminuser/"+userId);
						}
						/*else if(userdetails && username != userdata.username)
						{
							req.session.approveerror = '';
							req.session.approveerror = "Username Already Exist!";
							return res.redirect("/admin/editstaffAdminuser/"+userId);
						}*/
						else
						{
							if(username != userdata.username)
							{
								var admincriteria	=	{
									name: username,
									isDeleted: false
								};
								Adminuser.findOne(admincriteria)
							  	.then(function(adminuserdetails) {
									if ("undefined" === typeof adminuserdetails || adminuserdetails=='' || adminuserdetails==null)
									{
										var practicecriteria	=	{
											username: username,
											isDeleted: false
										};
										PracticeUser.findOne(practicecriteria)
										.then(function(practiceuserdetails) {
											if ("undefined" === typeof practiceuserdetails || practiceuserdetails=='' || practiceuserdetails==null)
											{
												Adminuser.update({email: previousAdminemail}, {name: username, email:email, phoneNumber:phoneNumber}).exec(function afterwards(err, adminuserupdated){
												PracticeUser.update({id: userId}, {username: username,firstname: firstname,lastname: lastname, email:email,phoneNumber:phoneNumber}).exec(function afterwards(err, userupdated){
														req.session.successmsg = '';
														req.session.successmsg = "Practice Admin has been updated Successfully!";
														var modulename = 'Update Practice Admin user';
														var modulemessage = 'Updated Practice admin user successfully';
														req.logdata=req.allParams();
														req.role=userdata.role.rolename;
 														Logactivity.practiceLogActivity(req,modulename,modulemessage);
 														return res.redirect("/admin/managestaffAdmin");
													});
												});
											}
											else
											{
												req.session.approveerror = '';
												req.session.approveerror = "Username Already Exist!";
												return res.redirect("/admin/editstaffAdminuser/"+userId)
											}
									   	}).catch(function (err) {
											req.session.errormsg='';
											req.session.errormsg = 'Unable to update user';
											return res.redirect("/admin/editstaffAdminuser/"+userId);
									   });
 									}
									else
									{
										req.session.approveerror = '';
										req.session.approveerror = "Username Already Exist!";
										return res.redirect("/admin/editstaffAdminuser/"+userId)
									}
								}).catch(function (err) {
									req.session.errormsg='';
									req.session.errormsg = 'Unable to update user';
									return res.redirect("/admin/editstaffAdminuser/"+userId);
							   });
							}
							else
							{
								Adminuser.update({email: previousAdminemail}, {name: username, email:email, phoneNumber:phoneNumber}).exec(function afterwards(err, adminuserupdated){
									PracticeUser.update({id: userId}, {username: username,firstname: firstname,lastname: lastname, email:email,phoneNumber:phoneNumber}).exec(function afterwards(err, userupdated){
											req.session.successmsg = '';
											req.session.successmsg = "Practice Admin has been updated Successfully!";
											var modulename = 'Update Practice Admin user';
											var modulemessage = 'Updated Practice admin user successfully';
											req.logdata=req.allParams();
											req.role=userdata.role.rolename;
											Logactivity.practiceLogActivity(req,modulename,modulemessage);
											return res.redirect("/admin/managestaffAdmin");
									});
								});
							}
						}
					})
					.catch(function (err) {
						req.session.errormsg='';
						req.session.errormsg = 'Unable to update user';
						return res.redirect("/admin/editstaffAdminuser/"+userId);
					 });
				  }
			   })
			   .catch(function (err) {
					req.session.errormsg='';
					req.session.errormsg = 'Unable to update user';
					return res.redirect("/admin/editstaffAdminuser/"+userId);
			   });
		 })
		 .catch(function (err) {
				req.session.errormsg='';
				req.session.errormsg = 'Unable to update user';
				return res.redirect("/admin/editstaffAdminuser/"+userId);
		 });
	 }
}

function autoFillingUniversityAction(req, res){

	var universitySearch = req.param('universitySearch');


	if (!universitySearch) {
		sails.log.error("StaffAdmin#autocompleteAction :: Insufficient Data");
		return res.handleError({
			code: 500,
        	message: 'INTERNAL_SERVER_ERROR'
	   });
	}
	else
	{

		PracticeManagement.native(function(err,coll){
			coll.aggregate([
			   { $group : {"_id" : "$PracticeName","PracticeID": { "$first": "$_id"}, "isDeleted": { "$first": "$isDeleted"}} },
			   {
				$match: {
				  isDeleted: false,
				  "_id":  {'$regex': universitySearch ,$options:'i'}
				}
			  }
		   ],function(err,universities) {

					var data = [];
					var universityName = '';
					_.forEach(universities, function(university) {
						  data.push({
							universityId: university.PracticeID,
							universityName: university._id,
							schoolDOE:university.SchoolDOE,
						  });
					});
					sails.log.info('University# --------> ', data);
					return res.success(data);
			  });
		});
	}
}

function getschoolBranchAction(req,res)
{
	var schoolBranch = req.param('schoolBranch');
	sails.log.info("schoolbranchschoolbranch : ",schoolBranch);

	if(!schoolBranch)
	{
		sails.log.error("StaffAdmin#autocompleteAction :: Insufficient Data");
		return res.handleError({
			code: 500,
        	message: 'INTERNAL_SERVER_ERROR'
	   });
	}
	else
	{
	  var criteria = {
		  isDeleted: false,
		  BranchName: schoolBranch
		};
		sails.log.info("criteria::criteria::::",criteria);
		PracticeManagement
		  .find(criteria)
		  .then(function(schoolbranch) {
		  	sails.log.info("schoolbranch::schoolbranch::::",schoolbranch);
			var data = [];
			var schoolBranchName = '';
			_.forEach(schoolbranch, function(schbranch) {

				sails.log.info("schbranchschbranchschb::::",schbranch);

				if(schbranch.BranchName != '')
				{
					schoolBranchName = schbranch.BranchName;
				}
				else
				{
					schoolBranchName = schbranch.BranchName;
				}

				data.push({
				universityId: schbranch.id,
				schoolBranchName: schoolBranchName
			  });

			});
			sails.log.info('University#autocompleteUniversityAction :: data :', data);
			return res.success(data);
		  })
		  .catch(function(err) {
			sails.log.error('University#autocompleteUniversityAction :: err :', err);
			return res.handleError(err);
		  });
	}
}

function resendinvite( req, res ) {
	var practiceid = req.param('id');
	sails.log.info( "PracticeController.resendinvite practiceid:", practiceid );

    PracticeManagement.findOne( { id: practiceid } )
    .then( ( practicedata ) => {
        if( practicedata ) {
		    EmailService.resendInviteUrl( practicedata );
			req.session.Practicesuccessmsg = "Resend Invite url has been send successfully!";
			return res.redirect( "/admin/managepractice/" );
        } else {
			req.session.Practiceerrormsg = "Invite url not send!";
			return res.redirect( "/admin/managepractice/" );
		}
	} ).catch( ( err ) => {
		sails.log.error( "Resend Invite#sendInviteUrl::", err );
		return reject( err );
	} );
}

/* Onboarding starts here */
function startPracticeAction(req,res){

   var urlpath = req.param('urlpath');

   //sails.log.info("urlpath::",urlpath);

   if(urlpath)
   {
	   var criteria={
		  UrlSlug: urlpath
	   }

	   //sails.log.info("PracticeUrl::",urlpath)

	   PracticeManagement
	   .findOne(criteria)
	   .then(function(reponseData) {

		  if(reponseData)
		  {
			 if(reponseData.Status== "Pending")
			 {
				req.session.practiceId = reponseData.id;
				req.session.activeTab =1;

				PracticeManagement
				.update({id: req.session.practiceId},{levelcompleted: req.session.activeTab})
				.exec(function afterwards(err, updated){

   	  	 			return res.view("practice/startpractice",{activeTab:req.session.activeTab});
				});
			 }
			 else
			 {
				 req.session.practiceId ='';
				 res.view("practice/error/errorpage", {
					code: 401,
					data: 'Already completed the practice setup',
					layout: 'layout'
				});
			 }
		  }
		  else
		  {
			req.session.practiceId ='';
			res.view("practice/error/errorpage", {
				code: 401,
				data: 'Invalid Practice Invite url',
				layout: 'layout'
			});
		  }
	   })
	   .catch(function(err) {
			req.session.practiceId ='';
			res.view("practice/error/errorpage", {
				code: 403,
				data: 'Invalid Practice Invite url',
				layout: 'layout'
			});
	   });
   }
   else
   {
	    req.session.practiceId ='';
		res.view("practice/error/errorpage", {
			code: 404,
			data: 'Page not found',
			layout: 'layout'
		});
   }
}

function practiceinformationAction(req, res){

	if((req.session.practiceId != '') && (typeof(req.session.practiceId) != 'undefined') && (req.session.practiceId !=null) )
	{
		 var currentactiveTab=1;
		 if((req.session.activeTab != '') && (typeof(req.session.activeTab) != 'undefined') && (req.session.activeTab !=null) )
		 {
			currentactiveTab = req.session.activeTab;
		 }


		 PracticeManagement
		 .findOne({ id: req.session.practiceId})
		 .then(function(practiceData) {

			 if(currentactiveTab<=2)
			 {
				State
				//.getExistingState()
				.getExistingPracticeState()
				.then(function (stateData) {
					//sails.log.info("stateData::",stateData);
					req.session.activeTab =2;

					PracticeManagement
				    .update({id: req.session.practiceId},{levelcompleted: req.session.activeTab})
				    .exec(function afterwards(err, updated){

						res.view('practice/practiceinformation',{practiceData:practiceData,stateData:stateData,activeTab:req.session.activeTab});
					});
				})
				.catch(function(err) {
					req.session.practiceId ='';
					res.view("practice/error/errorpage", {
						code: 404,
						data: 'Requested page not found',
						layout: 'layout'
					});
				});
			 }
		 })
		 .catch(function(err) {

				req.session.practiceId ='';
				res.view("practice/error/errorpage", {
					code: 404,
					data: 'Requested page not found',
					layout: 'layout'
				});
		 });
	}
	else
	{
		req.session.practiceId ='';
		res.view("practice/error/errorpage", {
			code: 404,
			data: 'Requested page not found',
			layout: 'layout'
		});
	}
}

function updatepracticeinfoAction(req, res){

	if((req.session.practiceId != '') && (typeof(req.session.practiceId) != 'undefined') && (req.session.practiceId !=null) )
	{
		var reqData  = req.allParams();

		var criteria = {
		  id: req.session.practiceId,
		  isDeleted: false
		};

		//sails.log.info("practice criteria:", criteria);

		req.session.practiceupdateerror = '';
		req.session.practiceupdatesuccess = '';

		PracticeManagement.findOne(criteria)
      	.then(function(practicedata) {

			//sails.log.info("practicedata:", practicedata);

			if (practicedata)
			{
				Roles.findOne({rolename:'Rep'})
				.then(function(roledetails){

				   		var roleId = roledetails.id;

						//sails.log.info("roleId:", roleId);

						var practiceusercriteria = {
							email: req.param('contactemail'),
							practicemanagement:practicedata.id
						};

						var practiceusernamecriteria = {
							username: req.param('username'),
						};

						PracticeUser.findOne(practiceusernamecriteria)
					    .then(function(usernameExist) {

							if (!usernameExist)
							{
								PracticeUser.findOne(practiceusercriteria)
								.then(function(userdata) {

									if (!userdata)
									{
											 var userDetails = {
														//userReference:userReference,
														username:req.param('username'),
														email:req.param('contactemail'),
														firstname:req.param('firstname'),
														lastname:req.param('lastname'),
														roles: roleId,
														registeredtype:'Rep',
														role:'Rep',
														practicemanagement:practicedata.id,
														practiceManagementName:practicedata.PracticeName,
														phoneNumber:req.param('PhoneNumber'),
														BranchName:practicedata.LocationName,
														passwordstatus:1
												};


												var password = req.param("password");
												var confirmpassword = req.param("confirmpassword");

												var salt = PracticeUser.generateSalt();

												sails.log.info("salt::",salt);
												sails.log.info("userDetails::",userDetails);

												userDetails.password = password;

												return User.generateEncryptedPassword(userDetails, salt)
												.then(function(encryptedPassword) {

													userDetails.password = encryptedPassword;
													userDetails.salt = salt;

													return User.getNextSequenceValue('practiceuser')
													.then(function(userRefernceData) {

															userDetails.userReference ='PFUSR_'+userRefernceData.sequence_value;

															PracticeUser.create(userDetails)
															.then(function(user) {

																PracticeManagement
																.update({id: req.session.practiceId},{levelcompleted: req.session.activeTab})
																.exec(function afterwards(err, updated){

																	 sails.log.info("Admin privilege created for this practice");

																	 req.session.activeTab =3;
																	 //req.session.practiceupdatesuccess = "Admin privilege created for this practice";
																	 return res.redirect("/practice/addprocedcures");
																});
															 })
															 .catch(function(err) {
																	sails.log.error("create err::",err);
																	req.session.practiceupdateerror = "Failed to create admin privilege for this practice";
																	req.session.reqData = reqData;
																	return res.redirect("/practice/practiceinformation");
															 });

													})
													.catch(function(err) {
															sails.log.error("sequence err::",err);
															req.session.practiceupdateerror = "Failed to create admin privilege for this practice";
															req.session.reqData = reqData;
															return res.redirect("/practice/practiceinformation");
													});
											})
											 .catch(function(err) {
													sails.log.error("password err::",err);
													req.session.practiceupdateerror = "Failed to create admin privilege for this practice";
													req.session.reqData = reqData;
													return res.redirect("/practice/practiceinformation");
											 });
									}
									else
									{
										 sails.log.error("Email already exist");
										 if(practicedata.levelcompleted==2)
										 {
											sails.log.error("Enter if loop");
											req.session.activeTab =3;
											return res.redirect("/practice/addprocedcures");
										 }
										 else
										 {
											sails.log.error("Enter else loop");
											req.session.practiceupdateerror = "Email already exist to create admin privilege for this practice";
											req.session.reqData = reqData;
											return res.redirect("/practice/practiceinformation");
										 }
									}
								})
								.catch(function (err) {
										sails.log.error("practice fetch err::",err);
										req.session.practiceupdateerror = "Failed to create admin privilege for this practice";
										req.session.reqData = reqData;
										return res.redirect("/practice/practiceinformation");
								});
							}
							else
							{
								sails.log.error("username already exist");
								req.session.practiceupdateerror = "Username already exist";
								req.session.reqData = reqData;
								return res.redirect("/practice/practiceinformation");
							}
						})
						.catch(function (err) {
								sails.log.error("username fetch fails",err);
								req.session.practiceupdateerror = "Failed to create admin privilege for this practice";
								req.session.reqData = reqData;
								return res.redirect("/practice/practiceinformation");
						});
					})
					.catch(function (err) {
							sails.log.error("role fetch fails", err);
							req.session.practiceupdateerror = "Failed to create admin privilege for this practice";
							req.session.reqData = reqData;
							return res.redirect("/practice/practiceinformation");
					});
			}
			else
			{
				sails.log.error("Invalid pracitce data");
				req.session.practiceupdateerror = "Failed to create admin privilege for this practice";
				req.session.reqData = reqData;
				return res.redirect("/practice/practiceinformation");
			}
		})
	    .catch(function (err) {
				sails.log.error("practice management fetch fails",err);
				req.session.practiceupdateerror = "Failed to create admin privilege for this practice";
				req.session.reqData = reqData;
				return res.redirect("/practice/practiceinformation");
		});
	}
	else
	{
		sails.log.error("Invalid practice url");
		req.session.practiceId ='';
		res.view("practice/error/errorpage", {
			code: 404,
			data: 'Requested page not found',
			layout: 'layout'
		});
	}
}

function addprocedcuresAction(req, res){

	if((req.session.practiceId != '') && (typeof(req.session.practiceId) != 'undefined') && (req.session.practiceId !=null) )
	{
		res.view('practice/addprocedcures',{activeTab:req.session.activeTab});
	}
	else
	{
		req.session.practiceId ='';
		res.view("practice/error/errorpage", {
			code: 404,
			data: 'Requested page not found',
			layout: 'layout'
		});
	}
}

function stringHasValue( str ) {
	if( ( str != '' ) &&
		( typeof( str ) != 'undefined' ) &&
		( str != null ) ) {
		return true;
	}
}

function getPraciceId( req ) {
	let practiceId = "";
	if( stringHasValue( req.session.practiceId ) ) {
		practiceId = req.session.practiceId;
	} else if( stringHasValue( req.session.practiceID ) ) {
		practiceId = req.session.practiceID;
	} else if( stringHasValue( req.session.adminpracticeID ) ) {
		practiceId = req.session.adminpracticeID;
	}
	return practiceId;
}

function createprocedureAction(req, res){
	let practiceId = getPraciceId( req );

	if( practiceId ) {
		let allParams = req.allParams();
		sails.log.info( "practice post value:", allParams );

		return Procedures.createProcedure( allParams,practiceId )
		.then( ( procedure ) => {
			if( procedure.hasOwnProperty( "custom" ) ) {
				for( const p in procedure.custom ) {
					procedure.custom[ p ].id = p;
				}
			}
			return res.redirect( `/admin/proceduresettings/${practiceId}` );
		} )
		.catch( ( err ) => {
			sails.log.error( "PracticeController#createprocedureAction::", err );
			res.status( 500 ).json( { "error": err } );
			return;
		} );
	} else {
		let err = new Error( "Unknown Practice" )
		sails.log.error( "PracticeController#createprocedureAction::", err );
		res.status( 404 ).json( { "error": err } );
		return;
	}
}

function deleteprocedureAction( req, res ) {
	let allParams = req.allParams();
	if( allParams.id ) {
		return Procedures.deleteProcedure( allParams.id)
		.then( () => {
			res.status( 200 ).send( "deleted" );
			return;
		} )
		.catch( ( err ) => {
			sails.log.error( "PracticeController#deleteprocedureAction::", err );
			res.status( 500 ).json( { "error": err } );
			return;
		} );
	} else {
		let err = new Error( "Procedure Id required" )
		sails.log.error( "PracticeController#deleteprocedureAction::", err );
		res.status( 404 ).json( { "error": err } );
		return;
	}
}

function updateprocedureAction(req, res){
	let allParams = req.allParams();
	let practiceId = getPraciceId( req );
	sails.log.info( "procedure put value:", allParams );

	if( allParams && allParams.id ) {
		return Procedures.updateProcedure( allParams, practiceId, allParams.id )
		.then( ( procedure ) => {
			// res.status( 200 ).json( procedure[ 0 ] );
			return res.redirect( `/admin/proceduresettings/${practiceId}` );
		} )
		.catch( ( err ) => {
			sails.log.error( "PracticeController#updateprocedureAction::", err );
			res.status( 500 ).json( { "error": err } );
			return;
		} );
	} else {
		let err = new Error( "Unknown Procedure" )
		sails.log.error( "PracticeController#updateprocedureAction::", err );
		res.status( 404 ).json( { "error": err } );
		return;
	}
}

function addlendermerchantfeesAction(req,res){

	if((req.session.practiceId != '') && (typeof(req.session.practiceId) != 'undefined') && (req.session.practiceId !=null) )
	{
		res.view('practice/addlendermerchantfees',{activeTab:req.session.activeTab});
	}
	else
	{
		req.session.practiceId ='';
		res.view("practice/error/errorpage", {
			code: 404,
			data: 'Requested page not found',
			layout: 'layout'
		});
	}
}

function getmerchantfeetemplateAction (req, res){

	var rowCount = req.param('rowCount');

	var vendorcriteria = {
		isDeleted: false
	};

	Vendor.find(vendorcriteria)
	.then(function(vendorData) {

		sails.log.info("vendorData::",vendorData);
		sails.log.info("rowCount::",rowCount);

		res.render("practice/merchantfeetemplate", {rowCount:rowCount,vendorData:vendorData}, function(err, listdata){
			var json = {
				status: 200,
				listdata: listdata
			};
			res.contentType('application/json');
			res.json(json);
		});
	})
	.catch(function (err) {
			var json = {
				status: 400,
				listdata: {}
			};
			res.contentType('application/json');
			res.json(json);
	});
}

function getvendorinterestrateAction(req, res){

	var rowCount = req.param('rowCount');
	var vendorID = req.param('vendorID');

	var vendorcriteria = {
		id:vendorID,
		isDeleted: false
	};

	var listdata='<option value="">Select Finance Product</option>';

	Vendor.findOne(vendorcriteria)
	.then(function(vendorData) {

			_.forEach(vendorData.APRMonthly, function(interest , key) {

				 listdata+='<option value="">'+interest+'% APR - '+key+' months</option>';
			});

		    var json = {
				status: 200,
				listdata: listdata
			};
			res.contentType('application/json');
			res.json(json);
	})
	.catch(function (err) {
			var json = {
				status: 400,
				listdata: listdata
			};
			res.contentType('application/json');
			res.json(json);
	});
}

function addstaffmembersActtion(req, res){
	res.view('practice/addstaffmembers');

	/*if((req.session.practiceId != '') && (typeof(req.session.practiceId) != 'undefined') && (req.session.practiceId !=null) )
	{
		res.view('practice/addstaffmembers',{activeTab:req.session.activeTab});
	}
	else
	{
		req.session.practiceId ='';
		res.view("practice/error/errorpage", {
			code: 404,
			data: 'Requested page not found',
			layout: 'layout'
		});
	}*/
}

function getstaffmembersAction(req, res){

	var rowCount = req.param('rowCount');

	res.render("practice/addstaffmemberstemplate", {rowCount:rowCount}, function(err, listdata){
		var json = {
			status: 200,
			listdata: listdata
		};
		res.contentType('application/json');
		res.json(json);
	});
}

function addfinancialinformationAction(req, res){
	res.view('practice/addfinancialinformation');

	/*if((req.session.practiceId != '') && (typeof(req.session.practiceId) != 'undefined') && (req.session.practiceId !=null) )
	{
		res.view('practice/addfinancialinformation',{activeTab:req.session.activeTab});
	}
	else
	{
		req.session.practiceId ='';
		res.view("practice/error/errorpage", {
			code: 404,
			data: 'Requested page not found',
			layout: 'layout'
		});
	}*/
}
function checkpracticeurlAction(req, res){
	var slug = req.param('urlSlug');
	sails.log.info('slug', slug);
	PracticeManagement.findOne({UrlSlug:slug}).then(function(practiceRes){
		if(practiceRes)
		{
			var status	=	'400';
		}
		else
		{
			var status	=	'200';
		}
		var json = { status : status };
		res.contentType('application/json');
		res.json(json);
  	}).catch(function (err) {
		sails.log.error('PracticeManagement#checkpracticeurlAction :: err', err);
		return res.handleError(err);
	});
}

function viewpracticedetailsAction(req, res){

	var practiceID = req.param('id');

	PracticeManagement.findOne({id:practiceID})
	.then(function(practiceData){

		if(practiceData)
		{
			if("undefined" !== typeof practiceData.CreditCardNumber && practiceData.CreditCardNumber != '' && practiceData.CreditCardNumber!=null)
			{
				practiceData.CreditCardNumber	=	practiceData.CreditCardNumber.replace(/\d(?=\d{4})/g, "X");
			}
			else
			{
				practiceData.CreditCardNumber	='--';
			}

			if("undefined" !== typeof practiceData.CardExpiryDate && practiceData.CardExpiryDate != '' && practiceData.CardExpiryDate!=null)
			{
				practiceData.CardExpiryDate		=	practiceData.CardExpiryDate.replace(/[0-9 \/]/g, "X");
			}
			else
			{
				practiceData.CardExpiryDate	='--';
			}

			if("undefined" !== typeof practiceData.CvvCode && practiceData.CvvCode != '' && practiceData.CvvCode!=null)
			{
				practiceData.CvvCode			=	practiceData.CvvCode.replace(/[0-9]/g, "X");
			}
			else
			{
				practiceData.CvvCode	='--';
			}

			if("undefined" !== typeof practiceData.Accountnumber && practiceData.Accountnumber != '' && practiceData.Accountnumber!=null)
			{
				practiceData.Accountnumber		=	practiceData.Accountnumber.replace(/\d(?=\d{4})/g, "X");
			}
			else
			{
				practiceData.Accountnumber	='--';
			}

			if("undefined" !== typeof practiceData.Verifyaccountnumber && practiceData.Verifyaccountnumber != '' && practiceData.Verifyaccountnumber!=null)
			{
				practiceData.Verifyaccountnumber=	practiceData.Verifyaccountnumber.replace(/\d(?=\d{4})/g, "X");
			}
			else
			{
				practiceData.Verifyaccountnumber	='--';
			}

			if("undefined" !== typeof practiceData.Routingnumber && practiceData.Routingnumber != '' && practiceData.Routingnumber!=null)
			{
				//practiceData.Routingnumber		=	practiceData.Routingnumber.replace(/\d(?=\d{4})/g, "X");
			}
			else
			{
				practiceData.Routingnumber	='--';
			}

			practiceData.UrlSlug		=	sails.config.siteBaseUrl+practiceData.UrlSlug;


			if("undefined" === typeof practiceData.industryCode || practiceData.industryCode == '' || practiceData.industryCode==null)
			{
				practiceData.industryCode	=	'--';
			}

			if("undefined" === typeof practiceData.memberCode || practiceData.memberCode == '' || practiceData.memberCode==null)
			{
				practiceData.memberCode	=	'--';
			}

			if("undefined" === typeof practiceData.prefixCode || practiceData.prefixCode == '' || practiceData.prefixCode==null)
			{
				practiceData.prefixCode	=	'--';
			}

			if("undefined" === typeof practiceData.apiPassword || practiceData.apiPassword == '' || practiceData.apiPassword==null)
			{
				practiceData.apiPassword	=	'--';
			}

			if("undefined" === typeof practiceData.Bankname || practiceData.Bankname == '' || practiceData.Bankname==null)
			{
				practiceData.Bankname	=	'--';
			}

			if("undefined" === typeof practiceData.Accountholder || practiceData.Accountholder == '' || practiceData.Accountholder==null)
			{
				practiceData.Accountholder	=	'--';
			}

			if("undefined" === typeof practiceData.Cardholdername || practiceData.Cardholdername == '' || practiceData.Cardholdername==null)
			{
				practiceData.Cardholdername	=	'--';
			}

			if(practiceData.payments)
			{
				var loopid	=	1;
				_.forEach(practiceData.payments, function(userPayments) {
					sails.log.info('userPayments', userPayments);
					userPayments.newvalidityDate	=	moment(userPayments.newvalidityDate).format('LL');
					userPayments.date 				=	moment(userPayments.date).format('LL');
					userPayments.amount				=	parseFloat(userPayments.amount/100);

					if(userPayments.paymentstatus==1)
					{
						userPayments.paymentstatus	=	'settled';
					}
					else if(userPayments.paymentstatus==2)
					{
						userPayments.paymentstatus	=	'pending';
					}
					else
					{
						userPayments.paymentstatus	=	'failed';
					}
					if("undefined" !== typeof userPayments.failure_code && userPayments.failure_code != '' && userPayments.failure_code!=null)
					{
						userPayments.failuremsg =  userPayments.failure_code+" "+userPayments.failure_message
					}
					else
					{
						userPayments.failuremsg =  "-";
					}

					userPayments.loopid	=	loopid;
					loopid++;
				});
				var payments=practiceData.payments;
			}
			else
			{
				var payments=[];
			}
			var responsedata = {
			  practiceData:practiceData,
			  payments:payments
			};

			return res.view("admin/practice/practiceDetails", responsedata);
		}
		else
		{
			res.view("admin/error/404", {
				data: 'Invalid practice',
				layout: 'layout'
			});
		}
	}).catch(function (err) {
		var errors = err.message;
		sails.log.error('PracticeManagement#viewpracticedetailsAction:: err', errors);
		res.view("admin/error/404", {
			data: err.message,
			layout: 'layout'
		});
	});
}

function practicesettingEditAction(req, res) {

    var errorval = '';
    var successval = '';

    if (req.session.practiceerror != '') {
        errorval = req.session.practiceerror;
        req.session.practiceerror = '';
    }

    if (req.session.practicesuccessmsg != '') {
        successval = req.session.practicesuccessmsg;
        req.session.practicesuccessmsg = '';
    }


    var school_id = req.param('id');

    PracticeManagement.findOne({ id: school_id }).then(function (schoolData) {

        if ("undefined" !== typeof schoolData.Accountnumber && schoolData.Accountnumber != '' && schoolData.Accountnumber != null) {
            schoolData.Accountnumber = schoolData.Accountnumber.replace(/\d(?=\d{4})/g, "X");
        }
        if ("undefined" !== typeof schoolData.Accountnumber && schoolData.Verifyaccountnumber != '' && schoolData.Verifyaccountnumber != null) {
            schoolData.Verifyaccountnumber = schoolData.Verifyaccountnumber.replace(/\d(?=\d{4})/g, "X");
        }
        if ("undefined" !== typeof schoolData.Routingnumber && schoolData.Routingnumber != '' && schoolData.Routingnumber != null) {
            schoolData.Routingnumber = schoolData.Routingnumber.replace(/\d(?=\d{4})/g, "X");
        }
        if ("undefined" !== typeof schoolData.CreditCardNumber && schoolData.CreditCardNumber != '' && schoolData.CreditCardNumber != null) {
            schoolData.CreditCardNumber = schoolData.CreditCardNumber.replace(/\d(?=\d{4})/g, "X");
        }

        LoanSettings
            .find({ practicemanagement: school_id })
            .then(function (termData) {

                State
                    //.getExistingState()
                    .getExistingPracticeState()
                    .then(function (states) {
                        return res.view("admin/user/editpracticesetting", { schoolData: schoolData, termData:termData, errorval: errorval, successval: successval, stateData: states, siteUrl: sails.config.siteBaseUrl });
                    })
                    .catch(function (err) {
                        sails.log.error('PracticeManagement#editpracticeAction :: err', err);
                        return res.handleError(err);
                    });
            })
            .catch(function (err) {
                sails.log.error('LoanSetting#editpracticeAction :: err', err);
                return res.handleError(err);
            });
        })
        .catch(function (err) {
            sails.log.error('PracticeManagement#editpracticeAction :: err', err);
            return res.handleError(err);
        });

}

