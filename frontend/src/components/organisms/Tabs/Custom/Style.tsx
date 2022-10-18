import styled, { css } from "styled-components";

const Wrapper = styled.div<{ variant?: string }>`
  ${(props) =>
    props.variant === "agents-portal-main" &&
    css`
      .tabs {
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        & button {
          border: 1px solid rgba(0, 69, 92, 0.08);
          border-radius: 1rem;
          color: #1a3855;
          background: none;
          box-sizing: border-box;
          text-decoration: none;
          font-weight: bold;
          font-size: 1.6rem;
          padding: 1.8rem;
          text-align: center;
          min-width: 20rem;
          font-family: "Spartan";
        }

        & .active {
          background: #fff;
          box-shadow: rgb(0 0 0 / 10%) 0.4rem 0.5rem 0.9rem;
          color: #034376;
        }
      }
    `}

  ${(props) =>
    props.variant === "form" &&
    css`
      .tabs {
        display: flex;
        align-items: center;
        & button {
          color: #1c1c1e;
          box-sizing: border-box;
          text-decoration: none;
          font-weight: bold;
          font-size: 14px;
          background: none;
          border: 1px solid transparent;
          line-height: 16px;
          padding: 12px;
          text-align: left;
          min-width: 200px;
          font-family: "Spartan";
        }

        & .active {
          background: #fff;
          color: var(--color-primary);
          border-bottom: 1px solid var(--color-primary);
        }
      }
    `}
`;

export default Wrapper;
