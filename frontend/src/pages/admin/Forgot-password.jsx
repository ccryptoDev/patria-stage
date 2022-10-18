import React from "react";
import Form from "../../components/templates/admin/Forms/Login/ForgotPassword";
import Logo from "../../components/templates/admin/Login/Logo";
import {
  PageWrapper,
  UIWrapper,
} from "../../components/templates/admin/Login/PageStyles";

const Login = () => {
  return (
    <PageWrapper
      imgUrl={`${process.env.PUBLIC_URL}/images/financial-data-bro.svg`}
    >
      <UIWrapper>
        <Logo imgUrl={`${process.env.PUBLIC_URL}/images/icon-color.png`} />
        <div className="card">
          <div className="sign">
            <h4>Welcome</h4>
          </div>
          <div className="heading">
            <p>Enter your email</p>
          </div>
          <Form />
        </div>
      </UIWrapper>
    </PageWrapper>
  );
};

export default Login;
