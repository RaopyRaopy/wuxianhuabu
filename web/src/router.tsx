import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import UserLayout from "@/layouts/user-layout";
import HomePage from "@/pages/home";
import AssetsPage from "@/pages/assets";
import ImagePage from "@/pages/image";
import VideoPage from "@/pages/video";

export const router = createBrowserRouter([
    {
        element: (
            <UserLayout>
                <Outlet />
            </UserLayout>
        ),
        children: [
            { path: "/", element: <HomePage /> },
            { path: "/video", element: <VideoPage /> },
            { path: "/image", element: <ImagePage /> },
            { path: "/assets", element: <AssetsPage /> },
            { path: "*", element: <Navigate to="/video" replace /> },
        ],
    },
]);
