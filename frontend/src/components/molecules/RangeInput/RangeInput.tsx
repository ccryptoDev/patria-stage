import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  input[type="range"] {
    overflow: hidden;
    height: 2.7rem;
    -webkit-appearance: none;
    margin: 1rem 0;
    width: 100%;
    padding: 0 5px;
  }
  input[type="range"]:focus {
    outline: none;
  }
  input[type="range"]::-webkit-slider-runnable-track {
    width: 100%;
    height: 1.8rem;
    cursor: pointer;
    animate: 0.2s;
    box-shadow: 1px 1px 4px #144376;
    background: #144376;
    border-radius: 0.9rem;
    border: 3px solid #fcfcfd;
  }
  input[type="range"]::-webkit-slider-thumb {
    box-shadow: 0 0 0 #fcfcfd;
    border: 3px solid #fcfcfd;
    height: 1.8rem;
    width: 2.7rem;
    border-radius: 1.4rem;
    background: #144376;
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: -3px;
  }
  input[type="range"]:focus::-webkit-slider-runnable-track {
    background: #144376;
  }
  input[type="range"]::-moz-range-track {
    width: 100%;
    height: 1.8rem;
    cursor: pointer;
    animate: 0.2s;
    box-shadow: 1px 1px 4px #144376;
    background: #144376;
    border-radius: 0.9rem;
    border: 3px solid #fcfcfd;
  }
  input[type="range"]::-moz-range-thumb {
    box-shadow: 0 0 0 #fcfcfd;
    border: 3px solid #fcfcfd;
    height: 1.8rem;
    width: 2.7rem;
    border-radius: 1.4rem;
    background: #144376;
    cursor: pointer;
  }
  input[type="range"]::-ms-track {
    width: 100%;
    height: 1.8rem;
    cursor: pointer;
    animate: 0.2s;
    background: transparent;
    border-color: transparent;
    color: transparent;
  }
  input[type="range"]::-ms-fill-lower {
    background: #144376;
    border: 3px solid #fcfcfd;
    border-radius: 1.8rem;
    box-shadow: 1px 1px 4px #144376;
  }
  input[type="range"]::-ms-fill-upper {
    background: #144376;
    border: 3px solid #fcfcfd;
    border-radius: 1.8rem;
    box-shadow: 1px 1px 4px #144376;
  }
  input[type="range"]::-ms-thumb {
    margin-top: 1px;
    box-shadow: 0 0 0 #fcfcfd;
    border: 3px solid #fcfcfd;
    height: 1.8rem;
    width: 2.7rem;
    border-radius: 1.4rem;
    background: #144376;
    cursor: pointer;
  }
  input[type="range"]:focus::-ms-fill-lower {
    background: #144376;
  }
  input[type="range"]:focus::-ms-fill-upper {
    background: #144376;
  }
`;

type IProps = {
  onChange: any;
  name?: string;
  min: number;
  max: number;
  value: number;
  step: number;
};

export default function Range({ onChange, name, min, max, value, step }: IProps) {
  return (
    <Wrapper>
      <input type="range" step={step} value={value} min={min} max={max} name={name} onChange={onChange} />
    </Wrapper>
  );
}
