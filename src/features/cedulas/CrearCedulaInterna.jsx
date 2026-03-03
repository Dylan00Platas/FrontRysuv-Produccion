import { useEffect, useState, useContext } from "react";
import { saveAs } from "file-saver";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { FaSearch } from "react-icons/fa";
import { FiHelpCircle } from "react-icons/fi";
import Select from "react-select";

import "./CrearCedulaInterna.css";
import Sidebar from "@/layout/sidebar/Sidebar.jsx";
import CedulaService from "@/services/CedulaService.js";
import CatalogoDependencia from "@/utils/CatalogoDependencia.js";
import CatalogoCedula from "@/utils/CatalogoCedulas.js";
import SolicitudService from "@/services/SolicitudService.js";
import Constantes from "@/utils/Constants.js";
import UserContext from "@/utils/UserContext.jsx";

function CrearCedulaInterna() {
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [showHelp, setShowHelp] = useState(false);

  const { currentUser } = useContext(UserContext);
  const [procesoCargado, setProcesoCargado] = useState(null);

  const cedulaFromNav = location.state?.cedula || null;
  const [formData, setFormData] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return {
      hermes: "",
      numeroPlaza: "",
      fechaElaboracion: `${yyyy}-${mm}-${dd}`,
      nombre: "",
      edad: "",
      educacion: "",
      puesto: "",
      adscripcion: null,
      referido: "",
      antecedentes: "",
      cedulaSeleccionada: "",
      word: "",
      excel: "",
      ortografia: "",
      evaluacionConocimientos: "",
      expectativas: "",
      experienciaPuesto: "",
      experiencia: "",
      conclusiones: "",
      resultados: "",
      elabora: "",
      revisa: "",
      idProceso: "",
      analista: "",
      avaladoPor: "",
    };
  });

  const [cedulaOptions, setCedulaOptions] = useState([]);
  const [competencias, setCompetencias] = useState([]);
  const [dependencias, setDependencias] = useState([]);
  const [dependenciasCargadas, setDependenciasCargadas] = useState(false);
  const [clasificacionesCargadas, setClasificacionesCargadas] = useState(false);

  useEffect(() => {
    async function cargarDependencias() {
      const token = localStorage.getItem("token");
      const catalogo = new CatalogoDependencia();
      try {
        if (CatalogoDependencia.obtenerDependencias().length === 0) {
          await catalogo.cargarDependencias(token);
        }
        const depsObj = CatalogoDependencia.obtenerDependencias();
        const depsArray = Object.values(depsObj);
        setDependencias(depsArray);
        setDependenciasCargadas(true);
      } catch (err) {
        console.error("Error cargando dependencias:", err);
      }
    }
    cargarDependencias();
  }, []);

  useEffect(() => {
    if (cedulaFromNav && dependenciasCargadas) {
      const dep = dependencias.find(
        (d) => d.nombre === cedulaFromNav.dependencia,
      );

      setFormData((prev) => ({
        ...prev,
        hermes: cedulaFromNav.hermesNotificacion || "",
        numeroPlaza: cedulaFromNav.numeroPlaza || "",
        nombre: cedulaFromNav.candidato || "",
        puesto: cedulaFromNav.puesto || "",
        idProceso: cedulaFromNav.idProceso || "",
        edad: cedulaFromNav.edad || "",
        educacion: cedulaFromNav.educacionFormal || "",
        avaladoPor: cedulaFromNav.avaladoPor || "",
        referido: cedulaFromNav.referidoPor || "",
        antecedentes: cedulaFromNav.antecedentesFamiliaresUV || "",
        word: cedulaFromNav.resultadoHabilidadesWord || "",
        excel: cedulaFromNav.resultadoHabilidadesExcelReal || "",
        ortografia: cedulaFromNav.resultadoOrtografia || "",
        evaluacionConocimientos:
          cedulaFromNav.resultadoEvaluacionConocimiento || "",
        expectativas: cedulaFromNav.expectativaLaboral || "",
        experienciaPuesto: cedulaFromNav.experienciaRelacionada || "",
        experiencia: cedulaFromNav.experiencia || "",
        conclusiones: cedulaFromNav.conclusiones || "",
        resultados: cedulaFromNav.resultado || "",
        analista: cedulaFromNav.analista || "",
        cedulaSeleccionada: cedulaFromNav.FKIdClasificacionCedula
          ? Number(cedulaFromNav.FKIdClasificacionCedula)
          : "",
        fechaElaboracion: cedulaFromNav.fechaElaboracionCedulaInterna
          ? cedulaFromNav.fechaElaboracionCedulaInterna.split("T")[0]
          : "",
        adscripcion: dep
          ? {
              value: dep.idDependencia,
              label: dep.nombre,
              zona: dep.zona,
            }
          : null,
      }));
    }
  }, [cedulaFromNav, dependencias, dependenciasCargadas]);

  useEffect(() => {
    if (!cedulaFromNav || competencias.length === 0) return;

    const valoresPsicometria = competencias.reduce((acc, comp) => {
      const clavePsicometria =
        Constantes.nombreCompetenciaMap[comp.nombreCompetencia];
      acc[clavePsicometria] = cedulaFromNav[clavePsicometria] || "";
      return acc;
    }, {});

    setFormData((prev) => ({ ...prev, ...valoresPsicometria }));
  }, [cedulaFromNav, competencias]);

  useEffect(() => {
    const cargarOpciones = async () => {
      try {
        const token = localStorage.getItem("token");
        const cedulas = await new CatalogoCedula().cargarCedulas(token);
        const options = cedulas.map((c) => ({
          value: c.idClasificacionCedulas,
          label: `${c.numCedula}. ${c.nombre}`,
        }));
        setCedulaOptions(options);
        setClasificacionesCargadas(true);
      } catch (error) {
        console.error("Error cargando cédulas:", error);
      }
    };
    cargarOpciones();
  }, []);

  useEffect(() => {
    const cargarCompetencias = async () => {
      if (!formData.cedulaSeleccionada) return;
      try {
        const token = localStorage.getItem("token");
        const servicio = new CedulaService();
        const data = await servicio.obtenerCompetenciasPorClasificacionCedula(
          formData.cedulaSeleccionada,
          token,
        );
        setCompetencias(data);
      } catch (error) {
        console.error("Error cargando competencias:", error);
      }
    };
    cargarCompetencias();
  }, [formData.cedulaSeleccionada]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const buscarIdProceso = async () => {
    const token = localStorage.getItem("token");
    const servicio = new CedulaService();
    try {
      const proceso = await servicio.obtenerDatoInicialesCedula(
        formData.idProceso,
        token,
      );
      const dependencia = CatalogoDependencia.obtenerDependenciaPorId(
        proceso.FKIdDependencia,
      );
      const cedulaMatch = cedulaOptions.find((opt) =>
        opt.label
          .toLowerCase()
          .includes(proceso.funcionDesempeniar?.toLowerCase() || ""),
      );

      if (proceso) {
        setProcesoCargado({ proceso, dependencia });
        setFormData((prev) => ({
          ...prev,
          hermes: proceso.hermesNotificacion || "",
          educacion: proceso.educacionFormal || "",
          avaladoPor: proceso.avaladoPor || "",
          idProceso: proceso.idProceso,
          numeroPlaza: proceso.numPlaza || "",
          nombre: proceso.nombreCandidato || "",
          word: proceso.resultadoHabilidadesWord || "",
          excel: proceso.resultadoHabilidadesExcel || "",
          ortografia: proceso.resultadoOrtografia || "",
          evaluacionConocimientos:
            proceso.resultadoEvaluacionConocimiento || "",
          adscripcion: dependencia
            ? {
                value: dependencia.idDependencia,
                label: dependencia.nombre,
                zona: dependencia.zona,
              }
            : null,
        }));
      }
    } catch (error) {
      console.error("Error cargando datos iniciales:", error);
    }
  };

  useEffect(() => {
    if (!procesoCargado || !clasificacionesCargadas) return;
    const { proceso } = procesoCargado;
    const normalizar = (t) =>
      t
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") || "";
    const cedulaMatch = cedulaOptions.find((opt) =>
      normalizar(opt.label).includes(normalizar(proceso.funcionDesempeniar)),
    );

    if (cedulaMatch) {
      setFormData((prev) => ({
        ...prev,
        cedulaSeleccionada: cedulaMatch.value,
      }));
    }
  }, [procesoCargado, clasificacionesCargadas]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.hermes.trim()) {
      setMensaje({ texto: `❌ Por favor ingresa un hermes`, tipo: "error" });
      setTimeout(() => {
        setMensaje("");
      }, 3000);
      return;
    }

    if (!formData.cedulaSeleccionada) {
      setMensaje({
        texto: `⚠️ Debes seleccionar un tipo de cédula antes de guardar`,
        tipo: "error",
      });
      setTimeout(() => setMensaje(""), 3000);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const servicio = new CedulaService();
      const servicioSolicitud = new SolicitudService();
      const responseCedula = await servicio.registrarCedulaInterna(
        { ...formData, FKIdProceso: formData.idProceso },
        token,
      );
      const idCedula = responseCedula.idCedula;
      if (!idCedula)
        throw new Error("No se recibió el ID de la cédula registrada");
      await servicio.registrarResultado(
        idCedula,
        formData,
        competencias,
        token,
      );
      const solicitudData = {
        FKIdDependencia: formData.adscripcion
          ? formData.adscripcion.value
          : null,
        numeroPlaza: formData.numeroPlaza,
        nombre: formData.nombre,
        word: formData.word,
        excel: formData.excel,
        ortografia: formData.ortografia,
        evaluacionConocimientos: formData.evaluacionConocimientos,
        avaladoPor: formData.avaladoPor,
        educacionFormal: formData.educacion,
      };
      const respProceso =
        await servicioSolicitud.actualizarProcesoContratacionCedula(
          formData.idProceso,
          solicitudData,
          token,
        );
      if (respProceso && !respProceso.error) {
        setMensaje({
          texto:
            "✅  Cédula, resultados y base de datos actualizados correctamente",
          tipo: "exito",
        });
        setTimeout(() => {
          setMensaje("");
        }, 3000);
      } else {
        setMensaje({
          texto:
            " ⚠️ Se guardó la cédula y resultados, pero hubo error al actualizar la base de datos",
          tipo: "exito",
        });
        setTimeout(() => {
          setMensaje("");
        }, 3000);
      }
    } catch (error) {
      console.error("Error registrando cédula:", error);
      setMensaje({
        texto: `❌ Error al registrar : ${error.message}`,
        tipo: "error",
      });
      setTimeout(() => {
        setMensaje("");
      }, 3000);
    }
  };

  const handleGenerarPDF = async () => {
    try {
      const existingPdfBytes = await fetch("/CedulaInternaEditable.pdf").then(
        (res) => res.arrayBuffer(),
      );
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const form = pdfDoc.getForm();

      form.getTextField("nombre").setText(formData.nombre || "");
      form.getTextField("edad").setText(formData.edad + " años" || "");
      form.getTextField("hermes").setText(formData.hermes || "");
      form.getTextField("numeroPlaza").setText(formData.numeroPlaza || "");
      form
        .getTextField("fechaElaboracion")
        .setText(formData.fechaElaboracion || "");
      form.getTextField("educacionFormal").setText(formData.educacion || "");
      form.getTextField("puesto").setText(formData.puesto || "");
      form
        .getTextField("adscripcion")
        .setText(formData.adscripcion?.label || "");
      form.getTextField("referido").setText(formData.referido || "");
      form
        .getTextField("antecedentesFamiliares")
        .setText(formData.antecedentes || "");
      form.getTextField("resultadoWord").setText(formData.word || "");
      form.getTextField("resultadoExcel").setText(formData.excel || "");
      form
        .getTextField("resultadoOrtografia")
        .setText(formData.ortografia || "");
      form
        .getTextField("evaluacionConocimientos")
        .setText(formData.evaluacionConocimientos || "");
      form
        .getTextField("expectativaLaboral")
        .setText(formData.expectativas || "");
      form
        .getTextField("experienciaRelacionada")
        .setText(formData.experienciaPuesto || "");
      form.getTextField("experiencia").setText(formData.experiencia || "");
      form.getTextField("conclusiones").setText(formData.conclusiones || "");
      form.getTextField("resultado").setText(formData.resultados || "");
      form
        .getTextField("analista")
        .setText(
          "Lic. " +
            usuario.nombre +
            " " +
            usuario.primerApellido +
            " " +
            usuario.segundoApellido,
        );
      form.getTextField("jefeOficina").setText("Mtro. Alvaro Vallejo Carmona");
      let sumaPerfil = 0;
      let sumaPsicometria = 0;
      competencias.slice(0, 11).forEach((item, index) => {
        const i = index + 1;
        const nombreCompetencia = item.nombreCompetencia || "";
        const perfil = Number(item.perfil) || 0;
        const keyPsicometria =
          Constantes.nombreCompetenciaMap[item.nombreCompetencia];
        const valorPsicometria = Number(formData[keyPsicometria]) || 0;
        sumaPerfil = sumaPerfil + perfil;
        sumaPsicometria = sumaPsicometria + valorPsicometria;
        form.getTextField(`competencia${i}`).setText(nombreCompetencia);
        form.getTextField(`perfil${i}`).setText(perfil.toString());
        form
          .getTextField(`psicometria${i}`)
          .setText(valorPsicometria.toString());
      });
      const resultadoCuantitativo = sumaPsicometria / sumaPerfil;
      const resultadoCuantitativoPorcentaje = (
        resultadoCuantitativo * 100
      ).toFixed(0);
      form
        .getTextField("resultadoCuantitativo")
        .setText(`${resultadoCuantitativoPorcentaje}%`);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      form.getFields().forEach((field) => {
        field.updateAppearances(font);
        field.acroField.setBorderWidth(0);
        field.acroField.setBorderColor(undefined);
      });
      form.flatten();
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const fileName = `CedulaInterna_${formData.hermes || "SinHermes"}.pdf`;
      saveAs(blob, fileName);

      console.log("PDF generado correctamente");
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("Ocurrió un error al generar el PDF. Revisa la consola.");
    }
  };

  return (
    <div className="crear-cedula-page">
      <Sidebar tipoAcceso={currentUser.FKidTipoAcceso} />
      <main className="main-content">
        {/*  Mensaje flotante */}
        {mensaje.texto && (
          <div className={`mensaje-flotante ${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}

        {/*  Icono de ayuda */}
        <div className="help-icon" onClick={() => setShowHelp(true)}>
          <FiHelpCircle />
        </div>

        {/*  Modal de ayuda */}
        {showHelp && (
          <div className="modal-overlay" onClick={() => setShowHelp(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Ayuda</h2>
              <p>
                Esta es la ventana de <strong>Cédula Interna</strong>. Aquí
                podrás llenar los datos generales, competencias y resultados de
                un candidato.
              </p>
              <p>
                Ingresa el <strong>Identificador del candidato</strong> y
                presiona el icono de la lupa 🔍 para cargar la información
                disponible en la base de datos.
              </p>
              <p>
                Al finalizar, puedes <strong>guardar</strong> la cédula o{" "}
                <strong>generar el PDF</strong> con todos los datos capturados.
              </p>
              <p>
                <strong>
                  Nota: Si modificas información cargada automáticamente y
                  presionas “Guardar”, los cambios se reflejarán también en la
                  base de datos.
                </strong>
              </p>
              <button className="btn-cerrar" onClick={() => setShowHelp(false)}>
                Cerrar
              </button>
            </div>
          </div>
        )}

        <div className="page-header2">
          <h1 className="page-title2">Cédula Interna</h1>
        </div>

        <div className="contenido-cedula-interna-inner">
          <form className="form-grid" onSubmit={handleSubmit}>
            {/* Datos básicos */}
            <div className="form-group">
              <label className="form-label">ID de candidato</label>
              <div className="input-with-button">
                <input
                  type="number"
                  className="form-input"
                  value={formData.idProceso}
                  onChange={(e) =>
                    handleInputChange("idProceso", e.target.value)
                  }
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      await buscarIdProceso();
                    }
                  }}
                  placeholder="Ingresa el ID del candidato"
                />
                <button
                  type="button"
                  className="btn-lupa"
                  onClick={buscarIdProceso}
                  title="Buscar ID Proceso"
                >
                  <FaSearch />
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label-evaluacion">Hermes</label>
              <input
                type="text"
                className="form-input"
                value={formData.hermes}
                onChange={(e) => handleInputChange("hermes", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label-evaluacion">Número de Plaza</label>
              <input
                type="text"
                className="form-input"
                value={formData.numeroPlaza}
                onChange={(e) =>
                  handleInputChange("numeroPlaza", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label-evaluacion">
                Fecha de Elaboración
              </label>
              <input
                type="date"
                className="form-input"
                value={formData.fechaElaboracion}
                onChange={(e) =>
                  handleInputChange("fechaElaboracion", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label-evaluacion">Nombre</label>
              <input
                type="text"
                className="form-input"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label-evaluacion">Edad</label>
              <input
                type="text"
                className="form-input"
                value={formData.edad}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, "");
                  value = value.slice(0, 3);
                  handleInputChange("edad", value);
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label-evaluacion">Educación Formal</label>
              <input
                type="text"
                className="form-input"
                value={formData.educacion}
                onChange={(e) => handleInputChange("educacion", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label-evaluacion">Avalado por</label>
              <input
                type="text"
                className="form-input"
                value={formData.avaladoPor}
                onChange={(e) =>
                  handleInputChange("avaladoPor", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label-evaluacion">Puesto</label>
              <input
                type="text"
                className="form-input"
                value={formData.puesto}
                onChange={(e) => handleInputChange("puesto", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label-evaluacion">Adscripción</label>
              <Select
                options={dependencias.map((dep) => ({
                  value: dep.idDependencia,
                  label: dep.nombre,
                  zona: dep.zona,
                }))}
                value={formData.adscripcion}
                onChange={(selectedOption) => {
                  handleInputChange("adscripcion", selectedOption || null);
                  handleInputChange(
                    "region",
                    selectedOption ? selectedOption.zona : "",
                  );
                  handleInputChange(
                    "IdDependencia",
                    selectedOption ? selectedOption.value : null,
                  );
                }}
                placeholder="Escribe o selecciona una adscripción"
                isClearable
                isSearchable
              />
            </div>

            <div className="form-group">
              <label className="form-label-evaluacion">Referido Por</label>
              <input
                type="text"
                className="form-input"
                value={formData.referido}
                onChange={(e) => handleInputChange("referido", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label-evaluacion">
                Antecedentes Familia UV
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.antecedentes}
                onChange={(e) =>
                  handleInputChange("antecedentes", e.target.value)
                }
              />
            </div>

            {/* Selección de Cédula */}
            <h3 className="section-title">Confirmación de Competencias</h3>
            <div className="form-group" style={{ gridColumn: "span 3" }}>
              <label className="form-label-evaluacion">
                Seleccionar Cédula
              </label>
              <Select
                className="select-cedula"
                options={cedulaOptions}
                value={
                  cedulaOptions.find(
                    (option) => option.value === formData.cedulaSeleccionada,
                  ) || null
                }
                onChange={(option) =>
                  handleInputChange(
                    "cedulaSeleccionada",
                    option ? option.value : "",
                  )
                }
                placeholder="Selecciona o escribe..."
                isClearable
                isSearchable
              />
            </div>

            {/* Tabla de competencias */}
            <div
              className="tabla-competencias"
              style={{ gridColumn: "span 3" }}
            >
              <table>
                <thead>
                  <tr>
                    <th>Competencia</th>
                    <th>Perfil</th>
                    <th>Psicometría</th>
                  </tr>
                </thead>
                <tbody>
                  {competencias.length > 0 ? (
                    competencias.map((item, i) => (
                      <tr key={i}>
                        <td>{item.nombreCompetencia}</td>
                        <td>{item.perfil}</td>
                        <td>
                          <input
                            type="number"
                            className="form-input"
                            value={
                              formData[
                                Constantes.nombreCompetenciaMap[
                                  item.nombreCompetencia
                                ]
                              ] || ""
                            }
                            onChange={(e) => {
                              const key =
                                Constantes.nombreCompetenciaMap[
                                  item.nombreCompetencia
                                ];
                              handleInputChange(key, e.target.value);
                            }}
                            placeholder="Ingresa valor"
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: "center" }}>
                        Selecciona una cédula para ver sus competencias
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Conocimientos específicos */}
            {[
              { label: "Word", key: "word" },
              { label: "Excel", key: "excel" },
              { label: "Ortografía y Redacción", key: "ortografia" },
              {
                label: "Evaluación de Conocimientos",
                key: "evaluacionConocimientos",
              },
            ].map(({ label, key }) => (
              <div key={key} className="form-group">
                <label className="form-label-evaluacion">{label}</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData[key]}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                />
              </div>
            ))}

            {/* Conclusiones */}
            <h3 className="section-title">Conclusiones</h3>
            {[
              {
                label: "Expectativas laborales y económicas",
                key: "expectativas",
              },
              {
                label: "Experiencia Relacionada al puesto",
                key: "experienciaPuesto",
              },
              {
                label: "Experiencia (Periodo, Funciones, Organización)",
                key: "experiencia",
              },
              { label: "Conclusiones", key: "conclusiones" },
              { label: "Resultados", key: "resultados" },
            ].map(({ label, key }) => (
              <div
                key={key}
                className="form-group"
                style={{ gridColumn: "span 3" }}
              >
                <label className="form-label-evaluacion">{label}</label>
                <textarea
                  className="large-textarea"
                  value={formData[key] || ""}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                />
              </div>
            ))}

            {/* Botón */}
            <div className="action-buttons">
              <button type="submit" className="btn-guardar">
                Guardar
              </button>
              <button
                type="button"
                className="btn-generar"
                onClick={handleGenerarPDF}
              >
                Generar PDF
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CrearCedulaInterna;
