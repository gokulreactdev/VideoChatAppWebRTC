import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import { SocketContextProvider } from "./SocketContext";

ReactDOM.render(
  <SocketContextProvider>
    <App />
  </SocketContextProvider>,
  document.getElementById("root"),
);
