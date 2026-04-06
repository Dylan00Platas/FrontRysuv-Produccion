import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserLock, FaSearch } from "react-icons/fa";
import CatalogoService from "@/services/CatalogosService";
import ProcesoContratacionService from "@/services/ProcesoContratacionService";
import { Toast } from "@/components/Alert/Floating/Toast";
import { useToast } from "@/hooks/useToast";

import "./IniciarSolicitud.css";
import { IDependenciaBase } from "@/schemas/catalogos/GetDependencia";
import { useCookie } from "@/hooks/useCookie";
import MainHeader from "@/components/header/MainHeader";
import { InputField } from "@/components/input/InputField";
import FormSectionCard from "@/components/card/FormSectionCard";
import { CustomButton } from "@/components/button/CustomButton";
import { SelectField } from "@/components/input/SelectField";
import {
  ISolicitudAsignacionRequisicion,
  ISolicitudBolsaTrabajo,
} from "@/schemas/procesos-contratacion/PostProcesoContratacion";

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
        if (tipoSolicitud === "bolsa") {
          const DatosCandidato: ISolicitudBolsaTrabajo = {
            folio: dataConCandidato.folio,
            hermesNotificacion: dataConCandidato.hermes,
            fechaRecibido: dataConCandidato.fechaRecibido,
            FKIdDependencia: dataConCandidato.idDependencia,
            FKIdTipoPersonal:
              dataConCandidato.tipoPersonal === "eventual" ? 1 : 2,
            numPlaza: dataConCandidato.numPlaza,
            categoriaPuestoOrigen: dataConCandidato.categoriaOrigen,
            titularPlaza: dataConCandidato.titularPlaza,
            lineamientoOficioContinuidad: dataConCandidato.lineamiento,
            motivo: dataConCandidato.motivo,
            fechaElaboracionPropuesta: dataConCandidato.fechaPropuesta,
            fechaLiberacionOficio: dataConCandidato.fechaOficio,
            periodoAutorizadoOficioFin: dataConCandidato.periodoTermino,
            periodoAutorizadoOficioInicio: dataConCandidato.periodoInicio,
            FKIdTemporalDefinitiva:
              dataConCandidato.tipo === "temporal" ? 1 : 2,
            FKIdEstadoProcesoContratacion: dataConCandidato.estado,
            observaciones: dataConCandidato.observaciones,
            numCarpeta: dataConCandidato.numeroCarpeta,
            funcionDesempeniar: dataConCandidato.funcion,
            familiaFuncional: dataConCandidato.familia,
            fechaEntrevista: dataConCandidato.fechaCita,
            fechaEvaluacionCompetencias:
              dataConCandidato.fechaEvaluacionDesempenio,
            fechaInicioProcesamiento: dataConCandidato.fechaProcesamiento,
            resultadoEvaluacionConocimiento:
              dataConCandidato.resultadoConocimiento,
            experienciaLaboralSolicitada: dataConCandidato.experiencia,
            resultadoReferenciasLaborales: dataConCandidato.referencias,
            fechaEnvioDEyDP: dataConCandidato.fechaEnvioDEyDP,
            beneficiado: dataConCandidato.beneficiado,
            fechaRevisionOfiEval: dataConCandidato.fechaOfiEval,
            diasProceso: dataConCandidato.tiempoProceso,
            fechaEvaluacionDesempenio:
              dataConCandidato.fechaEvaluacionDesempenio,
            observacionesAnalista: dataConCandidato.observacionesAnalista,
            consecutivoExpediente: dataConCandidato.consecutivoExpediente,
            seguimientoEvaluacionDesempenio:
              dataConCandidato.seguimientoDesempeno,
            resultadoSeguimientoEvaluacionDesempenio:
              dataConCandidato.resultadoSeguimiento,
            FKIdAcceso: currentUser!.idAcceso,
            autorizacion: dataConCandidato.autorizacion,
            categoriaAutorizadaOficio: dataConCandidato.categoriaAutorizada,
            FKIdTipoProceso: 3,
            nombreCandidato: dataConCandidato.candidato,
            fechaNotificacion: dataConCandidato.fechaNotificacion,
          };
          response =
            await ProcesoContratacionServicio.postProcesoContratacion(
              DatosCandidato,
            );
        } else {
          const DatosCandidato: ISolicitudAsignacionRequisicion = {
            folio: dataConCandidato.folio,
            hermesNotificacion: dataConCandidato.hermes,
            fechaRecibido: dataConCandidato.fechaRecibido,
            FKIdDependencia: dataConCandidato.idDependencia,
            FKIdTipoPersonal:
              dataConCandidato.tipoPersonal === "eventual" ? 1 : 2,
            FKIdTemporalDefinitiva:
              dataConCandidato.tipo === "temporal" ? 1 : 2,
            FKIdEstadoProcesoContratacion: dataConCandidato.estado,
            FKIdTipoProceso: tipoSolicitud === "Asignación" ? 1 : 2,
            FKIdAcceso: currentUser!.idAcceso,
            numPlaza: dataConCandidato.numPlaza,
            categoriaAutorizadaOficio: dataConCandidato.categoriaOrigen,
            titularPlaza: dataConCandidato.titularPlaza,
            lineamientoOficioContinuidad: dataConCandidato.lineamiento,
            motivo: dataConCandidato.motivo,
            fechaElaboracionPropuesta: dataConCandidato.fechaPropuesta,
            fechaLiberacionOficio: dataConCandidato.fechaOficio,
            periodoAutorizadoOficioInicio: dataConCandidato.periodoInicio,
            periodoAutorizadoOficioFin: dataConCandidato.periodoTermino,
            observaciones: dataConCandidato.observaciones,
            autorizacion: dataConCandidato.autorizacion,
            categoriaPuestoOrigen: dataConCandidato.categoriaAutorizada,
            nombreCandidato: dataConCandidato.candidato,
            fechaEntrevista: dataConCandidato.fechaEntrevista,
          };
          response =
            await ProcesoContratacionServicio.postProcesoContratacion(
              DatosCandidato,
            );
        }
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

  const handleBuscarDependencia = () => {
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

          <SelectField
            label="Tipo de solicitud:"
            options={[
              { value: "Asignacion", label: "Asignación" },
              { value: "Requisición", label: "Requisición" },
              { value: "Bolsa", label: "Bolsa de trabajo" },
            ]}
            value={tipoSolicitud}
            onChange={(e) => setTipoSolicitud}
          />
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
                    handleBuscarDependencia;
                  }
                }}
                showSearchButton={true}
                onSearch={() => handleBuscarDependencia}
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

              <SelectField
                label="Tipo de personal:"
                value={formData.tipoPersonal}
                onChange={(e) => handleInputChange("tipoPersonal", e)}
                options={[
                  { value: "eventual", label: "Eventual" },
                  { value: "confianza", label: "Confianza" },
                ]}
              />

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

              <SelectField
                label="Lineamiento que aplica:"
                value={formData.lineamiento}
                onChange={(e) => handleInputChange("lineamiento", e)}
                options={[
                  { value: "4.1 y 4.2", label: "4.1 y 4.2" },
                  { value: "5.1 y 5.2", label: "5.1 y 5.2" },
                  { value: "4.3", label: "4.3" },
                  { value: "N/A", label: "N/A" },
                ]}
              />

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

              <SelectField
                label="Tipo:"
                value={formData.tipo}
                onChange={(e) => handleInputChange("tipo", e)}
                options={[
                  { value: "temporal", label: "Temporal" },
                  { value: "Definitiva", label: "Definitiva" },
                ]}
              />

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

                  <SelectField
                    label="Beneficiado:"
                    value={formData.beneficiado ? "si" : "no"}
                    onChange={(e) => handleInputChange("beneficiado", e)}
                    options={[
                      { value: "si", label: "Si" },
                      { value: "no", label: "No" },
                    ]}
                  />

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

                  <SelectField
                    label="Seguimiento evaluación desempeño:"
                    value={formData.seguimientoDesempeno}
                    onChange={(e) =>
                      handleInputChange("seguimientoDesempeno", e)
                    }
                    options={[
                      { value: "si", label: "Si" },
                      { value: "no", label: "No" },
                    ]}
                  />

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
                <FormSectionCard title="Datos de los candidatos:">
                  <InputField
                    label="Cantidad de candidatos:"
                    type="number"
                    min="1"
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

                  <div style={{ gridColumn: "1 / -1" }}>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
                      {formData.candidatos.map((candidato, index) => (
                        <FormSectionCard
                          key={index}
                          title={`Candidato ${index + 1}`}
                        >
                          <InputField
                            label="Nombre del candidato:"
                            value={candidato.nombre}
                            onChange={(e) => {
                              const updated = [...formData.candidatos];
                              updated[index].nombre = e.target.value;
                              handleInputChange("candidatos", updated);
                            }}
                          />
                          <InputField
                            label="Fecha de cita:"
                            type="date"
                            value={candidato.fechaCita}
                            onChange={(e) => {
                              const updated = [...formData.candidatos];
                              updated[index].fechaCita = e.target.value;
                              handleInputChange("candidatos", updated);
                            }}
                          />
                        </FormSectionCard>
                      ))}
                    </div>
                  </div>
                </FormSectionCard>
              </>
            )}

            <div className="flex items-center justify-end gap-3 pb-10 max-[900px]:justify-center">
              <CustomButton variant="save" type="submit">
                Guardar
              </CustomButton>
              <CustomButton variant="cancel">Cancelar</CustomButton>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

export default IniciarSolicitud;
