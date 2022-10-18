import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Button from "../../../../../atoms/Buttons/Button";
import {
  initForm,
  renderBillingAddress,
  inintAddressForm,
} from "./Forms/config";
import { validate as validateAchForm } from "./Forms/ACH/validate";
import { validate as validateCardForm } from "./Forms/Card/validate";
import { validate as validateHomeAddress } from "./Forms/validateAddress";
import Container from "../../styles";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";
import { H4, H3 } from "../../../../../atoms/Typography";
import TabsWrapper from "../../../../../molecules/Tabs/Material-ui/styles";
import Tabs from "../../../../../molecules/Tabs/Material-ui";
import ACHForm from "./Forms/ACH";
import Card from "./Forms/Card";
import {
  addFundingMethodInLMS,
  getDefaultPaymentMethod,
  makeDisbursement,
} from "../../../../../../api/application";
// import { errorHandler } from "../../../../../../utils/errorHandler";
import { useUserData } from "../../../../../../contexts/user";
import { parseFormToFormat } from "../../../../../../utils/form/parsers";
import Form from "./styles";
import { errorHandler } from "../../../../../../utils/errorHandler";

export const tabNames = {
  CARD: "CARD",
  ACH: "ACH",
};

export const tabs = [
  { button: "Debit Card", value: tabNames.CARD },
  { button: "ACH", value: tabNames.ACH },
];

const SectionWrapper = styled.div`
  margin: 24px 0;

  .heading-wrapper {
    margin: 14px 0;
    display: flex;
    column-gap: 10px;
  }
`;

const renderForm = ({
  activeTab,
  form,
  onChangeHandler,
  onClickHanlder,
}: {
  activeTab: string;
  form: any;
  onChangeHandler: any;
  onClickHanlder: any;
}) => {
  switch (activeTab) {
    case tabNames.CARD:
      return <Card form={form} onChangeHandler={onChangeHandler} />;
    case tabNames.ACH:
      return (
        <ACHForm
          form={form}
          onChangeHandler={onChangeHandler}
          setAccountType={onClickHanlder}
        />
      );
    default:
      return <Card form={form} onChangeHandler={onChangeHandler} />;
  }
};

const validatePaymentForm = ({
  activeTab,
  form,
}: {
  activeTab: string;
  form: any;
}) => {
  switch (activeTab) {
    case tabNames.ACH:
      return validateAchForm(form);
    case tabNames.CARD:
      return validateCardForm(form);
    default:
      return [true, form];
  }
};

const PaymentMethod = ({
  moveToNextStep,
  isActive,
}: {
  moveToNextStep: any;
  isActive: boolean;
}) => {
  const [form, setForm] = useState(initForm({}));
  const [addressForm, setAddressForm] = useState(inintAddressForm({}));
  const [loading, setLoading] = useState(false);
  const [hasFetchedAChPaymentData, setHasFetchedAChPaymentData] =
    useState(false);
  const [activeTab, setActiveTab] = useState(tabs[0].value);
  const [defaultPaymentData, setDefaultPaymentData] = useState({
    financialInstitution: "",
    accountNumber: "",
    routingNumber: "",
  });
  const {
    user,
    loading: userLoading,
    screenId: screenTrackingId,
    fetchUser,
  } = useUserData();
  const userData = user?.data?.user || null;

  const populateHomeAddress = () => {
    if (user?.data) {
      setAddressForm(inintAddressForm(user.data.user));
    }
  };

  const populateFormData = () => {
    if (user?.data) {
      const fullName = `${userData.firstName} ${userData.lastName}`;
      setForm(
        initForm({
          fullName,
          financialInstitution: defaultPaymentData?.financialInstitution,
          accountNumber: defaultPaymentData?.accountNumber,
          routingNumber: defaultPaymentData?.routingNumber,
        })
      );

      console.log({ form });
    }
  };

  useEffect(() => {
    if (!hasFetchedAChPaymentData && isActive) {
      getDefaultPaymentMethod({ screenTrackingId }).then((response: any) => {
        setDefaultPaymentData(response.account);
        setHasFetchedAChPaymentData(true);
      });
    }
  }, [userData, isActive]);

  useEffect(() => {
    if (isActive && userData) {
      populateHomeAddress();
      populateFormData();
    }
  }, [userData, isActive, defaultPaymentData]);

  const onSubmitHandler = async (e: any) => {
    try {
      e.preventDefault();
      const [isValid, updatedForm] = validatePaymentForm({ activeTab, form });
      if (isValid) {
        const [isAddressValid, updatedAddressForm] =
          validateHomeAddress(addressForm);
        if (isAddressValid) {
          setLoading(true);
          const addressPayload = parseFormToFormat(addressForm);
          const cardPayload = parseFormToFormat(form);

          const payload = {
            screenTrackingId: userData?.screenTracking,
            billingAddress1: `${addressPayload.street} ${addressPayload.state} ${addressPayload.city}`,
            billingCity: addressPayload.city,
            billingFirstName: addressPayload.firstName,
            billingLastName: addressPayload.lastName,
            billingState: addressPayload.state,
            billingZip: addressPayload.zipCode,
            cardCode: cardPayload.securityCode,
            cardNumber: cardPayload.cardNumber,
            expMonth: cardPayload?.expirationDate?.substring(0, 2),
            expYear: cardPayload?.expirationDate?.substring(2, 4),
            paymentType: activeTab,
            routingNumber: cardPayload?.routingNumber,
            accountNumber: cardPayload?.accountNumber,
            financialInstitution: cardPayload.financialInstitution,
            accountType: cardPayload.accountType,
          };

          await addFundingMethodInLMS({ payload, throwException: true });
          const disbursementResponse = await makeDisbursement(screenTrackingId);

          if (disbursementResponse.error) {
            throw disbursementResponse.error;
          }

          setLoading(false);
          moveToNextStep();
        } else {
          setAddressForm(updatedAddressForm);
        }
      } else {
        setForm(updatedForm);
      }
    } catch (error: any) {
      errorHandler({ error: "Try again" });
      setLoading(false);
      // moveToNextStep();
    }
  };

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevState: any) => ({
      ...prevState,
      [name]: { ...prevState[name], value, message: "" },
    }));
  };

  const onClickHanlder = ({ name, value }: { value: string; name: string }) => {
    setForm((prevState: any) => ({
      ...prevState,
      [name]: { ...prevState[name], value, message: "" },
    }));
  };

  return (
    <Container>
      <Loader loading={loading || userLoading}>
        <Form onSubmit={onSubmitHandler}>
          <H3>Funding Method</H3>
          <TabsWrapper className="tabs-wrapper">
            <Tabs
              buttons={tabs}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </TabsWrapper>
          {renderForm({ form, activeTab, onChangeHandler, onClickHanlder })}
          <SectionWrapper>
            <div className="heading-wrapper">
              <H4>Billing Address</H4>
            </div>
            {/* <div className="heading-wrapper">
              <CheckBox
                label="Home Address"
                value={isHomeAddress}
                onChange={(e: any) => setIsHomeAddress(e.target.value)}
              />
            </div> */}
            <div className="fields-wrapper">
              {renderBillingAddress(addressForm).map(
                ({ component: Component, ...field }) => {
                  return (
                    <Component
                      key={field.name}
                      {...field}
                      onChange={onChangeHandler}
                    />
                  );
                }
              )}
            </div>
          </SectionWrapper>

          <Button type="submit" variant="primary">
            Confirm
          </Button>
        </Form>
      </Loader>
    </Container>
  );
};

export default PaymentMethod;
