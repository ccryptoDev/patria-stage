import styled from "styled-components";

export const PageWrapper = styled.div`
  position: relative;
  background: url(${(props) => props.imgUrl});
  background-size: cover;
  background-position: center;
  min-height: 100vh;

  &:after {
    background: linear-gradient(
      60deg,
      rgb(0 0 0 / 72%),
      rgb(255 255 255 / 80%)
    );
  }

  &:before {
    background: rgba(0, 0, 0, 0.5);
  }

  &:after,
  &:before {
    position: absolute;
    z-index: 1;
    display: block;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    content: "";
  }
`;

export const UIWrapper = styled.div`
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: center;

  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    background: #fff;
    box-shadow: 0 1px 4px 0 rgb(0 0 0 / 14%);
    border-radius: 6px;
    margin: 5rem 0 3rem;

    & .sign {
      padding: 1.5rem;
      border-radius: 3px;
      background: linear-gradient(60deg, #034376, #034376);
      color: #fff;
      width: calc(100% - 3rem);
      margin: -4rem 0 2rem;
      box-sizing: border-box;
      box-shadow: 0 4px 2rem 0px rgb(0 0 0 / 14%),
        0 0.7rem 1rem -5px rgb(39 138 176 / 40%);

      & h4 {
        margin: 1rem 0;
        text-align: center;
      }
    }

    & .heading p {
      margin-top: 0;
      color: #999999;
    }
  }
`;
