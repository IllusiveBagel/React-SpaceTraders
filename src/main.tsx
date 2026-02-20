import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Layout from "components/Layout";
import Home from "pages/Home";
import Fleet from "pages/Fleet";
import Contracts from "pages/Contracts";
import Systems from "pages/Systems";
import System from "pages/System";
import Ship from "pages/Ship";
import Automation from "pages/Automation";
import Market from "pages/Market";
import Shipyard from "pages/Shipyard";
import Map from "pages/Map";
import Waypoint from "pages/Waypoint";
import { AutomationProvider } from "automation/AutomationProvider";

import "./index.css";

const router = createBrowserRouter([
    {
        element: <Layout />,
        children: [
            {
                path: "/",
                element: <Home />,
            },
            {
                path: "/fleet",
                element: <Fleet />,
            },
            {
                path: "/contracts",
                element: <Contracts />,
            },
            {
                path: "/automation",
                element: <Automation />,
            },
            {
                path: "/market",
                element: <Market />,
            },
            {
                path: "/shipyard",
                element: <Shipyard />,
            },
            {
                path: "/map",
                element: <Map />,
            },
            {
                path: "/fleet/:shipSymbol",
                element: <Ship />,
            },
            {
                path: "/systems",
                element: <Systems />,
            },
            {
                path: "/systems/:systemSymbol",
                element: <System />,
            },
            {
                path: "/systems/:systemSymbol/waypoints/:waypointSymbol",
                element: <Waypoint />,
            },
        ],
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={new QueryClient()}>
            <AutomationProvider>
                <RouterProvider router={router} />
            </AutomationProvider>
        </QueryClientProvider>
    </StrictMode>,
);
