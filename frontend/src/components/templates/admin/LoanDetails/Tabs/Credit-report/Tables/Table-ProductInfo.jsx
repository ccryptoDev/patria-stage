import React from "react";
import Wrapper from "../../../../../../atoms/Table/Details-vertical";

const Table = () => {
  return (
    <Wrapper>
      <table className="table table-bordered">
        <tbody>
          <tr>
            <th className="half-width">code</th>
            <td> 00W18 </td>
          </tr>
          <tr>
            <th>status</th>
            <td> defaultDelivered </td>
          </tr>
          <tr>
            <td colSpan="2" className="trade-info-heading">
              <b>scoreModel</b>
            </td>
          </tr>
          <tr>
            <td colSpan="2">
              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <td colSpan="2" className="trade-info-heading">
                      <b>score</b>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <table className="table table-bordered">
                        <tbody>
                          <tr>
                            <th className="half-width"> results </th>
                            <td>
                              <div> +824 </div>
                            </td>
                          </tr>
                          <tr>
                            <th>derogatoryAlert</th>
                            <td> false </td>
                          </tr>
                          <tr>
                            <th> fileInquiriesImpactedScore </th>
                            <td>
                              <div> false </div>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="2" className="trade-info-heading">
                              <b>factors</b>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="2">
                              <table className="table table-bordered">
                                <tbody>
                                  <tr>
                                    <td colSpan="2" className="trade-info-heading">
                                      <b>factor</b>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td colSpan="2">
                                      <div>
                                        <table className="table table-bordered">
                                          <tbody>
                                            <tr>
                                              <th className="half-width"> Rank </th>
                                              <td> 1 </td>
                                            </tr>
                                            <tr>
                                              <th>Code</th>
                                              <td> 003 </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                        <table className="table table-bordered">
                                          <tbody>
                                            <tr>
                                              <th className="half-width"> Rank </th>
                                              <td> 2 </td>
                                            </tr>
                                            <tr>
                                              <th>Code</th>
                                              <td> 010 </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                        <table className="table table-bordered">
                                          <tbody>
                                            <tr>
                                              <th className="half-width"> Rank </th>
                                              <td> 3 </td>
                                            </tr>
                                            <tr>
                                              <th>Code</th>
                                              <td> 005 </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                        <table className="table table-bordered">
                                          <tbody>
                                            <tr>
                                              <th className="half-width"> Rank </th>
                                              <td> 4 </td>
                                            </tr>
                                            <tr>
                                              <th>Code</th>
                                              <td> 030 </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
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
