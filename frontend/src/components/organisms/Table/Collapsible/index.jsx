import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";

const TableStyle = styled.div`
  transition: all 0.3s;
  overflow: hidden;
  table {
    box-sizing: border-box;
  }
`;

const Table = ({ items, thead, content, expanded, showByDefault = 0 }) => {
  const elem = useRef(null);
  const [height, setHeight] = useState({ full: 0, default: 0 });

  useEffect(() => {
    if (elem && elem?.current && items.length) {
      const elemHeight =
        elem &&
        items.length &&
        elem.current &&
        elem?.current?.querySelector("tbody tr") &&
        elem?.current?.querySelector("tbody tr").offsetHeight;
      const defaultHeight = elemHeight * (showByDefault + 1);
      const fullHeight = elemHeight * (items.length + 1);
      setHeight({ full: fullHeight, default: defaultHeight });
    }
    // eslint-disable-next-line
  }, [items.length]);

  return (
    <TableStyle
      style={{
        maxHeight:
          height.full && expanded ? `${height.full}px` : `${height.default}px`,
      }}
      ref={elem}
    >
      <table>
        <thead>
          <tr>
            {thead.map((item) => (
              <th key={item}>{item}</th>
            ))}
          </tr>
        </thead>
        <tbody>{content}</tbody>
      </table>
    </TableStyle>
  );
};

export default Table;
