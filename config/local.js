'use strict';

var allowedAdminRoles = ['Admin', 'Rep'];
var allowedPracticeRoles = ['Rep'];

module.exports = {
  //port:8100,
  siteBaseUrl: 'http://modern-health.alchemylms.com/',
  rollbackEnabled: 0,
  allowedAdminRoles: allowedAdminRoles,
  allowedPracticeRoles: allowedPracticeRoles,
  useremailunique: 0,
  //--karthik
  //stripePublicKey:'pk_test_fm0ABdVj1Y9YrBuMtJDtDRXT',
  //stripeSecretKey:'sk_test_JE2NI92frzEP07QHlHjycVN2',
  //--Derrick
  stripePublicKey: 'pk_test_NxtUWal5AA8m77ysJUp2RmNs',
  stripeSecretKey: 'sk_test_QzOcEfy2rrjVQmrZNjPHySVC',
  stripeAmount: 100,
  stripeSetupFee: 159500,
  stripeSaasFee: 29500,
  clientEmailId: 'rajrajan26@gmail.com',
  clientName: 'Derrick',
};
