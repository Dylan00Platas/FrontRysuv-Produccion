import { RouteObject } from "react-router-dom";
import GenerarOficio from "@/features/oficios/GenerarOficio";
import VerDetallesOficio from "@/features/oficios/VerDetallesOficio";
import VerOficios from "@/features/oficios/VerOficios";
import MainLayout from "@/layout/main-layout/main-layout";

const oficiosRoutes: RouteObject[] = [
  {
    path: "/generar-oficio",
    element: (
      <MainLayout>
        <GenerarOficio />
      </MainLayout>
    ),
  },
  {
    path: "/ver-oficios",
    element: (
      <MainLayout>
        <VerOficios />
      </MainLayout>
    ),
  },
  {
    path: "/ver-detalles-oficio",
    element: (
      <MainLayout>
        <VerDetallesOficio />
      </MainLayout>
    ),
  },
];

export default oficiosRoutes;
