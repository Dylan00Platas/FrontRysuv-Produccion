import {
  FaAddressCard,
  FaChartBar,
  FaEnvelope,
  FaSearch,
  FaUser,
  FaGlobeAmericas,
  FaRegCalendarAlt,
  FaTasks,
} from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";
import { MdAddBox, MdAssignment } from "react-icons/md";
import { useNavigate } from "react-router-dom";

import "./Sidebar.css";
import uvBlanco from "@/assets/uvBlanco.png";

export function Sidebar() {
  const tipoAcceso: number = 1;
  const navigate = useNavigate();

  const irPanorama = () => navigate("/panorama");
  const irUsuarios = () => navigate("/usuarios");
  const irProcesos = () => navigate("/procesos");
  const irIniciarSolicitud = () => navigate("/iniciar-solicitud");
  const irNoBeneficiados = () => navigate("/no-beneficiados");
  const irEstadisticas = () => navigate("/estadisticas");
  const irSolicitudes = () => navigate("/solicitudes");
  const irCedulas = () => navigate("/cedulas");
  const irMenu = () => navigate("/menu");
  const irAgenda = () => navigate("/agenda");
  const irSeguimientoHermes = () => navigate("/seguimiento-hermes");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  return (
    <aside className="sidebar">
      <button
        className="tituloRyS-contenedor"
        onClick={irMenu}
        aria-label="Abrir menú de RySUV"
      >
        <h2 className="tituloRyS">RySUV</h2>
        <img src={uvBlanco} alt="Logo Universidad" className="logoUV" />
      </button>

      <div className="subtextos"></div>

      <ul>
        {/* TODO-Desarrollo: Mejorar lógica para mostrar opciones, es poco seguro.*/}
        {/* === tipoAcceso 1: Todos los botones === */}
        {tipoAcceso === 1 && (
          <>
            <li onClick={irIniciarSolicitud}>
              <MdAddBox className="icon" /> Iniciar Solicitud
            </li>
            <li onClick={irSolicitudes}>
              <FaEnvelope className="icon" /> Ver Solicitudes
            </li>
            <li onClick={irProcesos}>
              <FaSearch className="icon" /> Evaluaciones
            </li>
            <li onClick={irCedulas}>
              <MdAssignment className="icon" /> Cédulas
            </li>
            <li onClick={irEstadisticas}>
              <FaChartBar className="icon" /> Estadísticas
            </li>
            <li onClick={irPanorama}>
              <FaGlobeAmericas className="icon" /> Panorama
            </li>
            <li onClick={irNoBeneficiados}>
              <FaAddressCard className="icon" /> No Beneficiados
            </li>
            <li onClick={irUsuarios}>
              <FaUser className="icon" /> Usuarios
            </li>
            <li onClick={irAgenda}>
              <FaRegCalendarAlt className="icon" /> Agenda
            </li>
            <li onClick={irSeguimientoHermes}>
              <FaTasks className="icon" /> Seguimiento Hermes
            </li>
          </>
        )}

        {/* === tipoAcceso 2: Solo Cédulas, Procesos y Menú === */}
        {tipoAcceso === 2 && (
          <>
            <li onClick={irProcesos}>
              <FaSearch className="icon" /> Evaluaciones
            </li>
            <li onClick={irCedulas}>
              <MdAssignment className="icon" /> Cédulas
            </li>
            <li onClick={irNoBeneficiados}>
              <FaAddressCard className="icon" /> No Beneficiados
            </li>
          </>
        )}

        {/* === tipoAcceso 3: Todos excepto Usuarios === */}
        {tipoAcceso === 3 && (
          <>
            <li onClick={irIniciarSolicitud}>
              <MdAddBox className="icon" /> Iniciar Solicitud
            </li>
            <li onClick={irSolicitudes}>
              <FaEnvelope className="icon" /> Ver Solicitudes
            </li>
            <li onClick={irProcesos}>
              <FaSearch className="icon" /> Evaluaciones
            </li>
            <li onClick={irCedulas}>
              <MdAssignment className="icon" /> Cédulas
            </li>
            <li onClick={irEstadisticas}>
              <FaChartBar className="icon" /> Estadísticas
            </li>
            <li onClick={irNoBeneficiados}>
              <FaAddressCard className="icon" /> No Beneficiados
            </li>
            <li onClick={irPanorama}>
              <FaGlobeAmericas className="icon" /> Panorama
            </li>
            <li onClick={irAgenda}>
              <FaRegCalendarAlt className="icon" /> Agenda
            </li>
            <li onClick={irSeguimientoHermes}>
              <FaTasks className="icon" /> Seguimiento Hermes
            </li>
          </>
        )}

        {tipoAcceso === 4 && (
          <>
            <li onClick={irPanorama}>
              <FaGlobeAmericas className="icon" /> Panorama
            </li>

            <li onClick={irIniciarSolicitud}>
              <MdAddBox className="icon" /> Iniciar Solicitud
            </li>
            <li onClick={irSolicitudes}>
              <FaEnvelope className="icon" /> Ver Solicitudes
            </li>
            <li onClick={irProcesos}>
              <FaSearch className="icon" /> Evaluaciones
            </li>
            <li onClick={irCedulas}>
              <MdAssignment className="icon" /> Cédulas
            </li>
            <li onClick={irEstadisticas}>
              <FaChartBar className="icon" /> Estadísticas
            </li>
            <li onClick={irNoBeneficiados}>
              <FaAddressCard className="icon" /> No Beneficiados
            </li>
            <li onClick={irSeguimientoHermes}>
              <FaTasks className="icon" /> Seguimiento Hermes
            </li>
          </>
        )}
      </ul>

      <button className="logout" onClick={handleLogout}>
        <IoLogOutOutline className="icon" /> Cerrar Sesión
      </button>
    </aside>
  );
}

export default Sidebar;
