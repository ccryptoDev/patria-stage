import React from "react";
import StartApplication from "../../components/templates/landing/Apply/StartApplication";
import OptionsSection from "../../components/templates/landing/Apply/OptionsSection";
import AboutUs from "../../components/templates/landing/Apply/Aboutus";
import CustomerSection from "../../components/templates/landing/Apply/CustomerPortal";

const Apply = () => {
  return (
    <div>
      <StartApplication />
      <OptionsSection />
      <AboutUs />
      <CustomerSection />
    </div>
  );
};

export default Apply;
