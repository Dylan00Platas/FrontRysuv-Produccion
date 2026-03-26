import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserLock, FaSearch } from "react-icons/fa";
import CatalogoService from "@/services/CatalogosService";
import ProcesoContratacionService from "@/services/ProcesoContratacionService";
import { Toast } from "@/components/Alert/Floating/Toast";
import { useToast } from "@/hooks/useToast";
import "./IniciarSolicitud.css";
import { IDependenciaBase } from "@/schemas/catalogos/GetDependencia";
import IPostProcesoContratacion from "@/schemas/procesos-contratacion/PostProcesoContratacion";
import { useCookie } from "@/hooks/useCookie";
import MainHeader from "@/components/header/MainHeader";
import { InputField } from "@/components/input-field/InputField";
import FormSectionCard from "@/components/card/FormSectionCard";

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
  const { toast, mostrarToast } = useToast();
  const { currentUser } = useCookie();

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
    async function cargarDependencias() {
      try {
        const response = await new CatalogoService().getDependencias();
        setDependencias(response.mensaje.dependencias);
      } catch (err) {
        mostrarToast("Error al cargar dependencias", "error");
      }
    }

    cargarDependencias();
  }, []);

  {
    !dependenciasCargadas && (
      <div className="overlay-cargando">
        <div className="spinner"></div>
        <p>Cargando dependencias...</p>
      </div>
    );
  }

  const handleInputChange = (
    field: keyof IProcesoContratacion,
    value: string | number | boolean | ICandidato[],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.folio.trim() && !formData.hermes.trim()) {
      mostrarToast(
        "Debes ingresar al menos un Folio o Hermes de notificación",
        "error",
      );
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
          autorizacion: dataConCandidato.autorizacion,
          beneficiado: dataConCandidato.beneficiado,
          categoriaAutorizadaOficio: dataConCandidato.categoriaAutorizada,
          categoriaPuestoOrigen: dataConCandidato.categoriaOrigen,
          consecutivoExpediente: dataConCandidato.consecutivoExpediente,
          diasProceso: dataConCandidato.tiempoProceso,
          experienciaLaboralSolicitada: dataConCandidato.experiencia,
          familiaFuncional: dataConCandidato.familia,
          fechaElaboracionPropuesta: dataConCandidato.fechaPropuesta,
          fechaEntrevista: dataConCandidato.fechaEntrevista,
          fechaEnvioDEyDP: dataConCandidato.fechaEnvioDEyDP,
          fechaEnvioEvaluacionDesempenio:
            dataConCandidato.fechaEvaluacionDesempenio,
          fechaEvaluacionCompetencias: dataConCandidato.fechaCompetencias,
          fechaInicioProcesamiento: dataConCandidato.fechaProcesamiento,
          fechaLiberacionOficio: dataConCandidato.fechaOficio,
          fechaNotificacion: dataConCandidato.fechaNotificacion,
          fechaRecibido: dataConCandidato.fechaRecibido,
          fechaRevisionOfiEval: dataConCandidato.fechaOfiEval,
          folio: dataConCandidato.folio,
          FKIdAcceso: currentUser!.idAcceso,
          FKIdDependencia: dataConCandidato.idDependencia,
          FKIdEstadoProcesoContratacion: dataConCandidato.estado,
          FKIdTemporalDefinitiva: dataConCandidato.tipo === "temporal" ? 1 : 2,
          FKIdTipoPersonal:
            dataConCandidato.tipoPersonal === "eventual" ? 1 : 2,
          FKIdTipoProceso: 0,
          funcionDesempeniar: dataConCandidato.funcion,
          hermesNotificacion: dataConCandidato.hermes,
          lineamientoOficioContinuidad: dataConCandidato.lineamiento,
          motivo: dataConCandidato.motivo,
          nombreCandidato: formData.candidatos[i].nombre,
          numCarpeta: dataConCandidato.numeroCarpeta,
          numPlaza: dataConCandidato.numPlaza,
          observaciones: dataConCandidato.observaciones,
          observacionesAnalista: dataConCandidato.observacionesAnalista,
          periodoAutorizadoOficioFin: dataConCandidato.periodoInicio,
          periodoAutorizadoOficioInicio: dataConCandidato.periodoTermino,
          resultadoEvaluacionCompetencias: dataConCandidato.resultadoEvaluacion,
          resultadoEvaluacionConocimiento:
            dataConCandidato.resultadoConocimiento,
          resultadoHabilidadesExcel: dataConCandidato.resultadoExcel,
          resultadoHabilidadesWord: dataConCandidato.resultadoWord,
          resultadoOrtografia: dataConCandidato.resultadoOrtografia,
          resultadoProcesoEvaluacion: dataConCandidato.resultadoEvaluacion,
          resultadoReferenciasLaborales: dataConCandidato.referencias,
          resultadoSeguimientoEvaluacionDesempenio:
            dataConCandidato.resultadoSeguimiento,
          titularPlaza: dataConCandidato.titularPlaza,
        };
        response =
          await ProcesoContratacionServicio.postProcesoContratacion(
            DatosCandidato,
          );
        console.log(`Solicitud ${i + 1} creada:`, response);
      }
      mostrarToast(`${cantidad} solicitude(s) creadas correctamente`, "exito");
      setTimeout(() => {
        navigate("/solicitudes");
      }, 1000);

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
        idAcceso: 0,
      });
    } catch (error) {
      console.error(
        "IniciarSolicitud.tsx - Error al iniciar solicitud:" + error,
      );
      mostrarToast("Error al crear solicitud", "error");
    }
  };

  const handleBuscarDependencia = (
    e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent,
  ) => {
    e.preventDefault();
    const numDep = formData.numDependencia.trim();
    const dep = dependencias.find(
      (dependecia) => dependecia.numDependencia === numDep,
    );
    if (dep) {
      handleInputChange("dependencia", dep.nombre);
      handleInputChange("area", dep.areaOrganizacional);
      handleInputChange("region", dep.zona);
      formData.idDependencia = dep.idDependencia;
    } else {
      mostrarToast("No se encontró la dependencia ingresada", "error");
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
    <>
      <Toast texto={toast.texto} tipo={toast.tipo} />
      <main className="ml-65 w-[calc(100%-260px)] px-[4%] py-[2%] overflow-y-auto min-h-screen bg-slate-50">
        <div className="flex justify-between items-center w-full mb-[2%] gap-[2%]">
          <MainHeader
            title="Iniciar solicitud"
            subtitle="Gestión de solicitudes"
          />

          <select
            className="header-select-solicitud"
            value={tipoSolicitud}
            onChange={(e) => setTipoSolicitud(e.target.value)}
          >
            <option value="" disabled>
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Campos comunes para ambos tipos */}
            <FormSectionCard title="Datos generales de la vacante">
              <div className="form-group">
                <InputField
                  label="Folio:"
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

              <InputField
                label="Hermes de notificación:"
                value={formData.hermes}
                onChange={(e) => {
                  handleInputChange("hermes", e.target.value);
                  e.target.setCustomValidity("");
                }}
              />

              <InputField
                label="Fecha de recibido:"
                type="date"
                value={formData.fechaRecibido}
                onChange={(e) =>
                  handleInputChange("fechaRecibido", e.target.value)
                }
              />

              <InputField
                label="Número de entidad académica o dependencia:"
                value={formData.numDependencia}
                onChange={(e) =>
                  handleInputChange("numDependencia", e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleBuscarDependencia(e);
                  }
                }}
                showSearchButton={true}
                onSearch={(e) => handleBuscarDependencia(e)}
                searchButtonTitle="Buscar dependencia"
              />

              <InputField
                label="Entidad académica o Dependencia:"
                value={formData.dependencia}
                onChange={(e) =>
                  handleInputChange("dependencia", e.target.value)
                }
              />

              <InputField
                label="Área Organizacional"
                value={formData.area}
                onChange={(e) => handleInputChange("area", e.target.value)}
              />

              <InputField
                label="Región:"
                value={formData.region}
                onChange={(e) => handleInputChange("region", e.target.value)}
              />

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

              <InputField
                label="Número de plaza:"
                value={formData.numPlaza}
                onChange={(e) => handleInputChange("numPlaza", e.target.value)}
              />

              <InputField
                label="Categoría/Puesto (origen)"
                value={formData.categoriaOrigen}
                onChange={(e) =>
                  handleInputChange("categoriaOrigen", e.target.value)
                }
              />

              <InputField
                label="Titular de la plaza:"
                value={formData.titularPlaza}
                onChange={(e) =>
                  handleInputChange("titularPlaza", e.target.value)
                }
              />

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

              <InputField
                label="Motivo:"
                value={formData.motivo}
                onChange={(e) => handleInputChange("motivo", e.target.value)}
              />

              <InputField
                label="Fecha de elaboración propuesta:"
                type="date"
                value={formData.fechaPropuesta}
                onChange={(e) =>
                  handleInputChange("fechaPropuesta", e.target.value)
                }
              />

              <InputField
                label="Fecha de liberación de oficio:"
                type="date"
                value={formData.fechaOficio}
                onChange={(e) =>
                  handleInputChange("fechaOficio", e.target.value)
                }
              />

              <InputField
                label="Periodo autorizado en oficio (inicio):"
                type="date"
                value={formData.periodoInicio}
                onChange={(e) =>
                  handleInputChange("periodoInicio", e.target.value)
                }
              />

              <InputField
                label="Periodo autorizado en oficio (fin):"
                type="date"
                value={formData.periodoTermino}
                onChange={(e) =>
                  handleInputChange("periodoTermino", e.target.value)
                }
              />

              <InputField
                label="Categoría autorizada en oficio:"
                value={formData.categoriaAutorizada}
                onChange={(e) =>
                  handleInputChange("categoriaAutorizada", e.target.value)
                }
              />

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

              <InputField
                label="Autorización:"
                type="checkbox"
                checked={formData.autorizacion}
                onChange={(e) =>
                  handleInputChange("autorizacion", e.target.checked)
                }
              />

              <InputField
                label="Observaciones registro:"
                value={formData.observaciones}
                onChange={(e) =>
                  handleInputChange("observaciones", e.target.value)
                }
              />
            </FormSectionCard>

            {/* Campos específicos Bolsa de Trabajo */}
            {tipoSolicitud === "Bolsa" && (
              <>
                <FormSectionCard title="Datos del proceso">
                  <InputField
                    label="Número de carpeta:"
                    value={formData.numeroCarpeta}
                    onChange={(e) =>
                      handleInputChange("numeroCarpeta", e.target.value)
                    }
                  />
                  <InputField
                    label="Nombre del candidato:"
                    value={formData.candidato}
                    onChange={(e) =>
                      handleInputChange("candidato", e.target.value)
                    }
                  />
                  <InputField
                    label="Función a desempeñar:"
                    value={formData.funcion}
                    onChange={(e) =>
                      handleInputChange("funcion", e.target.value)
                    }
                  />
                  <InputField
                    label="Función a desempeñar:"
                    value={formData.funcion}
                    onChange={(e) =>
                      handleInputChange("funcion", e.target.value)
                    }
                  />

                  <InputField
                    label="Familia funcional:"
                    value={formData.familia}
                    onChange={(e) =>
                      handleInputChange("familia", e.target.value)
                    }
                  />

                  <InputField
                    label="Fecha entrevista:"
                    value={formData.fechaEntrevista}
                    onChange={(e) =>
                      handleInputChange("fechaEntrevista", e.target.value)
                    }
                  />

                  <InputField
                    label="Fecha evaluación competencias:"
                    value={formData.fechaCompetencias}
                    onChange={(e) =>
                      handleInputChange("fechaCompetencias", e.target.value)
                    }
                  />

                  <InputField
                    label="Fecha se inicia procesamiento:"
                    value={formData.fechaProcesamiento}
                    onChange={(e) =>
                      handleInputChange("fechaProcesamiento", e.target.value)
                    }
                  />

                  <InputField
                    label="Resultado evaluación conocimiento:"
                    value={formData.resultadoConocimiento}
                    onChange={(e) =>
                      handleInputChange("resultadoConocimiento", e.target.value)
                    }
                  />

                  <InputField
                    label="Experiencia laboral solicitada:"
                    value={formData.experiencia}
                    onChange={(e) =>
                      handleInputChange("experiencia", e.target.value)
                    }
                  />

                  <InputField
                    label="Referencias:"
                    value={formData.referencias}
                    onChange={(e) =>
                      handleInputChange("referencias", e.target.value)
                    }
                  />

                  <InputField
                    label="Fecha envío a DEyDP:"
                    type="date"
                    value={formData.fechaEnvioDes}
                    onChange={(e) =>
                      handleInputChange("fechaEnvioDes", e.target.value)
                    }
                  />

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

                  <InputField
                    label="Fecha revisión OfiEval:"
                    type="date"
                    value={formData.fechaOfiEval}
                    onChange={(e) =>
                      handleInputChange("fechaOfiEval", e.target.value)
                    }
                  />

                  <InputField
                    label="Fecha notificación:"
                    type="date"
                    value={formData.fechaNotificacion}
                    onChange={(e) =>
                      handleInputChange("fechaNotificacion", e.target.value)
                    }
                  />

                  <InputField
                    label="Tiempo del proceso:"
                    value={formData.tiempoProceso}
                    onChange={(e) =>
                      handleInputChange("tiempoProceso", e.target.value)
                    }
                  />

                  <InputField
                    label="Fecha de evaluación de desempeño:"
                    type="date"
                    value={formData.fechaEvaluacionDesempenio}
                    onChange={(e) =>
                      handleInputChange(
                        "fechaEvaluacionDesempenio",
                        e.target.value,
                      )
                    }
                  />

                  <InputField
                    label="Observaciones analista:"
                    value={formData.observacionesAnalista}
                    onChange={(e) =>
                      handleInputChange("observacionesAnalista", e.target.value)
                    }
                  />

                  <InputField
                    label="Consecutivo expediente físico:"
                    value={formData.consecutivoExpediente}
                    onChange={(e) =>
                      handleInputChange("consecutivoExpediente", e.target.value)
                    }
                  />

                  <div className="form-group">
                    <label className="form-label-solicitud">
                      Seguimiento Evaluación Desempeño
                    </label>
                    <select
                      className="form-input-solicitud"
                      value={formData.seguimientoDesempeno}
                      onChange={(e) =>
                        handleInputChange(
                          "seguimientoDesempeno",
                          e.target.value,
                        )
                      }
                    >
                      <option value="" disabled>
                        Seleccionar
                      </option>
                      <option value="si">Sí</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  <InputField
                    label="Resultado seguimiento evaluación desempeño:"
                    className="form-input-solicitud"
                    value={formData.resultadoSeguimiento}
                    onChange={(e) =>
                      handleInputChange("resultadoSeguimiento", e.target.value)
                    }
                  />
                </FormSectionCard>
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
    </>
  );
}

export default IniciarSolicitud;
