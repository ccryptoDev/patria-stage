import React from "react";
import moment from "moment";
import Wrapper from "./Styles";
import TruthInLending from "./TruthInLending";
import PaymentSchedule from "./PaymentSchedule";
import Header from "./Header";
import Itemization from "./Itemization";
import Terms from "./Terms";
import SignaturePage from "./SignaturePage";
import PaymentAuthorization from "./PaymentAuthorization";
import Disclosure from "./Disclosure";

const Ric = ({
  loanDocData = null,
  userSignature,
  paymentData,
  isPdf = false,
}) => {
  const dateSigned = moment().toDate();
  const user = loanDocData?.user;

  return (
    <Wrapper>
      <Header user={user} dateSigned={dateSigned} />
      <TruthInLending paymentData={paymentData} />
      <PaymentSchedule paymentData={paymentData} />
      <Itemization paymentData={paymentData} />
      <Terms user={user} />
      <SignaturePage
        userSignature={userSignature}
        user={user}
        dateSigned={dateSigned.toDateString()}
      />
      <PaymentAuthorization
        isPdf={isPdf}
        user={user}
        userSignature={userSignature}
        dateSigned={dateSigned.toDateString()}
        paymentData={paymentData}
      />
      <Disclosure />
    </Wrapper>
  );
};

export default Ric;
