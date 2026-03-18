import React, { useState, useEffect, useContext } from "react";
import { FaSearch } from "react-icons/fa";
import { Toast } from "@/components/Alert/Floating/Toast";
import { IPostSeguimientoHermes, ISeguimientoHermesBase } from "@/schemas/procesos-contratacion/PostSeguimientoHermes";
import ProcesoContratacionService from "@/services/ProcesoContratacionService";
import { useToast } from "@/hooks/useToast";
import "./SeguimientoHermes.css";

interface ISeguimientoHermes {
  Folio: string,
  "Fecha de Recepción": string,
  Importancia: string
  "Tipo de Envío": string,
  "Requiere Respuesta": string,
  Solicita: string,
  "Entidad/Dependencia": string,
  Asunto: string,
  Estatus: string,
  Acciones: string
}

const columnas: Columna[] = [
  "Folio",
  "Fecha de Recepción",
  "Importancia",
  "Tipo de Envío",
  "Requiere Respuesta",
  "Solicita",
  "Entidad/Dependencia",
  "Asunto",
  "Estatus",
  "Acciones",
];

type Columna = keyof ISeguimientoHermes;

function SeguimientoHermes() {
  const [registros, setRegistros] = useState<ISeguimientoHermes[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const ServicioProcesoContratacion = new ProcesoContratacionService();
  const {toast,mostrarToast} = useToast();

  const [filtros, setFiltros] = useState<Record<string, string>>(
    columnas.reduce((acc, col) => {
      acc[col] = "Todos";
      return acc;
    }, {} as Record<string,string>),
  );
  const columnasSinFiltro = ["Entidad/Dependencia", "Asunto", "Acciones"];

  const getOpcionesColumna = (col: Columna) => {
  const valores = registros
      .map((r) => r[col])
      .filter((v) => v && v.toString().trim() !== "");
    return ["Todos", ...Array.from(new Set(valores))];
  };

  useEffect(() => {
    const cargarSeguimientoHermes = async () => {
      try {
        const data = await ServicioProcesoContratacion.getSeguimientoHermes();
        const registrosMapeados:ISeguimientoHermes[] = data.mensaje.seguimientos.map((r) => ({
          Folio: r.folio ?? "",
          "Fecha de Recepción": r.fechaRecepcion ?? "",
          Importancia: r.importancia ?? "",
          "Tipo de Envío": r.tipoEnvio ?? "",
          "Requiere Respuesta": r.requiereRespuesta ? "Sí" : "No",
          Solicita: r.solicita ?? "",
          "Entidad/Dependencia": r.entidadDependencia ?? "",
          Asunto: r.asunto ?? "",
          Estatus: r.estatus ?? "",
          Acciones: r.acciones ?? "",
        }));
        setRegistros(registrosMapeados);
      } catch (error) {
        console.error("SeguimientoHermes.tsx - Error al cargar Seguimiento Hermes: " + error);
        mostrarToast("No se pudieron cargar los registros de Seguimiento Hermes", "error")
      }
    };

    cargarSeguimientoHermes();
  }, []);

  const handleChange = (rowIndex: number, colName: Columna, value: string) => {
    const nuevos = [...registros];
    nuevos[rowIndex][colName] = value;
    setRegistros(nuevos);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const clip = e.clipboardData.getData("text");
    const filas = clip.split(/\r?\n/).filter((f) => f.trim() !== "");
    //  Folios que ya existen en la tabla
    const foliosExistentes = new Set(
      registros.map((r) => r.Folio).filter((f) => f && f.trim() !== ""),
    );
    const nuevasFilas: ISeguimientoHermes[] = [];
    filas.forEach((fila) => {
      const celdas = fila.split("\t");
      const registro = {} as ISeguimientoHermes;
      columnas.forEach((col, i) => {
        registro[col] = celdas[i] || "";
      });
      const folioNuevo = registro.Folio?.trim();
      //  Solo agregar si el folio NO existe
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

  const registrosFiltrados = registros.filter((reg) => {
    const coincideBusqueda =
      searchTerm.trim() === "" ||
      columnas.some((col) =>
        reg[col]?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
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
    }, {} as Record<string, string>); 
    setFiltros(filtrosReset);
  };

  const handleGuardarTodos = async () => {
    try {
      const Datos:IPostSeguimientoHermes = {
        registros: registros.map((seguimiento) => ({
          folio: seguimiento.Folio,
          fechaRecepcion: seguimiento["Fecha de Recepción"],
          importancia: seguimiento.Importancia,
          tipoEnvio: seguimiento["Tipo de Envío"],
          requiereRespuesta: seguimiento["Requiere Respuesta"] === "Sí" ? true : false,
          solicita: seguimiento.Solicita,
          entidadDependencia: seguimiento["Entidad/Dependencia"],
          asunto: seguimiento.Asunto,
          estatus: seguimiento.Estatus,
          acciones: seguimiento.Acciones
        }))
      }
      const Response = ServicioProcesoContratacion.postSeguimientoHermes(Datos)
      mostrarToast("Registros guardados correctamente","exito")
    } catch (err) {
      mostrarToast("Error al guardar registros.","error")
      console.log("SeguimientoHermes.tsx - Error al guardar registros: "+err);
    }
  };

  return (
    <div className="seguimiento-page">
      <main className="main-content">
        <Toast texto={toast.texto} tipo={toast.tipo} />
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
            <button className="btn-limpiar" onClick={limpiarFiltros}>
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
                    <td
                      key={col}
                      className={col === "Folio" ? "col-folio" : ""}
                    >
                      {["Asunto", "Acciones"].includes(col) ? (
                        <textarea
                          value={reg[col]}
                          onChange={(e) =>
                            handleChange(rowIndex, col, e.target.value)
                          }
                          className="celda-multilinea"
                          rows={1}
                        />
                      ) : (
                        <input
                          type="text"
                          value={reg[col]}
                          onChange={(e) =>
                            handleChange(rowIndex, col, e.target.value)
                          }
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
