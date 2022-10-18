import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export const useLoanData = (userData: any) => {
  // if (typeof userData === "undefined")
  //   throw Error("useLoanData error: pass user data");
  const [loanData, setLoanData] = useState<any>();
  const params: { id: string } = useParams();

  const selectLoan = (id: string) => {
    // 1. SELECT SCREENTRACKING FOR THE ACTIVE APPLICATION
    const screenTracking = userData.screenTrackings.find(
      // eslint-disable-next-line
      (st: any) => st._id === id
    );
    const paymentManagement = userData.paymentManagements.find(
      (pm: any) => pm.screenTracking === id
    );

    return { screenTracking, paymentManagement };
  };

  useEffect(() => {
    if (params && params.id) {
      const id = params?.id;
      if (userData && userData?.screenTrackings.length && id) {
        const { screenTracking, paymentManagement } = selectLoan(id);
        setLoanData({ screenTracking, paymentManagement });
      }
    }
    // eslint-disable-next-line
  }, [userData, params.id]);

  return { loanData, setLoanData, selectLoan };
};
