import React from 'react'
import { Root, Fill, Input, Wrapper } from './styles'

type IRadio = {
  name: string;
  text: string;
  value: string;
  onChange: any;
  selected: string;
  texthightlight: boolean;
}

export const Radio = ({
  name,
  text,
  value,
  onChange,
  selected,
  texthightlight,
}: IRadio) => {
  const checked = selected === value
  return (
    <label>
      <Wrapper>
        <Root>
          <Input
            type="radio"
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
          />
          <Fill />
        </Root>
          <span className={`${texthightlight && checked ? "highlight" : ""}`}>{text}</span>
      </Wrapper>
    </label>
  )
}
