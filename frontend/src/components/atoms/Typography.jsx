import styled from "styled-components";

export const Hr = styled.hr`
  margin-top: 10px;
  margin-bottom: 10px;
  border: 0;
  border-top: 1px solid var(--color-grey-light);
`;

export const H1 = styled.h1`
  &,
  & span {
    font-weight: 700;
    position: relative;
    font-size: 5.2rem;
    line-height: 6.2rem;
    color: #222222;
  }

  @media screen and (max-width: 767px) {
    &,
    & span {
      line-height: 1.5;
    }
  }
`;

export const H2 = styled.h2`
  &,
  & span {
    font-weight: 700;
    position: relative;
    font-size: 3.2rem;
    line-height: 3.5rem;
    color: #222222;
  }

  @media screen and (max-width: 767px) {
    &,
    & span {
      font-size: 2rem;
      line-height: 2.2rem;
    }
  }
`;

export const H3 = styled.h3`
  &,
  & span {
    font-weight: 700;
    position: relative;
    font-size: 2.4rem;
    line-height: 1.5;
    color: var(--color-grey);
  }

  @media screen and (max-width: 767px) {
    &,
    & span {
      font-size: 18px;
      font-weight: 600;
    }
  }
`;

export const H4 = styled.h4`
  &,
  & span {
    font-weight: 700;
    position: relative;
    font-size: 2rem;
    line-height: 1.5;
    color: var(--color-grey);
    @media screen and (max-width: 767px) {
      &,
      & span {
        font-size: 16px;
        font-weight: 600;
      }
    }
  }
`;

export const H5 = styled.h5`
  &,
  & span {
    font-weight: 600;
    position: relative;
    font-size: 1.8rem;
    line-height: 1.5;
    color: #222222;
  }
`;

export const Note = styled.p`
  &,
  & span {
    font-size: 1.4rem;
    line-height: 1.6rem;
    font-weight: 400;
    font-weight: normal;
    color: #222222;
  }
`;
