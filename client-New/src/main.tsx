import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Layout from "components/Navigation/Layout";
import Home from "pages/Home";
import Fleet from "pages/Fleet";
import SelectAgent from "pages/SelectAgent";
import RequireAgent from "components/Auth/RequireAgent";

import "./index.css";

const router = createBrowserRouter([
    {
        element: (
            <RequireAgent>
                <Layout />
            </RequireAgent>
        ),
        children: [
            {
                path: "/",
                element: <Home />,
            },
            {
                path: "/fleet",
                element: <Fleet />,
            },
        ],
    },
    {
        path: "/select-agent",
        element: <SelectAgent />,
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={new QueryClient()}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    </StrictMode>,
);
