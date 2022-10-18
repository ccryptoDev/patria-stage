import React, { useState, useRef, useEffect } from "react";
import Banner from "../../components/templates/landing/About/Banner";
import Cards from "../../components/templates/landing/About/Cards";
import Article from "../../components/templates/landing/About/Article";
import { scrollTop } from "../../utils/scroll";

const Contact = () => {
  const [scrollToArticle, setScrollToArticle] = useState(false);
  const articleElem: any = useRef(null);

  // IF THE PAGE IS NAVIGATED TO FROM A DIFFERNT PAGE
  useEffect(() => {
    if (window.location.hash) {
      setScrollToArticle(true);
    } else {
      scrollTop();
    }
  }, [window.location.hash]);

  // SCROLL TO ARTICLE ON BUTTON CLICK
  useEffect(() => {
    if (scrollToArticle && articleElem && articleElem.current) {
      articleElem.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [scrollToArticle]);

  return (
    <div>
      <Banner />
      <Cards />
      <Article articleExpanded={scrollToArticle} articleRef={articleElem} />
    </div>
  );
};

export default Contact;
