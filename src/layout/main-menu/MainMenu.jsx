import { useEffect, useRef, useState, useContext } from "react";
import "./MainMenu.css";
import uvBlanco from "@/assets/uvBlanco.png";
import Sidebar from "@/layout/sidebar/Sidebar.jsx";
import UserContext from "@/utils/UserContext.jsx";

export function MainMenu() {
  const logoRef = useRef(null);
  const { currentUser } = useContext(UserContext); // TODO
  const [isBouncing, setIsBouncing] = useState(false);

  const [pos, setPos] = useState({ x: 200, y: 200 });
  const dirRef = useRef({ dx: 2, dy: 2 });

  useEffect(() => {
    if (!isBouncing) return;

    const move = () => {
      const { dx, dy } = dirRef.current;

      setPos((prev) => {
        const logo = logoRef.current;
        if (!logo) return prev;

        let newX = prev.x + dx;
        let newY = prev.y + dy;

        const logoRect = logo.getBoundingClientRect();
        const maxX = window.innerWidth - logoRect.width;
        const maxY = window.innerHeight - logoRect.height;

        if (newX <= 0 || newX >= maxX) dirRef.current.dx *= -1;
        if (newY <= 0 || newY >= maxY) dirRef.current.dy *= -1;

        return {
          x: Math.min(Math.max(newX, 0), maxX),
          y: Math.min(Math.max(newY, 0), maxY),
        };
      });
    };

    const interval = setInterval(move, 10);
    return () => clearInterval(interval);
  }, [isBouncing]);

  const handleDoubleClick = () => {
    setIsBouncing(true);

    if (logoRef.current) {
      logoRef.current.style.transition = "transform 0.3s ease";
      logoRef.current.style.transform = "scale(0.7)";
      setTimeout(() => {
        if (logoRef.current) logoRef.current.style.transition = "";
      }, 300);
    }
  };

  if (!currentUser) return <div>Cargando usuario...</div>;

  return (
    <div className="flex size-full bg-white fixed top-0 left-0">
      <main className="contenido">
        <Sidebar tipoAcceso={currentUser.FKidTipoAcceso} />
        <div className="logo-container">
          <img
            ref={logoRef}
            src={uvBlanco}
            alt="Logo UV"
            className={`logo ${isBouncing ? "bouncing" : ""}`}
            onDoubleClick={handleDoubleClick}
            style={{
              position: isBouncing ? "fixed" : "static",
              left: isBouncing ? pos.x : "auto",
              top: isBouncing ? pos.y : "auto",
            }}
          />
          <div className="logo-texts">
            <p className="linea1">Secretaría de Administración y Finanzas</p>
            <p className="linea2">Dirección General de Recursos Humanos</p>
            <p className="linea3">
              Departamento de Evaluación y Desarrollo de Personal
            </p>
            <p className="linea3">
              Oficina de Evaluación y Proyectos de Recursos Humanos
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MainMenu;
