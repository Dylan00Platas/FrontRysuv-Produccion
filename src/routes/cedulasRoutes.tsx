import { RouteObject } from "react-router-dom";
import { lazy } from "react";
import MainLayout from "@/layout/main-layout/main-layout";

const Cedulas = lazy(() => import("@/features/cedulas/Cedulas"));
const CrearCedulaInterna = lazy(
  () => import("@/features/cedulas/CrearCedulaInterna"),
);
const CrearConstancia = lazy(
  () => import("@/features/cedulas/CrearConstancia"),
);

const cedulasRoutes: RouteObject[] = [
  {
    path: "/cedulas",
    element: (
      <MainLayout>
        <Cedulas />
      </MainLayout>
    ),
  },
  {
    path: "/crear-cedula",
    element: (
      <MainLayout>
        <CrearConstancia />
      </MainLayout>
    ),
  },
  {
    path: "/crear-cedula-interna",
    element: (
      <MainLayout>
        <CrearCedulaInterna />
      </MainLayout>
    ),
  },
];

export default cedulasRoutes;
