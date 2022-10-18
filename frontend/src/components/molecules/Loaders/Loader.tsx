import React, { FunctionComponent } from "react";
import styled, { css } from "styled-components";

const Loader = styled.div<{
  size?: string;
  height?: string;
  position?: "center" | "right";
}>`
  height: ${(props) => `${props.size}rem` || "4rem"};
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  z-index: 999;

  .loader,
  .loader:before,
  .loader:after {
    background: #ff8000;
    -webkit-animation: load1 1s infinite ease-in-out;
    animation: load1 1s infinite ease-in-out;
    width: 1em;
    height: ${(props) => props.height || "4rem"};
  }

  .loader {
    color: #ff8000;
    text-indent: -9999em;
    position: absolute;
    font-size: ${(props) => `${props.size}px` || "4px"};
    -webkit-transform: translateZ(0);
    -ms-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-animation-delay: -0.16s;
    animation-delay: -0.16s;

    ${(props) =>
      props.position === "center" &&
      css`
        transform: translate(-50%, -50%);
        left: 50%;
        top: 50%;
      `}
  }

  .loader:before,
  .loader:after {
    position: absolute;
    top: 0;
    content: "";
  }

  .loader:before {
    left: -1.5em;
    -webkit-animation-delay: -0.32s;
    animation-delay: -0.32s;
  }

  .loader:after {
    left: 1.5em;
  }

  @-webkit-keyframes load1 {
    0%,
    80%,
    100% {
      box-shadow: 0 0;
      height: 4em;
    }

    40% {
      box-shadow: 0 -2em;
      height: 5em;
    }
  }

  @keyframes load1 {
    0%,
    80%,
    100% {
      box-shadow: 0 0;
      height: 4em;
    }

    40% {
      box-shadow: 0 -2em;
      height: 5em;
    }
  }

  .search {
    color: red;
  }
`;
type LoaderProps = {
  className?: string;
  position?: "center" | "right";
  size?: string;
};

const LoaderComponent: FunctionComponent<LoaderProps> = ({
  className,
  size,
  position,
}) => {
  return (
    <Loader position={position} size={size} className="preloader">
      <div className={`${className} loader`}>loading ...</div>
    </Loader>
  );
};

export default LoaderComponent;
