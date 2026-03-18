/**
 * TODO-Desarrollo: Lazy loading
 *    const Agenda = lazy(() => import("./features/Agenda/Agenda.jsx"));
 * TODO-Desarrollo: Verificar protección de rutas por usuario.
 *    <Route element={<PrivateRoute />}>
 *      <Route path="/menu" element={<MenuPrincipal />} />
 *    </Route>
 */

import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";

import Agenda from "./features/agendas/Agenda";
import Cedulas from "./features/cedulas/Cedulas.jsx";
import CrearCedulaInterna from "./features/cedulas/CrearCedulaInterna.jsx";
import CrearConstancia from "./features/cedulas/CrearConstancia";
import Estadisticas from "./features/estadisticas/Estadisticas.jsx";
import GenerarOficio from "./features/oficios/GenerarOficio.jsx";
import VerDetallesOficio from "./features/oficios/VerDetallesOficio.js";
import VerOficios from "./features/oficios/VerOficios.js";
import CandidatoNoBeneficiado from "./features/no-beneficiados/CandidatoNoBeneficiado";
import NoBeneficiados from "./features/no-beneficiados/NoBeneficiados.js";
import Panorama from "./features/panorama/Panorama";
import Evaluacion from "./features/procesos/Evaluacion";
import Procesos from "./features/procesos/Procesos.js";
import SeguimientoHermes from "./features/seguimiento-hermes/SeguimientoHermes.jsx";
import AsignarSolicitud from "./features/solicitudes/AsignarSolicitud";
import IniciarSolicitud from "./features/solicitudes/IniciarSolicitud";
import Solicitudes from "./features/solicitudes/Solicitudes";
import CrearUsuario from "./features/usuarios/CrearUsuario";
import EditarUsuario from "./features/usuarios/EditarUsuario";
import Usuarios from "./features/usuarios/Usuarios.js";
import { Login } from "@/pages/login/Login";
import { MainMenu } from "@/layout/main-menu/MainMenu";
import MainLayout from "./layout/main-layout/main-layout";

function AppRoutes() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Login />} />
        <Route path="/menu" element={<MainMenu />} />
        <Route
          path="/agenda"
          element={
            <MainLayout>
              <Agenda />
            </MainLayout>
          }
        />
        <Route
          path="/cedulas"
          element={
            <MainLayout>
              <Cedulas />
            </MainLayout>
          }
        />
        <Route 
          path="/crear-usuario" 
          element={
            <MainLayout>
              <CrearUsuario />
            </MainLayout>
          } 
        />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route 
          path="/iniciar-solicitud" 
          element={
            <MainLayout>
              <IniciarSolicitud />
            </MainLayout>
          } />
        <Route path="/crear-cedula" element={<CrearConstancia />} />
        <Route path="/no-beneficiados" element={<NoBeneficiados />} />
        <Route
          path="/candidato-no-beneficiado"
          element={<CandidatoNoBeneficiado />}
        />
        <Route 
          path="/evaluacion" 
          element={
            <MainLayout>
              <Evaluacion />
            </MainLayout>
        } />
        <Route path="/crear-cedula-interna" element={<CrearCedulaInterna />} />
        <Route path="/estadisticas" element={<Estadisticas />} />
        <Route path="/asignar-solicitud" element={<AsignarSolicitud />} />
        <Route 
          path="/procesos" 
          element={
            <MainLayout>
              <Procesos />
            </MainLayout>
        } />
        <Route path="/solicitudes" element={<Solicitudes />} />
        <Route 
          path="/editar-usuario" 
          element={
            <MainLayout>
              <EditarUsuario />
            </MainLayout>
          }/>
        <Route path="/panorama" element={<Panorama />} />
        <Route path="/generar-oficio" element={<GenerarOficio />} />
        <Route path="/ver-oficios" element={<VerOficios />} />
        <Route path="/ver-detalles-oficio" element={<VerDetallesOficio />} />
        <Route 
          path="/seguimiento-hermes" 
          element={
            <MainLayout>
              <SeguimientoHermes />
            </MainLayout>
        }/>
      </Routes>
    </AnimatePresence>
  );
}

export default AppRoutes;
