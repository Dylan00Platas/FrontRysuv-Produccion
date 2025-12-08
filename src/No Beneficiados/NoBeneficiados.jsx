import { useState,useEffect, useContext  } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import Sidebar from "../Componentes/Sidebar";
import './NoBeneficiados.css';
import NoBeneficiadoServicio from "../Servicios/NoBeneficiadoServicio.js";
import CatalogoDependencia from "../Auxiliares/CatalogoDependencia.js";
import { UsuarioContext } from "../Auxiliares/UsuarioContext.jsx";


function NoBeneficiados() {
  const navigate = useNavigate();
  const { usuario } = useContext(UsuarioContext);

  const [filtros, setFiltros] = useState({
    region: null,
    profesion: null,
    resultado: null
  });

  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    navigate("/");
  };

  useEffect(() => {
    const cargarDatos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (CatalogoDependencia.obtenerDependencias().length === 0) {
        await new CatalogoDependencia().cargarDependencias(token);
      }      
      const dependencias = CatalogoDependencia.obtenerDependencias();
      const procesos = await new NoBeneficiadoServicio().ObtenerTodosLosNoBeneficiados(token);      
      const mapeados = procesos.map(p => {
        const dep = CatalogoDependencia.obtenerZonaPorIdDependencia(p.FKIdDependencia);        
        const fechaEvaluacion = p.fechaEvaluacionCompetencias
          ? p.fechaEvaluacionCompetencias.split('T')[0]
          : '';


        return {
          id: p.idProcesoContratacion,
          nombre: p.nombreCandidato,
          profesion: p.categoriaPuestoOrigen || "Sin dato",
          resultado: p.resultadoProcesoEvaluacion || "Sin resultado",
          region: dep || 'Sin región',
          fechaEvaluacion ,
          numCarpeta: p.numCarpeta || ''
        };        
      });
      setCandidatos(mapeados);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };
  cargarDatos();
}, []);


  
  const regionOptions = [...new Set(candidatos.map(c => c.region))].map(r => ({ value: r, label: r }));
  const profesionOptions = [...new Set(candidatos.map(c => c.profesion))].map(p => ({ value: p, label: p }));
  const resultadoOptions = [...new Set(candidatos.map(c => c.resultado))].map(r => ({ value: r, label: r }));

  const candidatosFiltrados = candidatos.filter(c => {
    return (
      (!filtros.region || filtros.region.value === c.region) &&
      (!filtros.profesion || filtros.profesion.value === c.profesion) &&
      (!filtros.resultado || filtros.resultado.value === c.resultado)
    );
  });

  return (
    <div className="nobeneficiados-page">
<Sidebar tipoAcceso={usuario.FKidTipoAcceso} /> 
      {/* Main content */}
      <main className="main-content">
        

  <div className="page-header2">
        <h1 className="page-title2">No beneficiados</h1>
        </div>

       


<div className="contenido-candidatos-inner">

        {/* Filtros */}
        <div className="filtros-combobox">
          <div>
            <label>Región</label>
            <Select 
              options={regionOptions}
              value={filtros.region}
              onChange={(value) => setFiltros(prev => ({ ...prev, region: value }))}
              placeholder="Selecciona región..."
              isClearable
            />
          </div>

          <div>
            <label>Profesión</label>
            <Select 
              options={profesionOptions}
              value={filtros.profesion}
              onChange={(value) => setFiltros(prev => ({ ...prev, profesion: value }))}
              placeholder="Selecciona profesión..."
              isClearable
              isSearchable
            />
          </div>

          <div>
            <label>Resultado</label>
            <Select 
              options={resultadoOptions}
              value={filtros.resultado}
              onChange={(value) => setFiltros(prev => ({ ...prev, resultado: value }))}
              placeholder="Selecciona resultado..."
              isClearable
            />
          </div>
        </div>

        {/* Tabla */}
        <table className="tabla-candidatos">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Profesión</th>
              <th>Resultado</th>
              <th>Región</th>
            </tr>
          </thead>
          <tbody>
            {candidatosFiltrados.map(c => (
              <tr 
                key={c.id} 
                className="clickable-row"
                onClick={() => navigate("/candidato-no-beneficiado", { state: { candidato: c } })}
              >
                <td>{c.nombre}</td>
                <td>{c.profesion}</td>
                <td>{c.resultado}</td>
                <td>{c.region}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </main>
    </div>
  );
}

export default NoBeneficiados;

