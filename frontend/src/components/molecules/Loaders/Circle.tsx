import React from "react";
import styled from "styled-components";

const Loader = styled.div<{
  size?: string;
  height?: string;
  position?: "center" | "right";
}>`
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;

  .loader {
    width: 1em;
    border-radius: 50%;
    position: absolute;
    text-indent: -9999em;
    font-size: ${(props) => `${props.size}px` || "0.7rem"};
    -webkit-animation: load5 1.1s infinite ease;
    animation: load5 1.1s infinite ease;
    transform: translate(-50%, -50%);
    top: 50%;
    left: 50%;
  }
  @-webkit-keyframes load5 {
    0%,
    100% {
      box-shadow: 0em -2.6em 0em 0em #034376,
        1.8em -1.8em 0 0em rgba(3, 67, 118, 0.2),
        2.5em 0em 0 0em rgba(3, 67, 118, 0.2),
        1.75em 1.75em 0 0em rgba(3, 67, 118, 0.2),
        0em 2.5em 0 0em rgba(3, 67, 118, 0.2),
        -1.8em 1.8em 0 0em rgba(3, 67, 118, 0.2),
        -2.6em 0em 0 0em rgba(3, 67, 118, 0.5),
        -1.8em -1.8em 0 0em rgba(3, 67, 118, 0.7);
    }
    12.5% {
      box-shadow: 0em -2.6em 0em 0em rgba(3, 67, 118, 0.7),
        1.8em -1.8em 0 0em #034376, 2.5em 0em 0 0em rgba(3, 67, 118, 0.2),
        1.75em 1.75em 0 0em rgba(3, 67, 118, 0.2),
        0em 2.5em 0 0em rgba(3, 67, 118, 0.2),
        -1.8em 1.8em 0 0em rgba(3, 67, 118, 0.2),
        -2.6em 0em 0 0em rgba(3, 67, 118, 0.2),
        -1.8em -1.8em 0 0em rgba(3, 67, 118, 0.5);
    }
    25% {
      box-shadow: 0em -2.6em 0em 0em rgba(3, 67, 118, 0.5),
        1.8em -1.8em 0 0em rgba(3, 67, 118, 0.7), 2.5em 0em 0 0em #034376,
        1.75em 1.75em 0 0em rgba(3, 67, 118, 0.2),
        0em 2.5em 0 0em rgba(3, 67, 118, 0.2),
        -1.8em 1.8em 0 0em rgba(3, 67, 118, 0.2),
        -2.6em 0em 0 0em rgba(3, 67, 118, 0.2),
        -1.8em -1.8em 0 0em rgba(3, 67, 118, 0.2);
    }
    37.5% {
      box-shadow: 0em -2.6em 0em 0em rgba(3, 67, 118, 0.2),
        1.8em -1.8em 0 0em rgba(3, 67, 118, 0.5),
        2.5em 0em 0 0em rgba(3, 67, 118, 0.7), 1.75em 1.75em 0 0em #034376,
        0em 2.5em 0 0em rgba(3, 67, 118, 0.2),
        -1.8em 1.8em 0 0em rgba(3, 67, 118, 0.2),
        -2.6em 0em 0 0em rgba(3, 67, 118, 0.2),
        -1.8em -1.8em 0 0em rgba(3, 67, 118, 0.2);
    }
    50% {
      box-shadow: 0em -2.6em 0em 0em rgba(3, 67, 118, 0.2),
        1.8em -1.8em 0 0em rgba(3, 67, 118, 0.2),
        2.5em 0em 0 0em rgba(3, 67, 118, 0.5),
        1.75em 1.75em 0 0em rgba(3, 67, 118, 0.7), 0em 2.5em 0 0em #034376,
        -1.8em 1.8em 0 0em rgba(3, 67, 118, 0.2),
        -2.6em 0em 0 0em rgba(3, 67, 118, 0.2),
        -1.8em -1.8em 0 0em rgba(3, 67, 118, 0.2);
    }
    62.5% {
      box-shadow: 0em -2.6em 0em 0em rgba(3, 67, 118, 0.2),
        1.8em -1.8em 0 0em rgba(3, 67, 118, 0.2),
        2.5em 0em 0 0em rgba(3, 67, 118, 0.2),
        1.75em 1.75em 0 0em rgba(3, 67, 118, 0.5),
        0em 2.5em 0 0em rgba(3, 67, 118, 0.7), -1.8em 1.8em 0 0em #034376,
        -2.6em 0em 0 0em rgba(3, 67, 118, 0.2),
        -1.8em -1.8em 0 0em rgba(3, 67, 118, 0.2);
    }
    75% {
      box-shadow: 0em -2.6em 0em 0em rgba(3, 67, 118, 0.2),
        1.8em -1.8em 0 0em rgba(3, 67, 118, 0.2),
        2.5em 0em 0 0em rgba(3, 67, 118, 0.2),
        1.75em 1.75em 0 0em rgba(3, 67, 118, 0.2),
        0em 2.5em 0 0em rgba(3, 67, 118, 0.5),
        -1.8em 1.8em 0 0em rgba(3, 67, 118, 0.7), -2.6em 0em 0 0em #034376,
        -1.8em -1.8em 0 0em rgba(3, 67, 118, 0.2);
    }
    87.5% {
      box-shadow: 0em -2.6em 0em 0em rgba(3, 67, 118, 0.2),
        1.8em -1.8em 0 0em rgba(3, 67, 118, 0.2),
        2.5em 0em 0 0em rgba(3, 67, 118, 0.2),
        1.75em 1.75em 0 0em rgba(3, 67, 118, 0.2),
        0em 2.5em 0 0em rgba(3, 67, 118, 0.2),
        -1.8em 1.8em 0 0em rgba(3, 67, 118, 0.5),
        -2.6em 0em 0 0em rgba(3, 67, 118, 0.7), -1.8em -1.8em 0 0em #034376;
    }
  }
  @keyframes load5 {
    0%,
    100% {
      box-shadow: 0em -2.6em 0em 0em #034376,
        1.8em -1.8em 0 0em rgba(3, 67, 118, 0.2),
        2.5em 0em 0 0em rgba(3, 67, 118, 0.2),
        1.75em 1.75em 0 0em rgba(3, 67, 118, 0.2),
        0em 2.5em 0 0em rgba(3, 67, 118, 0.2),
        -1.8em 1.8em 0 0em rgba(3, 67, 118, 0.2),
        -2.6em 0em 0 0em rgba(3, 67, 118, 0.5),
        -1.8em -1.8em 0 0em rgba(3, 67, 118, 0.7);
    }
    12.5% {
      box-shadow: 0em -2.6em 0em 0em rgba(3, 67, 118, 0.7),
        1.8em -1.8em 0 0em #034376, 2.5em 0em 0 0em rgba(3, 67, 118, 0.2),
        1.75em 1.75em 0 0em rgba(3, 67, 118, 0.2),
        0em 2.5em 0 0em rgba(3, 67, 118, 0.2),
        -1.8em 1.8em 0 0em rgba(3, 67, 118, 0.2),
        -2.6em 0em 0 0em rgba(3, 67, 118, 0.2),
        -1.8em -1.8em 0 0em rgba(3, 67, 118, 0.5);
    }
    25% {
      box-shadow: 0em -2.6em 0em 0em rgba(3, 67, 118, 0.5),
        1.8em -1.8em 0 0em rgba(3, 67, 118, 0.7), 2.5em 0em 0 0em #034376,
        1.75em 1.75em 0 0em rgba(3, 67, 118, 0.2),
        0em 2.5em 0 0em rgba(3, 67, 118, 0.2),
        -1.8em 1.8em 0 0em rgba(3, 67, 118, 0.2),
        -2.6em 0em 0 0em rgba(3, 67, 118, 0.2),
        -1.8em -1.8em 0 0em rgba(3, 67, 118, 0.2);
    }
    37.5% {
      box-shadow: 0em -2.6em 0em 0em rgba(3, 67, 118, 0.2),
        1.8em -1.8em 0 0em rgba(3, 67, 118, 0.5),
        2.5em 0em 0 0em rgba(3, 67, 118, 0.7), 1.75em 1.75em 0 0em #034376,
        0em 2.5em 0 0em rgba(3, 67, 118, 0.2),
        -1.8em 1.8em 0 0em rgba(3, 67, 118, 0.2),
        -2.6em 0em 0 0em rgba(3, 67, 118, 0.2),
        -1.8em -1.8em 0 0em rgba(3, 67, 118, 0.2);
    }
    50% {
      box-shadow: 0em -2.6em 0em 0em rgba(3, 67, 118, 0.2),
        1.8em -1.8em 0 0em rgba(3, 67, 118, 0.2),
        2.5em 0em 0 0em rgba(3, 67, 118, 0.5),
        1.75em 1.75em 0 0em rgba(3, 67, 118, 0.7), 0em 2.5em 0 0em #034376,
        -1.8em 1.8em 0 0em rgba(3, 67, 118, 0.2),
        -2.6em 0em 0 0em rgba(3, 67, 118, 0.2),
        -1.8em -1.8em 0 0em rgba(3, 67, 118, 0.2);
    }
    62.5% {
      box-shadow: 0em -2.6em 0em 0em rgba(3, 67, 118, 0.2),
        1.8em -1.8em 0 0em rgba(3, 67, 118, 0.2),
        2.5em 0em 0 0em rgba(3, 67, 118, 0.2),
        1.75em 1.75em 0 0em rgba(3, 67, 118, 0.5),
        0em 2.5em 0 0em rgba(3, 67, 118, 0.7), -1.8em 1.8em 0 0em #034376,
        -2.6em 0em 0 0em rgba(3, 67, 118, 0.2),
        -1.8em -1.8em 0 0em rgba(3, 67, 118, 0.2);
    }
    75% {
      box-shadow: 0em -2.6em 0em 0em rgba(3, 67, 118, 0.2),
        1.8em -1.8em 0 0em rgba(3, 67, 118, 0.2),
        2.5em 0em 0 0em rgba(3, 67, 118, 0.2),
        1.75em 1.75em 0 0em rgba(3, 67, 118, 0.2),
        0em 2.5em 0 0em rgba(3, 67, 118, 0.5),
        -1.8em 1.8em 0 0em rgba(3, 67, 118, 0.7), -2.6em 0em 0 0em #034376,
        -1.8em -1.8em 0 0em rgba(3, 67, 118, 0.2);
    }
    87.5% {
      box-shadow: 0em -2.6em 0em 0em rgba(3, 67, 118, 0.2),
        1.8em -1.8em 0 0em rgba(3, 67, 118, 0.2),
        2.5em 0em 0 0em rgba(3, 67, 118, 0.2),
        1.75em 1.75em 0 0em rgba(3, 67, 118, 0.2),
        0em 2.5em 0 0em rgba(3, 67, 118, 0.2),
        -1.8em 1.8em 0 0em rgba(3, 67, 118, 0.5),
        -2.6em 0em 0 0em rgba(3, 67, 118, 0.7), -1.8em -1.8em 0 0em #034376;
    }
  }
`;
type LoaderProps = {
  className?: string;
  position?: "center" | "right";
  size?: string;
};

const LoaderComponent = ({ className, size, position }: LoaderProps) => {
  return (
    <Loader position={position} size={size} className="preloader">
      <div className={`${className} loader`}>loading ...</div>
    </Loader>
  );
};

export default LoaderComponent;
