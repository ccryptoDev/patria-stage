import React from "react";
import Content from "../../components/templates/application/Pdfs";
import pdf from "../../components/templates/application/Pdfs/ordinance.pdf";

const Component = () => {
  return <Content pdf={pdf} />;
};

export default Component;
