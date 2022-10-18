import React from "react";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, Slide } from "react-toastify";
import Router from "./routes";
import GlobalStyle from "./styles/GlobalStyles";
import { AppContextProvider } from "./contexts/global";

const App = () => {
  return (
    <div className="App">
      <GlobalStyle />
      <ToastContainer
        position="bottom-right"
        autoClose={2500}
        hideProgressBar
        closeOnClick
        rtl={false}
        draggable
        pauseOnHover
        transition={Slide}
      />
      <AppContextProvider>
        <Router />
      </AppContextProvider>
    </div>
  );
};

export default App;
