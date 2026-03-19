import { RouteObject } from "react-router-dom";
import AsignarSolicitud from "@/features/solicitudes/AsignarSolicitud";
import IniciarSolicitud from "@/features/solicitudes/IniciarSolicitud";
import Solicitudes from "@/features/solicitudes/Solicitudes";
import MainLayout from "@/layout/main-layout/main-layout";

const solicitudesRoutes: RouteObject[] = [
  {
    path: "/solicitudes",
    element: (
      <MainLayout>
        <Solicitudes />
      </MainLayout>
    ),
  },
  {
    path: "/iniciar-solicitud",
    element: (
      <MainLayout>
        <IniciarSolicitud />
      </MainLayout>
    ),
  },
  {
    path: "/asignar-solicitud",
    element: (
      <MainLayout>
        <AsignarSolicitud />
      </MainLayout>
    ),
  },
];

export default solicitudesRoutes;
