import { RouteObject } from "react-router-dom";
import { lazy } from "react";
import MainLayout from "@/layout/main-layout/main-layout";

const Panorama = lazy(() => import("@/features/panorama/Panorama"));
const Estadisticas = lazy(() => import("@/features/estadisticas/Estadisticas"));

const seguimientoRoutes: RouteObject[] = [
  {
    path: "/estadisticas",
    element: (
      <MainLayout>
        <Estadisticas />
      </MainLayout>
    ),
  },
  {
    path: "/panorama",
    element: (
      <MainLayout>
        <Panorama />
      </MainLayout>
    ),
  },
];

export default seguimientoRoutes;
