import React from "react";
import Table from "../../../atoms/Table/Details-horizontal";
import { formatCurrency } from "../../../../utils/formats";
import Card from "../Components/Table-Card";

const PaymentSchedule = () => {
  return (
    <Card className="mt-20">
      <Table>
        <thead>
          <tr>
            <th className="index">#</th>
            <th>Schedule Date</th>
            <th>Payment Type</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {/* <tr>
            <td className="index">1</td>
            <td>10/12/2021</td>
            <td>Withdrawal</td>
            <td>{formatCurrency(1000)}</td>
          </tr> */}
        </tbody>
      </Table>
    </Card>
  );
};

export default PaymentSchedule;
