import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "./context/CartProvider";
import { NotificationProvider } from "./context/NotificationProvider";
import { AuthProvider } from "./auth/AuthProvider";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <NotificationProvider>
                    <CartProvider>
                        <App />
                    </CartProvider>
                </NotificationProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
