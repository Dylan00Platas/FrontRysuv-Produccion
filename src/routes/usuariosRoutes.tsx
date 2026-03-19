import { RouteObject } from "react-router-dom";
import CrearUsuario from "@/features/usuarios/CrearUsuario";
import EditarUsuario from "@/features/usuarios/EditarUsuario";
import Usuarios from "@/features/usuarios/Usuarios";
import MainLayout from "@/layout/main-layout/main-layout";

const usuariosRoutes: RouteObject[] = [
  { path: "/usuarios", element: <Usuarios /> },
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
