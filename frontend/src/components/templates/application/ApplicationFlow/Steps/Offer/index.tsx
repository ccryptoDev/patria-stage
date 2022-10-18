import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Offer from "./OfferBox";
import { Form } from "./styles";
import Header from "../../../Components/FormHeader";
import Container from "../../styles";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";
import {
  getUserOffers,
  storeInitialSelectedOffer,
} from "../../../../../../api/application";
import { errorHandler } from "../../../../../../utils/errorHandler";
import { useUserData } from "../../../../../../contexts/user";

const OffersWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 12px;

  @media screen and (max-width: 620px) {
    grid-template-columns: clamp(230px, 100%, 280px);
    justify-content: center;
  }
`;

const Offers = ({
  isActive,
  moveToNextStep,
}: {
  isActive: boolean;
  moveToNextStep: any;
}) => {
  const [loading, setLoading] = useState(false);
  const [userOffers, setUserOffers] = useState<any>(null);
  const { screenId } = useUserData();

  const fetchUserOffers = async () => {
    try {
      setLoading(true);
      const response = await getUserOffers(screenId);
      setLoading(false);
      if (response.error) {
        throw Error(response.error.message);
      }

      if (response?.data && response?.data?.data) {
        setUserOffers(response.data.data);
      }
    } catch (error) {
      errorHandler(error);
    }
  };

  useEffect(() => {
    if (isActive) {
      fetchUserOffers();
    }
  }, [isActive]);

  const onSubmit = async (offer: any) => {
    setLoading(true);
    await storeInitialSelectedOffer({
      offer,
      throwException: true,
      screenTrackingId: screenId,
    })
      .then(() => moveToNextStep())
      .catch(errorHandler)
      .finally(() => setLoading(false));
  };

  const title = "You Are Conditionally Approved!! Choose your Offer";
  const note =
    "Review different weekly payment and select the options that are available to you.";
  return (
    <Container>
      <Loader loading={loading}>
        <Form>
          <Header title={title} note={note} />

          <div className="offer-wrapper">
            <OffersWrapper>
              {userOffers &&
                userOffers.map((offer: any) => {
                  return (
                    <Offer
                      onClick={() => onSubmit(offer)}
                      {...offer}
                      key={offer.term}
                    />
                  );
                })}
            </OffersWrapper>
          </div>
        </Form>
      </Loader>
    </Container>
  );
};

export default Offers;
