import { useCallback, useEffect, useId, useState } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

import { Toast } from "@/components/Alert/Floating/Toast";
import CedulaService from "@/services/CedulaService.js";
import ILabelValue from "@/interfaces/LabelValue";
import { ICedulaBase } from "@/schemas/cedulas/GetCedula";
import { useToast } from "@/hooks/useToast";
import { useCedulas } from "@/hooks/useCedulas";
import { useCedulasFiltradas } from "@/hooks/UseCedulasFiltradas";
import { getUniqueOptionsLabelValue } from "@/utils/utils";
import MainHeader from "@/components/header/MainHeader";
import { InputField } from "@/components/input-field/InputField";
import FormSectionCard from "@/components/card/FormSectionCard";
import { CustomButton } from "@/components/button/CustomButton";

// Utils ---------------------------------------------------------------------
const selectStyles = {
  control: (base: object, state: { isFocused: boolean }) => ({
    ...base,
    borderColor: state.isFocused ? "#18529d" : "#e2e8f0",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(24,82,157,0.15)" : "none",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "#f8fafc",
    "&:hover": { borderColor: "#18529d" },
    minHeight: "40px",
  }),
  option: (
    base: object,
    state: { isSelected: boolean; isFocused: boolean },
  ) => ({
    ...base,
    fontSize: "13px",
    backgroundColor: state.isSelected
      ? "#18529d"
      : state.isFocused
        ? "#eff6ff"
        : "white",
    color: state.isSelected ? "white" : "#334155",
  }),
  placeholder: (base: object) => ({
    ...base,
    color: "#94a3b8",
    fontSize: "13px",
  }),
  singleValue: (base: object) => ({
    ...base,
    color: "#1e293b",
    fontSize: "13px",
  }),
};
function CedulaBadge({ tipo }: { tipo: string }) {
  const config: Record<string, { label: string; classes: string }> = {
    Interna: {
      label: "Interna",
      classes: "bg-pink-100 text-pink-700 ring-1 ring-pink-200",
    },
    Resultados: {
      label: "Resultados",
      classes: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    },
    DeBolsa: {
      label: "De bolsa",
      classes: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
    },
  };

  const { label, classes } = config[tipo] ?? {
    label: tipo,
    classes: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${classes}`}
    >
      {label}
    </span>
  );
}
const getIdTipoCedula = (id: number): string => {
  switch (id) {
    case 1:
      return "Interna";
    case 2:
      return "Resultados";
    case 3:
      return "De bolsa";
    default:
      return "";
  }
};
function normalizarCedulas(data: ICedulaBase[]): ICedulaBase[] {
  return data.map((cedula) => ({
    idCedula: cedula.idCedula || 0,
    adscripcion: null,
    analista: cedula.analista || "",
    antecedentesFamiliaresUV: cedula.antecedentesFamiliaresUV || "",
    aprobadoDireccion: false,
    aprobadoJefeOficina: false,
    archivoAdjunto: false,
    categoriaPuestoOrigen: cedula.categoriaPuestoOrigen || "",
    competenciaDesarrollar: cedula.competenciaDesarrollar || "",
    competenciaReforzar: cedula.competenciaReforzar || "",
    competenciasSobresaliente: cedula.competenciasSobresaliente || "",
    conclusiones: cedula.conclusiones || "",
    consecutivoExpediente: cedula.consecutivoExpediente || "",
    dependencia: cedula.dependencia || "",
    descripcionDesarrollar: cedula.descripcionDesarrollar || "",
    descripcionReforzar: cedula.descripcionReforzar || "",
    diasProceso: cedula.diasProceso || "",
    edad: cedula.edad || "",
    educacionFormal: Array.isArray(cedula.educacionFormal)
      ? cedula.educacionFormal.find((e) => e) || ""
      : cedula.educacionFormal || "",
    efectoContratacion: cedula.efectoContratacion || "",
    estado: cedula.estado || false,
    evaluacionConocimientos: cedula.evaluacionConocimientos || "",
    expectativaLaboral: cedula.expectativaLaboral || "",
    experiencia: cedula.experiencia || "",
    experienciaLaboralSolicitada: cedula.experienciaLaboralSolicitada || "",
    experienciaRelacionada: cedula.experienciaRelacionada || "",
    familiaFuncional: cedula.familiaFuncional || "",
    fechaCedulaInterna: cedula.fechaCedulaInterna || "",
    fechaCedulaResultados: cedula.fechaCedulaResultados || "",
    fechaElaboracionPropuesta: cedula.fechaElaboracionPropuesta || "",
    fechaEntrevista: cedula.fechaEntrevista || "",
    fechaEnvioDEyDP: cedula.fechaEnvioDEyDP || "",
    fechaEnvioEvaluacionDesempenio: cedula.fechaEnvioEvaluacionDesempenio || "",
    fechaEvaluacionCompetencias: cedula.fechaEvaluacionCompetencias || "",
    fechaEvaluacionDesempenio: cedula.fechaEnvioEvaluacionDesempenio || "",
    fechaInicioProcesamiento: cedula.fechaInicioProcesamiento || "",
    fechaLiberacionOficio: cedula.fechaLiberacionOficio || "",
    fechaNotificacion: cedula.fechaNotificacion || "",
    fechaRecibido: cedula.fechaRecibido || "",
    fechaRevisionOfiEval: cedula.fechaRevisionOfiEval || "",
    FKIdClasificacionCedula: cedula.FKIdClasificacionCedula || 0,
    FKIdProceso: cedula.FKIdResultado || 0,
    FKIdResultado: cedula.FKIdResultado || 0,
    FKIdTipoCedula: cedula.FKIdTipoCedula === 1 ? 1 : 2,
    folio: cedula.folio || "",
    funcionDesempeniar: cedula.funcionDesempeniar || "",
    hermesNotificacion: cedula.hermesNotificacion || "",
    lineamientoOficioContinuidad: cedula.lineamientoOficioContinuidad || "",
    motivo: cedula.motivo || "",
    motivoCedulaInterna: cedula.motivoCedulaInterna || "",
    motivoCedulaResultados: cedula.motivoCedulaResultados || "",
    nombreCandidato: cedula.nombreCandidato || "N/A",
    numCarpeta: cedula.numCarpeta || "",
    numPlaza: cedula.numPlaza || "",
    observaciones: cedula.observaciones || "",
    observacionesAnalista: cedula.observacionesAnalista || "",
    oficioAutorizacionDeOcupacion: cedula.oficioAutorizacionDeOcupacion || "",
    periodoAutorizadoOficioFin: cedula.periodoAutorizadoOficioFin || "",
    periodoAutorizadoOficioInicio: cedula.periodoAutorizadoOficioInicio || "",
    plaza: cedula.plaza || "",
    puesto: cedula.puesto || "N/A",
    psicometriaAnalisisProblemas: cedula.psicometriaAnalisisProblemas || "",
    psicometriaComunicacion: cedula.psicometriaComunicacion || "",
    psicometriaControlActividades: cedula.psicometriaControlActividades || "",
    psicometriaDinamismo: cedula.psicometriaDinamismo || "",
    psicometriaEnfoqueCalidad: cedula.psicometriaEnfoqueCalidad || "",
    psicometriaEnfoqueResultados: cedula.psicometriaEnfoqueCalidad || "",
    psicometriaInnovacion: cedula.psicometriaInnovacion || "",
    psicometriaLiderazgo: cedula.psicometriaLiderazgo || "",
    psicometriaNegociacion: cedula.psicometriaNegociacion || "",
    psicometriaOrientacionAlServicio:
      cedula.psicometriaOrientacionAlServicio || "",
    psicometriaPensamientoEstrategico:
      cedula.psicometriaPensamientoEstrategico || "",
    psicometriaPlaneacionOrganizacion:
      cedula.psicometriaPlaneacionOrganizacion || "",
    psicometriaRelacionesInterpersonales:
      cedula.psicometriaRelacionesInterpersonales || "",
    psicometriaSensibilidadALineamientos:
      cedula.psicometriaSensibilidadALineamientos || "",
    psicometriaTomaDecisiones: cedula.psicometriaTomaDecisiones || "",
    psicometriaTrabajoEnEquipo: cedula.psicometriaTrabajoEnEquipo || "",
    referidoPor: cedula.referidoPor || "",
    resultado: cedula.resultado || "Pendiente",
    resultadoEvaluacionCompetencias:
      cedula.resultadoEvaluacionCompetencias || "",
    resultadoEvaluacionConocimiento:
      cedula.resultadoEvaluacionConocimiento || "",
    resultadoHabilidadesExcel: cedula.resultadoHabilidadesExcel || "N/A",
    resultadoHabilidadesWord: cedula.resultadoHabilidadesWord || "",
    resultadoOrtografia: cedula.resultadoOrtografia || "",
    resultadoPorcentaje: cedula.resultadoPorcentaje || "",
    resultadoProcesoEvaluacion: cedula.resultadoProcesoEvaluacion || "",
    resultadoReferenciasLaborales: cedula.resultadoReferenciasLaborales || "",
    resultadoSeguimientoEvaluacionDesempenio:
      cedula.resultadoSeguimientoEvaluacionDesempenio || "",
    seguimientoEvaluacionDesempenio:
      cedula.seguimientoEvaluacionDesempenio || "",
    titularPlaza: cedula.titularPlaza || "",
  }));
}

// Datos fijos ---------------------------------------------------------------
const CEDULA_OPTIONS: ILabelValue[] = [
  { value: "Interna", label: "Interna" },
  { value: "Resultados", label: "Resultados" },
  { value: "Archivadas", label: "Archivadas" },
];

function Cedulas() {
  const navigate = useNavigate();
  const { toast, mostrarToast } = useToast();
  const fieldID = useId();
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
  } = useCedulasFiltradas(cedulasNormalizadas);

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

      <main className="ml-65 w-[calc(100%-260px)] px-[4%] py-[2%] overflow-y-auto min-h-screen bg-slate-50">
        <MainHeader title="Consulta de cédulas" subtitle="Gestión de cédulas" />

        <div className="flex flex-col gap-6">
          {/* Filtros */}
          <FormSectionCard title="Filtros">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-auto sm:flex-1">
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
              <div className="w-full sm:w-auto sm:flex-1">
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
              <InputField
                id={`${fieldID}-searchTerm`}
                placeholder="Buscar folio, candidato..."
                autoComplete="on"
                name="searchTerm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                showSearchButton={true}
                onSearch={setSearchTerm}
                searchButtonTitle="Buscar por palabra clave"
              />
            </div>
          </FormSectionCard>
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
                            <InputField
                              type="checkbox"
                              checked={selectedCedulas.includes(c.idCedula)}
                              onChange={() => toggleSelect(c.idCedula)}
                              onClick={(e) => e.stopPropagation()}
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
              <CustomButton
                variant="edit"
                icon={<FaPlus />}
                onClick={() => navigate("/crear-cedula-interna")}
              >
                Cédula interna
              </CustomButton>
              <CustomButton
                variant="save"
                icon={<FaPlus />}
                onClick={() => navigate("/crear-cedula")}
              >
                Cédula de resultados
              </CustomButton>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default Cedulas;
