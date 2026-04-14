import { RouteObject } from "react-router-dom";
import { lazy } from "react";
import MainLayout from "@/layout/MainLayout";

const MainMenu = lazy(() => import("@/pages/MainMenu"));

const authRoutes: RouteObject[] = [
	{
		path: "/menu",
		element: (
			<MainLayout>
				<MainMenu />
			</MainLayout>
		),
	},
];

export default authRoutes;
