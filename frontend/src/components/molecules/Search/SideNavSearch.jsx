import React, { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import styled from "styled-components";
import searchIcon from "../../../assets/svgs/Agents/icons/search.svg";
import { routes } from "../../../routes/Agents/routes";

const SearchWrapper = styled.form`
  position: relative;
  width: 18rem;
  margin: 2rem auto;

  button {
    position: absolute;
    z-index: 100;
    right: 0;
    top: 0;
    outline: none;
    height: 100%;
    width: 5rem;
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  img {
    height: 2rem;
    width: 2rem;

    & svg {
      & path {
        fill: red;
      }
    }
  }

  input {
    position: relative;
    border: 1px solid #cbdae9;
    padding: 0.8rem;
    padding-right: 3rem;
    outline: none;
    border-radius: 0.8rem;
    width: 17.5rem;
    font-size: 1.4rem;

    &::placeholder {
      color: var(--lightgray-200);
    }
  }
`;

const Search = () => {
  const history = useHistory();
  const location = useLocation();
  const searchString = location.search.replace("?query=", "") || "";
  const [query, setQuery] = useState(searchString);
  const onSubmit = (e) => {
    e.preventDefault();
    history.push(`${routes.SEARCH}?query=${query}`);
  };

  const onChangeHandler = (e) => {
    setQuery(e.target.value);
  };

  return (
    <SearchWrapper onSubmit={(e) => onSubmit(e)}>
      <button type="submit">
        <img src={searchIcon} alt="search" />
      </button>
      <input
        type="text"
        placeholder="Search"
        name="query"
        value={query}
        onChange={(e) => onChangeHandler(e)}
      />
    </SearchWrapper>
  );
};

export default Search;
