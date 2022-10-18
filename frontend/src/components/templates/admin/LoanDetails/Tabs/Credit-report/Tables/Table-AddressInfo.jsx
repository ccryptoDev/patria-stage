import React from "react";
import Wrapper from "../../../../../../atoms/Table/Details-vertical";

const Table = () => {
  return (
    <Wrapper>
      <table className="table table-bordered">
        <tbody>
          <tr>
            <th className="half-width">Status</th>
            <td> current </td>
          </tr>
          <tr>
            <th>Qualifier</th>
            <td> personal </td>
          </tr>
          <tr>
            <th>Address</th>
            <td className="text-center">
              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <td className="half-width">Number</td>
                    <td> 8180 </td>
                  </tr>
                  <tr>
                    <td>Street Name</td>
                    <td> BRIARWOOD </td>
                  </tr>
                  <tr>
                    <td>Type</td>
                    <td> ST </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </Wrapper>
  );
};

export default Table;
