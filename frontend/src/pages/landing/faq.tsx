import React, { useEffect, useState } from "react";
import Banner from "../../components/templates/landing/Faq/Banner";
import Content from "../../components/templates/landing/Faq/Content";
import { scrollTop } from "../../utils/scroll";

const FAQ = () => {
  const [input, setInput] = useState("");
  const [regexp, setRegExp] = useState<any>("");

  useEffect(() => {
    scrollTop();
  }, []);

  const searchHanlder = () => {
    if (input.trim()) {
      const regex = new RegExp(`(${input})`, "gi");
      setRegExp(regex);
    } else {
      setRegExp("");
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchHanlder();
    }, 500);
    return () => {
      clearInterval(debounce);
    };
  }, [input]);

  return (
    <div>
      <Banner onChangeHandler={setInput} inputValue={input} />
      <Content regexp={regexp} />
    </div>
  );
};

export default FAQ;
