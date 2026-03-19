// routes/otrosRoutes.tsx
import { RouteObject } from "react-router-dom";
import CandidatoNoBeneficiado from "@/features/no-beneficiados/CandidatoNoBeneficiado";
import NoBeneficiados from "@/features/no-beneficiados/NoBeneficiados";
import Evaluacion from "@/features/procesos/Evaluacion";
import Procesos from "@/features/procesos/Procesos";
import SeguimientoHermes from "@/features/seguimiento-hermes/SeguimientoHermes";
import MainLayout from "@/layout/main-layout/main-layout";

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
