import React from "react";
import Banner from "../../components/templates/landing/Loans/Banner";
import Cards from "../../components/templates/landing/Loans/Cards";
import Benefits from "../../components/templates/landing/Loans/Benefits";
import Repayment from "../../components/templates/landing/Loans/Repayment";
import Clarifications from "../../components/templates/landing/Loans/Clarifications";

const Contact = () => {
  return (
    <div>
      <Banner />
      <Cards />
      <Benefits />
      <Repayment />
      <Clarifications />
    </div>
  );
};

export default Contact;
