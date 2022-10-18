import React, { useState, useEffect } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  align-items: center;

  input {
    border-radius: 2.5rem;
    text-indent: 0.8rem;
    border: 2px solid #d3d7df;
    height: 3rem;
    padding: 5px;
    font-size: 1.4rem;
  }
`;

const Search = ({ searchHanlder }) => {
  const [input, setInput] = useState("");

  // input search debounce
  useEffect(() => {
    const debounce = setTimeout(() => {
      searchHanlder(input);
    }, 1000);
    return () => {
      clearInterval(debounce);
    };
    // eslint-disable-next-line
  }, [input]);

  const onChangeHandler = (e) => setInput(e.target.value);

  return (
    <Wrapper>
      <input
        type="text"
        onChange={onChangeHandler}
        value={input}
        placeholder="Search"
      />
    </Wrapper>
  );
};

export default Search;
