import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FaSearch, FaClock, FaCaretDown, FaCaretUp } from "react-icons/fa";
import { useRef } from "react";
import { useToast } from "@/hooks/useToast";
import IPutProcesoContratacion from "@/schemas/procesos-contratacion/PutProcesoContratacion";
import CatalogoService from "@/services/CatalogosService";
import ProcesoContratacionService from "@/services/ProcesoContratacionService";
import { IDependenciaBase } from "@/schemas/catalogos/GetDependencia";
import "./Evaluacion.css";
import IGetSesion from "@/schemas/acceso/GetSesion";
import AuthService from "@/services/AuthService";
import IPostControlVersion from "@/schemas/control-versiones/PostControlVersion";
import { Toast } from "@/components/Alert/Floating/Toast";

const mapTipoProceso = {
  1: "asignacion",
  2: "requisicion",
  3: "bolsa",
} as const;

const mapTemporalDefinitiva = {
  1: "Temporal",
  2: "Definitiva",
} as const;

const mapEstadoProceso = {
  1: "Citado",
  2: "Evaluado",
  4: "En revision",
  5: "En firma",
  6: "Notificado",
  7: "Cancelado",
  8: "Terminado",
  13: "Inicio procesamiento",
  14: "Procesamiento oficio",
  15: "Fin procesamiento",
} as const;

interface IPutProceso {
  idProcesoContratacion: number;
  folio: string;
  hermes: string;
  fechaRecibido: string;
  numDependencia: string;
  entidad: string;
  area: string;
  region: string;
  tipoPersonal: string;
  numPlaza: string;
  categoria: string;
  titular: string;
  lineamiento: string;
  motivo: string;
  fechaPropuesta: string;
  fechaLiberacion: string;
  pInicio: string;
  pTermino: string;
  categoriaAutorizada: string;
  tipo: (typeof mapTemporalDefinitiva)[keyof typeof mapTemporalDefinitiva];
  observacionesRegistro: string;
  analista: string;
  estado: (typeof mapEstadoProceso)[keyof typeof mapEstadoProceso];
  tipoAsignacion: (typeof mapTipoProceso)[keyof typeof mapTipoProceso];
  nCarpeta: string;
  candidato: string;
  funcion: string;
  familia: string;
  fechaEntrevista: string;
  fechaCompetencias: string;
  fechaProcesamiento: string;
  experienciaLaboral: string;
  resultadoConocimiento: string;
  fechaEnvioEval: string;
  resultadoReferencias: string;
  resultadoOrtografia: string;
  resultadoWord: string;
  resultadoExcel: string;
  resultadoEvaluacion: string;
  beneficiado: string;
  fechaRevision: string;
  fechaEnvio: string;
  fechaNotificacion: string;
  tiempoProceso: string;
  observacionesAnalista: string;
  consecutivo: string;
  seguimientoDesempeno: string;
  resultadoSeguimiento: string;
  estadoFinal: string;
  terminado: boolean;
  FKIdDependencia: number | null;
  fechaEvaluacionDesempeno: string;
}

interface ICalculoEstado {
  fechaEntrevista: string;
  fechaCompetencias: string;
  fechaProcesamiento: string;
  fechaRevision: string;
  fechaEnvio: string;
  fechaNotificacion: string;
}

function Evaluacion() {
  const location = useLocation();
  const procesoSeleccionado = location.state || {};
  const [step, setStep] = useState(1);
  const ProcesoServicio = new ProcesoContratacionService();
  const [soloLectura, setSoloLectura] = useState<boolean>(true);
  const [showPopup, setShowPopup] = useState(false);
  const [versiones, setVersiones] = useState<any>([]);
  const [dependenciasCargadas, setDependenciasCargadas] = useState(false);
  const [dependencias, setDependencias] = useState<IDependenciaBase[]>([]);
  const [tarjetasAbiertas, setTarjetasAbiertas] = useState<boolean[]>([]);
  const { toast, mostrarToast } = useToast();
  const [datosSesion, setDatosSesion] = useState<IGetSesion | null>(null);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  useEffect(() => {
    async function ObtenerSesion() {
      if (datosSesion === null) {
        const AuthServicio = new AuthService();
        const respuesta = await AuthServicio.session();
        if (respuesta.mensaje.usuario) {
          const DatosSesion: IGetSesion = {
            tipoDeAcceso: respuesta.mensaje.tipoDeAcceso,
            usuario: respuesta.mensaje.usuario,
            idAcceso: respuesta.mensaje.idAcceso,
            nombre: respuesta.mensaje.nombre,
            primerApellido: respuesta.mensaje.primerApellido,
            segundoApellido: respuesta.mensaje.segundoApellido,
          };
          setDatosSesion(DatosSesion);
        }
      }
    }

    ObtenerSesion();
  }, []);

  useEffect(() => {
    if (datosSesion?.tipoDeAcceso === 2) {
      setSoloLectura(true);
    } else {
      setSoloLectura(false);
    }
  }, [datosSesion]);

  const calcularEstado = (data: ICalculoEstado) => {
    if (
      !data.fechaEntrevista &&
      !data.fechaCompetencias &&
      !data.fechaProcesamiento &&
      !data.fechaRevision &&
      !data.fechaEnvio &&
      !data.fechaNotificacion
    )
      return "";

    if (data.fechaEntrevista && !data.fechaCompetencias) return "Citado";
    if (data.fechaCompetencias && !data.fechaProcesamiento) return "Evaluado";
    if (data.fechaRevision && !data.fechaEnvio) return "En revision";
    if (data.fechaEnvio && !data.fechaNotificacion) return "En firma";
    if (data.fechaNotificacion) return "Notificado";

    return "Terminado";
  };

  const [formData, setFormData] = useState<IPutProceso>({
    // Grid 1
    idProcesoContratacion: procesoSeleccionado.idProceso,
    folio: procesoSeleccionado.folio || "",
    hermes: procesoSeleccionado.hermesNotificacion || "",
    fechaRecibido: formatDate(procesoSeleccionado.fechaRecibido),
    numDependencia: procesoSeleccionado.numDependencia || "",
    entidad: procesoSeleccionado.nombre || "",
    area: procesoSeleccionado.area || "",
    region: procesoSeleccionado.zona || "",
    tipoPersonal: procesoSeleccionado.FKIdTipoPersonal || "",
    numPlaza: procesoSeleccionado.numPlaza || "",
    categoria: procesoSeleccionado.categoriaPuestoOrigen || "",
    titular: procesoSeleccionado.titularPlaza || "",
    lineamiento: procesoSeleccionado.lineamientoOficioContinuidad || "",
    motivo: procesoSeleccionado.motivo || "",
    fechaPropuesta: formatDate(procesoSeleccionado.fechaElaboracionPropuesta),
    fechaLiberacion: formatDate(procesoSeleccionado.fechaLiberacionOficio),
    pInicio: formatDate(procesoSeleccionado.periodoAutorizadoOficioInicio),
    pTermino: formatDate(procesoSeleccionado.periodoAutorizadoOficioFin),
    categoriaAutorizada: procesoSeleccionado.categoriaAutorizadaOficio || "",
    tipo:
      mapTemporalDefinitiva[
        procesoSeleccionado.FKIdTemporalDefinitiva as keyof typeof mapTemporalDefinitiva
      ] || "",
    observacionesRegistro: procesoSeleccionado.observaciones || "",
    analista: procesoSeleccionado.analista || "",
    estado:
      mapEstadoProceso[
        procesoSeleccionado.FKIdEstadoProcesoContratacion as keyof typeof mapEstadoProceso
      ] || "",
    tipoAsignacion:
      mapTipoProceso[
        procesoSeleccionado.FKIdTipoProceso as keyof typeof mapTipoProceso
      ] || "",

    // Grid 2
    nCarpeta: procesoSeleccionado.numCarpeta || "",
    candidato: procesoSeleccionado.nombreCandidato || "",
    funcion: procesoSeleccionado.funcionDesempeniar || "",
    familia: procesoSeleccionado.familiaFuncional || "",
    fechaEntrevista: formatDate(procesoSeleccionado.fechaEntrevista),
    fechaCompetencias: formatDate(
      procesoSeleccionado.fechaEvaluacionCompetencias,
    ),
    fechaProcesamiento: formatDate(
      procesoSeleccionado.fechaInicioProcesamiento,
    ),
    experienciaLaboral: procesoSeleccionado.experienciaLaboralSolicitada || "",
    resultadoConocimiento:
      procesoSeleccionado.resultadoEvaluacionConocimiento || "",
    fechaEnvioEval: formatDate(
      procesoSeleccionado.fechaEnvioEvaluacionDesempenio,
    ),
    resultadoReferencias:
      procesoSeleccionado.resultadoReferenciasLaborales || "",
    resultadoOrtografia: procesoSeleccionado.resultadoOrtografia || "",
    resultadoWord: procesoSeleccionado.resultadoHabilidadesWord || "",
    resultadoExcel: procesoSeleccionado.resultadoHabilidadesExcel || "",
    resultadoEvaluacion: procesoSeleccionado.resultadoProcesoEvaluacion || "",
    beneficiado: procesoSeleccionado.beneficiado ? "si" : "no",
    fechaRevision: formatDate(procesoSeleccionado.fechaRevisionOfiEval),
    fechaEnvio: formatDate(procesoSeleccionado.fechaEnvioDEyDP),
    fechaNotificacion: formatDate(procesoSeleccionado.fechaNotificacion),
    tiempoProceso: procesoSeleccionado.diasProceso || "",
    observacionesAnalista: procesoSeleccionado.observacionesAnalista || "",
    consecutivo: procesoSeleccionado.consecutivoExpediente || "",
    seguimientoDesempeno:
      procesoSeleccionado.seguimientoEvaluacionDesempenio === true
        ? "Si"
        : procesoSeleccionado.seguimientoEvaluacionDesempenio === false
          ? "No"
          : "",
    resultadoSeguimiento:
      procesoSeleccionado.resultadoSeguimientoEvaluacionDesempenio || "",
    estadoFinal: procesoSeleccionado.estadoFinal || "",
    terminado: procesoSeleccionado.terminado || false,
    FKIdDependencia: procesoSeleccionado.FKIdDependencia || null,
    fechaEvaluacionDesempeno:
      formatDate(procesoSeleccionado.fechaEvaluacionDesempeno) || "",
  });

  const fechasInicialesRef = useRef({
    fechaEntrevista: formData.fechaEntrevista,
    fechaCompetencias: formData.fechaCompetencias,
    fechaProcesamiento: formData.fechaProcesamiento,
    fechaRevision: formData.fechaRevision,
    fechaEnvio: formData.fechaEnvio,
    fechaNotificacion: formData.fechaNotificacion,
  });

  const toggleTarjeta = (index: number) => {
    setTarjetasAbiertas((prev) => ({
      ...prev,
      [index]: !prev[index], // alterna entre abierto/cerrado
    }));
  };

  const handleInputChange = (
    field: keyof IPutProceso,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    async function cargarDependencias() {
      if (dependencias.length === 0 && dependenciasCargadas !== true) {
        try {
          const ServicioCatalogo = new CatalogoService();
          const response = await ServicioCatalogo.getDependencias();
          setDependencias(response.mensaje.dependencias);
          setDependenciasCargadas(true);
        } catch (err) {
          console.error(
            "IniciarSolicitud.tsx - Error cargando dependencias: ",
            err,
          );
          mostrarToast("Error al cargar dependencias", "error");
        }
      } else {
        setDependenciasCargadas(true);
      }
    }
    cargarDependencias();
  }, [dependenciasCargadas]);

  useEffect(() => {
    async function ObtenerSesion() {
      if (datosSesion === null) {
        const AuthServicio = new AuthService();
        const respuesta = await AuthServicio.session();
        if (respuesta.mensaje.usuario) {
          const DatosSesion: IGetSesion = {
            tipoDeAcceso: respuesta.mensaje.tipoDeAcceso,
            usuario: respuesta.mensaje.usuario,
            idAcceso: respuesta.mensaje.idAcceso,
            nombre: respuesta.mensaje.nombre,
            primerApellido: respuesta.mensaje.primerApellido,
            segundoApellido: respuesta.mensaje.segundoApellido,
          };
          setDatosSesion(DatosSesion);
        }
      }
    }
    ObtenerSesion();
  }, []);

  const mapFormDataToDto = (form: IPutProceso, idAcceso: number): IPutProcesoContratacion => {
    const findKey = <T extends object>(map: T, value: string): number =>
      Number(Object.entries(map).find(([, v]) => v === value)?.[0] ?? 0);
    return {
      folio: String(form.folio),
      hermesNotificacion: form.hermes,
      fechaRecibido: form.fechaRecibido,
      numPlaza: String(form.numPlaza),
      categoriaPuestoOrigen: form.categoria,
      titularPlaza: form.titular,
      lineamientoOficioContinuidad: form.lineamiento,
      motivo: form.motivo,
      fechaElaboracionPropuesta: form.fechaPropuesta,
      fechaLiberacionOficio: form.fechaLiberacion,
      periodoAutorizadoOficioInicio: form.pInicio,
      periodoAutorizadoOficioFin: form.pTermino,
      categoriaAutorizadaOficio: form.categoriaAutorizada,
      observaciones: form.observacionesRegistro,
      FKIdEstadoProcesoContratacion: findKey(mapEstadoProceso, form.estado),
      FKIdTemporalDefinitiva: findKey(mapTemporalDefinitiva, form.tipo),
      FKIdTipoProceso: findKey(mapTipoProceso, form.tipoAsignacion),
      FKIdDependencia: form.FKIdDependencia ?? 0,

      // Grid 2
      numCarpeta: form.nCarpeta,
      nombreCandidato: form.candidato,
      funcionDesempeniar: form.funcion,
      familiaFuncional: form.familia,
      fechaEntrevista: form.fechaEntrevista,
      fechaEvaluacionCompetencias: form.fechaCompetencias,
      fechaInicioProcesamiento: form.fechaProcesamiento,
      experienciaLaboralSolicitada: form.experienciaLaboral,
      resultadoEvaluacionConocimiento: form.resultadoConocimiento,
      fechaEnvioEvaluacionDesempenio: form.fechaEnvioEval,
      resultadoReferenciasLaborales: form.resultadoReferencias,
      resultadoOrtografia: form.resultadoOrtografia,
      resultadoHabilidadesWord: form.resultadoWord,
      resultadoHabilidadesExcel: form.resultadoExcel,
      resultadoProcesoEvaluacion: form.resultadoEvaluacion,
      beneficiado: form.beneficiado === "si",
      fechaRevisionOfiEval: form.fechaRevision,
      fechaEnvioDEyDP: form.fechaEnvio,
      fechaNotificacion: form.fechaNotificacion,
      diasProceso: form.tiempoProceso,
      observacionesAnalista: form.observacionesAnalista,
      consecutivoExpediente: form.consecutivo,
      seguimientoEvaluacionDesempenio: form.seguimientoDesempeno === "Si",
      resultadoSeguimientoEvaluacionDesempenio: form.resultadoSeguimiento,

      // Campos sin equivalente en IPutProceso — ajusta según tu lógica
      atendioCita: false,
      avaladoPor: "",
      capacitado: false,
      citaVirtual: false,
      educacionFormal: "",
      fechaAsignacionAnalista: "",
      FKIdAcceso: idAcceso,
      FKIdTipoPersonal: Number(form.tipoPersonal) || 0,
      resultadoEvaluacionCompetencias: "",
    };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const idProceso = procesoSeleccionado.idProceso;
      const dto = mapFormDataToDto(formData,datosSesion!.idAcceso);
      const respuesta = await ProcesoServicio.putProcesoContratacion(
        idProceso,
        dto,
      );

      if (respuesta && respuesta.error === false) {
        try {
          const nombreCompleto = datosSesion!.usuario;
          const ControlPost: IPostControlVersion = {
            nombreCompleto: nombreCompleto,
            jsonDatos: JSON.stringify(dto),
            FKIdProceso: idProceso,
          };
          await ProcesoServicio.postControlVersion(ControlPost);
          mostrarToast("Evaluación registrada", "exito");
        } catch (versionError) {
          console.error(
            "Evaluacion.tsx - Error al registrar control de versión: " +
              versionError,
          );
          mostrarToast(
            "Evaluación guardada, pero NO se pudo registrar el control de cambios.",
            "error",
          );
        }
      } else {
        if (respuesta && respuesta.estado === 400) {
          mostrarToast("El formato de los datos es inválido.", "error");
        } else {
          mostrarToast("Ocurrió un error al guardar la evaluación.", "error");
        }
        console.log("Evaluacion.tsx - Respuesta del servidor:", respuesta);
      }
    } catch (error) {
      console.error("Evaluacion.tsx - Error al guardar evaluación:", error);
      mostrarToast(
        "Ocurrió un error al guardar los cambios de la evaluación.",
        "error",
      );
    }
  };

  useEffect(() => {
    type FechasClave =
      | "fechaEntrevista"
      | "fechaCompetencias"
      | "fechaProcesamiento"
      | "fechaRevision"
      | "fechaEnvio"
      | "fechaNotificacion";
    const fechasActuales: Record<FechasClave, string> = {
      fechaEntrevista: formData.fechaEntrevista,
      fechaCompetencias: formData.fechaCompetencias,
      fechaProcesamiento: formData.fechaProcesamiento,
      fechaRevision: formData.fechaRevision,
      fechaEnvio: formData.fechaEnvio,
      fechaNotificacion: formData.fechaNotificacion,
    };
    const hayCambio = (Object.keys(fechasActuales) as FechasClave[]).some(
      (key) => fechasActuales[key] !== fechasInicialesRef.current[key],
    );

    if (hayCambio) {
      const nuevoEstado = calcularEstado(formData);
      if (formData.estado !== nuevoEstado && nuevoEstado !== "") {
        setFormData((prev) => ({
          ...prev,
          estado: nuevoEstado as IPutProceso["estado"],
        }));
      }
    }
  }, [
    formData.fechaEntrevista,
    formData.fechaCompetencias,
    formData.fechaProcesamiento,
    formData.fechaRevision,
    formData.fechaEnvio,
    formData.fechaNotificacion,
  ]);

  useEffect(() => {
    if (
      formData.fechaNotificacion &&
      formData.resultadoEvaluacion === "Recomendable con observaciones"
    ) {
      const fechaNotif = new Date(formData.fechaNotificacion);
      const fechaEvaluacion = new Date(fechaNotif);
      fechaEvaluacion.setMonth(fechaEvaluacion.getMonth() + 3);
      const fechaISO = fechaEvaluacion.toISOString().split("T")[0];
      if (formData.fechaEvaluacionDesempeno !== fechaISO) {
        setFormData((prev) => ({
          ...prev,
          fechaEvaluacionDesempeno: fechaISO,
        }));
      }
    } else {
      if (formData.fechaEvaluacionDesempeno) {
        setFormData((prev) => ({
          ...prev,
          fechaEvaluacionDesempeno: "",
        }));
      }
    }
  }, [formData.fechaNotificacion]);

  const handleBuscarDependencia = () => {
    const numDep = formData.numDependencia.trim();
    const dep = dependencias.find(
      (dependencia) => dependencia.numDependencia === numDep,
    );
    if (dep) {
      handleInputChange("entidad", dep.nombre);
      handleInputChange("area", dep.areaOrganizacional);
      handleInputChange("region", dep.zona);
      handleInputChange("FKIdDependencia", dep.idDependencia);
    }
  };

  useEffect(() => {
    if (
      formData.lineamiento === "4.1 y 4.2" ||
      formData.lineamiento === "4.3"
    ) {
      if (formData.tipo !== "Temporal") {
        setFormData((prev) => ({ ...prev, tipo: "Temporal" }));
      }
    } else if (formData.lineamiento === "5.1 y 5.2") {
      if (formData.tipo !== "Definitiva") {
        setFormData((prev) => ({ ...prev, tipo: "Definitiva" }));
      }
    }
  }, [formData.lineamiento]);

  return (
    <>
      <Toast texto={toast.texto} tipo={toast.tipo} />
      <main className="main-content-evaluacion">
        <div className="page-header-evaluacion">
          <h1 className="page-title-evaluacion">Evaluación</h1>
          <div className="combobox-header-evaluacion">
            <label className="label-opcion-evaluacion">
              {formData.tipoAsignacion === "asignacion"
                ? "Asignación"
                : formData.tipoAsignacion === "requisicion"
                  ? "Requisición"
                  : "Bolsa"}
            </label>
          </div>
        </div>

        {/* FORM STEP 1 */}
        {step === 1 && (
          <form className="form-grid" onSubmit={handleSubmit}>
            {/* Identificador de candidato */}
            <div className="identificador-candidato-container full-row">
              <label className="identificador-candidato-label">
                Identificador de candidato:
              </label>
              <span className="identificador-candidato-valor">
                {formData.idProcesoContratacion || "N/A"}
              </span>
            </div>

            {/* Folio y Hermes */}
            {(
              [
                { label: "Folio", field: "folio" },
                { label: "Hermes de Notificación", field: "hermes" },
              ] as { label: string; field: keyof IPutProceso }[]
            ).map((f, i) => (
              <div key={i} className="form-group">
                <label className="form-label-evaluacion">{f.label}</label>
                <input
                  type="text"
                  className="form-input-evaluacion"
                  value={formData[f.field] as string}
                  onChange={(e) => handleInputChange(f.field, e.target.value)}
                  disabled={soloLectura}
                />
              </div>
            ))}

            {/* Fechas */}
            {(
              [
                {
                  label: "Fecha de recibido",
                  field: "fechaRecibido",
                  type: "date",
                },
                {
                  label: "Fecha de Elaboración Propuesta",
                  field: "fechaPropuesta",
                  type: "date",
                },
                {
                  label: "Fecha de liberación de oficio",
                  field: "fechaLiberacion",
                  type: "date",
                },
                {
                  label: "Periodo Autorizado en oficio (inicio)",
                  field: "pInicio",
                  type: "date",
                },
                {
                  label: "Periodo Autorizado en oficio (Termino)",
                  field: "pTermino",
                  type: "date",
                },
              ] as { label: string; field: keyof IPutProceso; type: string }[]
            ).map((f, i) => (
              <div key={i} className="form-group">
                <label className="form-label-evaluacion">{f.label}</label>
                <input
                  type={f.type}
                  className="form-input-evaluacion"
                  value={formData[f.field] as string}
                  onChange={(e) => handleInputChange(f.field, e.target.value)}
                  disabled={soloLectura}
                />
              </div>
            ))}

            <div className="form-group" style={{ position: "relative" }}>
              <label className="form-label-evaluacion">
                Número de Dependencia
              </label>
              <div className="input-with-icon">
                <input
                  type="text"
                  className="form-input-evaluacion"
                  value={formData.numDependencia}
                  onChange={(e) =>
                    handleInputChange("numDependencia", e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleBuscarDependencia();
                    }
                  }}
                  disabled={soloLectura}
                />
                <FaSearch
                  className="help-icon lupa-icon"
                  title="Buscar dependencia"
                  onClick={handleBuscarDependencia}
                />
              </div>
            </div>

            {/* Otros campos */}
            {(
              [
                { label: "Entidad académica o Dependencia", field: "entidad" },
                { label: "Área Organizacional", field: "area" },
                { label: "Región", field: "region" },
                {
                  label: "Tipo de Personal",
                  field: "tipoPersonal",
                  type: "select",
                },
                { label: "Número de Plaza", field: "numPlaza" },
                { label: "Categoría/Puesto (origen)", field: "categoria" },
                { label: "Titular de la Plaza", field: "titular" },
                { label: "Motivo", field: "motivo" },
                {
                  label: "Categoría por autorizar",
                  field: "categoriaAutorizada",
                },
              ] as { label: string; field: keyof IPutProceso; type?: string }[]
            ).map(({ label, field, type = "text" }, i) => (
              <div key={i} className="form-group">
                <label className="form-label-evaluacion">{label}</label>
                {type === "select" ? (
                  <select
                    className="form-input-evaluacion"
                    value={formData[field] as string}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    disabled={soloLectura}
                  >
                    <option value="">Seleccione...</option>
                    <option value="1">Confianza</option>
                    <option value="2">Eventual</option>
                  </select>
                ) : (
                  <input
                    type={type}
                    className="form-input-evaluacion"
                    value={formData[field] as string}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    disabled={soloLectura}
                  />
                )}
              </div>
            ))}

            {/* Lineamiento que aplica */}
            <div className="form-group">
              <label className="form-label-evaluacion">
                Lineamiento que aplica
              </label>
              <select
                className="form-input-evaluacion"
                value={formData.lineamiento}
                onChange={(e) =>
                  handleInputChange("lineamiento", e.target.value)
                }
                disabled={soloLectura}
              >
                <option value="">Seleccionar</option>
                <option value="4.1 y 4.2">4.1 y 4.2</option>
                <option value="5.1 y 5.2">5.1 y 5.2</option>
                <option value="4.3">4.3</option>
                <option value="N/A">N/A</option>
              </select>
            </div>

            {/* Tipo */}
            <div className="form-group">
              <label className="form-label-evaluacion">Tipo</label>
              <select
                className="form-input-evaluacion"
                value={formData.tipo}
                onChange={(e) => handleInputChange("tipo", e.target.value)}
                disabled={soloLectura}
              >
                <option value="">Seleccionar</option>
                <option value="Temporal">Temporal</option>
                <option value="Definitiva">Definitiva</option>
              </select>
            </div>

            {/* Observaciones Registro */}
            <div className="form-group" style={{ gridColumn: "span 3" }}>
              <label className="form-label-evaluacion">
                Observaciones Registro
              </label>
              <textarea
                className="large-textarea"
                value={formData.observacionesRegistro}
                onChange={(e) =>
                  handleInputChange("observacionesRegistro", e.target.value)
                }
                disabled={soloLectura}
              />
            </div>

            {/* Estado */}
            <div className="form-group">
              <label className="form-label-evaluacion">Estado</label>
              <select
                className="form-input-evaluacion"
                value={formData.estado}
                onChange={(e) => handleInputChange("estado", e.target.value)}
              >
                <option value="">Seleccionar</option>
                <option value="Citado">Citado</option>
                <option value="Evaluado">Evaluado</option>
                <option value="Inicio procesamiento">
                  Inicio procesamiento
                </option>
                <option value="Procesamiento oficio">
                  Procesamiento oficio
                </option>
                <option value="Fin procesamiento">
                  Fin procesamiento oficio
                </option>
                <option value="En revision">En revisión</option>
                <option value="En firma">En firma</option>
                <option value="Notificado">Notificado</option>
                <option value="Terminado">Terminado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <div className="action-buttons">
              <button
                type="button"
                className="btn-continuar"
                onClick={() => setStep(2)}
              >
                Continuar
              </button>
              <button type="submit" className="btn-guardar">
                Guardar
              </button>

              {datosSesion?.tipoDeAcceso !== 2 && (
                <button
                  type="button"
                  className="btn-crear-oficio"
                  onClick={() => {
                    const data = {
                      idProcesoContratacion: formData.idProcesoContratacion,
                      folio: String(formData.folio),
                      plaza: String(formData.numPlaza),
                      motivo: formData.motivo,
                      titularPlaza: formData.titular,
                      categoriaOrigen: formData.categoria,
                      categoriaAutorizada: formData.categoriaAutorizada,
                      candidato: formData.candidato,
                    };
                    sessionStorage.setItem("datosOficio", JSON.stringify(data));
                    window.open("/generar-oficio", "_blank");
                  }}
                >
                  Crear Oficio
                </button>
              )}

              <button
                type="button"
                className="btn-ver-oficios"
                onClick={() => {
                  const idProceso = formData.idProcesoContratacion;
                  sessionStorage.setItem(
                    "datosVerOficios",
                    JSON.stringify({ idProceso }),
                  );
                  window.open("/ver-oficios", "_blank");
                }}
              >
                Ver Oficios
              </button>
            </div>
          </form>
        )}
        <button
          className="btn-version-control-fixed"
          onClick={() => setShowPopup(true)}
        >
          <FaClock className="icono-reloj" />
        </button>

        {/* FORM STEP 2 */}
        {step === 2 && (
          <form className="form-grid" onSubmit={handleSubmit}>
            {/* Identificador de candidato */}
            <div className="identificador-candidato-container full-row">
              <label className="identificador-candidato-label">
                Identificador de candidato:
              </label>
              <span className="identificador-candidato-valor">
                {formData.idProcesoContratacion || "N/A"}
              </span>
            </div>

            <h3 className="section-title">Información del procesamiento</h3>

            {(
              [
                { label: "Nombre de Candidato", field: "candidato" },
                { label: "Función a desempeñar", field: "funcion" },
                { label: "Familia Funcional", field: "familia" },
              ] as { label: string; field: keyof IPutProceso }[]
            ).map((f, i) => (
              <div key={i} className="form-group">
                <label className="form-label-evaluacion">{f.label}</label>
                <input
                  type="text"
                  className="form-input-evaluacion"
                  value={formData[f.field] as string}
                  onChange={(e) => handleInputChange(f.field, e.target.value)}
                />
              </div>
            ))}

            <h3 className="section-title">Procesamiento</h3>

            {(
              [
                { label: "Fecha de entrevista", field: "fechaEntrevista" },
                {
                  label: "Fecha de evaluación competencias",
                  field: "fechaCompetencias",
                },
                {
                  label: "Fecha de inicio procesamiento",
                  field: "fechaProcesamiento",
                },
                {
                  label: "Fecha de envio de evaluación de desempeño",
                  field: "fechaEnvioEval",
                },
              ] as { label: string; field: keyof IPutProceso }[]
            ).map((f, i) => (
              <div key={i} className="form-group">
                <label className="form-label-evaluacion">{f.label}</label>
                <input
                  type="date"
                  className="form-input-evaluacion"
                  value={formData[f.field] as string}
                  onChange={(e) => handleInputChange(f.field, e.target.value)}
                />
              </div>
            ))}

            {/* Experiencia laboral */}
            <div className="form-group">
              <label className="form-label-evaluacion">
                Experiencia laboral solicitada
              </label>
              <select
                className="form-input-evaluacion"
                value={formData.experienciaLaboral}
                onChange={(e) =>
                  handleInputChange("experienciaLaboral", e.target.value)
                }
              >
                <option value="">Seleccionar</option>
                <option value="Cumple">Cumple</option>
                <option value="Cumple parcialmente">Cumple parcialmente</option>
                <option value="No cumple">No cumple</option>
              </select>
            </div>

            {(
              [
                {
                  label: "Resultado de evaluación conocimiento",
                  field: "resultadoConocimiento",
                },
                {
                  label: "Resultado de ortografía y redacción",
                  field: "resultadoOrtografia",
                },
                {
                  label: "Resultado de habilidades Word",
                  field: "resultadoWord",
                },
                {
                  label: "Resultado de habilidades Excel",
                  field: "resultadoExcel",
                },
              ] as { label: string; field: keyof IPutProceso; type?: string }[]
            ).map((f, i) => (
              <div key={i} className="form-group">
                <label className="form-label-evaluacion">{f.label}</label>
                <input
                  type={f.type || "text"}
                  className="form-input-evaluacion"
                  value={formData[f.field] as string}
                  onChange={(e) => {
                    const valor = e.target.value;
                    if (!f.type || f.type !== "number" || /^\d*$/.test(valor)) {
                      handleInputChange(f.field, valor);
                    }
                  }}
                />
              </div>
            ))}

            {/* Resultado de referencias */}
            <div className="form-group">
              <label className="form-label-evaluacion">
                Resultado de referencias
              </label>
              <select
                className="form-input-evaluacion"
                value={formData.resultadoReferencias}
                onChange={(e) =>
                  handleInputChange("resultadoReferencias", e.target.value)
                }
              >
                <option value="">Seleccionar</option>
                <option value="Recomendable">Recomendable</option>
                <option value="Recomendable con observaciones">
                  Recomendable con observaciones
                </option>
                <option value="No Recomendable">No Recomendable</option>
                <option value="No fue posible contactar">
                  No fue posible contactar
                </option>
              </select>
            </div>

            {/* Resultado de Evaluación */}
            <div className="form-group">
              <label className="form-label-evaluacion">
                Resultado de Evaluación
              </label>
              <select
                className="form-input-evaluacion"
                value={formData.resultadoEvaluacion}
                onChange={(e) =>
                  handleInputChange("resultadoEvaluacion", e.target.value)
                }
              >
                <option value="">Seleccionar</option>
                <option value="Recomendable">Recomendable</option>
                <option value="Recomendable con observaciones">
                  Recomendable con observaciones
                </option>
                <option value="No Recomendable">No recomendable</option>
              </select>
            </div>

            <h3 className="section-title">Etapa final del proceso</h3>

            {/* Beneficiado */}
            <div className="form-group">
              <label className="form-label-evaluacion">Beneficiado</label>
              <select
                className="form-input-evaluacion"
                value={formData.beneficiado}
                onChange={(e) =>
                  handleInputChange("beneficiado", e.target.value)
                }
              >
                <option value="">Seleccionar</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </div>

            {/* Fechas */}
            {(
              [
                {
                  label: "Fecha de revisión Oficina Eval",
                  field: "fechaRevision",
                },
                { label: "Fecha de envio a DEyDP", field: "fechaEnvio" },
                { label: "Fecha de Notificación", field: "fechaNotificacion" },
              ] as { label: string; field: keyof IPutProceso }[]
            ).map((f, i) => (
              <div key={i} className="form-group">
                <label className="form-label-evaluacion">{f.label}</label>
                <input
                  type="date"
                  className="form-input-evaluacion"
                  value={formData[f.field] as string}
                  onChange={(e) => handleInputChange(f.field, e.target.value)}
                />
              </div>
            ))}

            {/* Fecha de evaluación de desempeño */}
            <div className="form-group">
              <label className="form-label-evaluacion">
                Fecha de evaluación de seguimiento
              </label>
              <input
                type="date"
                className="form-input-evaluacion"
                value={formData.fechaEvaluacionDesempeno || ""}
                readOnly
              />
            </div>

            {/* Tiempo proceso */}
            <div className="form-group">
              <label className="form-label-evaluacion">
                Tiempo del proceso (cantidad de días)
              </label>
              <input
                type="number"
                className="form-input-evaluacion"
                value={formData.tiempoProceso}
                onChange={(e) =>
                  handleInputChange("tiempoProceso", e.target.value)
                }
              />
            </div>

            {/* Observaciones analista */}
            <div className="form-group" style={{ gridColumn: "span 3" }}>
              <label className="form-label-evaluacion">
                Observaciones del analista
              </label>
              <textarea
                className="large-textarea"
                value={formData.observacionesAnalista}
                onChange={(e) =>
                  handleInputChange("observacionesAnalista", e.target.value)
                }
              />
            </div>

            {/* Otros campos */}
            {(
              [
                {
                  label: "Consecutivo Expediente (Fisico)",
                  field: "consecutivo",
                },
                {
                  label: "Resultado a seguimiento de evaluación de desempeño",
                  field: "resultadoSeguimiento",
                },
              ] as { label: string; field: keyof IPutProceso }[]
            ).map((f, i) => (
              <div key={i} className="form-group">
                <label className="form-label-evaluacion">{f.label}</label>
                <input
                  type="text"
                  className="form-input-evaluacion"
                  value={formData[f.field] as string}
                  onChange={(e) => handleInputChange(f.field, e.target.value)}
                />
              </div>
            ))}

            {/* Seguimiento de evaluación desempeño */}
            <div className="form-group">
              <label className="form-label-evaluacion">
                Requiere seguimiento
              </label>
              <select
                className="form-input-evaluacion"
                value={formData.seguimientoDesempeno}
                onChange={(e) =>
                  handleInputChange("seguimientoDesempeno", e.target.value)
                }
              >
                <option value="Si">Si</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Estado y checkbox */}
            <div className="form-group">
              <label className="form-label-evaluacion">Estado</label>
              <select
                className="form-input-evaluacion"
                value={formData.estado}
                onChange={(e) => handleInputChange("estado", e.target.value)}
              >
                <option value="">Seleccionar</option>
                <option value="Citado">Citado</option>
                <option value="Evaluado">Evaluado</option>

                <option value="Inicio procesamiento">
                  Inicio procesamiento
                </option>
                <option value="Procesamiento oficio">
                  Procesamiento oficio
                </option>
                <option value="Fin procesamiento">
                  Fin procesamiento oficio
                </option>

                <option value="En revision">En revisión</option>
                <option value="En firma">En firma</option>
                <option value="Notificado">Notificado</option>
                <option value="Terminado">Terminado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            {/* Número de Carpeta */}
            <div className="form-group">
              <label className="form-label-evaluacion">Número de Carpeta</label>
              <input
                type="text"
                className="form-input-evaluacion"
                value={formData.nCarpeta}
                onChange={(e) => handleInputChange("nCarpeta", e.target.value)}
              />
            </div>
            <div className="action-buttons">
              <button
                type="button"
                className="btn-retroceder"
                onClick={() => setStep(1)}
              >
                Retroceder
              </button>
              <button type="submit" className="btn-guardar">
                Guardar
              </button>

              {datosSesion?.tipoDeAcceso !== 2 && (
                <button
                  type="button"
                  className="btn-crear-oficio"
                  onClick={() => {
                    const data = {
                      idProcesoContratacion: formData.idProcesoContratacion,
                      folio: String(formData.folio),
                      plaza: String(formData.numPlaza),
                      motivo: formData.motivo,
                      titularPlaza: formData.titular,
                      categoriaOrigen: formData.categoria,
                      categoriaAutorizada: formData.categoriaAutorizada,
                      candidato: formData.candidato,
                    };

                    const token = localStorage.getItem("token");
                    sessionStorage.setItem("token", token || "");
                    sessionStorage.setItem("datosOficio", JSON.stringify(data));

                    window.open("/generar-oficio", "_blank");
                  }}
                >
                  Crear Oficio
                </button>
              )}

              <button
                type="button"
                className="btn-ver-oficios"
                onClick={() => {
                  const idProceso = formData.idProcesoContratacion;
                  const token = localStorage.getItem("token") || "";

                  // Guardar en sessionStorage
                  sessionStorage.setItem("token", token);
                  sessionStorage.setItem(
                    "datosVerOficios",
                    JSON.stringify({ idProceso }),
                  );

                  // Abrir nueva pestaña / ventana
                  window.open("/ver-oficios", "_blank");
                }}
              >
                Ver Oficios
              </button>
            </div>
          </form>
        )}
        <button
          className="btn-version-control-fixed"
          onClick={async () => {
            try {
              const token = localStorage.getItem("token");
              const servicio = new ProcesoContratacionService();
              const idProceso = procesoSeleccionado.idProceso;

              console.log("ID del proceso:", idProceso);
              console.log("Token:", token);
              const listaJson =
                await servicio.getControlesVersionByProcesoId(idProceso);
              console.log("Respuesta cruda del backend:", listaJson);
              if (
                !listaJson ||
                listaJson.mensaje.controlesVersiones.length === 0
              ) {
                mostrarToast(
                  "No se recibieron versiones desde el backend",
                  "error",
                );
              }

              const versionesFormateadas =
                listaJson.mensaje.controlesVersiones.map((item) => {
                  console.log("Item original:", item);

                  let datosJson = item.jsonDatos;
                  if (typeof datosJson === "string") {
                    try {
                      datosJson = JSON.parse(datosJson);
                    } catch (parseError) {
                      console.error(
                        "Error parseando jsonDatos:",
                        parseError,
                        "jsonDatos:",
                        item.jsonDatos,
                      );
                      datosJson = "";
                    }
                  }

                  return {
                    NombreCompleto: item.nombreCompleto,
                    jsonDatos: datosJson,
                  };
                });
              console.log("Versiones formateadas:", versionesFormateadas);
              setVersiones(versionesFormateadas);
              setShowPopup(true);
            } catch (error) {
              console.error(
                "Evaluacion.tsx - Error al cargar versiones: ",
                error,
              );
              mostrarToast("Error al cargar versiones", "error");
            }
          }}
        >
          <FaClock className="icono-reloj" />
        </button>

        {showPopup && (
          <div className="popup-overlay" onClick={() => setShowPopup(false)}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
              <h2>Historial de versiones</h2>
              {versiones.length === 0 ? (
                <p>No hay versiones disponibles.</p>
              ) : (
                versiones.map((item: any, index: number) => {
                  const abierta = tarjetasAbiertas[index] || false; // por defecto cerrada
                  return (
                    <div className="json-card" key={index}>
                      <h4
                        onClick={() => toggleTarjeta(index)}
                        style={{ cursor: "pointer", userSelect: "none" }}
                      >
                        {item.NombreCompleto} — {item.fecha}{" "}
                        {abierta ? <FaCaretDown /> : <FaCaretUp />}
                      </h4>
                      {abierta && (
                        <ul className="json-list">
                          {Object.entries(item.jsonDatos).map(
                            ([key, value]) => (
                              <li key={key}>
                                <span className="json-key">
                                  {key.replace(/([A-Z])/g, " $1")}
                                </span>
                                <span className="json-value">
                                  {String(value)}
                                </span>
                              </li>
                            ),
                          )}
                        </ul>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default Evaluacion;
