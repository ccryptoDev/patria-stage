module.exports.routes = {
  "/": {
    view: "user/new/login",
    locals: { layout: "layouts/loginLayout" },
  },

  "get /admin/index": {
    view: "admin/index",
  },

  "get /admin/dashboard": {
    controller: "CategoryController",
    action: "getDashboardView",
  },
  /* ************************** For User / User Controller *********************************** */

  "post /v2/testAuth": {
    controller: "TestController",
    action: "testAuth",
  },

  "post /v2/decodeToken": {
    controller: "AuthController",
    action: "decodeToken",
  },

  "post /v2/login": {
    controller: "AuthController",
    action: "login",
  },

  "post /v2/logout": {
    controller: "AuthController",
    action: "logout",
  },

  "get /adminLogin": {
    controller: "UserController",
    action: "adminLoginView",
  },

  "post /application/FundingMethod": {
    controller: "UserController",
    action: "addFundingMethod",
  },

  "get /thankyou": {
    controller: "UserController",
    action: "thankyouView",
  },

  "GET /application/denied/:screenid": {
    controller: "UserController",
    action: "loanDeniedView",
  },

  "GET /application/step/testing/:screenId": {
    controller: "UserController",
    action: "stepsTesting",
  },

  "POST /flinks/initiate/:userId": {
    controller: "UserController",
    action: "initiateflinksService",
  },

  "GET /flinks/account-details/:requestId": {
    controller: "UserController",
    action: "getFlinkDeliveredData",
  },

  "POST /application/flinks/:screenId": {
    controller: "BankController",
    action: "storeFlinksLoginId",
  },
  // TODO: REMOVE THIS WHEN ACTUAL IMPLEMENTED
  "get /loanDeniedTest": {
    controller: "UserController",
    action: "loanDeniedView",
  },

  "get /about": {
    controller: "UserController",
    action: "aboutView",
  },
  "get /how-it-works": {
    controller: "UserController",
    action: "howItWorksView",
  },
  "get /faq": {
    controller: "UserController",
    action: "faqView",
  },
  "get /ratesAndFees": {
    controller: "UserController",
    action: "ratesAndFeesView",
  },
  "get /terms-of-use": {
    controller: "UserController",
    action: "termsOfUseView",
  },
  "get /optout": {
    controller: "UserController",
    action: "optoutView",
  },
  "get /contact": {
    controller: "UserController",
    action: "contactView",
  },

  "post /admin/loginAdminPost": {
    controller: "UserController",
    action: "login",
  },
  "get /admin/forgetPassword": {
    controller: "UserController",
    action: "forgetPassword",
  },
  "get /changeNewbank/:id/:banktoken": {
    controller: "UserController",
    action: "changeNewbank",
  },
  "get /saveinviteuser/:id/:invitetoken": {
    controller: "UserController",
    action: "saveInviteUser",
  },
  "get /admin/logout": {
    controller: "UserController",
    action: "logout",
  },
  "get /admin/getStates": {
    controller: "UserController",
    action: "getStates",
  },
  "post /test-clarity/:screenId": {
    controller: "UserController",
    action: "clarityInquiry",
  },

  /* ****************************** Application Process ***************************** */
  "GET /leadUserNewPassword": {
    controller: "ApplicationController",
    action: "leadUserNewPassword",
  },
  "post /signAchDebit": {
    controller: "ApplicationController",
    action: "signAchDebit",
  },
  "get /userinformation": {
    controller: "ApplicationController",
    action: "userInformation",
  },
  "get /application": {
    controller: "ApplicationController",
    action: "application",
  },
  "get /emailverifylanding/:id": {
    controller: "ApplicationController",
    action: "emailverifylanding",
  },
  "GET /createapplication": {
    controller: "ApplicationController",
    action: "createApplication",
  },
  "POST /createapplication": {
    controller: "ApplicationController",
    action: "createApplicationPost",
  },
  "GET /approvalChecks": {
    controller: "ApplicationController",
    action: "applicationWaterfall",
  },
  "GET /employmentandreferenceinfo": {
    controller: "ApplicationController",
    action: "getEmploymentAndReference",
  },
  "POST /employmentandreferenceinfo": {
    controller: "ApplicationController",
    action: "createEmploymentAndReference",
  },
  "GET /offers": {
    controller: "OffersController",
    action: "getOffersPage",
  },
  "POST /postOffers": {
    controller: "ApplicationController",
    action: "postOffers",
  },
  "GET /offers/:userId": {
    controller: "OffersController",
    action: "getOffersByUser",
  },
  "GET /verifybankinfo": {
    controller: "ApplicationController",
    action: "getLeadBankInfo",
  },
  "POST /bankVerified": {
    controller: "ApplicationController",
    action: "postVerifyBankInfo",
  },
  /* ****************************** New Patria LOS Application *********************************** */
  "POST /otp/send/:screenTrackingId": {
    controller: "ApiApplicationController",
    action: "resendOtpCode",
  },

  "GET /otp/status/:screenTrackingId": {
    controller: "ApiApplicationController",
    action: "getOtpStatus",
  },
  
  "GET /trueValidateStatus/:screenTrackingId": {
    controller: "ApiApplicationController",
    action: "getTrueValidateStatus",
  },

  "GET /getUserKbaQuestions": {
    controller: "ApiApplicationController",
    action: "getUserKbaQuestions",
  },

  "POST /kba/:screenTrackingId": {
    controller: "ApiApplicationController",
    action: "sendKbaAnswers",
  },

  "POST /otp/:screenTrackingId": {
    controller: "ApiApplicationController",
    action: "sendOtpResponse",
  },

  "POST /apply/newUser": {
    controller: "ApiApplicationController",
    action: "createApplication",
  },

  "POST /admin/proceed-rules": {
    controller: "ApiApplicationController",
    action: "processUnderwritingStep",
  },
  

  "POST /apply/APICreateEmploymentHistory/:screenTrackingId": {
    cors: {
      origin: "*",
      headers: "Content-Type, Authorization",
    },
    controller: "ApiApplicationController",
    action: "createEmploymentHistory",
  },

  "GET /APIGetEmploymentInfo": {
    controller: "ApiApplicationController",
    action: "getEmploymentHistory",
  },

  "PATCH /APIUpdateEmployerInfo/:employmentId": {
    controller: "ApiApplicationController",
    action: "updateEmployerInfo",
  },

  "PATCH /ApiUpdateUserInfo": {
    controller: "ApiApplicationController",
    action: "updateUserInfo",
  },

  "GET /ApiGetUserInfo": {
    controller: "ApiApplicationController",
    action: "getUserInfo",
  },

  "POST /ApiUpdateUserFinancialInfo": {
    controller: "ApiApplicationController",
    action: "updateUserFinancialInfo",
  },

  "GET /application/offers/:screenTrackingId": {
    controller: "ApiApplicationController",
    action: "getApplicationOffers",
  },

  "POST /createApplicationOffers": {
    controller: "ApiApplicationController",
    action: "createApplicationOffers",
  },

  "POST /application/uploadLoanDoc/:screenTrackingId": {
    controller: "ApiApplicationController",
    action: "uploadLoanDocument",
  },

  "POST /application/:screenTrackingId/storeInitialSelectedOffer": {
    controller: "ApiApplicationController",
    action: "storeInitialSelectedOffer",
  },

  "POST /application/:screenTrackingId/confirmApplicationReview": {
    controller: "ApiApplicationController",
    action: "confirmApplicationReview",
  },

  "POST /saveOffers": {
    controller: "ApiApplicationController",
    action: "saveOffers",
  },

  "GET /loanDocuments": {
    controller: "ApiApplicationController",
    action: "getLoanDocuments",
  },

  /* ****************************** Application in admin view ************************************ */
  "post /admin/new-application": {
    controller: "AdminApplicationController",
    action: "addApplication",
  },
  "post /admin/new-loan": {
    controller: "AdminApplicationController",
    action: "addLoan",
  },
  "get /admin/practices": {
    controller: "AdminApplicationController",
    action: "getPractices",
  },
  "get /admin/states": {
    controller: "AdminApplicationController",
    action: "getStates",
  },
  "get /admin/offers/:applicationId": {
    controller: "AdminApplicationController",
    action: "getOffers",
  },
  "post /admin/select-offer": {
    controller: "AdminApplicationController",
    action: "selectOffer",
  },
  "POST /admin/denyreapplication": {
    controller: "ApplicationController",
    action: "denyReapplication",
  },
  "POST /admin/allowreapplication": {
    controller: "ApplicationController",
    action: "allowReApplication",
  },

  /* ****************************** Log Activity ************************************ */
  "get /admin/managelogactivity": {
    controller: "LogactivityController",
    action: "manageLogActivity",
  },
  "get /admin/ajaxmanageloglist": {
    controller: "LogactivityController",
    action: "ajaxManageLogList",
  },
  "get /admin/viewlogDetails/:id": {
    controller: "LogactivityController",
    action: "viewlogDetails",
  },
  "get /admin/communicationlog": {
    controller: "LogactivityController",
    action: "communicationlog",
  },
  "get /admin/ajaxcommunicationlog": {
    controller: "LogactivityController",
    action: "ajaxcommunicationlog",
  },
  /* ****************************** For Pending Ach ************************************ */
  "get /admin/approveISA/:paymentId": {
    controller: "AchController",
    action: "approveISA",
  },
  "post /admin/saveProgramDates": {
    controller: "AchController",
    action: "saveProgramDates",
  },
  "get /admin/getAchDetails": {
    controller: "AchController",
    action: "showAllPendingAch",
  },
  "get /admin/getOpenApplicationDetails": {
    controller: "AchController",
    action: "showAllOpenApplicationAch",
  },
  "get /admin/getIncompleteApplicationDetails": {
    controller: "AchController",
    action: "showInCompleteApplicationAch",
  },
  "get /admin/getArchivedPendingDetails": {
    controller: "AchController",
    action: "showAllArchivedPendingAch",
  },
  "get /admin/getArchivedOpenDetails": {
    controller: "AchController",
    action: "showAllArchivedOpenAch",
  },
  "get /admin/getToDoItemsPendingDetails": {
    controller: "AchController",
    action: "showAllToDoItemsPendingAch",
  },
  "get /admin/getToDoItemsOpenApplicationDetails": {
    controller: "AchController",
    action: "showAllToDoItemsOpenApplication",
  },
  "get /admin/ajaxOpenApplicationAch/:viewtype": {
    controller: "AchController",
    action: "ajaxOpenApplicationAch",
  },
  "get /admin/ajaxPendingAch/:viewtype": {
    controller: "AchController",
    action: "ajaxPendingAch",
  },
  "get /admin/ajaxPaymentHistory": {
    controller: "AchController",
    action: "ajaxPaymentHistory",
  },
  "get /admin/getAchUserDetails/:id": {
    controller: "AchController",
    action: "getAchUserDetails",
  },
  "post /admin/confirmProcedure/:id": {
    controller: "AchController",
    action: "confirmProcedure",
  },
  "post /admin/denyloan": {
    controller: "AchController",
    action: "denyUserLoan",
  },

  "post /admin/addAchComments": {
    controller: "AchController",
    action: "addAchComments",
  },
  "get /admin/ajaxAchComments/:id": {
    controller: "AchController",
    action: "ajaxAchComments",
  },
  "post /admin/ajaxLaterComments": {
    controller: "AchController",
    action: "laterAchNeedsReview",
  },
  "post /admin/resolveAchComments": {
    controller: "AchController",
    action: "resolveAchComments",
  },
  "post /admin/uploadDocumentProof": {
    controller: "AchController",
    action: "uploadDocumentProof",
  },
  "get /admin/defaultUsers": {
    controller: "AchController",
    action: "defaultUsers",
  },
  "get /admin/ajaxDefaultUsersList": {
    controller: "AchController",
    action: "ajaxDefaultUsersList",
  },
  "get /admin/viewDefaultUser/:id": {
    controller: "AchController",
    action: "viewDefaultUser",
  },
  "get /admin/showAllApproved": {
    controller: "AchController",
    action: "showAllComplete",
  },
  "get /admin/showAllPerforming": {
    controller: "AchController",
    action: "showAllPerforming",
  },
  "get /admin/showAllCompleted": {
    controller: "AchController",
    action: "showAllCompleted",
  },
  "get /admin/showAllChargeOff": {
    controller: "AchController",
    action: "showAllChargeOff",
  },
  "get /admin/showProcedureDateSet": {
    controller: "AchController",
    action: "showProcedureDateSet",
  },
  "get /admin/completeapplication/:viewtype": {
    controller: "AchController",
    action: "completeApplication",
  },
  "get /admin/addchargeoff/:id/:rowid": {
    controller: "AchController",
    action: "addchargeoff",
  },
  "get /admin/showAllBlocked": {
    controller: "AchController",
    action: "showAllBlocked",
  },
  "get /admin/ajaxBlockedAch": {
    controller: "AchController",
    action: "ajaxBlockedAch",
  },
  "post /admin/releaseApp": {
    controller: "AchController",
    action: "releaseApp",
  },
  "post /admin/approveloan": {
    controller: "AchController",
    action: "approveUserLoan",
  },
  "get /admin/showAllDenied": {
    controller: "AchController",
    action: "showAllDenied",
  },
  "get /admin/showAllArchivedDenied": {
    controller: "AchController",
    action: "showAllArchivedDenied",
  },
  "get /admin/showAllToDoItemsDenied": {
    controller: "AchController",
    action: "showAllToDoItemsDenied",
  },
  "get /admin/ajaxDeniedApplication/:viewtype": {
    controller: "AchController",
    action: "ajaxDeniedApplication",
  },
  "post /admin/storyuserviewinfo": {
    controller: "AchController",
    action: "storyUserviewinfo",
  },
  "post /admin/changescheduledate": {
    controller: "ScreentrackingController",
    action: "changescheduledate",
  },
  "post /admin/changescheduleamount": {
    controller: "ScreentrackingController",
    action: "changescheduleamount",
  },
  "get /admin/userPaymentHistory": {
    controller: "AchController",
    action: "userPaymentHistory",
  },
  "post /admin/cancelACH": {
    controller: "AchController",
    action: "cancelAch",
  },
  "get /admin/potentialdefaultusers": {
    controller: "AchController",
    action: "showPotentialDefaultusers",
  },
  "get /admin/ajaxpotentialdefaultusers": {
    controller: "AchController",
    action: "ajaxPotentialDefaultusers",
  },
  "post /admin/updateSetDate": {
    controller: "AchController",
    action: "updateSetDate",
  },
  "post /admin/movetoopenupdate": {
    controller: "AchController",
    action: "movetoopenupdate",
  },
  "post /admin/markAsReviewed": {
    controller: "AchController",
    action: "markAsReviewed",
  },
  "post /admin/movetounarchive": {
    controller: "AchController",
    action: "movetoUnarchive",
  },
  "post /admin/reGeneratePaymentScheduleCalendar": {
    controller: "AchController",
    action: "reGeneratePaymentScheduleCalendar",
  },
  "post /admin/savePaymentScheduleChanges": {
    controller: "AchController",
    action: "savePaymentScheduleChanges",
  },
  "post /admin/changeIncompleteFundingPaymentType": {
    controller: "AchController",
    action: "changeIncompleteFundingPaymentType",
  },
  "post /admin/changeFundingPaymentType": {
    controller: "AchController",
    action: "changeFundingPaymentType",
  },
  "post /admin/ajaxUpdatePaymentBankruptcy": {
    controller: "AchController",
    action: "ajaxUpdatePaymentBankruptcy",
  },
  "get /admin/showAllBankruptcies": {
    controller: "AchController",
    action: "showAllBankruptcies",
  },
  "get /admin/ajaxGetBankruptcyList": {
    controller: "AchController",
    action: "ajaxGetBankruptcyList",
  },
  "POST /payment/waivePaymentItem": {
    controller: "AchController",
    action: "waivePaymentItem",
  },
  "POST /payment/deferPaymentItem": {
    controller: "AchController",
    action: "deferPaymentItem",
  },
  "POST /payment/waiveEntireLoan": {
    controller: "AchController",
    action: "waiveEntireLoan",
  },
  "POST /payment/ajaxChangeLoanDetails": {
    controller: "AchController",
    action: "ajaxChangeLoanDetails",
  },
  "POST /user/ajaxUpdateUserTabInformation": {
    controller: "AchController",
    action: "ajaxUpdateUserTabInformation",
  },
  "POST /user/ajaxUpdateEmployerTabInformation": {
    controller: "AchController",
    action: "ajaxUpdateEmployerTabInformation",
  },
  "POST /user/ajaxUpdateBankAccountInformation": {
    controller: "AchController",
    action: "ajaxUpdateBankAccountInformation",
  },

  "get /admin/freshLeadsList": {
    controller: "AchController",
    action: "showFreshLeadsList",
  },
  "POST /admin/ajaxFreshLeadList": {
    controller: "AchController",
    action: "ajaxFreshLeadList",
  },
  "POST /admin/ajaxOriginateLoan": {
    controller: "AchController",
    action: "ajaxOriginateLoan",
  },
  "POST /admin/ajaxOriginateOrApproveAndFundLoan": {
    controller: "AchController",
    action: "ajaxOriginateOrApproveAndFundLoan",
  },
  "POST /admin/ajaxUpdatePaymentStatus": {
    controller: "AchController",
    action: "ajaxUpdatePaymentStatus",
  },
  "POST /admin/ajaxToggleAutoAch": {
    controller: "AchController",
    action: "ajaxToggleAutoAch",
  },
  /* ****************************** Manage user module ************************************ */
  "get /admin/manageusers": {
    controller: "UserController",
    action: "getallUserDetails",
  },
  "get /admin/ajaxmanageuserlist": {
    controller: "UserController",
    action: "ajaxManageUserlist",
  },
  "get /admin/resetusers": {
    controller: "UserController",
    action: "getallResetUsers",
  },
  "get /admin/ajaxmanageresetuserlist": {
    controller: "UserController",
    action: "ajaxManageResetUserlist",
  },
  "post /admin/updateUserStatus": {
    controller: "UserController",
    action: "updateUserStatus",
  },
  "get /admin/viewUserDetails/:id": {
    controller: "UserController",
    action: "viewUserDetails",
  },
  "get /admin/viewResetUserDetails/:id": {
    controller: "UserController",
    action: "viewResetUserDetails",
  },
  "get /admin/deleteUserDetails/:id": {
    controller: "UserController",
    action: "deleteUserDetails",
  },
  "get /admin/resetUserDetails/:id": {
    controller: "UserController",
    action: "resetUserDetails",
  },
  "post /admin/sendverficationlink": {
    controller: "UserController",
    action: "sendverficationlink",
  },
  "post /admin/sendverficationcode": {
    controller: "UserController",
    action: "sendverficationcode",
  },
  "post /admin/changephoneverifystatus": {
    controller: "UserController",
    action: "changephoneverifystatus",
  },
  "get /admin/changeverifystatus/:id": {
    controller: "UserController",
    action: "changeverifystatus",
  },
  "post /admin/removephone": {
    controller: "UserController",
    action: "removephone",
  },
  "post /admin/changeemail": {
    controller: "UserController",
    action: "changeemail",
  },
  "post /admin/changephone": {
    controller: "UserController",
    action: "changephone",
  },
  "get /admin/ajaxUserTrackingList/:id": {
    controller: "UserController",
    action: "ajaxUserTrackingList",
  },
  "post /admin/showUserTrackingMap": {
    controller: "UserController",
    action: "showUserTrackingMap",
  },
  "get /admin/ajaxUserContactsList/:id": {
    controller: "UserController",
    action: "ajaxUserContactsList",
  },
  "get /admin/manageproducts": {
    controller: "UserController",
    action: "manageproducts",
  },
  "get /admin/viewproduct/:id": {
    controller: "UserController",
    action: "viewproductdetails",
  },
  "post /admin/createstateregulation": {
    controller: "ApplicationController",
    action: "createstateregulation",
  },
  "post /getloanamountcapfields": {
    controller: "UserController",
    action: "getloanamountcapfields",
  },
  "post /admin/createupdateamountcap": {
    controller: "UserController",
    action: "createupdateamountcap",
  },
  "post /admin/createupdateapplicationfee": {
    controller: "HomeController",
    action: "createupdateapplicationfee",
  },
  "post /getloanstateregualtionfields": {
    controller: "UserController",
    action: "getloanstateregualtionfields",
  },
  "post /getinterestratefields": {
    controller: "ApplicationController",
    action: "getinterestratefields",
  },
  "post /admin/createupdateinterestrate": {
    controller: "ApplicationController",
    action: "createupdateinterestrate",
  },
  "post /getproductRules": {
    controller: "HomeController",
    action: "getproductRules",
  },
  "post /getapplicationfee": {
    controller: "HomeController",
    action: "getapplicationfee",
  },
  "post /admin/createupdateproductrules": {
    controller: "HomeController",
    action: "createupdateproductrules",
  },
  "post /admin/ajaxgetloanamountcaps": {
    controller: "UserController",
    action: "ajaxgetloanamountcap",
  },
  "post /admin/ajaxgetinterestrates": {
    controller: "UserController",
    action: "ajaxgetinterestrates",
  },
  "post /admin/ajaxgetstateregulation": {
    controller: "ApplicationController",
    action: "ajaxgetstateregulations",
  },
  "post /admin/ajaxgetloanproductrules": {
    controller: "HomeController",
    action: "ajaxgetloanproductrules",
  },
  "post /admin/ajaxgetapplicationfee": {
    controller: "HomeController",
    action: "ajaxgetapplicationfee",
  },
  "get /admin/resentinviteemail/:id": {
    controller: "UserController",
    action: "resentinviteemail",
  },
  "get /admin/registeruser": {
    controller: "UserController",
    action: "registeruser",
  },
  "get /admin/ajaxregisteruserlist": {
    controller: "UserController",
    action: "ajaxregisteruserlist",
  },
  "post /admin/newresentinviteemail": {
    controller: "UserController",
    action: "newresentinviteemail",
  },
  "POST /admin/ajaxgetusertable": {
    controller: "UserController",
    action: "ajaxGetUserList",
  },
  /* ****************************** Loan pro payment testing ************************************ */
  "get /admin/addnewCustomer": {
    controller: "AchController",
    action: "addnewCustomer",
  },
  "get /admin/addnewBankaccount": {
    controller: "AchController",
    action: "addnewBankaccount",
  },
  "get /admin/loanproCreditPayment": {
    controller: "AchController",
    action: "loanproCreditPayment",
  },
  "get /admin/checkAchTransactionDetails": {
    controller: "AchController",
    action: "checkAchTransactionDetails",
  },
  /* ****************************** ScreenTracking ************************************ */
  "get /admin/incompleteApplication": {
    controller: "ScreentrackingController",
    action: "getIncompleteApplication",
  },
  "get /admin/ArchivedIncompleteApplication": {
    controller: "ScreentrackingController",
    action: "ArchivedIncompleteApplication",
  },
  "get /admin/ToDoItemIncompleteApplication": {
    controller: "ScreentrackingController",
    action: "ToDoItemIncompleteApplication",
  },
  "get /admin/ajaxIncompleteList/:viewtype": {
    controller: "ScreentrackingController",
    action: "ajaxIncompleteList",
  },
  // "get /admin/viewIncomplete/:id": {
  // 	controller: "AchController",
  // 	action: "getAchUserDetails"
  // },
  "get /admin/viewIncomplete/:id": {
    controller: "ScreenTrackingController",
    action: "viewIncomplete",
  },
  "post /admin/getChangeLoanOfferDetails": {
    controller: "ScreentrackingController",
    action: "getChangeLoanOfferDetails",
  },
  "post /admin/deletePaymentScheduleTransaction": {
    controller: "PaymentController",
    action: "deletePaymentScheduleTransaction",
  },
  "post /admin/updateNewloanincomedetails": {
    controller: "ScreentrackingController",
    action: "updateNewloanincomedetails",
  },
  "post /admin/manualloanOfferdetails": {
    controller: "ScreentrackingController",
    action: "manualLoanOfferDetails",
  },
  "post /admin/savemanualLoanOfferDetails": {
    controller: "ScreentrackingController",
    action: "savemanualLoanOfferDetails",
  },
  "get /admin/loanofferinfo/:id": {
    controller: "ScreentrackingController",
    action: "loanofferinfo",
  },
  "post /admin/saveserviceloanoffer": {
    controller: "ScreentrackingController",
    action: "saveserviceloanoffer",
  },
  "get /admin/saveServiceLoanOfferFromDTI/:id": {
    controller: "ScreentrackingController",
    action: "saveServiceLoanOfferFromDTI",
  },
  "post /admin/senduseroffer": {
    controller: "ScreentrackingController",
    action: "senduseroffer",
  },
  "post /admin/deleteMultipleScreen": {
    controller: "ScreentrackingController",
    action: "deleteMultipleScreen",
  },
  "get /ach-authorization": {
    controller: "HomeController",
    action: "achAuthorization",
  },
  "get /changeScheduleAuthorization": {
    controller: "HomeController",
    action: "changeScheduleAuthorization",
  },
  "get /contract/:id": {
    controller: "ScreentrackingController",
    action: "contract",
  },
  "get /admin/resendplaidlink/:id": {
    controller: "ScreentrackingController",
    action: "resendplaidlink",
  },
  "post /admin/changeincome/:id": {
    controller: "ScreentrackingController",
    action: "changeincome",
  },
  "post /admin/changeincomeincomplete/:screenid": {
    controller: "ScreentrackingController",
    action: "changeincome",
  },
  "post /admin/changeincomeDenied/:id": {
    controller: "ScreentrackingController",
    action: "changeincomeDenied",
  },
  "post /admin/addScreentrackingComments": {
    controller: "ScreentrackingController",
    action: "addScreentrackingComments",
  },
  "get /admin/ajaxScreentrackingComments/:id": {
    controller: "ScreentrackingController",
    action: "ajaxScreentrackingComments",
  },
  "post /admin/incompletegetrepullPlaidDetails": {
    controller: "ScreentrackingController",
    action: "incompletegetrepullPlaidDetails",
  },
  "post /admin/movetoincompleteupdate": {
    controller: "ScreentrackingController",
    action: "movetoincompleteupdate",
  },
  "post /admin/markToIncompleteApp": {
    controller: "ScreentrackingController",
    action: "markToIncompleteApp",
  },
  "post /admin/movetoarchive": {
    controller: "ScreentrackingController",
    action: "movetoarchive",
  },
  "post /admin/unarchive": {
    controller: "ScreentrackingController",
    action: "unarchive",
  },

  "post /admin/addUpdateReferences": {
    controller: "ScreentrackingController",
    action: "adminAddUpdateReferences",
  },

  "post /admin/ajaxSendLeadInviteEmail": {
    controller: "ScreentrackingController",
    action: "ajaxSendLeadInviteEmail",
  },

  "post /admin/ajaxSendResignEmail": {
    controller: "ScreentrackingController",
    action: "ajaxSendResignEmail",
  },
  /* ****************************** Admin User ************************************ */
  "get /admin/changepassword": {
    controller: "AdminuserController",
    action: "changepassword",
  },
  "post /admin/updatepassword": {
    controller: "AdminuserController",
    action: "updatepassword",
  },
  "get /admin/adminuserlist": {
    controller: "AdminuserController",
    action: "adminuserlist",
  },
  "get /admin/ajaxadminuserlist": {
    controller: "AdminuserController",
    action: "ajaxadminuserlist",
  },
  "get /admin/createnewuser": {
    controller: "AdminuserController",
    action: "createnewuser",
  },
  "post /admin/addnewuser": {
    controller: "AdminuserController",
    action: "addnewuser",
  },
  "get /admin/edituser/:id": {
    controller: "AdminuserController",
    action: "edituser",
  },
  "post /admin/updateuser": {
    controller: "AdminuserController",
    action: "updateuser",
  },
  "post /admin/updateAdminUserStatus": {
    controller: "AdminuserController",
    action: "updateAdminUserStatus",
  },
  "post /admin/resetPassword": {
    controller: "AdminuserController",
    action: "resetPassword",
  },
  /* ****************************** Plaid User ************************************ */
  "post /savebankdetails": {
    controller: "PlaidUserController",
    action: "savebankdetails",
  },
  "get /selectNewbank/:id/:banktoken": {
    controller: "PlaidUserController",
    action: "selectNewbank",
  },
  "post /selectedNewBank": {
    controller: "PlaidUserController",
    action: "selectedNewBank",
  },
  "get /changeBankresponse": {
    controller: "PlaidUserController",
    action: "changeBankresponse",
  },
  "post /servicegetuploadeddocuments": {
    controller: "ApplicationController",
    action: "servicegetuploadeddocuments",
  },
  "get /contract": {
    controller: "ApplicationController",
    action: "contract",
  },
  // "post /contract": {
  //   controller: "EsignatureController",
  //   action: "saveSignature",
  // },
  "post /application/:screenTrackingId/saveSignature": {
    controller: "EsignatureController",
    action: "saveSignature"
  },
  "post /application/:screenTrackingId/acceptTerm": {
    controller: "EsignatureController",
    action: "acceptTerm"
  },
  "post /application/:screenTrackingId/createSignedDocuments": {
    controller: "EsignatureController",
    action: "createSignedDocuments"
  },
  "get /application/loanDocument/:screenTrackingId": {
    controller: "EsignatureController",
    action: "getUserLoanDocument"
  },
  "get /application/:screenTrackingId/userSignature": {
    controller: "EsignatureController",
    action: "getUserSignatureContent"
  },
  "post /saveContract": {
    controller: "ApplicationController",
    action: "contractSigned",
  },
  "post /resignChangeScheduleContract": {
    controller: "ApplicationController",
    action: "resignChangeScheduleContract",
  },

  "post /redirecttodashboard": {
    controller: "ApplicationController",
    action: "redirecttodashboard",
  },
  "get /loanDenied": {
    controller: "ApplicationController",
    action: "denyLoan",
  },
  /* ***************** TestController ******************** */
  "get /test/latestPdfReport/:screenTrackingId": {
    controller: "TestController",
    action: "getLatestPdfReport",
  },
  
  "post /admin/testSmoothPaymentGeneration": {
    controller: "TestController",
    action: "testSmoothPaymentGeneration",
  },
  "get /test/testChangingPaymentSchedule/:paymentId/:firstPaymentString": {
    controller: "TestController",
    action: "testChangingPaymentSchedule",
  },

  "GET /test-makeAmortizationSchedule": {
    controller: "TestController",
    action: "testMakeAmortizationSchedule",
  },
  "GET /test-rcc": { controller: "TestController", action: "testRCC" },
  "GET /test/lendprotect": {
    controller: "TestController",
    action: "testLendProtect",
  },

  "GET /test/testFactorTrustLendProtect/:screenId": {
    controller: "TestController",
    action: "testFactorTrustLendProtect",
  },

  "GET /test/testUnderwriting/:screenId": {
    controller: "TestController",
    action: "testUnderwriting",
  },

  "POST /test/testUnderwritingEmails": {
    controller: "TestController",
    action: "testUnderwritingEmails",
  },

  "GET /test/regeneratePaymentSchedule/:paymentId": {
    controller: "TestController",
    action: "regeneratePaymentSchedule",
  },
  "GET /test/processNachaPayments": {
    controller: "TestController",
    action: "processNachaPayments",
  },
  "GET /test/processNachaReturnFile": {
    controller: "TestController",
    action: "processNachaReturnFile",
  },

  "GET /test/insertTestData/:userId": {
    controller: "TestController",
    action: "insertTestData",
  },
  /* ******************************* Practice Report **************************************** */
  "get /admin/practiceCreditReportList": {
    controller: "PracticereportController",
    action: "showPracticeReportList",
  },
  "get /admin/ajaxCreditReportList": {
    controller: "PracticereportController",
    action: "ajaxCreditReportList",
  },
  /* ****************************** Default User Update ************************************ */
  "post /admin/repullPayment": {
    controller: "AchController",
    action: "repullPayment",
  },
  /* ****************************** My Profile ************************************ */
  "get /post/rulesdecision": {
    controller: "ApplicationController",
    action: "viewRuleDecisionMaker",
  },
  "post /post/rulesdecision": {
    controller: "ApplicationController",
    action: "postRuleDecisionMaker",
  },
  "post /post/newrulesdecision": {
    controller: "ApplicationController",
    action: "postNewRuleDecision",
  },
  "get /gettransuniondetails/:id": {
    controller: "ApplicationController",
    action: "getTransunionDetails",
  },
  "get /getUserBankDetails/:id": {
    controller: "ApplicationController",
    action: "getUserBankDetails",
  },
  "get /getPaymentmanagementDetails/:id": {
    controller: "ApplicationController",
    action: "getPaymentmanagementDetails",
  },
  "post /admin/updateUserNameDetails": {
    controller: "UserController",
    action: "updateUserNameDetails",
  },
  "post /admin/updateAddressDetails": {
    controller: "UserController",
    action: "updateAddressDetails",
  },

  /* ****************************** Manage Doctors Module ************************************ */
  "get /admin/managepractice": {
    controller: "PracticeController",
    action: "practiceList",
  },
  "get /admin/createpractice": {
    controller: "PracticeController",
    action: "createpractice",
  },
  "post /admin/addnewpractice": {
    controller: "PracticeController",
    action: "addnewpractice",
  },
  "get /admin/ajaxpracticeList": {
    controller: "PracticeController",
    action: "ajaxpracticeList",
  },
  "get /admin/editpractice/:id": {
    controller: "PracticeController",
    action: "editpractice",
  },
  "post /admin/updatepractice/:id": {
    controller: "PracticeController",
    action: "updatepractice",
  },
  "get /admin/managestaffAdmin": {
    controller: "PracticeController",
    action: "staffAdminList",
  },
  "get /admin/ajaxstaffAdminUserList": {
    controller: "PracticeController",
    action: "ajaxstaffAdminUserList",
  },
  "get /admin/addStaffAdmin/:id": {
    controller: "PracticeController",
    action: "addStaffAdmin",
  },
  "get /admin/addStaffAdmin": {
    controller: "PracticeController",
    action: "addStaffAdmin",
  },
  "post /admin/addnewstaffAdminUser": {
    controller: "PracticeController",
    action: "addnewstaffAdminUser",
  },
  "get /admin/editstaffAdminuser/:id": {
    controller: "PracticeController",
    action: "editstaffAdminuser",
  },
  "post /admin/updatestaffAdminUser/:id": {
    controller: "PracticeController",
    action: "updatestaffAdminUser",
  },
  "post /admin/autoFillingUniversity": {
    controller: "PracticeController",
    action: "autoFillingUniversity",
  },
  "post /admin/getschoolBranch": {
    controller: "PracticeController",
    action: "getschoolBranch",
  },
  "get /admin/resendinvite/:id": {
    controller: "PracticeController",
    action: "resendinvite",
  },
  "get /admin/checkpracticeurl": {
    controller: "PracticeController",
    action: "checkpracticeurl",
  },
  "get /admin/viewpracticedetails/:id": {
    controller: "PracticeController",
    action: "viewpracticedetails",
  },
  "get /admin/practicesetting/:id": {
    controller: "PracticeController",
    action: "practicesettingEdit",
  },
  /* ****************************** apple-app-site-association ************************************ */
  "get /apple-app-site-association": function (req, res) {
    const remoteIP =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    return res.json(remoteIP);
  },
  "post /admin/incompleteUploadDocumentProof": {
    controller: "AchController",
    action: "incompleteUploadDocumentProof",
  },
  "get /admin/ajaxAllusersComments/:id": {
    controller: "ScreentrackingController",
    action: "ajaxAllusersComments",
  },
  "post /admin/addAlluserComments": {
    controller: "ScreentrackingController",
    action: "addAlluserComments",
  },
  "post /admin/changeincomefromincomplete/:screenid": {
    controller: "ScreentrackingController",
    action: "changeincomeFromOffer",
  },
  "post /admin/incompleteDenyloan": {
    controller: "ScreentrackingController",
    action: "incompleteDenyUserLoan",
  },
  "get /maintenance": {
    controller: "UserController",
    action: "maintenanceView",
  },
  "get /admin/viewBlocked/:id": {
    controller: "ScreentrackingController",
    action: "viewBlocked",
  },
  "post /admin/unBlockLoan/:id": {
    controller: "ScreentrackingController",
    action: "unBlockLoan",
  },
  /* ****************************** CustomerService Controller ************************************ */
  "get /admin/addApplication": {
    controller: "CustomerServiceController",
    action: "addApplicationByCustomerService",
  },
  "post /admin/addNewUserByCustomerService": {
    controller: "CustomerServiceController",
    action: "addNewUserByCustomerService",
  },
  "get /admin/transUnionInfoByCustomerService": {
    controller: "CustomerServiceController",
    action: "transUnionInfoByCustomerService",
  },
  /* ****************************** Approve patient loan ************************************ */
  "post /admin/approvepatientloan": {
    controller: "AchController",
    action: "approvePatientloan",
  },
  "post /admin/updatepatientloanstartdate": {
    controller: "AchController",
    action: "updatePatientloanstartdate",
  },
  "get /actumCreditTesting": function (req, res) {
    const remoteIP =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    return res.json(remoteIP);
  },
  /* ******* Provider list ******* */
  "get /admin/providerlist": {
    controller: "AchController",
    action: "providerlist",
  },
  "get /admin/ajaxProvider": {
    controller: "AchController",
    action: "ajaxProvider",
  },
  "get /admin/createpractice/:providerid": {
    controller: "PracticeController",
    action: "createpractice",
  },
  "post /twilio/startverification": {
    controller: "TwilioController",
    action: "startverification",
  },
  "post /twilio/validateCode": {
    controller: "TwilioController",
    action: "validate",
  },
  "post /idology/validatePhone": {
    // bill.TODO: implement
    controller: "IdologyController",
    action: "verifyPhoneNumber",
  },
  "post /joinRoom": {
    controller: "UserController",
    action: "joinRoom",
  },
  "post /changemobile": {
    controller: "UserController",
    action: "changemobile",
  },
  "post /createpromissorypdf": {
    controller: "ApplicationController",
    action: "createpromissorypdf",
  },
  "post /displayErrorPage": {
    controller: "ApplicationController",
    action: "displayErrorPage",
  },

  // -- Unique practice url
  /* ********************************* DecisionCloud API 1.0 ********************************* */

  "get /admin/collections/:collectionType": {
    controller: "CollectionsController",
    action: "getCollectionsView",
  },
  "get /admin/ajaxGetCollections/:collectionType": {
    controller: "CollectionsController",
    action: "ajaxGetCollectionsData",
  },
  "post /admin/ajaxAssignToUser": {
    controller: "CollectionsController",
    action: "ajaxAssignToUser",
  },
  "get /admin/ajaxGetPassDuePayments/:paymentId": {
    controller: "CollectionsController",
    action: "ajaxGetPassDuePayments",
  },
  "post /admin/getPassDuePaymentsForDisplay": {
    controller: "CollectionsController",
    action: "getPassDuePaymentsForDisplay",
  },
  "get /admin/ajaxGetCollectionComments/:paymentId": {
    controller: "CollectionsController",
    action: "ajaxGetCollectionComments",
  },
  "get /admin/ajaxGetCollectionComments/:paymentId/:commentType": {
    controller: "CollectionsController",
    action: "ajaxGetCollectionComments",
  },
  "post /admin/changePromiseToPaySchedule": {
    controller: "CollectionsController",
    action: "changePromiseToPaySchedule",
  },
  "post /admin/ajaxGetNewPaymentSchedulePreview": {
    controller: "CollectionsController",
    action: "ajaxGetNewPaymentSchedulePreview",
  },
  "post /admin/ajaxUpdatePaymentWorkFlow": {
    controller: "CollectionsController",
    action: "ajaxUpdatePaymentWorkFlow",
  },

  "post /admin/ajaxSaveNewLoanModifications": {
    controller: "CollectionsController",
    action: "ajaxSaveNewLoanModifications",
  },
  "get /admin/showSettled": {
    controller: "CollectionsController",
    action: "showSettledContacts",
  },
  "get /admin/showChargedOff": {
    controller: "CollectionsController",
    action: "showChargedOffContacts",
  },
  "get /admin/ajaxGetEndedContractsList/:endedListType": {
    controller: "CollectionsController",
    action: "ajaxGetEndedContractsList",
  },

  "get /admin/show-modified-loans": {
    controller: "CollectionsController",
    action: "showModifiedLoans",
  },
  "get /admin/ajaxGetModifiedLoansList": {
    controller: "CollectionsController",
    action: "ajaxGetModifiedLoansList",
  },
  "get /getStates": {
    controller: "UtilityController",
    action: "getStates",
  },
  //loan modification - collections
  "get /admin/loan-modification/:paymentId": {
    controller: "CollectionsController",
    action: "showLoanModificationPage",
  },

  "get /admin/testProcessPayments": {
    controller: "CollectionsController",
    action: "testProcessPayments",
  },
  "get /admin/testCheckPaymentStatus": {
    controller: "CollectionsController",
    action: "testCheckPaymentStatus",
  },
  // Make Payment
  "POST /admin/makepayment/renderDialog": {
    controller: "PaymentController",
    action: "makePaymentRenderDialog",
  },
  "POST /admin/makepayment/submitPayment": {
    controller: "PaymentController",
    action: "submitPayment",
  },
  // --
  "GET /apply": {
    controller: "HomeController",
    action: "practiceApplication",
  },
  "GET /admin/re-apply/application/:userId": {
    controller: "ApplicationController",
    action: "reApplyApplication",
  },
  "GET /admin/re-apply/offers/:screenId": {
    controller: "ApplicationController",
    action: "reApplyOffers",
  },
  "POST /admin/ajaxReApplyOfferSubmission": {
    controller: "ApplicationController",
    action: "ajaxReApplyOfferSubmission",
  },

  "POST /admin/ajaxPostReApplyApplication": {
    controller: "ApplicationController",
    action: "ajaxPostReApplyApplication",
  },

  "GET /leadCreateAccount/:userId": {
    controller: "ApplicationController",
    action: "leadCreateAccount",
  },
  "POST /leadCreateAccountPost": {
    controller: "ApplicationController",
    action: "leadCreateAccountPost",
  },
  // JWT -- JSON Web Token
  "post /admin/generateJWT": {
    controller: "JWTController",
    action: "generateJWT",
  },
  /* ****************************** Lead Controller ************************************ */
  "post /lead/import": {
    controller: "LeadController",
    action: "considerLead",
  },
  "get /admin/leads": {
    controller: "LeadController",
    action: "getLeadControllerUI",
  },
  "get /admin/lead/stats": {
    controller: "LeadController",
    action: "getLeadStats",
  },
  "get /admin/lead/campaignstats": {
    controller: "LeadController",
    action: "getCampaignStats",
  },

  "put /admin/lead/config/limit/month/:limit": {
    controller: "LeadController",
    action: "setMonthLimit",
  },
  "put /admin/lead/config/limit/day/:limit": {
    controller: "LeadController",
    action: "setDayLimit",
  },
  "put /admin/lead/config/limit/hour/:hour/:limit": {
    controller: "LeadController",
    action: "setHourLimit",
  },
  "put /admin/lead/config/limit/campaign/:campaign/month/:limit": {
    controller: "LeadController",
    action: "setCampaignMonthLimit",
  },
  "put /admin/lead/config/limit/campaign/:campaign/day/:limit": {
    controller: "LeadController",
    action: "setCampaignDayLimit",
  },
  "put /admin/lead/config/purchasing/:status": {
    controller: "LeadController",
    action: "setPurchaseBool",
  },
  "put /admin/lead/config/purchasing/holidays/:status": {
    controller: "LeadController",
    action: "setPurchaseHolidaysBool",
  },
  "put /admin/lead/config/purchasing/weekends/:status": {
    controller: "LeadController",
    action: "setPurchaseWeekendsBool",
  },
  "put /admin/lead/config/campaign/autopromote/:status": {
    controller: "LeadController",
    action: "setCampaignAutoPromote",
  },
  "put /admin/lead/config/purchasing/hours/:start/:end": {
    controller: "LeadController",
    action: "setPurchaseHoursRange",
  },
  "get /admin/lead/config/limit/month": {
    controller: "LeadController",
    action: "getMonthLimit",
  },
  "get /admin/lead/config/limit/day": {
    controller: "LeadController",
    action: "getDayLimit",
  },
  "get /admin/lead/config/limit/hour/:hour": {
    controller: "LeadController",
    action: "getHourLimit",
  },
  "get /admin/lead/config/limit/campaign/:campaign/month": {
    controller: "LeadController",
    action: "getCampaignMonthLimit",
  },
  "get /admin/lead/config/limit/campaign/:campaign/day": {
    controller: "LeadController",
    action: "getCampaignDayLimit",
  },
  "get /admin/lead/config/purchasing": {
    controller: "LeadController",
    action: "getPurchaseBool",
  },
  "get /admin/lead/config": {
    controller: "LeadController",
    action: "getConfig",
  },
  "get /admin/rejectedLeads": {
    controller: "LeadController",
    action: "getRejectedLeadUI",
  },
  "get /admin/lead/rejectedLeads": {
    controller: "LeadController",
    action: "getRejectedLeads",
  },
  "get /admin/lead/rejected/:leadid": {
    controller: "LeadController",
    action: "getRejectedDetails",
  },
  "get /admin/ajaxGetDeniedLeadApiData": {
    controller: "LeadController",
    action: "ajaxGetDeniedLeadApiData",
  },
  "GET /offers/:userId": {
    controller: "OffersController",
    action: "getOffersByUser",
  },
  /*********** Nacha ************/
  "GET /admin/nacha": {
    controller: "NachaController",
    action: "nachaFiles",
  },

  "GET /admin/nachacredentials": {
    controller: "NachaController",
    action: "nachaUpdateForm",
  },

  "POST /admin/nachacredentials": {
    controller: "NachaController",
    action: "postNachaCredentials",
  },

  "POST /admin/nacha/filelist": {
    controller: "NachaController",
    action: "nachaFileList",
  },

  "GET /admin/nacha/file/:id": {
    controller: "NachaController",
    action: "nachaFile",
  },
  /*********** Back Office Leads ************/
  "get /admin/getLeadDetails": {
    controller: "AchController",
    action: "showLeadAch",
  },
  /*********** Tests for Clarity ************/
  "GET /test/clarity": {
    controller: "TestController",
    action: "testClarityServiceCalls",
  },
  /* Send user and screentracking objects to test the underwriting waterfall */
  "POST /test/waterfall": {
    controller: "TestController",
    action: "testUnderwriting"
  },

  // ******* Bank Controller ***********
  "GET /bank/flinks-account/:screenTrackingId": {
    controller: "BankController",
    action: "getFlinksAccountDetail"
  },

  "GET /bank/userAccounts/:screenTrackingId": {
    controller: "BankController",
    action: "listUserAchAccounts"
  },

  // ******* Bank Controller ***********
  "POST /bank/verification/:screenId": {
    controller: "BankController",
    action: "verifyBankAuthorization"
  },

  "POST /bank/manual/:screenId": {
    controller: "BankController",
    action: "manualBankAdd"
  },

  // ********  Borrower ***************
  "POST /borrower/login": {
    controller: "BorrowerController",
    action: "borrowerLogin"
  },

  "GET /borrower": {
    controller: "BorrowerController",
    action: "getBorrowerData"
  },

  "GET /borrower/:screenId/agreements": {
    controller: "BorrowerController",
    action: "getBorrowerAgreements"
  },

  "GET /borrower/view-document/:docId": {
    controller: "BorrowerController",
    action: "readAgreement"
  },
};
