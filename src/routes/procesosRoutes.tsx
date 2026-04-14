import { RouteObject } from "react-router-dom";
import { lazy } from "react";
import MainLayout from "@/layout/MainLayout";

const CandidatoNoBeneficiado = lazy(
	() => import("@/features/no-beneficiados/CandidatoNoBeneficiado"),
);
const NoBeneficiados = lazy(
	() => import("@/features/no-beneficiados/NoBeneficiados"),
);
const Evaluacion = lazy(() => import("@/features/procesos/Evaluacion"));
const Procesos = lazy(() => import("@/features/procesos/Procesos"));
const SeguimientoHermes = lazy(
	() => import("@/features/seguimiento-hermes/SeguimientoHermes"),
);

const procesosRoutes: RouteObject[] = [
	{
		path: "/procesos",
		element: (
			<MainLayout>
				<Procesos />
			</MainLayout>
		),
	},
	{
		path: "/evaluacion",
		element: (
			<MainLayout>
				<Evaluacion />
			</MainLayout>
		),
	},
	{
		path: "/no-beneficiados",
		element: (
			<MainLayout>
				<NoBeneficiados />
			</MainLayout>
		),
	},
	{
		path: "/candidato-no-beneficiado",
		element: (
			<MainLayout>
				<CandidatoNoBeneficiado />
			</MainLayout>
		),
	},
	{
		path: "/seguimiento-hermes",
		element: (
			<MainLayout>
				<SeguimientoHermes />
			</MainLayout>
		),
	},
];

export default procesosRoutes;
