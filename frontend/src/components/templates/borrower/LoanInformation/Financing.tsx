import React from "react";
import Table from "../../../atoms/Table/Details-vertical";
import { formatCurrency } from "../../../../utils/formats";
import Card from "../Components/Table-Card";

interface PropsType {
  borrowerData: any;
}
const Financing = (props: PropsType) => {
  const { borrowerData } = props;

  const fullname = `${borrowerData?.user?.firstname} ${borrowerData?.user?.lastname}`;
  const { selectedOffer } = borrowerData;
  return (
    <Card className="mt-20">
      <Table>
        <tr>
          <td>Financing reference</td>
          <td>{borrowerData?.applicationReference}</td>
        </tr>
        <tr>
          <td>Name</td>
          <td>{fullname}</td>
        </tr>
        <tr>
          <td>Amount financed</td>
          <td>{formatCurrency(selectedOffer?.financedAmount)}</td>
        </tr>
        <tr>
          <td>Status</td>
          <td>{borrowerData?.underwritingDecision?.status}</td>
        </tr>
      </Table>
    </Card>
  );
};

export default Financing;
