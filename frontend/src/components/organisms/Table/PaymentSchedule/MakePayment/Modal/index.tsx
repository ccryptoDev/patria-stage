import React, { useState } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import { makePaymentApi } from "../../../../../../api/admin-dashboard";
import { IMakePayment } from "../../../../../../api/admin-dashboard/types";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";
import Form from "../Styles";
import ErrorMessage from "../../../../../molecules/ErrorMessage/FormError";
import MakePaymentForm from "./Form/SelectAmount";
import ConfirmPaymentTable from "./Form/ConfirmPayment";

type IProps = {
  closeModal: any;
  state: any;
  cb: any;
  accounts: {
    accountNumber: string;
    routingNumber: string;
    name: string;
  }[];
};

type IForm = {
  amount: number | string;
  date: Date | string | number;
  card: string;
};

type ISchedule = {
  amount: number;
  date: string;
  endPrincipal: number;
  fees: number;
  interest: number;
  month: number;
  paidFees: number;
  paidInterest: number;
  paidPastDueInterest: number;
  paidPrincipal: number;
  pastDueInterest: number;
  payment: number;
  paymentType: string;
  principal: number;
  startPrincipal: number;
  status: string;
  transactionId: string;
};

const renderMonthlyPayment = (schedule: ISchedule[]) => {
  const paymentSchedule = schedule.filter(
    (item: any) => item.status !== "paid"
  );
  const paymentItem =
    paymentSchedule && paymentSchedule?.length > 0 ? paymentSchedule[0] : null;
  if (paymentItem?.amount && paymentItem?.principal) {
    const today = new Date();
    if (moment(paymentItem.date).isBefore(today)) {
      return paymentItem?.amount?.toFixed(2);
    }
    return paymentItem?.principal?.toFixed(2);
  }

  return 0;
};

const switchButtonsConfig = (state: any) => [
  {
    name: "monthly",
    label: "Monthly Payment",
    value: renderMonthlyPayment(state?.paymentSchedule),
  },
  { name: "payoff", label: "Payoff", value: state?.payOffAmount.toFixed(2) },
];

const MakePayment = ({
  closeModal,
  state: { paymentManagement, accounts },
  cb,
}: IProps) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [form, setForm] = useState<IForm>({
    date: Date.now(),
    amount: 0,
    card: "",
  });
  const [page, setPage] = useState(0);

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload: IMakePayment = {
      amount: +form?.amount || 0,
      screenTrackingId: paymentManagement?.screenTracking,
    };

    if (payload?.amount) {
      setLoading(true);
      const result = await makePaymentApi(payload);
      if (result && !result.error) {
        await cb(); // refresh the payment schedule table
        toast.success("payment has been made!");
        closeModal();
      } else if (result?.error) {
        const message = result?.error;
        toast.error(message || "something went wrong");
        setErrorMessage("Server Error");
      }
      setLoading(false);
    }
  };

  // controlls the switch payment type amount
  const typeOfPaymentHandler = (amount: string): void => {
    setForm((prevState) => ({ ...prevState, amount }));
  };

  // returns the date from the date picker
  const getDateHandler = (date: any) => {
    setForm((prevState) => ({ ...prevState, date }));
  };

  // controlls menual amount input
  const changeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prevState) => ({ ...prevState, amount: e.target.value }));
  };

  // select card drop down controller
  const cardHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prevState) => ({ ...prevState, card: e.target.value }));
  };
  const renderForm = () => {
    const payload = {
      typeOfPaymentHandler,
      switchButtons: switchButtonsConfig(paymentManagement),
      form,
      getDateHandler,
      changeAmount,
      cardHandler,
      accounts: accounts || [],
      closeModal,
      setPage,
      paymentSchedule: paymentManagement.paymentSchedule.filter(
        (item: any) => item.status !== "paid"
      ),
    };
    switch (page) {
      case 0:
        return <MakePaymentForm {...payload} />;
      case 1:
        return (
          <ConfirmPaymentTable
            setPage={setPage}
            paymentSchedule={paymentManagement?.paymentSchedule || []}
          />
        );
      default:
        return <></>;
    }
  };

  return (
    <Loader loading={loading}>
      <Form onSubmit={onSubmitHandler} className="content">
        {renderForm()}
        {errorMessage ? <ErrorMessage message={errorMessage} /> : ""}
      </Form>
    </Loader>
  );
};
export default MakePayment;
