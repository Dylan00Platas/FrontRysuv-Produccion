import { Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import './App.css';
import { AnimatePresence } from "framer-motion";
import Cedulas from "./Cedulas/Cedulas";
import CrearCedulaInterna from "./Cedulas/CrearCedulaInterna";
import CrearConstancia from "./Cedulas/CrearConstancia";
import Estadisticas from "./Estadisticas/Estadisticas";
import InicioSesion from './InicioSesion';
import './InicioSesion.css';
import MenuPrincipal from "./MenuPrincipal";
import CandidatoNoBeneficiado from "./No Beneficiados/CandidatoNoBeneficiado";
import NoBeneficiados from "./No Beneficiados/NoBeneficiados";
import Evaluacion from "./Procesos/Evaluacion";
import Procesos from "./Procesos/Procesos";
import AsignarSolicitud from "./Solicitud/AsignarSolicitud";
import IniciarSolicitud from "./Solicitud/IniciarSolicitud";
import Solicitudes from "./Solicitud/Solicitudes";
import CrearUsuario from './Usuarios/CrearUsuario';
import EditarUsuario from "./Usuarios/EditarUsuario";
import Agenda from "./Agenda/Agenda.jsx";
import Usuarios from "./Usuarios/Usuarios";
import { UsuarioProvider } from "./Auxiliares/UsuarioContext.jsx";
import { useEffect } from "react";
import Panorama from "./Panorama/Panorama.jsx";

function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); // 💡 asegura que cada nueva página empiece desde arriba
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<InicioSesion />} />
        <Route path="/menu" element={<MenuPrincipal />} />
        <Route path="/crear-usuario" element={<CrearUsuario />} /> 
        <Route path="/usuarios" element={<Usuarios />} /> 
        <Route path="/iniciar-solicitud" element={<IniciarSolicitud />} /> 
        <Route path="/crear-cedula" element={<CrearConstancia />} />
        <Route path="/no-beneficiados" element={<NoBeneficiados />} />
        <Route path="/candidato-no-beneficiado" element={<CandidatoNoBeneficiado />} />
        <Route path="/evaluacion" element={<Evaluacion />} />
        <Route path="/crear-cedula-interna" element={<CrearCedulaInterna />} />
        <Route path="/estadisticas" element={<Estadisticas />} />
        <Route path="/asignar-solicitud" element={<AsignarSolicitud />} />
        <Route path="/procesos" element={<Procesos />} />
        <Route path="/solicitudes" element={<Solicitudes />} />
        <Route path="/cedulas" element={<Cedulas />} />
        <Route path="/editar-usuario" element={<EditarUsuario />} />
        <Route path="/panorama" element={<Panorama />} />
        <Route path="/agenda" element={<Agenda/>} />


      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <UsuarioProvider> 
      <Router>
        <AnimatedRoutes />
      </Router>
    </UsuarioProvider>
  );
}

export default App;
