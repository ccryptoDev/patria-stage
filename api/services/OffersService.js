module.exports = {
  generateOffersArray
};

function generateOffersArray(requestedLoanAmount, paymentFrequency = "B") {
  let offerArray = [
    {
      term: 8,
      interestRate: 780,
      apr: 780,
      id: "loanoffer1"
    },
    {
      term: 12,
      interestRate: 720,
      apr: 720,
      id: "loanoffer2"
    },
    {
      term: 16,
      interestRate: 660,
      apr: 660,
      id: "loanoffer3"
    },
    {
      term: 20,
      interestRate: 600,
      apr: 600,
      id: "loanoffer4"
    },
    {
      term: 24,
      interestRate: 540,
      apr: 540,
      id: "loanoffer5"
    }
  ];

  offerArray = offerArray.map(offer => {
    offer.regularPayment = SmoothPaymentService.determinePaymentAmount(
      paymentFrequency,
      offer.interestRate,
      offer.term,
      requestedLoanAmount
    );
    offer.financedAmount = requestedLoanAmount;
    return offer;
  });

  return offerArray;
}
