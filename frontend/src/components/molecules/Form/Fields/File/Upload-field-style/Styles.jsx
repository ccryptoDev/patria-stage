import styled from "styled-components";

export default styled.div`
  font-size: inherit;
  height: 3rem;
  position: relative;
  input {
    opacity: 0;
    z-index: -5;
    height: 100%;
    position: relative;
    width: 100%;
    opacity: 0;

    &:focus + label,
    & + .success {
      border-color: #28a745;
      box-shadow: 0 0 0 0.2rem rgb(40 167 69 / 25%);
    }
  }

  label {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
    border: 1px solid #ced4da;
    display: flex;
    align-items: center;
    padding: 5px 10rem 5px 1rem;
    border-radius: 5px;
    box-sizing: border-box;
    cursor: pointer;
    text-align: left;
    color: #363636;
    margin-bottom: 1.5rem;
    font-family: "Spartan";

    & span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &:after {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        z-index: 3;
        display: block;
        padding: 6px 1.2rem;
        line-height: inherit;
        color: #495057;
        content: "browse";
        background-color: #e9ecef;
        border-left: inherit;
        border-radius: 0 5px 5px 0;
        font-family: "Spartan";
        text-transform: lowercase;
        line-height: 1.6rem;
      }
    }
  }
`;
