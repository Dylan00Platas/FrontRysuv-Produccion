import { RouteObject } from "react-router-dom";
import { lazy } from "react";
import MainLayout from "@/layout/MainLayout";

const AsignarSolicitud = lazy(
	() => import("@/features/solicitudes/AsignarSolicitud"),
);
const IniciarSolicitud = lazy(
	() => import("@/features/solicitudes/IniciarSolicitud"),
);
const Solicitudes = lazy(() => import("@/features/solicitudes/Solicitudes"));

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
