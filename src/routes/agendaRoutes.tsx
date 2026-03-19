import { RouteObject } from "react-router-dom";
import Agenda from "@/features/agendas/Agenda";
import MainLayout from "@/layout/main-layout/main-layout";

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
