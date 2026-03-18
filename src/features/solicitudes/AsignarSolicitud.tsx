import { FormEvent, useEffect, useId, useState } from "react";
import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";

import "./AsignarSolicitud.css";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Alert/Floating/Toast";
import ILabelValue from "@/interfaces/LabelValue";
import ProcesoContratacionService from "@/services/ProcesoContratacionService";
import IResponseHTTP from "@/interfaces/http/Response";
import AccesoService from "@/services/AccesoService";
import {
  IGetUsuario,
  IGetUsuarios,
  IUsuarioBase,
} from "@/schemas/acceso/GetUsuario";

// Interfaces de UI ---------------------------------------------------------
interface IFormData {
  analista: string;
  avaladoPor: string;
  citaVirtual: boolean;
  educacionFormal: string;
  estado: string;
  familiaFuncional: string;
  fechaAsignacionAnalista: string;
  fechaEntrevista: string;
  folio: string;
  funcion: string;
  hermes: string;
  nombreCandidato: string;
  numeroCarpeta: string;
  observaciones: string;
  tipo: string;
}
const FAMILIA_KEYWORDS = {
  "N1. Académico Administrativo": "académico administrativo",
  "N2. Administrativo Académico": "administrativo académico",
  "N3. Administrativo": "administrativo",
  "N4. Normativo, jurídico, legal": "normativo jurídico legal",
  "N5. Tics": "tics",
  "N6. Salud": "salud",
  "N7. Cultura": "cultura",
  "N8. Deporte": "deporte",
  "N9. Presupuestal-contable": "presupuestal contable",
  "N10. Comunicación y edición": "comunicación y edición",
  "N11. Operativo": "operativo",
} as const;
type FamiliaKeyword = keyof typeof FAMILIA_KEYWORDS;
type CampoFamiliaKeyword = (typeof FAMILIA_KEYWORDS)[FamiliaKeyword];
const getFamilaKeywordKey = (
  nombre: string,
): CampoFamiliaKeyword | undefined => {
  if (nombre in FAMILIA_KEYWORDS) {
    return FAMILIA_KEYWORDS[nombre as FamiliaKeyword];
  }
  return undefined;
};

function AsignarSolicitud() {
  // Utils ------------------------------------------------------------------
  const navigate = useNavigate();
  const { toast, mostrarToast } = useToast();
  const [showPopupConfirmationDeletion, setShowPopupConfirmationDeletion] =
    useState(false);
  const fieldID = useId();
  const [formData, setFormData] = useState<IFormData>({
    analista: "",
    avaladoPor: "",
    citaVirtual: false,
    educacionFormal: "",
    estado: "",
    familiaFuncional: "",
    fechaAsignacionAnalista: "",
    fechaEntrevista: "",
    folio: "",
    funcion: "",
    hermes: "",
    nombreCandidato: "",
    numeroCarpeta: "",
    observaciones: "",
    tipo: "",
  });
  const location = useLocation();
  const solicitudSeleccionada = location.state?.solicitud || {};
  const [analistas, setAnalistas] = useState<IUsuarioBase[]>();
  const [permiteAsignarAnalista, setPermiteAsignarAnalista] = useState(true);
  const [funcionesOptions, setFuncionesOptions] = useState<ILabelValue[]>([]);
  const [funcionesFiltradas, setFuncionesFiltradas] = useState<
    ILabelValue[] | undefined
  >([]);
  const [avaladoPorSeleccionado, setAvaladoPorSeleccionado] = useState([]);

  let tipoInicial = "";
  let tipoDisabled = false;

  if (solicitudSeleccionada.FKIdTipoProceso === 1) {
    tipoInicial = "1";
    tipoDisabled = true;
  } else if (solicitudSeleccionada.FKIdTipoProceso === 2) {
    tipoInicial = "2";
    tipoDisabled = true;
  }

  const toggleAvaladoPor = (valor: string) => {
    setAvaladoPorSeleccionado((prev) => {
      if (prev.includes(valor)) {
        const nuevo = prev.filter((v) => v !== valor);
        handleInputChange("avaladoPor", nuevo.join(", "));
        return nuevo;
      } else {
        const nuevo = [...prev, valor];
        handleInputChange("avaladoPor", nuevo.join(", "));
        return nuevo;
      }
    });
  };

  useEffect(() => {
    if (!formData.familiaFuncional) {
      setFuncionesFiltradas([]);
      return;
    }

    const keyword = getFamilaKeywordKey(formData.familiaFuncional);
    if (!keyword) {
      setFuncionesFiltradas([]);
      return;
    }

    const normalizar = (texto: string) =>
      texto
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // eliminar acentos
        .replace(/[,.-]/g, "") // eliminar comas, guiones, puntos
        .trim();

    const kw = normalizar(keyword);

    const filtradas = funcionesOptions.filter((f: ILabelValue) => {
      const texto = normalizar(f.label);

      // Casos específicos: coincidencia estricta con la familia
      switch (kw) {
        case "administrativo":
          // ❗ Solo permitir si NO contiene "académico"
          return (
            texto.includes("administrativo") && !texto.includes("academico")
          );

        case "academico administrativo":
          // Coincide si incluye exactamente ambas en ese orden
          return texto.includes("academico administrativo");

        case "administrativo academico":
          // Coincide si incluye exactamente ambas en ese orden
          return texto.includes("administrativo academico");

        default:
          // Para las demás familias, basta con incluir la palabra clave
          return texto.includes(kw);
      }
    });

    setFuncionesFiltradas(filtradas);
  }, [formData.familiaFuncional, funcionesOptions]);

  useEffect(() => {
    if (solicitudSeleccionada && Object.keys(solicitudSeleccionada).length) {
      setFormData({
        analista: solicitudSeleccionada.idAnalista || "",
        avaladoPor: solicitudSeleccionada.avaladoPor || "",
        citaVirtual:
          solicitudSeleccionada.citaVirtual === true ||
          solicitudSeleccionada.citaVirtual === "Sí" ||
          solicitudSeleccionada.citaVirtual === 1
            ? true
            : false,
        educacionFormal: solicitudSeleccionada.educacionFormal || "",
        estado: solicitudSeleccionada.FKIdEstadoProcesoContratacion || "",
        familiaFuncional: solicitudSeleccionada.familiaFuncional || "",
        fechaAsignacionAnalista: solicitudSeleccionada.fechaAsignacionAnalista,
        fechaEntrevista: solicitudSeleccionada.fechaEntrevista
          ? new Date(solicitudSeleccionada.fechaEntrevista)
              .toISOString()
              .split("T")[0]
          : "",
        folio: solicitudSeleccionada.folio || "",
        funcion: solicitudSeleccionada.funcionDesempeniar || "",
        hermes: solicitudSeleccionada.hermesNotificacion || "",
        nombreCandidato: solicitudSeleccionada.nombreCandidato || "",
        numeroCarpeta: String(solicitudSeleccionada.numeroCarpeta || 0),
        observaciones: solicitudSeleccionada.observaciones || "",
        tipo: tipoInicial,
      });
      setPermiteAsignarAnalista(true);
    }
  }, [solicitudSeleccionada, tipoInicial]);

  //  Sincroniza los botones seleccionados de "Avalado por"
  useEffect(() => {
    if (solicitudSeleccionada?.avaladoPor) {
      // Separa por comas, limpia espacios
      const avalados = solicitudSeleccionada.avaladoPor
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a !== "");
      setAvaladoPorSeleccionado(avalados);
    } else {
      setAvaladoPorSeleccionado([]);
    }
  }, [solicitudSeleccionada]);

  useEffect(() => {
    const fetchAnalistas = async () => {
      try {
        const data: IResponseHTTP<IGetUsuarios> =
          await new AccesoService().getAnalistas();
        setAnalistas(data.mensaje.usuarios);
      } catch (err) {
        console.error("Error cargando analistas:", err);
      }
    };

    fetchAnalistas();
  }, []);

  const handleEliminar = async () => {
    try {
      // Usar el método correcto y mandar el ID del proceso
      const idProceso = solicitudSeleccionada.idProceso;

      if (!idProceso) {
        throw new Error("ID de proceso no encontrado para eliminar.");
      }

      const response: IResponseHTTP<string> =
        await new ProcesoContratacionService().deleteProcesoContratacionById(
          idProceso,
        );
      setShowPopupConfirmationDeletion(false);

      if (response.estado == 204) {
        mostrarToast("🗑️ Solicitud eliminada correctamente", "exito");
        setTimeout(() => navigate("/solicitudes"), 1500);
      } else {
        console.error(
          "AsignarSolicitud.tsx - No se logró eliminar proceso:\n" +
            response.mensaje,
        );
        mostrarToast("No se logró eliminar.", "error");
      }
    } catch (error) {
      setShowPopupConfirmationDeletion(false);
      console.error(
        "AsignarSlocitud.tsx - Error al eliminar la solicitud:\n",
        error,
      );
      mostrarToast("❌ Error al eliminar, intente más tarde.", "error");
    }
  };

  const handleInputChange = (
    field: keyof IFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { ...datosAEnviar } = formData;

    if (datosAEnviar.estado) {
      datosAEnviar.estado = datosAEnviar.estado;
    }

    if (datosAEnviar.analista) {
      datosAEnviar.analista = datosAEnviar.analista;
    }

    try {
      if (!formData.analista || formData.analista === "") {
        const response: IResponseHTTP<string> =
          await new ProcesoContratacionService().putProcesoContratacion(
            solicitudSeleccionada.idProceso,
            formData,
          );

        if (response.estado == 200) {
          mostrarToast(" ✅ Solicitud actualizada correctamente.", "exito");
          navigate("/solicitudes");
        } else {
          mostrarToast(
            "No se logró actualizar correctmanete la solicitud.",
            "error",
          );
        }
      } else {
        const fechaActual = new Date().toISOString().split("T")[0];

        const datosConAnalista = {
          ...datosAEnviar,
          FKIdEstadoProcesoContratacion: 1,
          idAcceso: Number(formData.analista),
          fechaAsignacionAnalista: fechaActual,
        };
        const response: IResponseHTTP<string> =
          await new ProcesoContratacionService().putProcesoContratacion(
            solicitudSeleccionada.idProceso,
            datosConAnalista,
          );
        mostrarToast(" ✅ Solicitud actualizada correctamente", "exito");
        navigate("/solicitudes");
      }
    } catch (error) {
      console.error("Error al guardar la solicitud:", error);
      mostrarToast(" ❌ Error al modificar la solicitud.", "error");
    }
  };

  return (
    <>
      <Toast texto={toast.texto} tipo={toast.tipo} />

      <main className="main-content">
        <h1 className="page-title4">Asignación de Solicitud</h1>

        <div className="contenido-asignacion-inner">
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="form-group">
              <label
                htmlFor={`${fieldID}-folio`}
                className="form-label-evaluacionl"
              >
                Folio
              </label>
              <input
                id={`${fieldID}-folio`}
                type="text"
                className="form-input"
                value={formData.folio}
                onChange={(e) => handleInputChange("folio", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label
                htmlFor={`${fieldID}-hermesNotificacion`}
                className="form-label-evaluacionl"
              >
                Hermes
              </label>
              <input
                id={`${fieldID}-hermesNotificacion`}
                type="text"
                className="form-input"
                value={formData.hermes}
                onChange={(e) => handleInputChange("hermes", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label
                htmlFor={`${fieldID}-numCarpeta`}
                className="form-label-evaluacionl"
              >
                Número de Carpeta
              </label>
              <input
                id={`${fieldID}-numCarpeta`}
                type="text"
                className="form-input"
                value={formData.numeroCarpeta}
                onChange={(e) =>
                  handleInputChange("numeroCarpeta", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label
                htmlFor={`${fieldID}-nombreCandidato`}
                className="form-label-evaluacionl"
              >
                Nombre de Candidato
              </label>
              <input
                id={`${fieldID}-nombreCandidato`}
                type="text"
                className="form-input"
                value={formData.nombreCandidato}
                onChange={(e) =>
                  handleInputChange("nombreCandidato", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label
                htmlFor={`${fieldID}-familiaFuncional`}
                className="form-label-evaluacionl"
              >
                Familia Funcional
              </label>
              <select
                id={`${fieldID}-familiaFuncional`}
                className="form-input"
                value={formData.familiaFuncional}
                onChange={(e) =>
                  handleInputChange("familiaFuncional", e.target.value)
                }
              >
                <option value="" disabled hidden>
                  Seleccionar familia funcional
                </option>
                <option value="N1. Académico Administrativo">
                  N1. Académico Administrativo
                </option>
                <option value="N2. Administrativo Académico">
                  N2. Administrativo Académico
                </option>
                <option value="N3. Administrativo">N3. Administrativo</option>
                <option value="N4. Normativo, jurídico, legal">
                  N4. Normativo, jurídico, legal
                </option>
                <option value="N5. Tics">N5. Tics</option>
                <option value="N6. Salud">N6. Salud</option>
                <option value="N7. Cultura">N7. Cultura</option>
                <option value="N8. Deporte">N8. Deporte</option>
                <option value="N9. Presupuestal-contable">
                  N9. Presupuestal-contable
                </option>
                <option value="N10. Comunicación y edición">
                  N10. Comunicación y edición
                </option>
                <option value="N11. Operativo">N11. Operativo</option>
              </select>
            </div>

            {/*  Función a desempeñar como combo box */}
            <div className="form-group">
              <label
                htmlFor={`${fieldID}-funcion`}
                className="form-label-evaluacionl"
              >
                Función a Desempeñar
              </label>
              <Select
                id={`${fieldID}-funcion`}
                options={funcionesFiltradas}
                value={
                  funcionesFiltradas?.find(
                    (opt) => opt.label === formData.funcion,
                  ) || null
                }
                onChange={(selected) =>
                  handleInputChange("funcion", selected ? selected.label : "")
                }
                placeholder={
                  formData.familiaFuncional
                    ? funcionesFiltradas?.length
                      ? "Selecciona una función relacionada..."
                      : "No hay funciones disponibles para esta familia"
                    : "Primero selecciona una familia funcional"
                }
                isDisabled={!formData.familiaFuncional}
                isClearable
                isSearchable
              />
            </div>

            <div className="form-group">
              <label
                htmlFor={`${fieldID}-fechaEntrevista`}
                className="form-label-evaluacionl"
              >
                Fecha entrevista
              </label>
              <input
                id={`${fieldID}-fechaEntrevista`}
                type="date"
                className="form-input"
                value={formData.fechaEntrevista || ""}
                onChange={(e) =>
                  handleInputChange("fechaEntrevista", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label
                htmlFor={`${fieldID}-educacionFormal`}
                className="form-label-evaluacionl"
              >
                Educación formal
              </label>
              <input
                id={`${fieldID}-educacionFormal`}
                type="text"
                className="form-input"
                value={formData.educacionFormal}
                onChange={(e) =>
                  handleInputChange("educacionFormal", e.target.value)
                }
              />
            </div>

            {/*  Avalado por - botones seleccionables */}
            <div className="form-group">
              <label
                htmlFor={`${fieldID}-avaladoPor`}
                className="form-label-evaluacionl"
              >
                Avalado por
              </label>
              <div className="avalado-buttons">
                {[
                  "Título",
                  "Cédula",
                  "Certificado",
                  "Kárdex",
                  "Constancia",
                ].map((opcion) => (
                  <button
                    id={`${fieldID}-avaladoPor`}
                    key={opcion}
                    type="button"
                    className={`avalado-btn ${
                      avaladoPorSeleccionado.includes(opcion) ? "selected" : ""
                    }`}
                    onClick={() => toggleAvaladoPor(opcion)}
                  >
                    {opcion}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label
                htmlFor={`${fieldID}-estado`}
                className="form-label-evaluacionl"
              >
                Estado
              </label>
              <select
                id={`${fieldID}-estado`}
                className="form-input"
                value={formData.estado}
                onChange={(e) => handleInputChange("estado", e.target.value)}
              >
                <option value="" disabled hidden>
                  Seleccionar
                </option>
                <option value="9">Pendiente (cita)</option>
                <option value="10">Entregado (cita)</option>
                <option value="11">Citado</option>
              </select>
            </div>

            <div className="checkbox-group-solicitud pr-75 pb-5">
              <label
                htmlFor={`${fieldID}-citaVirtual`}
                className="form-label-evaluacionl whitespace-nowrap mb-2.5"
              >
                Cita virtual
              </label>
              <input
                id={`${fieldID}-citaVirtual`}
                type="checkbox"
                checked={formData.citaVirtual}
                onChange={(e) =>
                  handleInputChange("citaVirtual", e.target.checked)
                }
              />
            </div>

            <div className="form-group grid-cols-1">
              <label
                htmlFor={`${fieldID}-observaciones`}
                className="form-label-evaluacionl"
              >
                Observaciones registro
              </label>
              <textarea
                id={`${fieldID}-observaciones`}
                className="form-input textarea-large"
                value={formData.observaciones}
                onChange={(e) =>
                  handleInputChange("observaciones", e.target.value)
                }
              />
            </div>

            {permiteAsignarAnalista && (
              <div className="form-group analista-combobox">
                <label
                  htmlFor={`${fieldID}-analista`}
                  className="form-label-evaluacionl text-[14px] font-bold"
                >
                  Analista
                </label>
                <select
                  id={`${fieldID}-analista`}
                  className="form-input"
                  value={formData.analista}
                  onChange={(e) =>
                    handleInputChange("analista", e.target.value)
                  }
                >
                  <option value="" disabled hidden>
                    Seleccionar
                  </option>
                  <option value="">No asignar</option>

                  {analistas.map((a) => (
                    <option key={a.idAcceso} value={a.idAcceso}>
                      {a.nombre} {a.primerApellido} {a.segundoApellido || ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group tipo-combobox">
              <label
                htmlFor={`${fieldID}-tipo`}
                className="form-label-evaluacionl"
              >
                Tipo
              </label>
              <select
                id={`${fieldID}-tipo`}
                className="form-input"
                value={formData.tipo}
                onChange={(e) => handleInputChange("tipo", e.target.value)}
                disabled={tipoDisabled}
              >
                <option value="">Seleccionar</option>
                <option value="1">Asignación</option>
                <option value="2">Requisición</option>
              </select>
            </div>

            <div className="action-buttons">
              <button type="submit" className="btn-guardar">
                Guardar
              </button>
              <button
                type="button"
                className="btn-eliminar"
                onClick={() => setShowPopupConfirmationDeletion(true)}
              >
                Eliminar
              </button>
            </div>
          </form>
        </div>

        {/* 🧩 Pop-up de confirmación */}
        {showPopupConfirmationDeletion && (
          <div className="popup-overlay">
            <div className="popup">
              <h3>¿Estás seguro que deseas eliminar la solicitud?</h3>
              <div className="popup-buttons">
                <button className="btn-confirmar" onClick={handleEliminar}>
                  Aceptar
                </button>
                <button
                  className="btn-cancelar"
                  onClick={() => setShowPopupConfirmationDeletion(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default AsignarSolicitud;
