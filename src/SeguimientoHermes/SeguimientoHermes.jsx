import React, { useState, useEffect, useContext } from "react";
import Sidebar from "../Componentes/Sidebar";
import { UsuarioContext } from "../Auxiliares/UsuarioContext.jsx";
import "./SeguimientoHermes.css";
import { FaSearch } from "react-icons/fa";
import SolicitudServicio from "../Servicios/SolicitudServicio.js";


const columnas = [
  "Folio",
  "Fecha de Recepción",
  "Importancia",
  "Tipo de Envío",
  "Requiere Respuesta",
  "Solicita",
  "Entidad/Dependencia",
  "Asunto",
  "Estatus",
  "Acciones" 
];

function SeguimientoHermes() {
  const { usuario } = useContext(UsuarioContext);
  const [registros, setRegistros] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const solicitudServicio = new SolicitudServicio();
  const mapearRegistro = (r) => ({
    folio: r.Folio,
    fechaRecepcion: r["Fecha de Recepción"],
    importancia: r.Importancia,
    tipoEnvio: r["Tipo de Envío"],
    requiereRespuesta: r["Requiere Respuesta"],
    solicita: r.Solicita,
    entidadDependencia: r["Entidad/Dependencia"],
    asunto: r.Asunto,
    estatus: r.Estatus,
    acciones: r.Acciones
  });

  
 const [filtros, setFiltros] = useState(
  columnas.reduce((acc, col) => {
    acc[col] = "Todos";
    return acc;
  }, {})
);
const columnasSinFiltro = [
  "Entidad/Dependencia",
  "Asunto",
  "Acciones"
];

  const handleFiltroChange = (col, value) => {
  setFiltros({
    ...filtros,
    [col]: value
  });
};

const getOpcionesColumna = (col) => {
  const valores = registros
    .map((r) => r[col])
    .filter((v) => v && v.toString().trim() !== "");

  return ["Todos", ...Array.from(new Set(valores))];
};

  useEffect(() => {
    const cargarSeguimientoHermes = async () => {
      try {
        const token = localStorage.getItem("token");
        const data = await solicitudServicio.obtenerTodosSeguimientoHermes(token);

        // 🔹 Adaptar backend → tabla
        const registrosMapeados = data.map(r => ({
          "Folio": r.folio ?? "",
          "Fecha de Recepción": r.fechaRecepcion ?? "",
          "Importancia": r.importancia ?? "",
          "Tipo de Envío": r.tipoEnvio ?? "",
          "Requiere Respuesta": r.requiereRespuesta ? "Sí" : "No",
          "Solicita": r.solicita ?? "",
          "Entidad/Dependencia": r.entidadDependencia ?? "",
          "Asunto": r.asunto ?? "",
          "Estatus": r.estatus ?? "",
          "Acciones": r.acciones ?? ""
        }));

        setRegistros(registrosMapeados);
      } catch (error) {
        console.error("Error al cargar Seguimiento Hermes:", error);
        alert("No se pudieron cargar los registros de Seguimiento Hermes");
      }
    };

    cargarSeguimientoHermes();
  }, []);



  const handleChange = (rowIndex, colName, value) => {
    const nuevos = [...registros];
    nuevos[rowIndex][colName] = value;
    setRegistros(nuevos);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const clip = e.clipboardData.getData("text");
    const filas = clip.split(/\r?\n/).filter((f) => f.trim() !== "");
    // 🔹 Folios que ya existen en la tabla
    const foliosExistentes = new Set(
        registros
        .map((r) => r.Folio)
        .filter((f) => f && f.trim() !== "")
    );
    const nuevasFilas = [];
    filas.forEach((fila) => {
        const celdas = fila.split("\t");
        const registro = {};
        columnas.forEach((col, i) => {
        registro[col] = celdas[i] || "";
        });
        const folioNuevo = registro.Folio?.trim();
        // 🔹 Solo agregar si el folio NO existe
        if (folioNuevo && !foliosExistentes.has(folioNuevo)) {
        nuevasFilas.push(registro);
        foliosExistentes.add(folioNuevo); // evita duplicados dentro del mismo pegado
        }
    });
    if (nuevasFilas.length === 0) {
        alert("Todos los registros pegados ya existen (folios duplicados).");
        return;
    }
    setRegistros((prev) => [...prev, ...nuevasFilas]);
    };


  const handleGuardarFila = (index) => {
    alert("Fila guardada: " + JSON.stringify(registros[index]));
    // Aquí podrías llamar a tu API para guardar
  };

  const handleEliminarFila = (index) => {
    const nuevos = [...registros];
    nuevos.splice(index, 1);
    setRegistros(nuevos);
  };

  const registrosFiltrados = registros.filter((reg) => {
  const coincideBusqueda =
    searchTerm.trim() === "" ||
    columnas.some((col) =>
      reg[col]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    
  const coincideFiltros = columnas.every((col) => {
    if (columnasSinFiltro.includes(col)) return true;
    if (filtros[col] === "Todos") return true;
    return reg[col] === filtros[col];
  });

  return coincideBusqueda && coincideFiltros;
});


  const limpiarFiltros = () => {
    const filtrosReset = columnas.reduce((acc, col) => {
      acc[col] = "Todos";
      return acc;
    }, {});
    setFiltros(filtrosReset);
  };

  const handleGuardarTodos = async () => {
    const token= localStorage.getItem("token");
    try {
      await solicitudServicio.registrarSeguimientoHermes(
        registros,
        token
      );
      alert("Registros guardados correctamente");
    } catch (err) {
      console.error(err);
      alert("Error al guardar registros");
    }
  };




  return (
    <div className="seguimiento-page">
      <Sidebar tipoAcceso={usuario.FKidTipoAcceso} />

      <main className="main-content">
        <div className="seguimiento-header">
          <h1 className="seguimiento-title">Seguimiento Hermes</h1>
        </div>

        <div className="main-content-inner">
          <div className="filtro-busqueda">
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
            <div className="seguimiento-actions">
              <button className="btn-guardar" onClick={handleGuardarTodos}>
                Guardar Todos
              </button>
              <button
                className="btn-limpiar"
                onClick={limpiarFiltros}
              >
                Limpiar filtros
              </button>
            </div>
          <table
            className="seguimiento-table"
            onPaste={handlePaste} // soporta pegar varias filas
          >
           <thead>
                <tr>
                    {columnas.map((col) => (
                      <th key={col} className={col === "Folio" ? "col-folio" : ""}>
                        {col}
                      </th>
                    ))}
                </tr>

                {/* 🔽 Fila de filtros con combo dinámico */}
                <tr className="fila-filtros">
                    {columnas.map((col) => (
                    <th key={col}>
                      {!columnasSinFiltro.includes(col) && (
                        <select
                          value={filtros[col]}
                          onChange={(e) =>
                            setFiltros({ ...filtros, [col]: e.target.value })
                          }
                        >
                          {getOpcionesColumna(col).map((op) => (
                            <option key={op} value={op}>
                              {op}
                            </option>
                          ))}
                        </select>
                      )}
                    </th>
                    ))}
                </tr>
                </thead>
           <tbody>
            {registrosFiltrados.map((reg, rowIndex) => (
                <tr key={rowIndex}>
                {columnas.map((col) => (
                  <td key={col} className={col === "Folio" ? "col-folio" : ""}>
                    {["Asunto", "Acciones"].includes(col) ? (
                      <textarea
                        value={reg[col]}
                        onChange={(e) => handleChange(rowIndex, col, e.target.value)}
                        className="celda-multilinea"
                        rows={1}
                      />
                    ) : (
                      <input
                        type="text"
                        value={reg[col]}
                        onChange={(e) => handleChange(rowIndex, col, e.target.value)}
                      />
                    )}
                  </td>
                ))}
                </tr>
            ))}
            </tbody>

          </table>
         
        </div>
      </main>
    </div>
  );
}

export default SeguimientoHermes;