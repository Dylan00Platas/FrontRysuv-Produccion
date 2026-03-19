import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserLock, FaSearch } from "react-icons/fa";
import CatalogoService from "@/services/CatalogosService";
import ProcesoContratacionService from "@/services/ProcesoContratacionService";
import { Toast } from "@/components/Alert/Floating/Toast";
import { useToast } from "@/hooks/useToast";
import "./IniciarSolicitud.css";
import IGetSesion from "@/schemas/acceso/GetSesion";
import AuthService from "@/services/AuthService";
import { IDependenciaBase } from "@/schemas/catalogos/GetDependencia";
import IPostProcesoContratacion from "@/schemas/procesos-contratacion/PostProcesoContratacion";

interface ICandidato {
  nombre: string;
  fechaCita: string;
}

export interface IProcesoContratacion {
  folio: string;
  hermes: string;
  fechaRecibido: string;
  numDependencia: string;
  dependencia: string;
  area: string;
  region: string;
  tipoPersonal: string;
  numPlaza: string;
  categoriaOrigen: string;
  titularPlaza: string;
  lineamiento: string;
  motivo: string;
  fechaPropuesta: string;
  fechaOficio: string;
  periodoInicio: string;
  periodoTermino: string;
  categoriaAutorizada: string;
  tipo: string;
  estado: number;
  autorizacion: boolean;
  observaciones: string;
  numeroCarpeta: string;
  candidato: string;
  funcion: string;
  familia: string;
  fechaEntrevista: string;
  fechaCompetencias: string;
  fechaProcesamiento: string;
  resultadoConocimiento: string;
  experiencia: string;
  referencias: string;
  fechaEnvioDes: string;
  resultadoWord: string;
  resultadoExcel: string;
  resultadoOrtografia: string;
  resultadoEvaluacion: string;
  beneficiado: boolean;
  fechaOfiEval: string;
  fechaEnvioDEyDP: string;
  fechaNotificacion: string;
  tiempoProceso: string;
  observacionesAnalista: string;
  consecutivoExpediente: string;
  seguimientoDesempeno: string;
  resultadoSeguimiento: string;
  idDependencia: number;
  fechaEvaluacionDesempenio: string;
  cantidadCandidatos: string;
  idAcceso: number;
  tipoDeProceso: number;
  candidatos: ICandidato[];
}

function IniciarSolicitud() {
  const navigate = useNavigate();
  const [tipoSolicitud, setTipoSolicitud] = useState("");
  const [dependenciasCargadas, setDependenciasCargadas] = useState(false);
  const [dependencias, setDependencias] = useState<IDependenciaBase[]>([]);
  const {toast, mostrarToast} = useToast();
  const ServicioCatalogo = new CatalogoService();
  const [datosSesion, setDatosSesion] = useState<IGetSesion|null>(null);

  const [formData, setFormData] = useState<IProcesoContratacion>({
    idAcceso: 0,
    folio: "",
    hermes: "",
    fechaRecibido: "",
    numDependencia: "",
    dependencia: "",
    area: "",
    region: "",
    tipoPersonal: "",
    numPlaza: "",
    categoriaOrigen: "",
    titularPlaza: "",
    lineamiento: "",
    motivo: "",
    fechaPropuesta: "",
    fechaOficio: "",
    periodoInicio: "",
    periodoTermino: "",
    categoriaAutorizada: "",
    tipo: "",
    estado: 1,
    autorizacion: false,
    observaciones: "",
    numeroCarpeta: "",
    candidato: "",
    funcion: "",
    familia: "",
    fechaEntrevista: "",
    fechaCompetencias: "",
    fechaProcesamiento: "",
    resultadoConocimiento: "",
    experiencia: "",
    referencias: "",
    fechaEnvioDes: "",
    resultadoWord: "",
    resultadoExcel: "",
    resultadoOrtografia: "",
    resultadoEvaluacion: "",
    beneficiado: false,
    fechaOfiEval: "",
    fechaEnvioDEyDP: "",
    fechaNotificacion: "",
    tiempoProceso: "",
    observacionesAnalista: "",
    consecutivoExpediente: "",
    seguimientoDesempeno: "",
    resultadoSeguimiento: "",
    idDependencia: 0,
    tipoDeProceso: 0,
    fechaEvaluacionDesempenio: "",
    cantidadCandidatos: "1",
    candidatos: [{ nombre: "", fechaCita: "" }],
  });

  useEffect(() => {
    async function ObtenerSesion() {
      if(datosSesion === null){
        const AuthServicio = new AuthService();
        const respuesta = await AuthServicio.session();
        if(respuesta.mensaje.usuario){
          const DatosSesion : IGetSesion = {
            tipoDeAcceso: respuesta.mensaje.tipoDeAcceso,
            usuario: respuesta.mensaje.usuario,
            idAcceso: respuesta.mensaje.idAcceso,
            nombre: respuesta.mensaje.nombre,
            primerApellido: respuesta.mensaje.primerApellido,
            segundoApellido: respuesta.mensaje.segundoApellido
          }
          setDatosSesion(DatosSesion)
        }
      }
    }
    ObtenerSesion();
  }, [])

  useEffect(() => {
    async function cargarDependencias() {
      if (dependencias.length === 0 && dependenciasCargadas !== true) {
        try {
          const response = await ServicioCatalogo.getDependencias();
          setDependencias(response.mensaje.dependencias)
          setDependenciasCargadas(true);
        } catch (err) {
          console.error("IniciarSolicitud.tsx - Error cargando dependencias: ", err);
          mostrarToast("Error al cargar dependencias", "error")
        }
      }else{
        setDependenciasCargadas(true);
      }
    }
    cargarDependencias();
  }, [dependenciasCargadas]);

  {
    !dependenciasCargadas && (
      <div className="overlay-cargando">
        <div className="spinner"></div>
        <p>Cargando dependencias...</p>
      </div>
    );
  }

  const handleInputChange = (field: keyof IProcesoContratacion, value: string | number | boolean | ICandidato[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.folio.trim() && !formData.hermes.trim()) {
      mostrarToast("Debes ingresar al menos un Folio o Hermes de notificación", "error")
      return;
    }
    try {
      const ProcesoContratacionServicio = new ProcesoContratacionService();
      const cantidad = parseInt(formData.cantidadCandidatos, 10) || 1;
      for (let i = 0; i < cantidad; i++) {
        const dataConCandidato = {
          ...formData,
          candidato: formData.candidatos[i].nombre,
          fechaCita: formData.candidatos[i].fechaCita,
        };
        let response;
        const DatosCandidato: IPostProcesoContratacion = {
          autorizacion: dataConCandidato.autorizacion, beneficiado: dataConCandidato.beneficiado, categoriaAutorizadaOficio: dataConCandidato.categoriaAutorizada, categoriaPuestoOrigen: dataConCandidato.categoriaOrigen,
          consecutivoExpediente: dataConCandidato.consecutivoExpediente, diasProceso: dataConCandidato.tiempoProceso, experienciaLaboralSolicitada: dataConCandidato.experiencia, familiaFuncional: dataConCandidato.familia,
          fechaElaboracionPropuesta: dataConCandidato.fechaPropuesta, fechaEntrevista: dataConCandidato.fechaEntrevista, fechaEnvioDEyDP: dataConCandidato.fechaEnvioDEyDP, fechaEnvioEvaluacionDesempenio: dataConCandidato.fechaEvaluacionDesempenio,
          fechaEvaluacionCompetencias: dataConCandidato.fechaCompetencias, fechaInicioProcesamiento: dataConCandidato.fechaProcesamiento, fechaLiberacionOficio: dataConCandidato.fechaOficio, fechaNotificacion: dataConCandidato.fechaNotificacion,
          fechaRecibido: dataConCandidato.fechaRecibido, fechaRevisionOfiEval: dataConCandidato.fechaOfiEval, folio: dataConCandidato.folio, FKIdAcceso: datosSesion!.idAcceso, FKIdDependencia: dataConCandidato.idDependencia, FKIdEstadoProcesoContratacion: dataConCandidato.estado, FKIdTemporalDefinitiva: dataConCandidato.tipo === "temporal" ? 1 : 2,
          FKIdTipoPersonal: dataConCandidato.tipoPersonal === "eventual" ? 1 : 2, FKIdTipoProceso: tipoSolicitud === "Asignación" ? 1 : (tipoSolicitud === "Requisición" ? 2 : 3), funcionDesempeniar: dataConCandidato.funcion, hermesNotificacion: dataConCandidato.hermes, lineamientoOficioContinuidad: dataConCandidato.lineamiento, motivo: dataConCandidato.motivo,
          nombreCandidato: formData.candidatos[i].nombre, numCarpeta: dataConCandidato.numeroCarpeta, numPlaza: dataConCandidato.numPlaza, observaciones: dataConCandidato.observaciones, observacionesAnalista: dataConCandidato.observacionesAnalista, periodoAutorizadoOficioFin: dataConCandidato.periodoInicio,
          periodoAutorizadoOficioInicio: dataConCandidato.periodoTermino, resultadoEvaluacionCompetencias: dataConCandidato.resultadoEvaluacion, resultadoEvaluacionConocimiento: dataConCandidato.resultadoConocimiento, resultadoHabilidadesExcel: dataConCandidato.resultadoExcel, resultadoHabilidadesWord: dataConCandidato.resultadoWord,
          resultadoOrtografia: dataConCandidato.resultadoOrtografia, resultadoProcesoEvaluacion: dataConCandidato.resultadoEvaluacion, resultadoReferenciasLaborales: dataConCandidato.referencias, resultadoSeguimientoEvaluacionDesempenio: dataConCandidato.resultadoSeguimiento, titularPlaza: dataConCandidato.titularPlaza
        } 
        if (tipoSolicitud === "bolsa") {
          response = await ProcesoContratacionServicio.postProcesoContratacion(DatosCandidato)
        } else {
          response = await ProcesoContratacionServicio.postProcesoContratacion(DatosCandidato)
        }
        console.log(`Solicitud ${i + 1} creada:`, response);
      }
      mostrarToast( `${cantidad} solicitude(s) creadas correctamente`, "error")
      setTimeout(() => {
        navigate("/solicitudes");
      }, 2000);

      setFormData({
        folio: "",
        hermes: "",
        fechaRecibido: "",
        numDependencia: "",
        dependencia: "",
        area: "",
        region: "",
        tipoPersonal: "",
        numPlaza: "",
        categoriaOrigen: "",
        titularPlaza: "",
        lineamiento: "",
        motivo: "",
        fechaPropuesta: "",
        fechaOficio: "",
        periodoInicio: "",
        periodoTermino: "",
        categoriaAutorizada: "",
        tipo: "",
        estado: 1,
        idDependencia: 0,
        autorizacion: false,
        beneficiado: false,
        observaciones: "",
        numeroCarpeta: "",
        candidato: "",
        funcion: "",
        familia: "",
        fechaEntrevista: "",
        fechaCompetencias: "",
        fechaProcesamiento: "",
        resultadoConocimiento: "",
        experiencia: "",
        referencias: "",
        fechaEnvioDes: "",
        resultadoWord: "",
        resultadoExcel: "",
        resultadoOrtografia: "",
        resultadoEvaluacion: "",
        fechaOfiEval: "",
        fechaEnvioDEyDP: "",
        fechaNotificacion: "",
        tiempoProceso: "",
        observacionesAnalista: "",
        consecutivoExpediente: "",
        seguimientoDesempeno: "",
        resultadoSeguimiento: "",
        fechaEvaluacionDesempenio: "",
        cantidadCandidatos: "1",
        candidatos: [{ nombre: "", fechaCita: "" }],
        tipoDeProceso: 0,
        idAcceso: 0
      });
    } catch (error) {
      console.error("IniciarSolicitud.tsx - Error al iniciar solicitud:" + error);
      mostrarToast("Error al crear solicitud","error")
    }
  };

  const handleBuscarDependencia = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    e.preventDefault();
    const numDep = formData.numDependencia.trim();
    const dep = dependencias.find(dependecia => dependecia.numDependencia = numDep)
    if (dep) {
      handleInputChange("dependencia", dep.nombre);
      handleInputChange("area", dep.areaOrganizacional);
      handleInputChange("region", dep.zona);
      formData.idDependencia = dep.idDependencia;
    } else {
      mostrarToast("No se encontró la dependencia ingresada", "error")
    }
  };

  useEffect(() => {
    if (
      formData.lineamiento === "4.1 y 4.2" ||
      formData.lineamiento === "4.3"
    ) {
      if (formData.tipo !== "temporal") {
        setFormData((prev) => ({ ...prev, tipo: "temporal" }));
      }
    } else if (formData.lineamiento === "5.1 y 5.2") {
      if (formData.tipo !== "definitiva") {
        setFormData((prev) => ({ ...prev, tipo: "definitiva" }));
      }
    }
  }, [formData.lineamiento]);

  return (
    <div className="iniciar-solicitud-page">
      <main className="main-content-solicitud">
        <Toast texto={toast.texto} tipo={toast.tipo}/>
        <div className="page-header-solicitud">
          <h1 className="page-title-solicitud">Iniciar Solicitud</h1>
          <select
            className="header-select-solicitud"
            value={tipoSolicitud}
            onChange={(e) => setTipoSolicitud(e.target.value)}
          >
            <option value="" disabled>
              {" "}
              Seleccionar tipo de solicitud
            </option>
            <option value="Asignación">Asignación</option>
            <option value="Requisición">Requisición</option>
            <option value="Bolsa">Bolsa de Trabajo</option>
          </select>
        </div>

        <div className="form-wrapper">
          {tipoSolicitud === "" && (
            <div className="glass-overlay-lock">
              <div className="lock-content">
                <FaUserLock className="lock-icon" />
                <p>Selecciona un tipo de solicitud para continuar</p>
              </div>
            </div>
          )}

          <form className="form-grid-solicitud" onSubmit={handleSubmit}>
            {/* Campos comunes para ambos tipos */}
            <h3 className="section-title">Datos generales de la vacante</h3>

            <div className="form-group">
              <label className="form-label-solicitud">Folio </label>
              <input
                type="text"
                className="form-input-solicitud"
                value={formData.folio}
                onChange={(e) => {
                  handleInputChange("folio", e.target.value);
                  e.target.setCustomValidity("");
                }}
                disabled={tipoSolicitud === "Asignación"}
                style={{
                  backgroundColor:
                    tipoSolicitud === "Asignación" ? "#e0e0e0" : "white",
                  color: "black",
                }}
                placeholder={
                  tipoSolicitud === "Asignación"
                    ? "Este campo está bloqueado para asignación"
                    : ""
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label-solicitud">
                Hermes de Notificación
              </label>
              <input
                type="text"
                className="form-input-solicitud"
                value={formData.hermes}
                onChange={(e) => {
                  handleInputChange("hermes", e.target.value);
                  e.target.setCustomValidity("");
                }}
              />
            </div>

            <div className="form-group-solicitud">
              <label className="form-label-solicitud">Fecha de recibido</label>
              <input
                type="date"
                className="form-input-solicitud"
                value={formData.fechaRecibido}
                onChange={(e) =>
                  handleInputChange("fechaRecibido", e.target.value)
                }
              />
            </div>

            <div
              className="form-group-solicitud"
              style={{ position: "relative" }}
            >
              <label className="form-label-solicitud">
                Número de Entidad académica o Dependencia
              </label>
              <div className="input-with-icon">
                <input
                  type="text"
                  className="form-input-solicitud"
                  value={formData.numDependencia}
                  onChange={(e) =>
                    handleInputChange("numDependencia", e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleBuscarDependencia(e);
                    }
                  }}
                />
                <FaSearch
                  className="help-icon lupa-icon"
                  title="Buscar dependencia"
                  onClick={(e) => handleBuscarDependencia(e)}
                />
              </div>
            </div>

            <div className="form-group-solicitud">
              <label className="form-label-solicitud">
                Entidad académica o Dependencia
              </label>
              <input
                type="text"
                className="form-input-solicitud"
                value={formData.dependencia}
                onChange={(e) =>
                  handleInputChange("dependencia", e.target.value)
                }
              />
            </div>

            <div className="form-group-solicitud">
              <label className="form-label-solicitud">
                Área Organizacional
              </label>
              <input
                type="text"
                className="form-input-solicitud"
                value={formData.area}
                onChange={(e) => handleInputChange("area", e.target.value)}
              />
            </div>

            <div className="form-group-solicitud">
              <label className="form-label-solicitud">Región</label>
              <input
                type="text"
                className="form-input-solicitud"
                value={formData.region}
                onChange={(e) => handleInputChange("region", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label-solicitud">Tipo de Personal</label>
              <select
                className="form-input-solicitud"
                value={formData.tipoPersonal}
                onChange={(e) =>
                  handleInputChange("tipoPersonal", e.target.value)
                }
              >
                <option value="" disabled>
                  Seleccionar
                </option>
                <option value="eventual">Eventual</option>
                <option value="confianza">Confianza</option>
              </select>
            </div>

            <div className="form-group-solicitud">
              <label className="form-label-solicitud">Número de Plaza</label>
              <input
                type="text"
                className="form-input-solicitud"
                value={formData.numPlaza}
                onChange={(e) => handleInputChange("numPlaza", e.target.value)}
              />
            </div>

            <div className="form-group-solicitud">
              <label className="form-label-solicitud">
                Categoría/Puesto (origen)
              </label>
              <input
                type="text"
                className="form-input-solicitud"
                value={formData.categoriaOrigen}
                onChange={(e) =>
                  handleInputChange("categoriaOrigen", e.target.value)
                }
              />
            </div>

            <div className="form-group-solicitud">
              <label className="form-label-solicitud">
                Titular de la Plaza
              </label>
              <input
                type="text"
                className="form-input-solicitud"
                value={formData.titularPlaza}
                onChange={(e) =>
                  handleInputChange("titularPlaza", e.target.value)
                }
              />
            </div>

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
              >
                <option value="">Seleccionar</option>
                <option value="4.1 y 4.2">4.1 y 4.2</option>
                <option value="5.1 y 5.2">5.1 y 5.2</option>
                <option value="4.3">4.3</option>
                <option value="N/A">N/A</option>
              </select>
            </div>

            <div className="form-group-solicitud">
              <label className="form-label-solicitud">Motivo</label>
              <input
                type="text"
                className="form-input-solicitud"
                value={formData.motivo}
                onChange={(e) => handleInputChange("motivo", e.target.value)}
              />
            </div>

            <div className="form-group-solicitud">
              <label className="form-label-solicitud">
                Fecha de Elaboración Propuesta
              </label>
              <input
                type="date"
                className="form-input-solicitud"
                value={formData.fechaPropuesta}
                onChange={(e) =>
                  handleInputChange("fechaPropuesta", e.target.value)
                }
              />
            </div>

            <div className="form-group-solicitud">
              <label className="form-label-solicitud">
                Fecha de liberación de oficio
              </label>
              <input
                type="date"
                className="form-input-solicitud"
                value={formData.fechaOficio}
                onChange={(e) =>
                  handleInputChange("fechaOficio", e.target.value)
                }
              />
            </div>

            <div className="form-group-solicitud">
              <label className="form-label-solicitud">
                Periodo Autorizado en oficio (inicio)
              </label>
              <input
                type="date"
                className="form-input-solicitud"
                value={formData.periodoInicio}
                onChange={(e) =>
                  handleInputChange("periodoInicio", e.target.value)
                }
              />
            </div>

            <div className="form-group-solicitud">
              <label className="form-label-solicitud">
                Periodo Autorizado en oficio (término)
              </label>
              <input
                type="date"
                className="form-input-solicitud"
                value={formData.periodoTermino}
                onChange={(e) =>
                  handleInputChange("periodoTermino", e.target.value)
                }
              />
            </div>

            <div className="form-group-solicitud">
              <label className="form-label-solicitud">
                Categoría autorizada en oficio
              </label>
              <input
                type="text"
                className="form-input-solicitud"
                value={formData.categoriaAutorizada}
                onChange={(e) =>
                  handleInputChange("categoriaAutorizada", e.target.value)
                }
              />
            </div>

            <div className="form-group-solicitud">
              <label className="form-label-solicitud">Tipo</label>
              <select
                className="form-input-solicitud"
                value={formData.tipo}
                onChange={(e) => handleInputChange("tipo", e.target.value)}
              >
                <option value="" disabled>
                  Seleccionar
                </option>
                <option value="temporal">Temporal</option>
                <option value="definitiva">Definitiva</option>
              </select>
            </div>

            <div className="form-group-solicitud checkbox-group-solicitud">
              <input
                type="checkbox"
                checked={formData.autorizacion}
                onChange={(e) =>
                  handleInputChange("autorizacion", e.target.checked)
                }
              />
              <label>Autorización</label>
            </div>

            <div
              className="form-group-solicitud"
              style={{ gridColumn: "span 3" }}
            >
              <label className="form-label-solicitud">
                Observaciones Registro
              </label>
              <textarea
                className="large-textarea-solicitud"
                value={formData.observaciones}
                onChange={(e) =>
                  handleInputChange("observaciones", e.target.value)
                }
              />
            </div>

            {/* Campos específicos Bolsa de Trabajo */}
            {tipoSolicitud === "Bolsa" && (
              <>
                <h3 className="section-title">Datos del proceso</h3>
                <div className="form-group">
                  <label className="form-label-solicitud">
                    Número Carpeta{" "}
                  </label>
                  <input
                    type="text"
                    className="form-input-solicitud"
                    value={formData.numeroCarpeta}
                    onChange={(e) =>
                      handleInputChange("numeroCarpeta", e.target.value)
                    }
                  />
                </div>

                <div className="form-group-solicitud">
                  <label className="form-label-solicitud">
                    Nombre de Candidato
                  </label>
                  <input
                    type="text"
                    className="form-input-solicitud"
                    value={formData.candidato}
                    onChange={(e) =>
                      handleInputChange("candidato", e.target.value)
                    }
                  />
                </div>

                <div className="form-group-solicitud">
                  <label className="form-label-solicitud">
                    Función a desempeñar
                  </label>
                  <input
                    type="text"
                    className="form-input-solicitud"
                    value={formData.funcion}
                    onChange={(e) =>
                      handleInputChange("funcion", e.target.value)
                    }
                  />
                </div>

                <div className="form-group-solicitud">
                  <label className="form-label-solicitud">
                    Familia Funcional
                  </label>
                  <input
                    type="text"
                    className="form-input-solicitud"
                    value={formData.familia}
                    onChange={(e) =>
                      handleInputChange("familia", e.target.value)
                    }
                  />
                </div>

                <div className="form-group-solicitud">
                  <label className="form-label-solicitud">
                    Fecha Entrevista
                  </label>
                  <input
                    type="date"
                    className="form-input-solicitud"
                    value={formData.fechaEntrevista}
                    onChange={(e) =>
                      handleInputChange("fechaEntrevista", e.target.value)
                    }
                  />
                </div>

                <div className="form-group-solicitud">
                  <label className="form-label-solicitud">
                    Fecha Evaluación competencias
                  </label>
                  <input
                    type="date"
                    className="form-input-solicitud"
                    value={formData.fechaCompetencias}
                    onChange={(e) =>
                      handleInputChange("fechaCompetencias", e.target.value)
                    }
                  />
                </div>

                <div className="form-group-solicitud">
                  <label className="form-label-solicitud">
                    Fecha Se inicia procesamiento
                  </label>
                  <input
                    type="date"
                    className="form-input-solicitud"
                    value={formData.fechaProcesamiento}
                    onChange={(e) =>
                      handleInputChange("fechaProcesamiento", e.target.value)
                    }
                  />
                </div>

                <div className="form-group-solicitud">
                  <label className="form-label-solicitud">
                    Resultado Evaluación conocimiento
                  </label>
                  <input
                    type="text"
                    className="form-input-solicitud"
                    value={formData.resultadoConocimiento}
                    onChange={(e) =>
                      handleInputChange("resultadoConocimiento", e.target.value)
                    }
                  />
                </div>

                <div className="form-group-solicitud">
                  <label className="form-label-solicitud">
                    Experiencia laboral solicitada
                  </label>
                  <input
                    type="text"
                    className="form-input-solicitud"
                    value={formData.experiencia}
                    onChange={(e) =>
                      handleInputChange("experiencia", e.target.value)
                    }
                  />
                </div>

                <div className="form-group-solicitud">
                  <label className="form-label-solicitud">Referencias</label>
                  <input
                    type="text"
                    className="form-input-solicitud"
                    value={formData.referencias}
                    onChange={(e) =>
                      handleInputChange("referencias", e.target.value)
                    }
                  />
                </div>

                <div className="form-group-solicitud">
                  <label className="form-label-solicitud">
                    Fecha Envío a DEyDP
                  </label>
                  <input
                    type="date"
                    className="form-input-solicitud"
                    value={formData.fechaEnvioDes}
                    onChange={(e) =>
                      handleInputChange("fechaEnvioDes", e.target.value)
                    }
                  />
                </div>

                {/* Otros campos de resultados y seguimiento */}
                <div className="form-group-solicitud">
                  <label className="form-label-solicitud">Beneficiado</label>
                  <select
                    className="form-input-solicitud"
                    value={formData.beneficiado ? "si" : "no"}
                    onChange={(e) =>
                      handleInputChange("beneficiado", e.target.value)
                    }
                  >
                    <option value="" disabled>
                      Seleccionar
                    </option>
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label-solicitud">
                    Fecha Revisión OfiEval
                  </label>
                  <input
                    type="date"
                    className="form-input-solicitud"
                    value={formData.fechaOfiEval}
                    onChange={(e) =>
                      handleInputChange("fechaOfiEval", e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label-solicitud">
                    Fecha Notificación
                  </label>
                  <input
                    type="date"
                    className="form-input-solicitud"
                    value={formData.fechaNotificacion}
                    onChange={(e) =>
                      handleInputChange("fechaNotificacion", e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label-solicitud">
                    Tiempo del proceso
                  </label>
                  <input
                    type="text"
                    className="form-input-solicitud"
                    value={formData.tiempoProceso}
                    onChange={(e) =>
                      handleInputChange("tiempoProceso", e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label-solicitud">
                    Fecha de evaluación de desempeño
                  </label>
                  <input
                    type="date"
                    className="form-input-solicitud"
                    value={formData.fechaEvaluacionDesempenio}
                    onChange={(e) =>
                      handleInputChange(
                        "fechaEvaluacionDesempenio",
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "span 3" }}>
                  <label className="form-label-solicitud">
                    Observaciones Analista
                  </label>
                  <textarea
                    className="large-textarea"
                    value={formData.observacionesAnalista}
                    onChange={(e) =>
                      handleInputChange("observacionesAnalista", e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label-solicitud">
                    Consecutivo Expediente Físico
                  </label>
                  <input
                    type="text"
                    className="form-input-solicitud"
                    value={formData.consecutivoExpediente}
                    onChange={(e) =>
                      handleInputChange("consecutivoExpediente", e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label-solicitud">
                    Seguimiento Evaluación Desempeño
                  </label>
                  <select
                    className="form-input-solicitud"
                    value={formData.seguimientoDesempeno}
                    onChange={(e) =>
                      handleInputChange("seguimientoDesempeno", e.target.value)
                    }
                  >
                    <option value="" disabled>
                      Seleccionar
                    </option>
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label-solicitud">
                    Resultado Seguimiento Evaluación Desempeño
                  </label>
                  <input
                    type="text"
                    className="form-input-solicitud"
                    value={formData.resultadoSeguimiento}
                    onChange={(e) =>
                      handleInputChange("resultadoSeguimiento", e.target.value)
                    }
                  />
                </div>
              </>
            )}

            {/*  Asignación/Requisición */}
            {tipoSolicitud !== "Bolsa" && (
              <>
                <div className="form-group-solicitud">
                  <label className="form-label-solicitud">
                    Cantidad de candidatos
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="form-input-solicitud"
                    value={formData.cantidadCandidatos}
                    onChange={(e) => {
                      const cantidad = parseInt(e.target.value, 10) || 1;
                      const nuevosCandidatos = Array.from(
                        { length: cantidad },
                        (_, i) => ({
                          nombre: formData.candidatos[i]?.nombre || "",
                          fechaCita: formData.candidatos[i]?.fechaCita || "",
                        }),
                      );

                      handleInputChange("cantidadCandidatos", cantidad);
                      handleInputChange("candidatos", nuevosCandidatos);
                    }}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  {formData.candidatos.map((candidato, index) => (
                    <div key={index} className="candidato-section">
                      <h3 className="section-title">Candidato {index + 1}</h3>

                      <div className="form-group-solicitud">
                        <label className="form-label-solicitud">
                          Nombre del Candidato
                        </label>
                        <input
                          type="text"
                          className="form-input-solicitud candidato-input"
                          value={candidato.nombre}
                          onChange={(e) => {
                            const updated = [...formData.candidatos];
                            updated[index].nombre = e.target.value;
                            handleInputChange("candidatos", updated);
                          }}
                        />
                      </div>

                      <div className="form-group-solicitud">
                        <label className="form-label-solicitud">
                          Fecha de cita
                        </label>
                        <input
                          type="date"
                          className="form-input-solicitud candidato-input"
                          value={candidato.fechaCita}
                          onChange={(e) => {
                            const updated = [...formData.candidatos];
                            updated[index].fechaCita = e.target.value;
                            handleInputChange("candidatos", updated);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div
              className="form-group-solicitud action-buttons"
              style={{ gridColumn: "span 3" }}
            >
              <button type="submit" className="btn-guardar-solicitud">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default IniciarSolicitud;
