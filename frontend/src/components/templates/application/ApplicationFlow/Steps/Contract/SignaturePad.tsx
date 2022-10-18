import React, { useEffect } from "react";
import styled from "styled-components";
import SignatureCanvas from "react-signature-canvas";
import Button from "../../../../../atoms/Buttons/Button";
import { Note, H3 } from "../../../../../atoms/Typography";
import ButtonWrapper from "../../../../../atoms/Form/Buttons-wrapper";

type IProps = {
  sigCanvas: any;
  save: any;
  data?: string;
};

const Wrapper = styled.div`
  padding: 24px;
  border-radius: 14px;
  margin: 24px 0;
  background: #fbfbff;
  & h2 {
    font-weight: 700;
  }

  & .note {
    margin: 12px 0;
  }

  .btn-secondary {
    background: transparent;
  }

  .sigcanvas {
    border: 1px solid var(--color-border);
    background: #fff;
    border-radius: 14px;
    margin: 10px 0;
    height: 200px;
    max-width: 997px;
    width: 100%;
  }

  @media screen and (max-width: 767px) {
    padding: 12px;
  }
`;

function SignaturePad({ sigCanvas, save, data }: IProps) {
  useEffect(() => {
    if (data) {
      const canvas = sigCanvas.current.getCanvas();
      const ctx = canvas.getContext("2d");
      const image = new Image();
      image.onload = () => {
        ctx.drawImage(image, 0, 0);
      };
      image.src = `data:image/png;base64,${data}`;
    }
  }, []);

  const clear = () => sigCanvas.current.clear();
  return (
    <Wrapper>
      <H3>Create your sign</H3>
      <Note className="note color-text">
        Please click and hold your mouse to sign your signature in the box
        below. You will need to sign the fields below with your signature.
      </Note>
      <SignatureCanvas
        ref={sigCanvas}
        canvasProps={{
          className: "sigcanvas",
        }}
      />
      <ButtonWrapper>
        <Button type="button" variant="primary" onClick={save}>
          Accept
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="btn-secondary"
          onClick={clear}
        >
          Clear
        </Button>
      </ButtonWrapper>
    </Wrapper>
  );
}

export default SignaturePad;
