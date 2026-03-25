import { RouteObject } from "react-router-dom";
import { lazy } from "react";
import MainLayout from "@/layout/main-layout/main-layout";

const CrearUsuario = lazy(() => import("@/features/usuarios/CrearUsuario"));
const EditarUsuario = lazy(() => import("@/features/usuarios/EditarUsuario"));
const Usuarios = lazy(() => import("@/features/usuarios/Usuarios"));

const usuariosRoutes: RouteObject[] = [
  {
    path: "/usuarios",
    element: (
      <MainLayout>
        <Usuarios />
      </MainLayout>
    ),
  },
  {
    path: "/crear-usuario",
    element: (
      <MainLayout>
        <CrearUsuario />
      </MainLayout>
    ),
  },
  {
    path: "/editar-usuario",
    element: (
      <MainLayout>
        <EditarUsuario />
      </MainLayout>
    ),
  },
];

export default usuariosRoutes;
