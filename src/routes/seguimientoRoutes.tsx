import { RouteObject } from "react-router-dom";
import Panorama from "@/features/panorama/Panorama";
import Estadisticas from "@/features/estadisticas/Estadisticas";
import MainLayout from "@/layout/main-layout/main-layout";

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
