import styled from "styled-components";

export default styled.ul`
  display: inline-block;
  padding-left: 0;
  border-radius: 4px;
  padding: 2rem 1rem;
  width: 100%;

  li {
    display: inline;
  }

  & > .disabled > button {
    color: #777;
    cursor: not-allowed;
    background-color: #fff;
    border-color: #ddd;
  }

  & > li > button,
  .pagination > li > span {
    position: relative;
    float: left;
    padding: 6px 1.2rem;
    margin-left: -1px;
    line-height: 1.42857143;
    color: #337ab7;
    text-decoration: none;
    background-color: #fff;
    border: 1px solid #ddd;
    cursor: pointer;
    outline: none;
  }

  & > .active > button {
    z-index: 2;
    color: #fff;
    cursor: default;
    background-color: #337ab7;
    border-color: #337ab7;
  }
  & > .disabled-active > button {
    z-index: 2;
    color: #fff;
    cursor: not-allowed;
    background-color: #337ab7;
    border-color: #337ab7;
  }
`;
