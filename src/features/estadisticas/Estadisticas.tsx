import { useState, useEffect, useMemo, useCallback } from "react";
import Select, { SingleValue } from "react-select";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

import "./Estadisticas.css";
import { Toast } from "@/components/Alert/Floating/Toast";
import { useToast } from "@/hooks/useToast";
import AccesoService from "@/services/AccesoService";
import IResponseHTTP from "@/interfaces/http/Response";
import ILabelValue from "@/interfaces/LabelValue";
import ProcesoContratacionService from "@/services/ProcesoContratacionService";
import {
  IGetProcesosContratacion,
  IProcesoContratacionBase,
} from "@/schemas/procesos-contratacion/GetProcesoContratacion";
import { IGetUsuarios, IUsuarioBase } from "@/schemas/acceso/GetUsuario";

// Interfaces de UI ------------------------------------------------------------
interface ICedulaAdaptada {
  id: number;
  folio: string;
  puesto: string;
  estado: string;
}
interface IProcesoAdaptado {
  id: number;
  folio: string;
  nombre: string;
  analista: string;
  estado: string;
  region: string;
  dependencia: string;
}
interface IFiltrosProcesos {
  estado: ILabelValue | null;
  analista: ILabelValue | null;
  dependencia: ILabelValue | null;
}
interface IDataMensual {
  mes: string;
  solicitudes: number;
}

// Constantes ------------------------------------------------------------------
const COLORS_PIE = ["#18529D", "#199532", "#df5252ff"];
const COLORS_PIE2 = [
  "#18529D",
  "#d86f1aff",
  "#199532",
  "#6549a5ff",
  "#df5252ff",
  "#4daedbff",
  "#8C564B",
  "#9467BD",
];
const COLORS_BAR = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7f50",
  "#8dd1e1",
  "#d0ed57",
  "#a4de6c",
  "#d88884",
];
const GRAFICAS_OPTIONS: ILabelValue[] = [
  { value: "todas", label: "Todas las gráficas" },
  { value: "solicitudes", label: "Solicitudes" },
  { value: "procesos", label: "Procesos" },
  { value: "mensual", label: "Actividades mensuales" },
  { value: "porAnalista", label: "Procesos por analista" },
  { value: "evaluacion", label: "Resultados de evaluación" },
];
const ESTADO_OPTIONS: ILabelValue[] = [
  { value: "Citado", label: "Citado" },
  { value: "En procesamiento", label: "En procesamiento" },
  { value: "En revisión", label: "En revisión" },
  { value: "En firma", label: "En firma" },
  { value: "Notificado", label: "Notificado" },
  { value: "Pendiente", label: "Pendiente" },
  { value: "Evaluado", label: "Evaluado" },
];
const ESTADO_SOLICITUD_OPTIONS: ILabelValue[] = [
  { value: "Todos", label: "Todos" },
  { value: "Pendiente (cita)", label: "Pendiente (cita)" },
  { value: "Entregado (cita)", label: "Entregado (cita)" },
  { value: "Citado", label: "Citado" },
];
const OPCION_TODOS: ILabelValue = { value: "Todos", label: "Todos" };
const OPCION_TODOS_ANALISTAS: ILabelValue = {
  value: "Todos",
  label: "Todos los analistas",
};
function mapEstado(fk: number): string {
  switch (fk) {
    case 1:
      return "Citado";
    case 2:
      return "Evaluado";
    case 4:
      return "En revisión";
    case 5:
      return "En firma";
    case 6:
      return "Notificado";
    case 7:
      return "Cancelado";
    case 8:
      return "Terminado";
    case 9:
      return "Pendiente (cita)";
    case 10:
      return "Entregado (cita)";
    case 11:
      return "Citado";
    case 12:
    case 13:
    case 14:
    case 15:
      return "En procesamiento";
    default:
      return "En proceso";
  }
}
function generarOpcionesMeses(n = 4): ILabelValue[] {
  const hoy = new Date();
  return Array.from({ length: n }, (_, i) => {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const label = fecha
      .toLocaleString("es-ES", { month: "long", year: "numeric" })
      .replace(/^\w/, (c) => c.toUpperCase());
    return {
      value: `${fecha.getFullYear()}-${fecha.getMonth() + 1}`,
      label,
    };
  });
}

function Estadisticas() {
  const navigate = useNavigate();
  const { toast, mostrarToast } = useToast();

  // Datos remotos ------------------------------------------------------------
  const [procesosRaw, setProcesosRaw] = useState<IProcesoContratacionBase[]>(
    [],
  );
  const [analistas, setAnalistas] = useState<IUsuarioBase[]>([]);
  const [loadingProcesos, setLoadingProcesos] = useState(true);
  const [dataMensual, setDataMensual] = useState<IDataMensual[] | null>(null);

  useEffect(() => {
    let cancelado = false;

    const fetchTodo = async () => {
      try {
        setLoadingProcesos(true);

        const [responseProcesos, responseAnalistas] = await Promise.all([
          new ProcesoContratacionService().getProcesosContratacion() as Promise<
            IResponseHTTP<IGetProcesosContratacion>
          >,
          new AccesoService().getAnalistas() as Promise<
            IResponseHTTP<IGetUsuarios>
          >,
        ]);

        if (cancelado) return;

        const procesos = responseProcesos.mensaje?.procesos ?? [];
        const usuariosLista = responseAnalistas.mensaje?.usuarios ?? [];

        setProcesosRaw(procesos);
        setAnalistas(usuariosLista);

        // Datos mensuales ----------------------------------------------------
        const validas = procesos.filter((p) => p.fechaNotificacion);

        if (validas.length > 0) {
          const maxFecha = new Date(
            Math.max(
              ...validas.map((p) => new Date(p.fechaNotificacion).getTime()),
            ),
          );

          const meses: IDataMensual[] = Array.from({ length: 4 }, (_, i) => {
            const d = new Date(
              maxFecha.getFullYear(),
              maxFecha.getMonth() - (3 - i),
              1,
            );
            return {
              mes: d
                .toLocaleString("es-ES", { month: "long", year: "numeric" })
                .replace(/^\w/, (c) => c.toUpperCase()),
              solicitudes: 0,
            };
          });

          validas.forEach((p) => {
            const fecha = new Date(p.fechaNotificacion);
            const label = fecha
              .toLocaleString("es-ES", { month: "long", year: "numeric" })
              .replace(/^\w/, (c) => c.toUpperCase());
            const entry = meses.find((m) => m.mes === label);
            if (entry) entry.solicitudes += 1;
          });

          setDataMensual(meses);
        } else {
          setDataMensual([]);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
        mostrarToast(
          "❌ Error al cargar los datos. Intente más tarde.",
          "error",
        );
      } finally {
        if (!cancelado) setLoadingProcesos(false);
      }
    };

    fetchTodo();
    return () => {
      cancelado = true;
    };
  }, []);

  // Procesos adaptados (con nombre de analista) -------------------------------
  const procesosAdaptados = useMemo<IProcesoAdaptado[]>(() => {
    const analistasMap = Object.fromEntries(
      analistas.map((a) => [
        a.idAcceso,
        `${a.nombre} ${a.primerApellido} ${a.segundoApellido ?? ""}`.trim(),
      ]),
    );

    return procesosRaw
      .filter((p) => p.FKIdAcceso !== null)
      .map((p, idx) => ({
        id: p.idProceso ?? idx,
        folio: p.folio ?? p.hermesNotificacion ?? "N/A",
        nombre: p.nombreCandidato ?? "Sin candidato",
        analista: analistasMap[p.FKIdAcceso ?? ""] ?? "Sin analista",
        estado: mapEstado(p.FKIdEstadoProcesoContratacion),
        region: p.dependencia.zona ?? "Sin región",
        dependencia: p.dependencia.nombre ?? "Sin dependencia",
      }));
  }, [procesosRaw, analistas]);

  // Solicitudes adaptadas (sin analista, sin tipo bolsa) -----------------------
  const solicitudes = useMemo<ICedulaAdaptada[]>(() => {
    return procesosRaw
      .filter((p) => p.FKIdTipoProceso !== 3 && p.FKIdAcceso === null)
      .map((p, idx) => ({
        id: p.idProceso ?? idx,
        folio: p.folio ?? p.hermesNotificacion ?? "N/A",
        puesto: p.categoriaPuestoOrigen ?? "Sin puesto",
        estado: mapEstado(p.FKIdEstadoProcesoContratacion),
      }));
  }, [procesosRaw]);

  // Contadores derivados --------------------------------------------------------
  const contadores = useMemo(() => {
    const contar = (ids: number[]) =>
      procesosRaw.filter((p) => ids.includes(p.FKIdEstadoProcesoContratacion))
        .length;

    return {
      pendientes: contar([9]),
      entregadas: contar([10]),
      notificadas: contar([11]),
      citado: contar([1]),
      evaluado: contar([2]),
      procesamiento: contar([13, 14, 15]),
      revision: contar([4]),
      firma: contar([5]),
      notificadoProceso: contar([6]),
      cancelado: contar([7]),
      terminado: contar([8]),
    };
  }, [procesosRaw]);

  // Opciones de filtros -------------------------------------------------------
  const analistaOptions = useMemo<ILabelValue[]>(
    () => [
      OPCION_TODOS,
      ...Array.from(new Set(procesosAdaptados.map((p) => p.analista))).map(
        (a) => ({ value: a, label: a }),
      ),
    ],
    [procesosAdaptados],
  );

  const dependenciaOptions = useMemo<ILabelValue[]>(
    () => [
      OPCION_TODOS,
      ...Array.from(new Set(procesosAdaptados.map((p) => p.dependencia))).map(
        (d) => ({ value: d, label: d }),
      ),
    ],
    [procesosAdaptados],
  );

  // Opciones de mes
  const mesesOptions = useMemo(() => generarOpcionesMeses(4), []);

  // Filtros de gráficas -------------------------------------------------------
  const [graficaSeleccionada, setGraficaSeleccionada] = useState<ILabelValue>(
    GRAFICAS_OPTIONS[0],
  );

  // Filtros de la tabla de procesos
  const [filtrosProcesos, setFiltrosProcesos] = useState<IFiltrosProcesos>({
    estado: null,
    analista: null,
    dependencia: null,
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Filtros de la tabla de solicitudes
  const [estadoFiltroSolicitud, setEstadoFiltroSolicitud] =
    useState<ILabelValue>(OPCION_TODOS);
  const [searchTermSolicitudes, setSearchTermSolicitudes] = useState("");

  // Filtros de la gráfica "por analista"
  const [analistaFiltro, setAnalistaFiltro] =
    useState<ILabelValue>(OPCION_TODOS);

  // Filtros de la gráfica "evaluación"
  const [analistaFiltroEval, setAnalistaFiltroEval] = useState<ILabelValue>(
    OPCION_TODOS_ANALISTAS,
  );
  const [mesFiltroEval, setMesFiltroEval] = useState<ILabelValue | null>(null);

  // Datos filtrados -----------------------------------------------------------
  const procesosFiltrados = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return procesosAdaptados.filter((p) => {
      const coincideEstado =
        !filtrosProcesos.estado || filtrosProcesos.estado.value === p.estado;
      const coincideAnalista =
        !filtrosProcesos.analista ||
        filtrosProcesos.analista.value === p.analista;
      const coincideDependencia =
        !filtrosProcesos.dependencia ||
        filtrosProcesos.dependencia.value === p.dependencia;
      const coincideBusqueda =
        !term ||
        p.folio.toLowerCase().includes(term) ||
        p.nombre.toLowerCase().includes(term) ||
        p.analista.toLowerCase().includes(term) ||
        p.estado.toLowerCase().includes(term);
      return (
        coincideEstado &&
        coincideAnalista &&
        coincideDependencia &&
        coincideBusqueda
      );
    });
  }, [procesosAdaptados, filtrosProcesos, searchTerm]);

  const solicitudesFiltradas = useMemo(() => {
    const term = searchTermSolicitudes.toLowerCase();
    return solicitudes.filter((s) => {
      const coincideEstado =
        estadoFiltroSolicitud.value === "Todos" ||
        s.estado === estadoFiltroSolicitud.value;
      const coincideBusqueda =
        !term ||
        s.folio.toLowerCase().includes(term) ||
        s.puesto.toLowerCase().includes(term) ||
        s.estado.toLowerCase().includes(term);
      return coincideEstado && coincideBusqueda;
    });
  }, [solicitudes, estadoFiltroSolicitud, searchTermSolicitudes]);

  // Datos para gráficas -----------------------------------------------------
  const dataSolicitudesChart = useMemo(
    () => [
      { name: "Pendiente (cita)", value: contadores.pendientes },
      { name: "Entregado (cita)", value: contadores.entregadas },
      { name: "Citado", value: contadores.notificadas },
    ],
    [contadores],
  );

  const dataProcesosChart = useMemo(
    () => [
      { name: "Citado", value: contadores.citado },
      { name: "Evaluado", value: contadores.evaluado },
      { name: "En procesamiento", value: contadores.procesamiento },
      { name: "En revisión", value: contadores.revision },
      { name: "En firma", value: contadores.firma },
      { name: "Notificado", value: contadores.notificadoProceso },
    ],
    [contadores],
  );

  // Datos para "procesos por analista"
  const dataAnalistaChart = useMemo(() => {
    const base =
      analistaFiltro.value === "Todos"
        ? procesosAdaptados
        : procesosAdaptados.filter((p) => p.analista === analistaFiltro.value);

    const contar = (estado: string) =>
      base.filter((p) => p.estado === estado).length;

    return [
      { name: "Citado", value: contar("Citado") },
      { name: "Evaluado", value: contar("Evaluado") },
      { name: "En procesamiento", value: contar("En procesamiento") },
      { name: "En revisión", value: contar("En revisión") },
      { name: "En firma", value: contar("En firma") },
      { name: "Notificado", value: contar("Notificado") },
    ];
  }, [procesosAdaptados, analistaFiltro]);

  const totalAnalistaChart =
    analistaFiltro.value === "Todos"
      ? procesosAdaptados.length
      : procesosAdaptados.filter((p) => p.analista === analistaFiltro.value)
          .length;

  // Datos para "resultados de evaluación"
  const dataEvaluacionChart = useMemo(() => {
    let base = procesosRaw.filter(
      (p) => p.fechaNotificacion !== null && p.fechaNotificacion !== "",
    );

    if (analistaFiltroEval.value !== "Todos") {
      base = base.filter(
        (p) => String(p.FKIdAcceso) === analistaFiltroEval.value,
      );
    }

    if (mesFiltroEval) {
      base = base.filter((p) => {
        const fecha = new Date(p.fechaNotificacion);
        return (
          `${fecha.getFullYear()}-${fecha.getMonth() + 1}` ===
          mesFiltroEval.value
        );
      });
    }

    const conteo: Record<string, number> = {};
    base.forEach((p) => {
      const key = p.resultadoProcesoEvaluacion?.trim() || "Sin resultado";
      conteo[key] = (conteo[key] ?? 0) + 1;
    });

    return {
      data: Object.entries(conteo).map(([name, value]) => ({ name, value })),
      total: base.length,
    };
  }, [procesosRaw, analistaFiltroEval, mesFiltroEval]);

  // Helpers de navegación -------------------------------------------------------
  const handleEditarSolicitud = useCallback(
    (solicitudAdaptada: ICedulaAdaptada) => {
      const solicitudCompleta = procesosRaw.find(
        (p) => p.idProceso === solicitudAdaptada.id,
      );
      navigate("/asignar-solicitud", {
        state: { solicitud: solicitudCompleta },
      });
    },
    [procesosRaw, navigate],
  );

  // Totales -------------------------------------------------------------------
  const totalSolicitudes =
    contadores.pendientes + contadores.entregadas + contadores.notificadas;
  const totalProcesos =
    contadores.citado +
    contadores.evaluado +
    contadores.procesamiento +
    contadores.revision +
    contadores.firma +
    contadores.notificadoProceso;

  const mostrarGrafica = (key: string) =>
    graficaSeleccionada?.value === key ||
    graficaSeleccionada?.value === "todas";

  return (
    <>
      <Toast texto={toast.texto} tipo={toast.tipo} />

      <main className="main-content-estadisticas">
        <div className="page-header">
          <h1 className="page-title-estadisticas">Estadísticas</h1>
        </div>

        {/* Selector de gráfica */}
        <div className="w-125 mb-5 mx-auto border-[1.5px] border-[#18529]">
          <Select<ILabelValue>
            options={GRAFICAS_OPTIONS}
            value={graficaSeleccionada}
            onChange={(v) => v && setGraficaSeleccionada(v)}
            placeholder="Selecciona una gráfica..."
            isClearable={false}
          />
        </div>

        <div className="contenido-cedula-inner">
          {/* Solicitudes */}
          {mostrarGrafica("solicitudes") && (
            <section className="stats-section">
              <h1 className="section-title">
                📌 {totalSolicitudes} Solicitudes Activas
              </h1>
              <p className="stats-label">
                {contadores.pendientes} Pendientes (cita),{" "}
                {contadores.entregadas} Entregadas (cita),{" "}
                {contadores.notificadas} Citadas
              </p>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dataSolicitudesChart}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={108}
                      dataKey="value"
                      label
                    >
                      {dataSolicitudesChart.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={COLORS_PIE[index % COLORS_PIE.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* Procesos */}
          {mostrarGrafica("procesos") && (
            <section className="stats-section">
              <h1 className="section-title">
                ⚙️ {totalProcesos} Procesos Activos
              </h1>
              <p className="stats-label">
                {contadores.citado} Citado, {contadores.evaluado} Evaluado,{" "}
                {contadores.procesamiento} En procesamiento,{" "}
                {contadores.revision} En revisión, {contadores.firma} En firma,{" "}
                {contadores.notificadoProceso} Notificado,{" "}
                {contadores.cancelado} Cancelado, {contadores.terminado}{" "}
                Terminado
              </p>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={dataProcesosChart}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      dataKey="value"
                      label
                    >
                      {dataProcesosChart.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={COLORS_PIE2[index % COLORS_PIE2.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* Actividad mensual */}
          {mostrarGrafica("mensual") && (
            <section className="stats-section">
              <h1 className="section-title">
                📉 Actividades Registradas al mes
              </h1>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dataMensual ?? []}>
                  <defs>
                    <linearGradient
                      id="colorSolicitudes"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#18529D" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#18529D" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="solicitudes"
                    stroke="#18529D"
                    fillOpacity={1}
                    fill="url(#colorSolicitudes)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </section>
          )}

          {/* Procesos por analista */}
          {mostrarGrafica("porAnalista") && (
            <section className="stats-section">
              <div className="flex justify-between items-center">
                <h1 className="section-title">⚙️ Procesos por analista</h1>
                <div className="w-62.5">
                  <Select<ILabelValue>
                    options={analistaOptions}
                    value={analistaFiltro}
                    onChange={(v) => setAnalistaFiltro(v ?? OPCION_TODOS)}
                    placeholder="Selecciona un analista"
                    isClearable
                  />
                </div>
              </div>

              <p className="stats-label">
                {totalAnalistaChart} Procesos —{" "}
                {dataAnalistaChart
                  .map((d) => `${d.value} ${d.name}`)
                  .join(", ")}
              </p>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={dataAnalistaChart}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={108}
                      dataKey="value"
                      label
                    >
                      {dataAnalistaChart.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={COLORS_PIE2[index % COLORS_PIE2.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* Resultados de evaluación */}
          {mostrarGrafica("evaluacion") && (
            <section className="stats-section">
              <h1 className="section-title">📈 Resultados de evaluación</h1>

              <div className="flex gap-4 mb-4">
                <div className="w-62.5">
                  <Select<ILabelValue>
                    options={[
                      OPCION_TODOS_ANALISTAS,
                      ...analistas.map((a) => ({
                        value: String(a.idAcceso),
                        label:
                          `${a.nombre} ${a.primerApellido} ${a.segundoApellido ?? ""}`.trim(),
                      })),
                    ]}
                    value={analistaFiltroEval}
                    onChange={(v) =>
                      setAnalistaFiltroEval(v ?? OPCION_TODOS_ANALISTAS)
                    }
                    placeholder="Selecciona un analista"
                    isClearable
                  />
                </div>

                <div className="w-62.5">
                  <Select<ILabelValue>
                    options={mesesOptions}
                    value={mesFiltroEval}
                    onChange={(v) => setMesFiltroEval(v ?? null)}
                    placeholder="Selecciona un mes"
                    isClearable
                  />
                </div>
              </div>

              <p className="stats-label">
                Mostrando {dataEvaluacionChart.total} procesos con resultado de
                evaluación{" "}
                {mesFiltroEval
                  ? `en ${mesFiltroEval.label}`
                  : "de los últimos meses"}{" "}
                {analistaFiltroEval.value === "Todos"
                  ? "de todos los analistas"
                  : `de ${analistaFiltroEval.label}`}
              </p>

              <div className="chart-container">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={dataEvaluacionChart.data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" barSize={45}>
                      {dataEvaluacionChart.data.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={COLORS_BAR[index % COLORS_BAR.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex wrap-normal justify-center gap-4 mt-4">
                {dataEvaluacionChart.data.map((entry, index) => (
                  <div
                    key={entry.name}
                    className="flex items-center gap-2 text-[0.9rem]"
                  >
                    <div
                      style={{
                        backgroundColor: COLORS_BAR[index % COLORS_BAR.length],
                      }}
                      className="w-4 h-4 border rounded-[3px]"
                    />
                    <span>{entry.name}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tabla de procesos */}
          <section className="stats-section">
            <h1 className="section-title">⚙️ Procesos</h1>

            <div className="filtros-combobox">
              <div>
                <p>Estado</p>
                <Select<ILabelValue>
                  options={ESTADO_OPTIONS}
                  value={filtrosProcesos.estado}
                  onChange={(v) =>
                    setFiltrosProcesos((prev) => ({ ...prev, estado: v }))
                  }
                  isClearable
                />
              </div>
              <div>
                <p>Analista</p>
                <Select<ILabelValue>
                  options={analistaOptions}
                  value={filtrosProcesos.analista}
                  onChange={(v) =>
                    setFiltrosProcesos((prev) => ({ ...prev, analista: v }))
                  }
                  isClearable
                />
              </div>
              <div>
                <p>Dependencia</p>
                <Select<ILabelValue>
                  options={dependenciaOptions}
                  value={filtrosProcesos.dependencia}
                  onChange={(v) =>
                    setFiltrosProcesos((prev) => ({ ...prev, dependencia: v }))
                  }
                  isClearable
                />
              </div>
              <div className="filtro-busqueda mt-[2.8%]">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loadingProcesos ? (
              <p>Cargando procesos...</p>
            ) : (
              <table className="tabla-candidatos">
                <thead>
                  <tr>
                    <th>Folio/Hermés</th>
                    <th>Nombre</th>
                    <th>Analista</th>
                    <th>Estado</th>
                    <th>Dependencia</th>
                  </tr>
                </thead>
                <tbody>
                  {procesosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center">
                        No hay procesos con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    procesosFiltrados.map((p) => {
                      const procesoOriginal = procesosRaw.find(
                        (r) => r.idProceso === p.id,
                      );
                      return (
                        <tr
                          key={p.id}
                          onDoubleClick={() =>
                            navigate("/evaluacion", { state: procesoOriginal })
                          }
                          className="cursor-pointer"
                          title="Doble clic para abrir en evaluación"
                        >
                          <td>{p.folio}</td>
                          <td>{p.nombre}</td>
                          <td>{p.analista}</td>
                          <td>{p.estado}</td>
                          <td>{p.dependencia}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </section>

          {/* Tabla de solicitudes */}
          <section className="stats-section">
            <h1 className="section-title">📑 Solicitudes</h1>

            <div className="filtros-bar">
              <div className="filtro-estado">
                <Select<ILabelValue>
                  options={ESTADO_SOLICITUD_OPTIONS}
                  value={estadoFiltroSolicitud}
                  onChange={(v) => v && setEstadoFiltroSolicitud(v)}
                  isClearable={false}
                />
              </div>
              <div className="filtro-busqueda">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTermSolicitudes}
                  onChange={(e) => setSearchTermSolicitudes(e.target.value)}
                />
              </div>
            </div>

            {loadingProcesos ? (
              <p className="mensaje-info">Cargando solicitudes...</p>
            ) : solicitudesFiltradas.length === 0 ? (
              <div className="mensaje-vacio-container">
                <h2>Todo en orden</h2>
                <p>No hay solicitudes pendientes en este momento.</p>
              </div>
            ) : (
              <table className="tabla-candidatos">
                <thead>
                  <tr>
                    <th>Folio/Hermés</th>
                    <th>Puesto</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudesFiltradas.map((s) => (
                    <tr
                      key={s.id}
                      onDoubleClick={() => handleEditarSolicitud(s)}
                      className="cursor-pointer"
                      title="Doble clic para asignar solicitud"
                    >
                      <td>{s.folio}</td>
                      <td>{s.puesto}</td>
                      <td>{s.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

export default Estadisticas;
