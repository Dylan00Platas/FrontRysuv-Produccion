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

import uvBlanco from "@/assets/uvBlanco.png";

interface SidebarProps {
  tipoAcceso: number;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  delay?: string;
}

function NavItem({ icon, label, onClick, delay = "0s" }: NavItemProps) {
  return (
    <li
      onClick={onClick}
      style={{ animationDelay: delay }}
      className="
        group relative flex items-center gap-[0.7rem]
        px-[0.8rem] py-[0.6rem] rounded-lg mb-0.5
        cursor-pointer text-[clamp(0.8rem,1vw,0.9rem)] font-light tracking-[0.015em]
        text-[rgba(220,235,255,0.78)] overflow-hidden
        opacity-0 animate-[fadeSlideIn_0.35s_forwards]
        transition-[background,color] duration-200 ease-in-out
        hover:bg-[rgba(77,159,255,0.13)] hover:text-white
        active:bg-[rgba(77,159,255,0.22)] active:scale-[0.985]
      "
    >
      {/* Accent bar izquierda */}
      <span
        className="
          absolute left-0 top-[20%] bottom-[20%] w-0.75 rounded-r-[3px]
          bg-[#4d9fff] opacity-0
          transition-opacity duration-200 ease-in-out
          group-hover:opacity-100
        "
      />

      {/* Ícono */}
      <span
        className="
          text-[clamp(0.9rem,1.1vw,1rem)] text-[#ff9a9a] shrink-0
          transition-[color,transform] duration-200 ease-in-out
          group-hover:text-[#7ec8ff] group-hover:scale-[1.15]
        "
      >
        {icon}
      </span>

      {label}
    </li>
  );
}

// ─── Mapa de rutas por tipoAcceso ─────────────────────────────────────────────

function useNavItems(
  tipoAcceso: number,
  navigate: ReturnType<typeof useNavigate>,
) {
  const go = (path: string) => () => navigate(path);

  const todos = [
    {
      icon: <MdAddBox />,
      label: "Iniciar Solicitud",
      path: "/iniciar-solicitud",
    },
    { icon: <FaEnvelope />, label: "Ver Solicitudes", path: "/solicitudes" },
    { icon: <FaSearch />, label: "Evaluaciones", path: "/procesos" },
    { icon: <MdAssignment />, label: "Cédulas", path: "/cedulas" },
    { icon: <FaChartBar />, label: "Estadísticas", path: "/estadisticas" },
    { icon: <FaGlobeAmericas />, label: "Panorama", path: "/panorama" },
    {
      icon: <FaAddressCard />,
      label: "No Beneficiados",
      path: "/no-beneficiados",
    },
    { icon: <FaUser />, label: "Usuarios", path: "/usuarios" },
    { icon: <FaRegCalendarAlt />, label: "Agenda", path: "/agenda" },
    {
      icon: <FaTasks />,
      label: "Seguimiento Hermes",
      path: "/seguimiento-hermes",
    },
  ];

  const sinUsuarios = todos.filter((i) => i.label !== "Usuarios");
  const sinUsuariosNiAgenda = sinUsuarios.filter((i) => i.label !== "Agenda");

  const mapAcceso: Record<number, typeof todos> = {
    1: todos,
    2: [
      { icon: <FaSearch />, label: "Evaluaciones", path: "/procesos" },
      { icon: <MdAssignment />, label: "Cédulas", path: "/cedulas" },
      {
        icon: <FaAddressCard />,
        label: "No Beneficiados",
        path: "/no-beneficiados",
      },
    ],
    3: sinUsuarios,
    4: sinUsuariosNiAgenda,
  };

  return (mapAcceso[tipoAcceso] ?? []).map((item) => ({
    ...item,
    onClick: go(item.path),
  }));
}

export function Sidebar({ tipoAcceso = 1 }: SidebarProps) {
  const navigate = useNavigate();
  const navItems = useNavItems(tipoAcceso, navigate);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  return (
    <aside
      className="
        bg-[#05163d] text-white absolute top-0 left-0 h-screen
        px-6 flex flex-col overflow-y-hidden overflow-x-hidden
        border-r border-[rgba(99,162,255,0.18)]
        shadow-[4px_0_32px_rgba(0,0,0,0.45),inset_-1px_0_0_rgba(255,255,255,0.04)]
        before:content-[''] before:absolute before:inset-0
        before:bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(24,82,200,0.35)_0%,transparent_70%),radial-gradient(ellipse_60%_30%_at_50%_100%,rgba(0,80,200,0.2)_0%,transparent_70%)]
        before:pointer-events-none before:z-0
      "
    >
      {/* ── Header / Logo ──────────────────────────────────────────────── */}
      <button
        onClick={() => navigate("/menu")}
        aria-label="Abrir menú de RySUV"
        className="
          group flex items-center justify-between relative
          px-[0.4rem] py-[0.8rem] w-full rounded-md
          bg-transparent hover:bg-white/5
          transition-[background,transform] duration-200
          hover:scale-[1.08]
        "
      >
        <h2 className="text-[2.3rem] text-white m-0 relative top-0 leading-none">
          RySUV
        </h2>
        <img
          src={uvBlanco}
          alt="Logo Universidad"
          className="
            h-[clamp(25px,4vw,40px)] w-auto object-contain
            drop-shadow-[0_0_2px_rgba(255,255,255,0.2)]
            transition-transform duration-[2s] linear
            group-hover:scale-[1.08]
          "
        />
      </button>

      <div className="relative px-[1.4rem] py-0 text-[0.7rem] font-light text-white/35 tracking-[0.08em] uppercase mb-[0.4rem]" />

      <ul className="list-none p-[0.6rem_0.7rem] m-0 grow relative z-1">
        {navItems.map((item, i) => (
          <NavItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            onClick={item.onClick}
            delay={`${0.05 + i * 0.05}s`}
          />
        ))}
      </ul>

      {/* ── Scrollbar (sólo webkit, no hay util de Tailwind) ───────────── */}
      <style>{`
        aside::-webkit-scrollbar { width: 4px; }
        aside::-webkit-scrollbar-track { background: transparent; }
        aside::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
        aside::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.22); }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        @media (max-height: 700px) {
          aside ul li { padding: 0.45rem 0.8rem; margin-bottom: 1px; }
        }
      `}</style>

      <button
        onClick={handleLogout}
        className="
          relative bg-transparent border-none
          border-t border-white/[0.07]
          text-[rgba(220,235,255,0.6)] text-[clamp(0.8rem,1vw,0.9rem)]
          font-light cursor-pointer flex items-center gap-[0.7rem]
          px-[1.4rem] py-4 w-full tracking-[0.015em]
          transition-[background,color] duration-200
          hover:bg-[rgba(255,100,100,0.1)] hover:text-[#ff9a9a]
        "
      >
        <IoLogOutOutline className="text-[#ff9a9a] text-base shrink-0 transition-[color,transform] duration-200 group-hover:text-[#7ec8ff] group-hover:scale-[1.15]" />
        Cerrar Sesión
      </button>
    </aside>
  );
}

export default Sidebar;
