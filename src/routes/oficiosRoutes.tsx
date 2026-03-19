import { RouteObject } from "react-router-dom";
import { lazy } from "react";
import MainLayout from "@/layout/main-layout/main-layout";

const GenerarOficio = lazy(() => import("@/features/oficios/GenerarOficio"));
const VerDetallesOficio = lazy(
  () => import("@/features/oficios/VerDetallesOficio"),
);
const VerOficios = lazy(() => import("@/features/oficios/VerOficios"));

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
