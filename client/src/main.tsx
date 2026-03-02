import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Layout from "components/Navigation/Layout";
import Dashboard from "pages/Dashboard";
import Fleet from "pages/Fleet";
import Ship from "pages/Ship";
import Map from "pages/Map";
import SelectAgent from "pages/SelectAgent";
import RequireAgent from "components/Auth";

import "./index.css";
import ContractsPage from "pages/Contracts";

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
                element: <Dashboard />,
            },
            {
                path: "/fleet",
                element: <Fleet />,
            },
            {
                path: "/fleet/:shipSymbol",
                element: <Ship />,
            },
            {
                path: "/contracts",
                element: <ContractsPage />,
            },
            {
                path: "/map",
                element: <Map />,
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
