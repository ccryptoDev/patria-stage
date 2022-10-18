import React, { useEffect, useState } from "react";
import styled from "styled-components";
import MainHeader from "../Components/Main-Header";
import { routes } from "../../../../routes/Admin/routes";
import Cube from "../Components/Cube";
import Container from "../Components/ContentContainer";
import { renderCubes } from "./config";
import { getApplicationStatusCount } from "../../../../api/admin-dashboard/login";

const Wrapper = styled.div`
  .cubes-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-gap: 17px;

    @media screen and (max-width: 1430px) {
      grid-template-columns: 1fr 1fr 1fr;
    }

    @media screen and (max-width: 1170px) {
      grid-template-columns: 1fr 1fr;
      grid-gap: 16px;
    }

    @media screen and (max-width: 992px) {
      grid-template-columns: 1fr 1fr 1fr;
    }

    @media screen and (max-width: 820px) {
      grid-template-columns: 1fr 1fr;
    }

    @media screen and (max-width: 560px) {
      grid-template-columns: 1fr;
    }
  }
`;

const Dashboard = () => {
  const crumbs = [{ text: "Dashboard", route: routes.DASHBOARD }];
  const [applicationCount, setApplicationCount] = useState({});

  const getApplicationCounts = async () => {
    try {
      const result = await getApplicationStatusCount();
      if (!result.ok) {
        throw new Error(result.error);
      }
      setApplicationCount(result.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getApplicationCounts();
  }, []);

  return (
    <Wrapper>
      <MainHeader
        crumbs={crumbs}
        heading="Dashboard"
        backgroundColor="#1E84BE"
      />
      <Container>
        <div className="cubes-container">
          {renderCubes(applicationCount).map((cube) => {
            return <Cube {...cube} key={cube.title} />;
          })}
        </div>
      </Container>
    </Wrapper>
  );
};

export default Dashboard;
