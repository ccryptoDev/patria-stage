import React from "react";
import styled from "styled-components";
import TableWrapper from "../../../../../atoms/Table/Details-vertical";
import TextField from "../../../../../molecules/Form/Fields/TextField";
import TextArea from "../../../../../molecules/Form/Fields/TextArea";
import Buttons from "../../../../../molecules/Buttons/SubmitForm";
import Button from "../../../../../atoms/Buttons/Button";
import { ITextField } from "../../../../application/types";

const Styled = styled.div`
  th {
    vertical-align: text-bottom;
    & .heading {
      padding: 1rem;
      font-weight: bold;
    }
  }

  textarea {
    resize: none;
  }

  .input-wrapper {
    padding: 1rem 1rem 3rem 1rem;
  }

  .submit-btn-wrapper {
    margin: 0;
    padding: 1rem;
    & button {
      width: max(20rem, 50%);
    }
  }
`;

type ICommentComponentProps = {
  onSubmitHandler: any;
  onChangeHandler: Function;
  form: { subject: ITextField; comment: ITextField };
};

const CommentComponent = ({
  onSubmitHandler,
  onChangeHandler,
  form,
}: ICommentComponentProps) => {
  return (
    <Styled>
      <form onSubmit={onSubmitHandler}>
        <TableWrapper>
          <table>
            <tbody>
              <tr>
                <th>
                  <div className="heading">Subject</div>
                </th>
                <td>
                  <div className="input-wrapper">
                    <TextField
                      name="subject"
                      message={form.subject.message}
                      value={form.subject.value}
                      placeholder="Enter subject"
                      onChange={onChangeHandler}
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <th>
                  <div className="heading">Comment</div>
                </th>
                <td>
                  <div className="input-wrapper">
                    <TextArea
                      name="comment"
                      message={form.comment.message}
                      value={form.comment.value}
                      cols={30}
                      rows={10}
                      onChange={onChangeHandler}
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <td />
                <td>
                  <Buttons className="submit-btn-wrapper">
                    <Button type="submit" variant="primary">
                      Submit
                    </Button>
                  </Buttons>
                </td>
              </tr>
            </tbody>
          </table>
        </TableWrapper>
      </form>
    </Styled>
  );
};

export default CommentComponent;
