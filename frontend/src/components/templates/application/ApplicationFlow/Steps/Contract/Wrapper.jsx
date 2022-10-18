import React from "react";
import { Note, H2 as Heading } from "../../../../../atoms/Typography";

function Contract({ children }) {
  return (
    <div>
      <div className="heading-wrapper mb-20">
        <Heading>Your Contract and ACH Authorization</Heading>
      </div>
      <Note className="note color-text">
        To finish, we need to confirm that you agree to the terms and conditions
        of this credit agreement. You have no obligation to pay the agreement
        you sign until after the described procedure is completed. Your first
        scheduled monthly payment will be due 30 days after the procedure is
        completed.
      </Note>
      <div>{children}</div>
    </div>
  );
}

export default Contract;
