import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";

import AppRoutes from "./routes/AppRoutes.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppRoutes />
    <Toaster position="top-right" />
  </React.StrictMode>,
);
