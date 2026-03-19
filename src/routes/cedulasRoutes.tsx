import { RouteObject } from "react-router-dom";
import Cedulas from "@/features/cedulas/Cedulas";
import CrearCedulaInterna from "@/features/cedulas/CrearCedulaInterna";
import CrearConstancia from "@/features/cedulas/CrearConstancia";
import MainLayout from "@/layout/main-layout/main-layout";

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
