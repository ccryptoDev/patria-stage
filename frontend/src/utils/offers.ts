export const parseSalaryAdvanceOffer = (offer: any) => {
  if (offer && offer.monthlyPayment && offer?.schedule?.length) {
    return {
      monthlyPayment: +offer?.monthlyPayment.toFixed(2),
      fee: +offer?.schedule[0]?.interest.toFixed(2),
      total: +offer.schedule
        .reduce((acc: number, item: any) => {
          return acc + item.payment;
        }, 0)
        .toFixed(2),
    };
  }
  return {
    monthlyPayment: 0,
    fee: 0,
    total: 0,
  };
};
