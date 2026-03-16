// ------------------------------------------------------------------------------
import { useCallback, useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

import "./cedulas.css";
import {
  selectStyles,
  CedulaBadge,
  getIdTipoCedula,
} from "@/utils/features/Cedulas.tsx";
import { normalizarCedulas } from "@/utils/features/Cedulas";
import CedulaService from "@/services/CedulaService.js";
import ILabelValue from "@/interfaces/LabelValue";
import { ICedulaBase } from "@/schemas/cedulas/GetCedula";
import { useCedulas } from "@/hooks/useCedulas";
import { getUniqueOptionsLabelValue } from "@/utils/utils";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Alert/Floating/Toast";
import { useCedulasFiltradas } from "@/hooks/UseCedulasFiltradas";

function Cedulas() {
  const navigate = useNavigate();
  const { toast, mostrarToast } = useToast();
  // Obtencion de cedulas -----------------------------------------------------
  const {
    data: cedulasData,
    loading: cedulasLoading,
    error: cedulasError,
    refetch: refetchCedulas,
  } = useCedulas();

  const [cedulasNormalizadas, setCedulasNormalizadas] = useState<
    ICedulaBase[] | null
  >(null);
  const [dependenciasUnicas, setDependenciasUnicas] = useState<
    ILabelValue[] | undefined
  >();
  const [resultadosUnicos, setResultadosUnicos] = useState<
    ILabelValue[] | null
  >(null);

  useEffect(() => {
    if (!cedulasData?.length) return;

    const normalizadas = normalizarCedulas(cedulasData);
    setCedulasNormalizadas(normalizadas);
    setDependenciasUnicas(
      getUniqueOptionsLabelValue(normalizadas, "dependencia"),
    );
    setResultadosUnicos(getUniqueOptionsLabelValue(normalizadas, "resultado"));
  }, [cedulasData]);

  // Manejo de filtros -------------------------------------------------------
  const CEDULA_OPTIONS: ILabelValue[] = [
    { value: "Interna", label: "Interna" },
    { value: "Resultados", label: "Resultados" },
    { value: "Archivadas", label: "Archivadas" },
  ];

  const {
    cedulaFiltro,
    setCedulaFiltro,
    dependenciaFiltro,
    setDependenciaFiltro,
    resultadoFiltro,
    setResultadoFiltro,
    searchTerm,
    setSearchTerm,
    cedulasFiltradas,
    resetFilters,
  } = useCedulasFiltradas(cedulasNormalizadas); // ✅ nombre correcto

  // Selección de cedulas -----------------------------------------------------
  const [selectedCedulas, setSelectedCedulas] = useState<number[]>([]);
  const [showCheckboxes, setShowCheckboxes] = useState(false);

  const toggleSelect = useCallback((id: number) => {
    setSelectedCedulas((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id],
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCedulas([]);
    setShowCheckboxes(false);
  }, []);

  const archivarCedulas = useCallback(async () => {
    if (selectedCedulas.length === 0) return;

    const service = new CedulaService();
    const resultados = await Promise.allSettled(
      selectedCedulas.map((id) => service.archivarCedula(id)),
    );

    const errores = resultados.filter((r) => r.status === "rejected");

    if (errores.length > 0) {
      console.error("Errores al archivar:", errores);
      mostrarToast(
        errores.length === selectedCedulas.length
          ? "No se pudieron archivar las cédulas."
          : "Algunas cédulas no se pudieron archivar.",
        "error",
      );
    } else {
      mostrarToast("Cédulas archivadas correctamente.", "exito");
    }

    await refetchCedulas();
    clearSelection();
  }, [selectedCedulas, mostrarToast, refetchCedulas, clearSelection]);

  const handleRowClick = useCallback(
    async (c: ICedulaBase) => {
      if (c.FKIdTipoCedula === 2 && c.FKIdProceso === 2) {
        try {
          const { mensaje } = await new CedulaService().getCedulaExterna(
            c.idCedula,
          );
          navigate("/crear-cedula", {
            state: {
              cedula: c,
              mostrarPDF: true,
              archivoUrl: mensaje.documento.FKIdCedula ?? null,
              archivoNombre: mensaje.documento.nombre ?? null,
              archivoBase64: mensaje.documento.archivo ?? null,
            },
          });
        } catch (error) {
          console.error("Error al obtener la cédula externa:", error);
          mostrarToast("No se pudo cargar el archivo de la cédula.", "error");
        }
        return;
      }

      const RUTAS: Partial<Record<string, string>> = {
        Resultados: "/crear-cedula",
        Interna: "/crear-cedula-interna",
      };

      const ruta = RUTAS[c.FKIdTipoCedula];
      if (ruta) {
        navigate(ruta, { state: { cedula: c } });
      } else {
        console.warn("Tipo de cédula sin ruta definida:", c.FKIdTipoCedula);
      }
    },
    [navigate, mostrarToast],
  );

  const colSpan = showCheckboxes ? 7 : 6;

  return (
    <>
      {/* Toast de notificación */}
      <Toast texto={toast.texto} tipo={toast.tipo} />

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
                  <Select<ILabelValue>
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
                  <Select<ILabelValue>
                    classNamePrefix="rs"
                    options={dependenciasUnicas}
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
            {cedulasLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 rounded-full border-4 border-[#18529d]/20 border-t-[#18529d] animate-spin" />
                <p className="text-sm text-slate-400 font-medium">
                  Cargando cédulas...
                </p>
              </div>
            ) : cedulasError ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-sm text-red-500 font-medium">
                  {cedulasError}
                </p>
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
                          {c.nombreCandidato}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          {c.dependencia}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 max-w-30 truncate">
                          {c.puesto}
                        </td>
                        <td className="px-5 py-3.5">
                          <CedulaBadge
                            tipo={getIdTipoCedula(c.FKIdTipoCedula)}
                          />
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
            {!cedulasLoading && !cedulasError && (
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
