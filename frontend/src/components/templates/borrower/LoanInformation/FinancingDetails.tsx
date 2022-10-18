import React from "react";
import Table from "../../../atoms/Table/Details-vertical";
import { formatCurrency, formatDate } from "../../../../utils/formats";
import Card from "../Components/Table-Card";

interface PropsType {
  borrowerData: any;
}

const FinancingDetails = (props: PropsType) => {
  const { borrowerData } = props;
  const { selectedOffer } = borrowerData;

  const getValue = (key: string, notation: string | null = null) => {
    if (!selectedOffer) return "N/A";
    const value = selectedOffer[key];
    if (value) return `${value}${notation}`;
    return "N/A";
  };

  return (
    <Card className="mt-20">
      <Table>
        <tr>
          <td>Financing reference</td>
          <td>--</td>
        </tr>
        <tr>
          <td>Amount financed</td>
          <td>{formatCurrency(selectedOffer?.financedAmount)}</td>
        </tr>
        <tr>
          <td>Interest rate</td>
          <td>{`${getValue("interestRate", "%")}`}</td>
        </tr>
        <tr>
          <td>APR</td>
          <td>{`${getValue("apr", "%")}`}</td>
        </tr>
        <tr>
          <td>Financing term</td>
          <td>{`${getValue("term", "month")}`}</td>
        </tr>
        <tr>
          <td>Maturity date</td>
          <td>{formatDate(new Date())}</td>
        </tr>
      </Table>
    </Card>
  );
};

export default FinancingDetails;
