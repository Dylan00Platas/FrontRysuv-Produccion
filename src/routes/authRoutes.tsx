import Login from "@/pages/login/Login";
import { RouteObject } from "react-router-dom";

const authRoutes: RouteObject[] = [
  {
    path: "/",
    element: <Login />,
  },
];

export default authRoutes;
