import React from "react";
import Content from "../../components/templates/application/Pdfs";
import pdf from "../../components/templates/application/Pdfs/termsOfUse.pdf";

const Component = () => {
  return <Content pdf={pdf} />;
};

export default Component;
