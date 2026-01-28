import { useEffect, useRef, useState,useContext } from "react";
import Sidebar from "./Componentes/Sidebar.jsx";
import "./MenuPrincipal.css";
import { UsuarioContext } from "./Auxiliares/UsuarioContext.jsx"; 

function MenuPrincipal() {
  const logoRef = useRef(null);
  const { usuario } = useContext(UsuarioContext); 
  const [isBouncing, setIsBouncing] = useState(false);

  const [pos, setPos] = useState({ x: 200, y: 200 });
  const [dir, setDir] = useState({ dx: 2, dy: 2 });





  useEffect(() => {
    if (!isBouncing) return;

    const move = () => {
      setPos((prev) => {
        let newX = prev.x + dir.dx;
        let newY = prev.y + dir.dy;

        const logo = logoRef.current;
        if (!logo) return prev;

        const logoRect = logo.getBoundingClientRect();

        const maxX = window.innerWidth - logoRect.width;
        const maxY = window.innerHeight - logoRect.height;

        let newDx = dir.dx;
        let newDy = dir.dy;

        if (newX <= 0 || newX >= maxX) newDx = -newDx;
        if (newY <= 0 || newY >= maxY) newDy = -newDy;

        setDir({ dx: newDx, dy: newDy });

        return {
          x: Math.min(Math.max(newX, 0), maxX),
          y: Math.min(Math.max(newY, 0), maxY),
        };
      });
    };

    const interval = setInterval(move, 10);
    return () => clearInterval(interval);
  }, [isBouncing, dir]);

  const handleDoubleClick = () => {
    setIsBouncing(true);

    if (logoRef.current) {
      logoRef.current.style.transition = "transform 0.3s ease";
      logoRef.current.style.transform = "scale(0.7)";
      setTimeout(() => {
        logoRef.current.style.transition = "";
      }, 300);
    }
  };

    if (!usuario) return <div>Cargando usuario...</div>;

return (
    <div className="menu-principal-page">
      <main className="contenido">
        <Sidebar tipoAcceso={usuario.FKidTipoAcceso} />
        <div className="logo-container">
          <img
            ref={logoRef}
            src="/recursos/Logo.png"
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
            <p className="linea3">Departamento de Evaluación y Desarrollo de Personal</p>
            <p className="linea3">Oficina de Evaluación y Proyectos de Recursos Humanos</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MenuPrincipal;
