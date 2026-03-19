import { RouteObject } from "react-router-dom";
import { lazy } from "react";
import MainLayout from "@/layout/main-layout/main-layout";

const Agenda = lazy(() => import("@/features/agendas/Agenda"));

const agendaRoutes: RouteObject[] = [
  {
    path: "/agenda",
    element: (
      <MainLayout>
        <Agenda />
      </MainLayout>
    ),
  },
];

export default agendaRoutes;
