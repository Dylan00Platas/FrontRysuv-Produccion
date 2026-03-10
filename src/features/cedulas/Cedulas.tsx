import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Select, { SingleValue } from "react-select";

import "./cedulas.css";
import CedulaService from "@/services/CedulaService.js";
import { ICedulaRaw } from "@/interfaces/cedulas/CedulaRaw";
import IResponseHTTP from "@/interfaces/http/Response";
import { ICedulaNormalizada } from "@/interfaces/cedulas/CedulaNormalizada";
import { normalizarCedulas } from "@/utils/features/Cedulas";
import { ICedulaExterna } from "@/interfaces/cedulas/CedulaExterna";
import { selectStyles, CedulaBadge } from "@/utils/features/Cedulas.tsx";

interface OpcionEstado {
  value: string;
  label: string;
}

const CEDULA_OPTIONS: OpcionEstado[] = [
  { value: "Interna", label: "Interna" },
  { value: "Resultados", label: "Resultados" },
  { value: "Archivadas", label: "Archivadas" },
];

function Cedulas() {
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const navigate = useNavigate();
  const [cedulas, setCedulas] = useState<ICedulaNormalizada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estado de selección
  const [selectedCedulas, setSelectedCedulas] = useState<number[]>([]);
  const [showCheckboxes, setShowCheckboxes] = useState(false);

  // Opciones de filtros dinámicas
  const [dependenciaOptions, setDependenciaOptions] = useState<OpcionEstado[]>(
    [],
  );
  const [resultadoOptions, setResultadoOptions] = useState<OpcionEstado[]>([]);

  // Estados de filtros — todos tipados correctamente para react-select
  const [cedulaFiltro, setCedulaFiltro] =
    useState<SingleValue<OpcionEstado>>(null);
  const [dependenciaFiltro, setDependenciaFiltro] =
    useState<SingleValue<OpcionEstado>>(null);
  const [resultadoFiltro, setResultadoFiltro] =
    useState<SingleValue<OpcionEstado>>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const cargarCedulas = async () => {
    setLoading(true);
    setError("");
    try {
      const data: IResponseHTTP<ICedulaRaw[]> =
        await new CedulaService().obtenerTodasCedulasDisponibles();

      // FIX: lógica de guardado corregida
      if (!data.mensaje) return;

      const cedulasNormalizadas: ICedulaNormalizada[] = normalizarCedulas(
        data.mensaje,
      );
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

  useEffect(() => {
    cargarCedulas();
  }, []);

  // Filtros — FIX: comparación contra .value del objeto de react-select
  const cedulasFiltradas = cedulas.filter((c) => {
    let coincideCedula = true;

    if (cedulaFiltro?.value) {
      if (cedulaFiltro.value === "Archivadas") {
        coincideCedula = c.estado === true;
      } else {
        coincideCedula = c.cedula === cedulaFiltro.value && c.estado !== true;
      }
    } else {
      coincideCedula = c.estado !== true;
    }

    // FIX: comparar string contra string usando .value
    const coincideDependencia =
      !dependenciaFiltro || c.dependencia === dependenciaFiltro.value;
    const coincideResultado =
      !resultadoFiltro || c.resultado === resultadoFiltro.value;

    const term = searchTerm.toLowerCase();
    const coincideBusqueda =
      c.folio.toLowerCase().includes(term) ||
      c.candidato.toLowerCase().includes(term) ||
      c.dependencia.toLowerCase().includes(term) ||
      c.puesto.toLowerCase().includes(term) ||
      c.resultado.toLowerCase().includes(term) ||
      c.cedula.toLowerCase().includes(term);

    return (
      coincideCedula &&
      coincideDependencia &&
      coincideResultado &&
      coincideBusqueda
    );
  });

  // FIX: id tipado como number
  const toggleSelect = (id: number) => {
    setSelectedCedulas((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id],
    );
  };

  const mostrarMensaje = (texto: string, tipo: string) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 4000);
  };

  const archivarCedulas = async () => {
    if (selectedCedulas.length === 0) return;

    try {
      const service = new CedulaService();

      const resultados = await Promise.allSettled(
        selectedCedulas.map((idCedula) => service.archivarCedula(idCedula)),
      );

      const errores = resultados.filter((r) => r.status === "rejected");

      if (errores.length > 0) {
        console.error("Errores al archivar:", errores);
        mostrarMensaje("Algunas cédulas no se pudieron archivar.", "error");
      } else {
        mostrarMensaje("Cédulas archivadas correctamente.", "exito");
      }

      // FIX: refrescar correctamente la lista tras archivar
      await cargarCedulas();
    } catch (err) {
      console.error("Error al archivar cédulas:", err);
      mostrarMensaje("Error al archivar las cédulas.", "error");
    } finally {
      setSelectedCedulas([]);
      setShowCheckboxes(false);
    }
  };

  const handleRowClick = async (c: ICedulaNormalizada) => {
    try {
      if (c.FKIdTipoCedula === 2 && c.FKIdTipoProceso === 2) {
        const cedulaExterna: IResponseHTTP<ICedulaExterna> =
          await new CedulaService().obtenerCedulaExternaPorIdCedula(c.idCedula);

        navigate("/crear-cedula", {
          state: {
            cedula: c,
            mostrarPDF: true,
            archivoUrl: cedulaExterna.mensaje.FKIdCedula ?? null,
            archivoNombre: cedulaExterna.mensaje.nombre ?? null,
            archivoBase64: cedulaExterna.mensaje.archivo ?? null,
          },
        });
        return;
      }
    } catch (error) {
      console.error("Error al obtener la cédula externa:", error);
      return;
    }

    if (c.cedula === "Resultados") {
      navigate("/crear-cedula", { state: { cedula: c } });
    } else if (c.cedula === "Interna") {
      navigate("/crear-cedula-interna", { state: { cedula: c } });
    }
  };

  const colSpan = showCheckboxes ? 7 : 6;

  return (
    <>
      {/* Toast de notificación */}
      {mensaje.texto && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-semibold text-white transition-all duration-300 ${
            mensaje.tipo === "exito"
              ? "bg-linear-to-r from-emerald-500 to-emerald-600"
              : "bg-linear-to-r from-red-500 to-rose-600"
          }`}
        >
          <span className="text-base">{mensaje.texto}</span>
        </div>
      )}

      <main className="ml-65 w-[calc(100%-260px)] px-10 py-8 overflow-y-auto min-h-screen bg-slate-50">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
            Gestión de documentos
          </p>
          <h1 className="text-3xl font-extrabold text-[#18529d] tracking-tight">
            Cédulas
          </h1>
          <div className="mt-2 h-1 w-16 rounded-full bg-linear-to-r from-[#18529d] to-[#199532]" />
        </div>

        <div className="flex flex-col gap-6">
          {/* Filtros */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-6 py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex gap-3 flex-1 flex-wrap">
                <div className="min-w-44 flex-1">
                  <Select<OpcionEstado>
                    classNamePrefix="rs"
                    options={CEDULA_OPTIONS}
                    value={cedulaFiltro}
                    onChange={setCedulaFiltro}
                    isClearable
                    placeholder="Tipo de cédula"
                    styles={selectStyles}
                  />
                </div>
                <div className="min-w-52 flex-1">
                  <Select<OpcionEstado>
                    classNamePrefix="rs"
                    options={dependenciaOptions}
                    value={dependenciaFiltro}
                    onChange={setDependenciaFiltro}
                    isClearable
                    placeholder="Dependencia"
                    styles={selectStyles}
                  />
                </div>
              </div>

              <div className="relative min-w-56 flex-1 max-w-72">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar folio, candidato..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18529d]/30 focus:border-[#18529d] transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 rounded-full border-4 border-[#18529d]/20 border-t-[#18529d] animate-spin" />
                <p className="text-sm text-slate-400 font-medium">
                  Cargando cédulas...
                </p>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-sm text-red-500 font-medium">{error}</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-linear-to-r from-[#18529d] to-[#1a6abf] text-white">
                    {showCheckboxes && <th className="w-12 px-4 py-3.5" />}
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider opacity-90">
                      Folio / Hermés
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider opacity-90">
                      Candidato
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider opacity-90">
                      Dependencia
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider opacity-90 max-w-30">
                      Puesto
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider opacity-90">
                      Tipo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cedulasFiltradas.length > 0 ? (
                    cedulasFiltradas.map((c, i) => (
                      <tr
                        key={c.idCedula}
                        onClick={() => handleRowClick(c)}
                        className={`cursor-pointer transition-colors duration-150 hover:bg-blue-50/60 ${
                          i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                        }`}
                      >
                        {showCheckboxes && (
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedCedulas.includes(c.idCedula)}
                              onChange={() => toggleSelect(c.idCedula)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 rounded border-slate-300 text-[#18529d] cursor-pointer accent-[#18529d]"
                            />
                          </td>
                        )}
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-600 font-medium">
                          {`${c.folio} / ${c.hermesNotificacion}`}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-800">
                          {c.candidato}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          {c.dependencia}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 max-w-30 truncate">
                          {c.puesto}
                        </td>
                        <td className="px-5 py-3.5">
                          <CedulaBadge tipo={c.cedula} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={colSpan} className="text-center py-16">
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <FaSearch className="text-2xl opacity-30" />
                          <span className="text-sm font-medium">
                            Sin resultados
                          </span>
                          <span className="text-xs">
                            Intenta con otros filtros
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {/* Footer de tabla con conteo */}
            {!loading && !error && (
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/80">
                <span className="text-xs text-slate-400 font-medium">
                  {cedulasFiltradas.length} resultado
                  {cedulasFiltradas.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {/* Controles */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              {!showCheckboxes ? (
                <button
                  onClick={() => setShowCheckboxes(true)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                >
                  Archivar cédulas
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowCheckboxes(false);
                      setSelectedCedulas([]);
                    }}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all shadow-sm"
                  >
                    Cancelar
                  </button>
                  {selectedCedulas.length > 0 && (
                    <button
                      onClick={archivarCedulas}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-amber-500 to-orange-500 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm"
                    >
                      Archivar{" "}
                      <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-xs">
                        {selectedCedulas.length}
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/crear-cedula-interna")}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-[#721995] to-[#8e24aa] rounded-lg hover:from-[#52126b] hover:to-[#6a1b9a] transition-all shadow-sm hover:shadow-md"
              >
                <span>+</span> Cédula Interna
              </button>
              <button
                onClick={() => navigate("/crear-cedula")}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-[#199532] to-[#2eb54a] rounded-lg hover:from-[#147a28] hover:to-[#27a040] transition-all shadow-sm hover:shadow-md"
              >
                <span>+</span> Cédula de Resultados
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default Cedulas;
