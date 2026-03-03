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

import Agenda from "./features/agenda/Agenda.jsx";
import Cedulas from "./features/cedulas/Cedulas.jsx";
import CrearCedulaInterna from "./features/cedulas/CrearCedulaInterna.jsx";
import CrearConstancia from "./features/cedulas/CrearConstancia.jsx";
import Estadisticas from "./features/estadisticas/Estadisticas.jsx";
import GenerarOficio from "./features/oficios/GenerarOficio.jsx";
import VerDetallesOficio from "./features/oficios/VerDetallesOficio.jsx";
import VerOficios from "./features/oficios/VerOficios.jsx";
import CandidatoNoBeneficiado from "./features/no-beneficiados/CandidatoNoBeneficiado.jsx";
import NoBeneficiados from "./features/no-beneficiados/NoBeneficiados.jsx";
import Panorama from "./features/panorama/Panorama.jsx";
import Evaluacion from "./features/procesos/Evaluacion.jsx";
import Procesos from "./features/procesos/Procesos.jsx";
import SeguimientoHermes from "./features/seguimiento-hermes/SeguimientoHermes.jsx";
import AsignarSolicitud from "./features/solicitudes/AsignarSolicitud.jsx";
import IniciarSolicitud from "./features/solicitudes/IniciarSolicitud.jsx";
import Solicitudes from "./features/solicitudes/Solicitudes.jsx";
import CrearUsuario from "./features/usuarios/CrearUsuario.jsx";
import EditarUsuario from "./features/usuarios/EditarUsuario.jsx";
import Usuarios from "./features/usuarios/Usuarios.jsx";
import { Login } from "@/pages/login/Login";
import { MainMenu } from "@/layout/main-menu/MainMenu";

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
        <Route path="/crear-usuario" element={<CrearUsuario />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/iniciar-solicitud" element={<IniciarSolicitud />} />
        <Route path="/crear-cedula" element={<CrearConstancia />} />
        <Route path="/no-beneficiados" element={<NoBeneficiados />} />
        <Route
          path="/candidato-no-beneficiado"
          element={<CandidatoNoBeneficiado />}
        />
        <Route path="/evaluacion" element={<Evaluacion />} />
        <Route path="/crear-cedula-interna" element={<CrearCedulaInterna />} />
        <Route path="/estadisticas" element={<Estadisticas />} />
        <Route path="/asignar-solicitud" element={<AsignarSolicitud />} />
        <Route path="/procesos" element={<Procesos />} />
        <Route path="/solicitudes" element={<Solicitudes />} />
        <Route path="/cedulas" element={<Cedulas />} />
        <Route path="/editar-usuario" element={<EditarUsuario />} />
        <Route path="/panorama" element={<Panorama />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/generar-oficio" element={<GenerarOficio />} />
        <Route path="/ver-oficios" element={<VerOficios />} />
        <Route path="/ver-detalles-oficio" element={<VerDetallesOficio />} />
        <Route path="/seguimiento-hermes" element={<SeguimientoHermes />} />
      </Routes>
    </AnimatePresence>
  );
}

export default AppRoutes;
