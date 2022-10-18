import React, { useState } from "react";
import Heading from "../../../../../molecules/Typography/admin/DetailsHeading";
import Comment from "./Comment";
import { useUserData } from "../../../../../../contexts/admin";
import { sendMessageApi } from "../../../../../../api/admin-dashboard";
import { initForm } from "./config";
import { validateComment } from "./validate";
import Table from "./Table";

const Comments = ({ state }: { state: any }) => {
  const { user } = useUserData();
  const [form, setForm] = useState(initForm);
  const [messages, setMessages] = useState(
    state?.screenTracking?.messages || []
  );

  // eslint-disable-next-line
  const screenTrackingId = state?.screenTracking?._id;
  const adminId = user?.user?.data?.id;

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prevState: any) => ({
      ...prevState,
      [e.target.name]: {
        ...prevState[e.target.name],
        value: e.target.value,
        message: "",
      },
    }));
  };

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const [isValid, updatedForm] = validateComment(form);
    if (isValid && adminId && screenTrackingId) {
      const body = {
        from: adminId,
        to: screenTrackingId,
        content: { subject: updatedForm.subject, comment: updatedForm.comment },
        // eslint-disable-next-line
        createdBy: user?.user?.data?._doc?.email,
      };
      const result: any = await sendMessageApi(body);
      if (result && !result.error && result.data) {
        const updatedMessages = result?.data;
        setForm(initForm);
        setMessages(updatedMessages);
      }
    } else {
      setForm(updatedForm);
    }
  };
  return (
    <div>
      <Heading text="Comments Section" />
      <Comment
        onChangeHandler={onChangeHandler}
        onSubmitHandler={onSubmitHandler}
        form={form}
      />
      <Heading text="Comments Details" />
      <Table messages={messages} />
    </div>
  );
};

export default Comments;
