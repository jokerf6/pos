import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/globals.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import store from "./store";
import { RoutesLayout } from "./layouts/index.layout";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <RoutesLayout>
        <App />
      </RoutesLayout>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
