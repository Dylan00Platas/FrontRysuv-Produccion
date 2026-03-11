import { useEffect, useState } from "react";
import { useContext } from "react";
import Select from "react-select";

import "./AsignarSolicitud.css";
import Sidebar from "@/layout/sidebar/Sidebar.jsx";
import CatalogoCedula from "@/services/CatalogoCedulas.js";
import UsuarioServicio from "@/services/UsuarioService.js";
import UserContext from "@/utils/UserContext.jsx";

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
};

function AsignarSolicitud() {
  const solicitudSeleccionada = location.state?.solicitud || {};
  const usuarioServicio = new UsuarioServicio();
  const SolicitudService = new SolicitudService();
  const token = localStorage.getItem("token");
  const { currentUser } = useContext(UserContext);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [permiteAsignarAnalista, setPermiteAsignarAnalista] = useState(true);
  const [funcionesOptions, setFuncionesOptions] = useState([]);
  const [funcionesFiltradas, setFuncionesFiltradas] = useState([]);
  const [mostrarPopup, setMostrarPopup] = useState(false);
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

  const toggleAvaladoPor = (valor) => {
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

  const [formData, setFormData] = useState({
    tipo: "",
    folio: "",
    hermes: "",
    numeroCarpeta: "",
    candidato: "",
    funcion: "",
    familia: "",
    fechaEntrevista: "",
    analista: "",
    estado: "",
    educacionFormal: "",
    avaladoPor: "",
    fechaAsignacionAnalista: "",
    citaVirtual: false,
    observaciones: "",
  });

  const [analistas, setAnalistas] = useState([]);

  useEffect(() => {
    const cargarFunciones = async () => {
      try {
        const token = localStorage.getItem("token");
        const catalogo = new CatalogoCedula();
        const cedulas = await catalogo.cargarCedulas(token);
        const opciones = cedulas.map((c) => ({
          value: c.idClasificacionCedulas,
          label: `${c.numCedula}. ${c.nombre}`,
        }));
        setFuncionesOptions(opciones);
      } catch (error) {
        console.error("Error cargando funciones (cédulas):", error);
      }
    };
    cargarFunciones();
  }, []);

  useEffect(() => {
    if (!formData.familia) {
      setFuncionesFiltradas([]);
      return;
    }

    const keyword = FAMILIA_KEYWORDS[formData.familia];
    if (!keyword) {
      setFuncionesFiltradas([]);
      return;
    }

    const normalizar = (texto) =>
      texto
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // eliminar acentos
        .replace(/[,.-]/g, "") // eliminar comas, guiones, puntos
        .trim();

    const kw = normalizar(keyword);

    const filtradas = funcionesOptions.filter((f) => {
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
  }, [formData.familia, funcionesOptions]);

  useEffect(() => {
    if (solicitudSeleccionada && Object.keys(solicitudSeleccionada).length) {
      setFormData({
        tipo: tipoInicial,
        folio: solicitudSeleccionada.folio || "",
        hermes: solicitudSeleccionada.hermesNotificacion || "",
        //numeroCarpeta: solicitudSeleccionada.numCarpeta || "",
        candidato: solicitudSeleccionada.nombreCandidato || "",
        funcion: solicitudSeleccionada.funcionDesempeniar || "",
        familia: solicitudSeleccionada.familiaFuncional || "",
        fechaEntrevista: solicitudSeleccionada.fechaEntrevista
          ? new Date(solicitudSeleccionada.fechaEntrevista)
              .toISOString()
              .split("T")[0]
          : "",
        analista: solicitudSeleccionada.idAnalista || "",
        estado: solicitudSeleccionada.FKIdEstadoProcesoContratacion || "",
        educacionFormal: solicitudSeleccionada.educacionFormal || "",
        citaVirtual:
          solicitudSeleccionada.citaVirtual === true ||
          solicitudSeleccionada.citaVirtual === "Sí" ||
          solicitudSeleccionada.citaVirtual === 1
            ? true
            : false,
        observaciones: solicitudSeleccionada.observaciones || "",
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
        const data = await usuarioServicio.obtenerAnalistas(token);
        setAnalistas(data);
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

      await SolicitudService.eliminarProcesoPorID(idProceso, token);
      setMostrarPopup(false);
      setMensaje({
        texto: "🗑️ Solicitud eliminada correctamente",
        tipo: "exito",
      });
      setTimeout(() => navigate("/solicitudes"), 1500);
    } catch (error) {
      setMostrarPopup(false); // Ocultar el pop-up incluso si falla
      console.error("Error al eliminar la solicitud:", error);

      // Intentamos obtener el mensaje del objeto de error del servicio (si fue lanzado así)
      const errorMsg =
        error.mensaje || error.message || "Error desconocido al eliminar.";

      setMensaje({ texto: `❌ Error al eliminar: ${errorMsg}`, tipo: "error" });
      setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { ...datosAEnviar } = formData;

    if (datosAEnviar.estado) {
      datosAEnviar.estado = Number(datosAEnviar.estado);
    }

    if (datosAEnviar.analista) {
      datosAEnviar.analista = Number(datosAEnviar.analista);
    }

    try {
      if (!formData.analista || formData.analista === "") {
        await SolicitudService.editarSolicitud(
          solicitudSeleccionada.idProceso,
          datosAEnviar,
          token,
        );

        setMensaje({
          texto: "✅ Solicitud actualizada correctamente",
          tipo: "exito",
        });
        setTimeout(() => navigate("/solicitudes"), 2000);
        setTimeout(() => setMensaje(""), 3000);
      } else {
        const fechaActual = new Date().toISOString().split("T")[0];

        const datosConAnalista = {
          ...datosAEnviar,
          FKIdEstadoProcesoContratacion: 1,
          idAcceso: Number(formData.analista),
          fechaAsignacionAnalista: fechaActual,
        };
        await SolicitudService.editarSolicitud(
          solicitudSeleccionada.idProceso,
          datosConAnalista,
          token,
        );
        setMensaje({
          texto: "✅ Solicitud asignada a analista",
          tipo: "exito",
        });
        setTimeout(() => navigate("/solicitudes"), 2000);
        setTimeout(() => setMensaje(""), 3000);
      }
    } catch (error) {
      console.error("Error al guardar la solicitud:", error);
      setMensaje({ texto: `❌ Error: ${error.message}`, tipo: "error" });
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  return (
    <div className="asignar-page">
      <Sidebar tipoAcceso={currentUser.FKidTipoAcceso} />

      <main className="main-content">
        {/*  Mensaje flotante */}
        {mensaje.texto && (
          <div className={`mensaje-flotante ${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}

        <h1 className="page-title4">Asignación de Solicitud</h1>

        <div className="contenido-asignacion-inner">
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label-evaluacionl">Folio</label>
              <input
                type="text"
                className="form-input"
                value={formData.folio}
                onChange={(e) => handleInputChange("folio", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label-evaluacionl">Hermes</label>
              <input
                type="text"
                className="form-input"
                value={formData.hermes}
                onChange={(e) => handleInputChange("hermes", e.target.value)}
              />
            </div>

            {/*
              <div className="form-group">
                <label className="form-label-evaluacionl">Número de Carpeta</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.numeroCarpeta}
                  onChange={(e) => handleInputChange("numeroCarpeta", e.target.value)}
                />
              </div>*/}

            <div className="form-group">
              <label className="form-label-evaluacionl">
                Nombre de Candidato
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.candidato}
                onChange={(e) => handleInputChange("candidato", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label-evaluacionl">
                Familia Funcional
              </label>
              <select
                className="form-input"
                value={formData.familia}
                onChange={(e) => handleInputChange("familia", e.target.value)}
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
              <label className="form-label-evaluacionl">
                Función a Desempeñar
              </label>
              <Select
                options={funcionesFiltradas}
                value={
                  funcionesFiltradas.find(
                    (opt) => opt.label === formData.funcion,
                  ) || null
                }
                onChange={(selected) =>
                  handleInputChange("funcion", selected ? selected.label : "")
                }
                placeholder={
                  formData.familia
                    ? funcionesFiltradas.length > 0
                      ? "Selecciona una función relacionada..."
                      : "No hay funciones disponibles para esta familia"
                    : "Primero selecciona una familia funcional"
                }
                isDisabled={!formData.familia}
                isClearable
                isSearchable
              />
            </div>

            <div className="form-group">
              <label className="form-label-evaluacionl">Fecha de cita</label>
              <input
                type="date"
                className="form-input"
                value={formData.fechaEntrevista || ""}
                onChange={(e) =>
                  handleInputChange("fechaEntrevista", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label-evaluacionl">Educación formal</label>
              <input
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
              <label className="form-label-evaluacionl">Avalado por</label>
              <div className="avalado-buttons">
                {[
                  "Título",
                  "Cédula",
                  "Certificado",
                  "Kárdex",
                  "Constancia",
                ].map((opcion) => (
                  <button
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
              <label className="form-label-evaluacionl">Estado</label>
              <select
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

            <div
              className="checkbox-group-solicitud"
              style={{ paddingRight: "300px", paddingBottom: "20px" }}
            >
              <label
                className="form-label-evaluacionl"
                style={{ whiteSpace: "nowrap", marginBottom: "10px" }}
              >
                Cita virtual
              </label>

              <input
                type="checkbox"
                checked={formData.citaVirtual}
                onChange={(e) =>
                  handleInputChange("citaVirtual", e.target.checked)
                }
              />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label-evaluacionl">
                Observaciones registro
              </label>
              <textarea
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
                  className="form-label-evaluacionl"
                  style={{ fontSize: "14px", fontWeight: 700 }}
                >
                  Analista
                </label>
                <select
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
              <label className="form-label-evaluacionl">Tipo</label>
              <select
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
                onClick={() => setMostrarPopup(true)}
              >
                Eliminar
              </button>
            </div>
          </form>
        </div>

        {/* 🧩 Pop-up de confirmación */}
        {mostrarPopup && (
          <div className="popup-overlay">
            <div className="popup">
              <h3>¿Estás seguro que deseas eliminar la solicitud?</h3>
              <div className="popup-buttons">
                <button className="btn-confirmar" onClick={handleEliminar}>
                  Aceptar
                </button>
                <button
                  className="btn-cancelar"
                  onClick={() => setMostrarPopup(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AsignarSolicitud;
