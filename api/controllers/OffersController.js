/** File Documentation */

module.exports = {
  getOffersByUser,
  getOffersPage
};

async function getOffersPage(req, res) {
  var user = req.session.userId;
  let userData = await User.findOne(user);
  let screentrackingData = await Screentracking.findOne({ user });

  if (userData.isFromLeadApi && !userData.leadReject && !userData.isBankVerified) { //if they are a lead and are not rejected and have not verified their bank info
    return res.redirect(`/verifybankinfo`);

  } else {
    const offersArray = OffersService.generateOffersArray(screentrackingData.requestedLoanAmount, screentrackingData.paymentFrequency);
    screentrackingData.offers = offersArray;
    await screentrackingData.save();

    return res.view("frontend/application/offers", { screentrackingData, userData });
  }
}

async function getOffersByUser(req, res) {
  var user = req.param("userId");
  let userData = await User.findOne(user);
  let screentrackingData = await Screentracking.findOne({ user: user });
  req.session.userId = user;

  return res.view("frontend/application/offers", { screentrackingData, userData });
}
