import { RouteObject } from "react-router-dom";
import { Login } from "@/pages/login/Login";
import { MainMenu } from "@/layout/main-menu/MainMenu";
import MainLayout from "@/layout/main-layout/main-layout";

const authRoutes: RouteObject[] = [
  { path: "/", element: <Login /> },
  { path: "", element: <Login /> },
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
