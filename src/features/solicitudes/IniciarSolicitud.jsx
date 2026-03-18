import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserLock, FaSearch } from "react-icons/fa";

import "./IniciarSolicitud.css";
import Sidebar from "@/layout/sidebar/Sidebar.jsx";
import CatalogoDependencia from "@/services/CatalogoDependencia.js";
import UserContext from "@/utils/UserContext.jsx";

function IniciarSolicitud() {
  const navigate = useNavigate();
  const [tipoSolicitud, setTipoSolicitud] = useState("");
  const [dependenciasCargadas, setDependenciasCargadas] = useState(false);
  const token = localStorage.getItem("token");
  const { currentUser } = useContext(UserContext);

  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const [formData, setFormData] = useState({
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
    estado: "",
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
    beneficiado: "",
    fechaOfiEval: "",
    fechaEnvioDEyDP: "",
    fechaNotificacion: "",
    tiempoProceso: "",
    observacionesAnalista: "",
    consecutivoExpediente: "",
    seguimientoDesempeno: "",
    resultadoSeguimiento: "",
    idDependencia: "",
    fechaEvaluacionDesempenio: "",
    cantidadCandidatos: 1,
    candidatos: [{ nombre: "", fechaCita: "" }],
  });

  useEffect(() => {
    async function cargarDependencias() {
      if (CatalogoDependencia.obtenerDependencias().length === 0) {
        const catalogo = new CatalogoDependencia();
        try {
          await catalogo.cargarDependencias(token);
          setDependenciasCargadas(true);
        } catch (err) {
          console.error("Error cargando dependencias:", err);
          setMensaje({ texto: "Error al cargar dependencias", tipo: "error" });
        }
      } else {
        setDependenciasCargadas(true);
      }
    }
    cargarDependencias();
  }, [token]);

  {
    !dependenciasCargadas && (
      <div className="overlay-cargando">
        <div className="spinner"></div>
        <p>Cargando dependencias...</p>
      </div>
    );
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ texto: "", tipo: "" });
    if (!formData.folio.trim() && !formData.hermes.trim()) {
      setMensaje({
        texto: "⚠️ Debes ingresar al menos un Folio o Hermes de notificación",
        tipo: "error",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const SolicitudService = new SolicitudService();
      const cantidad = parseInt(formData.cantidadCandidatos, 10) || 1;
      for (let i = 0; i < cantidad; i++) {
        const dataConCandidato = {
          ...formData,
          candidato: formData.candidatos[i].nombre,
          fechaCita: formData.candidatos[i].fechaCita,
        };
        let response;
        if (tipoSolicitud === "bolsa") {
          response = await SolicitudService.crearSolicitudBolsaTrabajo(
            dataConCandidato,
            token,
            tipoSolicitud,
          );
        } else {
          response = await SolicitudService.crearSolicitudAsignacionRequisicion(
            dataConCandidato,
            token,
            tipoSolicitud,
          );
        }
        console.log(`Solicitud ${i + 1} creada:`, response);
      }

      setMensaje({
        texto: `✅ ${cantidad > 1 ? `${cantidad} solicitudes creadas correctamente` : "Solicitud creada correctamente"}`,
        tipo: "exito",
      });
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
        estado: "",
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
        beneficiado: "",
        fechaOfiEval: "",
        fechaEnvioDEyDP: "",
        fechaNotificacion: "",
        tiempoProceso: "",
        observacionesAnalista: "",
        consecutivoExpediente: "",
        seguimientoDesempeno: "",
        resultadoSeguimiento: "",
        fechaEvaluacionDesempenio: "",
        cantidadCandidatos: 1,
        candidatos: [{ nombre: "", fechaCita: "" }],
      });
    } catch (error) {
      console.error("Error al iniciar solicitud:", error.message);
      setMensaje({ texto: `❌ Error: ${error.message}`, tipo: "error" });
    }
  };

  const handleBuscarDependencia = (e) => {
    e.preventDefault();
    const numDep = formData.numDependencia.trim();
    const dep =
      CatalogoDependencia.obtenerDependenciaPorNumeroDependencia(numDep);
    if (dep) {
      handleInputChange("dependencia", dep.nombre);
      handleInputChange("area", dep.areaOrganizacional);
      handleInputChange("region", dep.zona);
      formData.idDependencia = dep.idDependencia;
    } else {
      setMensaje({
        texto: "⚠️ No se encontró la dependencia ingresada",
        tipo: "error",
      });
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
        <Sidebar tipoAcceso={currentUser.FKidTipoAcceso} />

        {/*  Mensaje flotante */}
        {mensaje.texto && (
          <div className={`mensaje-flotante ${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}

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
            <option value="asignacion">Asignación</option>
            <option value="requisicion">Requisición</option>
            <option value="bolsa">Bolsa de Trabajo</option>
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
              <label htmlFor="folio" className="form-label-solicitud">Folio </label>
              <input
                id="folio"
                type="text"
                className="form-input-solicitud"
                value={formData.folio}
                onChange={(e) => {
                  handleInputChange("folio", e.target.value);
                  e.target.setCustomValidity("");
                }}
                disabled={tipoSolicitud === "asignacion"}
                style={{
                  backgroundColor:
                    tipoSolicitud === "asignacion" ? "#e0e0e0" : "white",
                  color: "black",
                }}
                placeholder={
                  tipoSolicitud === "asignacion"
                    ? "Este campo está bloqueado para asignación"
                    : ""
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="hermes" className="form-label-solicitud">
                Hermes de Notificación
              </label>
              <input
                id="hermes"
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
              <label htmlFor="fecha-recibido" className="form-label-solicitud">Fecha de recibido</label>
              <input
                id="fecha-recibido"
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
              <label htmlFor="num-dependencia" className="form-label-solicitud">
                Número de Entidad académica o Dependencia
              </label>
              <div className="input-with-icon">
                <input
                  id="num-dependencia"
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
              <label htmlFor="dependencia" className="form-label-solicitud">
                Entidad académica o Dependencia
              </label>
              <input
                id="dependencia"
                type="text"
                className="form-input-solicitud"
                value={formData.dependencia}
                onChange={(e) =>
                  handleInputChange("dependencia", e.target.value)
                }
              />
            </div>

            <div className="form-group-solicitud">
              <label htmlFor="area" className="form-label-solicitud">
                Área Organizacional
              </label>
              <input
                id="area"
                type="text"
                className="form-input-solicitud"
                value={formData.area}
                onChange={(e) => handleInputChange("area", e.target.value)}
              />
            </div>

            <div className="form-group-solicitud">
              <label htmlFor="region" className="form-label-solicitud">Región</label>
              <input
                id="region"
                type="text"
                className="form-input-solicitud"
                value={formData.region}
                onChange={(e) => handleInputChange("region", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="tipo-personal" className="form-label-solicitud">Tipo de Personal</label>
              <select
                id="tipo-personal"
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
              <label htmlFor="num-plaza" className="form-label-solicitud">Número de Plaza</label>
              <input
                id="num-plaza"
                type="text"
                className="form-input-solicitud"
                value={formData.numPlaza}
                onChange={(e) => handleInputChange("numPlaza", e.target.value)}
              />
            </div>

            <div className="form-group-solicitud">
              <label htmlFor="categoria-origen" className="form-label-solicitud">
                Categoría/Puesto (origen)
              </label>
              <input
                id="categoria-origen"
                type="text"
                className="form-input-solicitud"
                value={formData.categoriaOrigen}
                onChange={(e) =>
                  handleInputChange("categoriaOrigen", e.target.value)
                }
              />
            </div>

            <div className="form-group-solicitud">
              <label htmlFor="titular-plaza" className="form-label-solicitud">
                Titular de la Plaza
              </label>
              <input
                id="titular-plaza"
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
              <label htmlFor="lineamiento-solicitud" className="form-label-evaluacion">
                Lineamiento que aplica
              </label>
              <select
                id="lineamiento-solicitud"
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
              <label htmlFor="motivo" className="form-label-solicitud">Motivo</label>
              <input
                id="motivo"
                type="text"
                className="form-input-solicitud"
                value={formData.motivo}
                onChange={(e) => handleInputChange("motivo", e.target.value)}
              />
            </div>

            <div className="form-group-solicitud">
              <label htmlFor="fecha-propuesta" className="form-label-solicitud">
                Fecha de Elaboración Propuesta
              </label>
              <input
                id="fecha-propuesta"
                type="date"
                className="form-input-solicitud"
                value={formData.fechaPropuesta}
                onChange={(e) =>
                  handleInputChange("fechaPropuesta", e.target.value)
                }
              />
            </div>

            <div className="form-group-solicitud">
              <label htmlFor="fecha-oficio" className="form-label-solicitud">
                Fecha de liberación de oficio
              </label>
              <input
                id="fecha-oficio"
                type="date"
                className="form-input-solicitud"
                value={formData.fechaOficio}
                onChange={(e) =>
                  handleInputChange("fechaOficio", e.target.value)
                }
              />
            </div>

            <div className="form-group-solicitud">
              <label htmlFor="periodo-inicio" className="form-label-solicitud">
                Periodo Autorizado en oficio (inicio)
              </label>
              <input
                id="periodo-inicio"
                type="date"
                className="form-input-solicitud"
                value={formData.periodoInicio}
                onChange={(e) =>
                  handleInputChange("periodoInicio", e.target.value)
                }
              />
            </div>

            <div className="form-group-solicitud">
              <label htmlFor="periodo-termino" className="form-label-solicitud">
                Periodo Autorizado en oficio (término)
              </label>
              <input
                id="periodo-termino"
                type="date"
                className="form-input-solicitud"
                value={formData.periodoTermino}
                onChange={(e) =>
                  handleInputChange("periodoTermino", e.target.value)
                }
              />
            </div>

            <div className="form-group-solicitud">
              <label htmlFor="categoria-autorizada" className="form-label-solicitud">
                Categoría autorizada en oficio
              </label>
              <input
                id="categoria-autorizada"
                type="text"
                className="form-input-solicitud"
                value={formData.categoriaAutorizada}
                onChange={(e) =>
                  handleInputChange("categoriaAutorizada", e.target.value)
                }
              />
            </div>

            <div className="form-group-solicitud">
              <label htmlFor="tipo-solicitud" className="form-label-solicitud">Tipo</label>
              <select
                id="tipo-solicitud"
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
                id="autorizacion"
                type="checkbox"
                checked={formData.autorizacion}
                onChange={(e) =>
                  handleInputChange("autorizacion", e.target.checked)
                }
              />
              <label htmlFor="autorizacion">Autorización</label>
            </div>

            <div
              className="form-group-solicitud"
              style={{ gridColumn: "span 3" }}
            >
              <label htmlFor="observaciones" className="form-label-solicitud">
                Observaciones Registro
              </label>
              <textarea
                id="observaciones"
                className="large-textarea-solicitud"
                value={formData.observaciones}
                onChange={(e) =>
                  handleInputChange("observaciones", e.target.value)
                }
              />
            </div>

            {/* Campos específicos Bolsa de Trabajo */}
            {tipoSolicitud === "bolsa" && (
              <>
                <h3 className="section-title">Datos del proceso</h3>
                <div className="form-group">
                  <label htmlFor="numero-carpeta" className="form-label-solicitud">
                    Número Carpeta{" "}
                  </label>
                  <input
                    id="numero-carpeta"
                    type="text"
                    className="form-input-solicitud"
                    value={formData.numeroCarpeta}
                    onChange={(e) =>
                      handleInputChange("numeroCarpeta", e.target.value)
                    }
                  />
                </div>

                <div className="form-group-solicitud">
                  <label htmlFor="candidato-bolsa" className="form-label-solicitud">
                    Nombre de Candidato
                  </label>
                  <input
                    id="candidato-bolsa"
                    type="text"
                    className="form-input-solicitud"
                    value={formData.candidato}
                    onChange={(e) =>
                      handleInputChange("candidato", e.target.value)
                    }
                  />
                </div>

                <div className="form-group-solicitud">
                  <label htmlFor="funcion" className="form-label-solicitud">
                    Función a desempeñar
                  </label>
                  <input
                    id="funcion"
                    type="text"
                    className="form-input-solicitud"
                    value={formData.funcion}
                    onChange={(e) =>
                      handleInputChange("funcion", e.target.value)
                    }
                  />
                </div>

                <div className="form-group-solicitud">
                  <label htmlFor="familia" className="form-label-solicitud">
                    Familia Funcional
                  </label>
                  <input
                    id="familia"
                    type="text"
                    className="form-input-solicitud"
                    value={formData.familia}
                    onChange={(e) =>
                      handleInputChange("familia", e.target.value)
                    }
                  />
                </div>

                <div className="form-group-solicitud">
                  <label htmlFor="fecha-entrevista" className="form-label-solicitud">
                    Fecha Entrevista
                  </label>
                  <input
                    id="fecha-entrevista"
                    type="date"
                    className="form-input-solicitud"
                    value={formData.fechaEntrevista}
                    onChange={(e) =>
                      handleInputChange("fechaEntrevista", e.target.value)
                    }
                  />
                </div>

                <div className="form-group-solicitud">
                  <label htmlFor="fecha-competencias" className="form-label-solicitud">
                    Fecha Evaluación competencias
                  </label>
                  <input
                    id="fecha-competencias"
                    type="date"
                    className="form-input-solicitud"
                    value={formData.fechaCompetencias}
                    onChange={(e) =>
                      handleInputChange("fechaCompetencias", e.target.value)
                    }
                  />
                </div>

                <div className="form-group-solicitud">
                  <label htmlFor="fecha-procesamiento" className="form-label-solicitud">
                    Fecha Se inicia procesamiento
                  </label>
                  <input
                    id="fecha-procesamiento"
                    type="date"
                    className="form-input-solicitud"
                    value={formData.fechaProcesamiento}
                    onChange={(e) =>
                      handleInputChange("fechaProcesamiento", e.target.value)
                    }
                  />
                </div>

                <div className="form-group-solicitud">
                  <label htmlFor="resultado-conocimiento" className="form-label-solicitud">
                    Resultado Evaluación conocimiento
                  </label>
                  <input
                    id="resultado-conocimiento"
                    type="text"
                    className="form-input-solicitud"
                    value={formData.resultadoConocimiento}
                    onChange={(e) =>
                      handleInputChange("resultadoConocimiento", e.target.value)
                    }
                  />
                </div>

                <div className="form-group-solicitud">
                  <label htmlFor="experiencia" className="form-label-solicitud">
                    Experiencia laboral solicitada
                  </label>
                  <input
                    id="experiencia"
                    type="text"
                    className="form-input-solicitud"
                    value={formData.experiencia}
                    onChange={(e) =>
                      handleInputChange("experiencia", e.target.value)
                    }
                  />
                </div>

                <div className="form-group-solicitud">
                  <label htmlFor="referencias" className="form-label-solicitud">Referencias</label>
                  <input
                    id="referencias"
                    type="text"
                    className="form-input-solicitud"
                    value={formData.referencias}
                    onChange={(e) =>
                      handleInputChange("referencias", e.target.value)
                    }
                  />
                </div>

                <div className="form-group-solicitud">
                  <label htmlFor="fecha-envio-des" className="form-label-solicitud">
                    Fecha Envío a DEyDP
                  </label>
                  <input
                    id="fecha-envio-des"
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
                  <label htmlFor="beneficiado-solicitud" className="form-label-solicitud">Beneficiado</label>
                  <select
                    id="beneficiado-solicitud"
                    className="form-input-solicitud"
                    value={formData.beneficiado}
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
                  <label htmlFor="fecha-ofi-eval" className="form-label-solicitud">
                    Fecha Revisión OfiEval
                  </label>
                  <input
                    id="fecha-ofi-eval"
                    type="date"
                    className="form-input-solicitud"
                    value={formData.fechaOfiEval}
                    onChange={(e) =>
                      handleInputChange("fechaOfiEval", e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fecha-notificacion" className="form-label-solicitud">
                    Fecha Notificación
                  </label>
                  <input
                    id="fecha-notificacion"
                    type="date"
                    className="form-input-solicitud"
                    value={formData.fechaNotificacion}
                    onChange={(e) =>
                      handleInputChange("fechaNotificacion", e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tiempo-proceso-solicitud" className="form-label-solicitud">
                    Tiempo del proceso
                  </label>
                  <input
                    id="tiempo-proceso-solicitud"
                    type="text"
                    className="form-input-solicitud"
                    value={formData.tiempoProceso}
                    onChange={(e) =>
                      handleInputChange("tiempoProceso", e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fecha-eval-desempeno" className="form-label-solicitud">
                    Fecha de evaluación de desempeño
                  </label>
                  <input
                    id="fecha-eval-desempeno"
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
                  <label htmlFor="observaciones-analista" className="form-label-solicitud">
                    Observaciones Analista
                  </label>
                  <textarea
                    id="observaciones-analista"
                    className="large-textarea"
                    value={formData.observacionesAnalista}
                    onChange={(e) =>
                      handleInputChange("observacionesAnalista", e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="consecutivo-expediente" className="form-label-solicitud">
                    Consecutivo Expediente Físico
                  </label>
                  <input
                    id="consecutivo-expediente"
                    type="text"
                    className="form-input-solicitud"
                    value={formData.consecutivoExpediente}
                    onChange={(e) =>
                      handleInputChange("consecutivoExpediente", e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="seguimiento-desempeno" className="form-label-solicitud">
                    Seguimiento Evaluación Desempeño
                  </label>
                  <select
                    id="seguimiento-desempeno"
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
                  <label htmlFor="resultado-seguimiento" className="form-label-solicitud">
                    Resultado Seguimiento Evaluación Desempeño
                  </label>
                  <input
                    id="resultado-seguimiento"
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
            {tipoSolicitud !== "bolsa" && (
              <>
                <div className="form-group-solicitud">
                  <label htmlFor="cantidad-candidatos" className="form-label-solicitud">
                    Cantidad de candidatos
                  </label>
                  <input
                    id="cantidad-candidatos"
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
                    <div key={candidato.nombre ? `${candidato.nombre}-${index}` : index} className="candidato-section">
                      <h3 className="section-title">Candidato {index + 1}</h3>

                      <div className="form-group-solicitud">
                        <label htmlFor={`nombre-candidato-${index}`} className="form-label-solicitud">
                          Nombre del Candidato
                        </label>
                        <input
                          id={`nombre-candidato-${index}`}
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
                        <label htmlFor={`fecha-cita-${index}`} className="form-label-solicitud">
                          Fecha de cita
                        </label>
                        <input
                          id={`fecha-cita-${index}`}
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
