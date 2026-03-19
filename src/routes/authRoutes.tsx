import { RouteObject } from "react-router-dom";
import { lazy } from "react";
import MainLayout from "@/layout/main-layout/main-layout";

const MainMenu = lazy(() => import("@/layout/main-menu/MainMenu"));

const authRoutes: RouteObject[] = [
  {
    path: "/menu",
    element: (
      <MainLayout>
        <MainMenu />
      </MainLayout>
    ),
  },
];

export default authRoutes;
