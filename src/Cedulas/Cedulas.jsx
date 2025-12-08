import { useEffect, useState,useContext } from "react";
import PageTransition from "../Componentes/PageTransition.jsx"; 
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import Sidebar from "../Componentes/Sidebar.jsx";
import CedulaServicio from "../Servicios/CedulaServicio.js";
import "./Cedulas.css";
import { motion } from "framer-motion";
import { UsuarioContext } from "../Auxiliares/UsuarioContext.jsx";
import GestionArchivos from "../Auxiliares/GestionArchivos.js";

function Cedulas() {
    const { usuario } = useContext(UsuarioContext); 
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const navigate = useNavigate();
  const [cedulas, setCedulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado de selección
  const [selectedCedulas, setSelectedCedulas] = useState([]);
  const [showCheckboxes, setShowCheckboxes] = useState(false);

  // Opciones de filtros
  const cedulaOptions = [
    { value: "Interna", label: "Interna" },
    { value: "Resultados", label: "Resultados" },
    { value: "Archivadas", label: "Archivadas" },
  ];

  const [dependenciaOptions, setDependenciaOptions] = useState([]);
  const [resultadoOptions, setResultadoOptions] = useState([]);

  // Estados de filtros
  const [cedulaFiltro, setCedulaFiltro] = useState(null);
  const [dependenciaFiltro, setDependenciaFiltro] = useState(null);
  const [resultadoFiltro, setResultadoFiltro] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Cargar datos desde la API
  useEffect(() => {
    const cargarCedulas = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const servicio = new CedulaServicio();
        const data = await servicio.obtenerTodasCedulasDisponibles(token);

        const cedulasNormalizadas = data.map((c) => ({
          idCedula: c.idCedula,
          folio: c.folio || "",
          hermesNotificacion: c.hermesNotificacion || "",
          candidato: c.nombreCandidato || "N/A",
          dependencia: c.nombreDependencia || "N/A",
          puesto: c.puesto || "N/A",
          resultado: c.resultado || "Pendiente",
          cedula: c.FKIdTipoCedula === 1 ? "Interna" : "Resultados",
          estado: c.estado || false,
          idProceso: c.idProceso,          
          numeroPlaza: c.numPlaza,
          referidoPor: c.referidoPor,
          antecedentesFamiliaresUV: c.antecedentesFamiliaresUV,
          resultadoHabilidadesWord: c.resultadoHabilidadesWord,
          resultadoOrtografia: c.resultadoOrtografia,
          resultadoHabilidadesExcelReal: c.resultadoHabilidadesExcel,
          resultadoEvaluacionConocimiento: c.resultadoEvaluacionConocimiento,
          expectativaLaboral: c.expectativaLaboral,   
          experiencia: c.experiencia,
          conclusiones: c.conclusiones,   
          FKIdClasificacionCedula: c.FKIdClasificacionCedula,  
          fechaElaboracionCedulaInterna: c.fechaCedulaInterna,
          psicometriaComunicacion: c.psicometriaComunicacion,
          psicometriaTrabajoEnEquipo: c.psicometriaTrabajoEnEquipo,
          psicometriaOrientacionAlServicio: c.psicometriaOrientacionAlServicio,
          psicometriaSensibilidadALineamientos: c.psicometriaSensibilidadALineamientos,
          psicometriaPlaneacionOrganizacion: c.psicometriaPlaneacionOrganizacion  ,
          psicometriaAnalisisProblemas: c.psicometriaAnalisisProblemas,
          psicometriaEnfoqueResultados: c.psicometriaEnfoqueResultados,
          psicometriaControlActividades: c.psicometriaControlActividades,
          psicometriaEnfoqueCalidad: c.psicometriaEnfoqueCalidad,
          psicometriaRelacionesInterpersonales: c.psicometriaRelacionesInterpersonales,
          psicometriaLiderazgo: c.psicometriaLiderazgo,
          psicometriaTomaDecisiones: c.psicometriaTomaDecisiones,
          psicometriaDinamismo: c.psicometriaDinamismo,
          psicometriaInnovacion: c.psicometriaInnovacion,
          psicometriaPensamientoEstrategico: c.psicometriaPensamientoEstrategico,
          psicometriaNegociacion: c.psicometriaNegociacion,  
          analista: c.analista,                    
          resultadoHabilidadesExcel:c.resultadoHabilidadesExcel || "N/A",
          avaladoPor: c.avaladoPor,
          FKIdTipoCedula: c.FKIdTipoCedula,
          FKIdTipoProceso: c.FKIdTipoProceso,



          idDependencia: c.FKIdDependencia,
          edad: c.edad,
          plaza: c.plaza,
          oficioAutorizacionDeOcupacion: c.oficioAutorizacionDeOcupacion,
          educacionFormal: Array.isArray(c.educacionFormal)
          ? c.educacionFormal.find(e => e) || ""
          : c.educacionFormal || "",
          experienciaRelacionada: c.experienciaRelacionada,
          competenciaReforzar: c.competenciaReforzar,
          competenciaDesarrollar: c.competenciaDesarrollar,
          competenciasSobresaliente: c.competenciasSobresaliente,
          evaluacionConocimientos: c.evaluacionConocimientos,
          efectoContratacion: c.efectoContratacion,
          descripcionReforzar: c.descripcionReforzar,
          descripcionDesarrollar: c.descripcionDesarrollar,
          titularPlaza: c.titularPlaza,
          resultadoProcesoEvaluacion: c.resultadoProcesoEvaluacion,
          FKIdTemporalDefinitiva: c.FKIdTemporalDefinitiva,
          aprobadoJefeOficina: c.aprobadoJefeOficina,
          aprobadoDireccion: c.aprobadoDireccion,



        }));

        setCedulas(cedulasNormalizadas);

        const dependenciasUnicas = [
          ...new Set(cedulasNormalizadas.map((c) => c.dependencia)),
        ].map((d) => ({ value: d, label: d }));

        const resultadosUnicos = [
          ...new Set(cedulasNormalizadas.map((c) => c.resultado)),
        ].map((r) => ({ value: r, label: r }));

        setDependenciaOptions(dependenciasUnicas);
        setResultadoOptions(resultadosUnicos);
      } catch (err) {
        console.error("Error al cargar cédulas:", err);
        setError("No se pudieron cargar las cédulas.");
      } finally {
        setLoading(false);
      }
    };

    cargarCedulas();
  }, []);

  // Filtros
  const cedulasFiltradas = cedulas.filter((c) => {
    let coincideCedula = true;

    if (cedulaFiltro) {
      if (cedulaFiltro.value === "Archivadas") {
        coincideCedula = c.estado === true; // Solo mostrar archivadas
      } else {
        coincideCedula = c.cedula === cedulaFiltro.value && c.estado !== true;
        // Mostrar solo activas de ese tipo
      }
    } else {
      // Si no hay filtro, excluir archivadas
      coincideCedula = c.estado !== true;
    }

    const coincideDependencia =
      !dependenciaFiltro || c.dependencia === dependenciaFiltro.value;
    const coincideResultado =
      !resultadoFiltro || c.resultado === resultadoFiltro.value;

    const coincideBusqueda =
      c.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.candidato.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.dependencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.puesto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.resultado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cedula.toLowerCase().includes(searchTerm.toLowerCase());

    return (
      coincideCedula &&
      coincideDependencia &&
      coincideResultado &&
      coincideBusqueda
    );
  });

  // Manejo de selección
  const toggleSelect = (id) => {
    setSelectedCedulas((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

const archivarCedulas = async () => {
  if (selectedCedulas.length === 0) return;

  try {
    const token = localStorage.getItem("token");
    const servicio = new CedulaServicio();

    // Ejecutar las peticiones en paralelo
    const resultados = await Promise.allSettled(
selectedCedulas.map((idCedula) => servicio.archivarCedula(idCedula, token))
    );

    // Comprobar si hubo errores
    const errores = resultados.filter((r) => r.status === "rejected");

    if (errores.length > 0) {
      console.error("Errores al archivar:", errores);
      setMensaje({
        texto: "⚠️  Algunas cédulas no se pudieron archivar.",
        tipo: "error",
      });
    } else {
      setMensaje({
        texto: "✅  Cédulas archivadas correctamente.",
        tipo: "exito",
      });
    }

    // Refrescar lista sin romper el formato original
    const data = await servicio.obtenerTodasCedulasDisponibles(token);
    setCedulas(data.map((c) => ({
      id: c.idCedula,
      FKIdTipoCedula: c.FKIdTipoCedula,
      FKIdTipoProceso: c.FKIdTipoProceso,
      folio: c.folio || "",
      hermesNotificacion: c.hermesNotificacion || "N/A",
      candidato: c.nombreCandidato || "N/A",
      dependencia: c.nombreDependencia || "N/A",
      puesto: c.puesto || "N/A",
      resultado: c.resultado || "Pendiente",
      cedula: c.FKIdTipoCedula === 1 ? "Interna" : "Resultados",
      estado: c.estado || false,
    })));

  } catch (err) {
    console.error("Error al archivar cédulas:", err);
    setMensaje({
      texto: "⚠️  Error al archivar las cédulas.",
      tipo: "error",
    });
  } finally {
    setSelectedCedulas([]);
    setShowCheckboxes(false);
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 4000);
  }
};


  return (
        
    <div className="cedulas-page">
      <main className="main-content">
       <Sidebar tipoAcceso={usuario.FKidTipoAcceso} /> 

       {mensaje.texto && (
          <div className={`mensaje-flotante ${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}


        <div className="page-header2">
          <h1 className="page-title2">Cédulas</h1>
        </div>

        <div className="main-content-inner-cedula">
          {/* Filtros */}
          <div className="filtros-bar-cedula">
            <div className="filtro-combos-cedula">
              <Select
                className="select-filtro"
                classNamePrefix="select"
                options={cedulaOptions}
                value={cedulaFiltro}
                onChange={setCedulaFiltro}
                isClearable={true}
                placeholder="Tipo de cédula"
              />
              <Select
                className="select-filtro-cedula"
                classNamePrefix="select"
                options={dependenciaOptions}
                value={dependenciaFiltro}
                onChange={setDependenciaFiltro}
                isClearable={true}
                placeholder="Dependencia"
              />
             
            </div>

            <div className="filtro-busqueda">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Tabla */}
          {loading ? (
            <p className="loading-text">Cargando cédulas...</p>
          ) : error ? (
            <p className="error-text">{error}</p>
          ) : (
            <>
              <table className="tabla-cedulas">
                <thead>
                  <tr>
                    {showCheckboxes && <th></th>}
                    <th>Folio/Hermés</th>
                    <th>Candidato</th>
                    <th>Dependencia</th>
                    <th>Puesto</th>
                   <th>Cédula</th>
                  </tr>
                </thead>
                <tbody>
                  {cedulasFiltradas.length > 0 ? (
                    cedulasFiltradas.map((c) => (
                 <tr
  key={c.idCedula}
  onClick={async () => {
    try {
      // 🔍 Si es una cédula externa del proceso 2
      if (c.FKIdTipoCedula === 2 && c.FKIdTipoProceso === 2) {
        // Obtener token del contexto o localStorage
        const token = localStorage.getItem("token");

        // Instancia del servicio (ajusta el import si es necesario)
      const servicio = new CedulaServicio(); // ✅ corregido
        // Llamar al backend para traer el PDF y metadatos
      const cedulaExterna = await servicio.obtenerCedulaExternaPorIdCedula(c.id, token);
        console.log("📄 Datos obtenidos de obtenerCedulaExternaPorIdCedula:", cedulaExterna);

        // Navegar enviando la información completa
        navigate("/crear-cedula", {
          state: {
            cedula: c,
            mostrarPDF: true,
            archivoUrl: cedulaExterna.archivoUrl || null,
            archivoNombre: cedulaExterna.nombre || null,
            archivoBase64: cedulaExterna.archivo || null, // opcional si quieres previsualizarlo
          },
        });
        return;
      }} catch (error) {
      console.error("❌ Error al obtener la cédula externa:", error);
      // Manejo de error (mostrar mensaje, etc.)
    }
     if (c.cedula === "Resultados") {
      navigate("/crear-cedula", { state: { cedula: c } });
    } else if (c.cedula === "Interna") {
      navigate("/crear-cedula-interna", { state: { cedula: c } });
    }
  }}
  style={{ cursor: "pointer" }}
>
      
                        {showCheckboxes && (
                          <td>
                          <input
  type="checkbox"
  checked={selectedCedulas.includes(c.idCedula)}
  onChange={() => toggleSelect(c.idCedula)}
  onClick={(e) => e.stopPropagation()} 
  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
/>
                          </td>
                        )}
                        <td>{c.folio + " / "+ c.hermesNotificacion}</td>
                        <td>{c.candidato}</td>
                        <td>{c.dependencia}</td>
                        <td>{c.puesto}</td>
                        <td>{c.cedula}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={showCheckboxes ? "7" : "6"}
                        style={{ textAlign: "center" }}
                      >
                        No hay resultados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
  </>
)}
              {/* Controles de archivo */}
              <div className="archivar-container">
                {!showCheckboxes ? (
                  <button
                    className="btn-archivar-toggle"
                    onClick={() => setShowCheckboxes(true)}
                  >
                    Archivar Cédulas
                  </button>
                ) : (
                  selectedCedulas.length > 0 && (
                    <button className="btn-archivar" onClick={archivarCedulas}>
                      Archivar ({selectedCedulas.length})
                    </button>
                  )
                )}
                 <button
            className="btn-cedula"
            onClick={() => navigate("/crear-cedula-interna")}
          >
            Crear Cédula Interna
          </button>
          <button
            className="btn-cedulaResultados"
            onClick={() => navigate("/crear-cedula")}
          >
            Crear Cédula de Resultados
          </button>
              </div>
            
        </div>
        


        </main>
        
      </div>
  );
}


export default Cedulas;