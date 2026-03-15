import { useEffect, useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { FiHelpCircle } from "react-icons/fi";
import { saveAs } from "file-saver";
import { PDFDocument, StandardFonts } from "pdf-lib";
import Select from "react-select";

import "./CrearCedulaInterna.css";
import CedulaService from "@/services/CedulaService";
import IResponseHTTP from "@/interfaces/http/Response";
import { IGetCompetenciasClasificacionCedula } from "@/schemas/cedulas/GetCompetencia";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Alert/Floating/Toast";
import { useDependencias } from "@/hooks/useDependencias";
import {
  IDependenciaBase,
  IGetDependencias,
} from "@/schemas/catalogos/GetDependencia";
import { ITipoCedulaBase } from "@/schemas/catalogos/GetTipoCedula";
import { useCedulaTipos } from "@/hooks/useCedulaTipos";
import ProcesoContratacionService from "@/services/ProcesoContratacionService";
import { IGetProcesoContratacion } from "@/schemas/procesos-contratacion/GetProcesoContratacion";
import { useDependenciaById } from "@/hooks/useDependenciaById";
import CatalogoService from "@/services/CatalogosService";
import { nombreCompetenciaMap } from "@/utils/Constants";
import { IPostCedulaInternaForm } from "@/schemas/cedulas/PostCedula";

function CrearCedulaInterna() {
  const location = useLocation();
  const { toast, mostrarToast } = useToast();
  const [showToastHelp, setShowToastHelp] = useState(false);
  // IPostCedulaInternaForm o IPostCedula
  const [formData, setFormData] = useState<IPostCedulaInternaForm>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const data: IPostCedulaInternaForm = {
      // Verificar en back que dato y de que
      revisa: "",
      elabora: "",
      avaladoPor: "",
      adscripcion: null,
      //-----
      analista: "",
      antecedentesFamiliaresUV: "",
      conclusiones: "",
      edad: "",
      educacionFormal: "",
      evaluacionConocimientos: "",
      expectativaLaboral: "",
      experiencia: "",
      experienciaRelacionada: "",
      fechaElaboracionPropuesta: "",
      FKIdProceso: 0,
      hermesNotificacion: "",
      idCedula: 0,
      nombreCandidato: "",
      numPlaza: "",
      puesto: "",
      referidoPor: "",
      resultados: "",
      resultadoHabilidadesExcel: "",
      resultadoHabilidadesWord: "",
      resultadoOrtografia: "",
    };
    return data;
  });
  // Obtener dependencias --------------------------------------------------------
  const {
    data: dataDependencias,
    loading: loadingDependencias,
    error: errorDependencias,
  } = useDependencias();
  const [dependencias, setDependencias] = useState<IGetDependencias | null>();
  useEffect(() => {
    setDependencias(dataDependencias);
  }, [dataDependencias]);

  const {
    data: dataDependenciaById,
    loading: loadingDependenciaById,
    error: errorDependenciaById,
  } = useDependenciaById();
  const [dependenciaById, setDependenciaById] =
    useState<IDependenciaBase | null>();

  // Obtener tipos de cédulas ---------------------------------------------------
  const {
    data: dataCedulaTipos,
    loading: loadingCedulaTipos,
    error: errorCedulaTipos,
  } = useCedulaTipos();
  const [tiposCedula, setTiposCedula] = useState<ITipoCedulaBase[] | null>();
  useEffect(() => {
    setTiposCedula(dataCedulaTipos);
  }, [dataCedulaTipos]);

  // Obtener competencias clasificacion cedula ----------------------------------
  const [competencias, setCompetencias] =
    useState<IGetCompetenciasClasificacionCedula | null>(null);
  useEffect(() => {
    const cargarCompetencias = async () => {
      if (!formData.idCedula) return;
      try {
        const response: IResponseHTTP<IGetCompetenciasClasificacionCedula> =
          await new CedulaService().getCompetenciasClasificacionCedula(
            Number(formData.idCedula),
          );
        setCompetencias(response.mensaje);
      } catch (error) {
        console.error("Error cargando competencias:", error);
      }
    };
    cargarCompetencias();
  }, [formData.idCedula]);

  // -----------------------------------------------------------------------------
  //

  const cedulaFromNav = location.state?.cedula || null;
  useEffect(() => {
    if (!cedulaFromNav || competencias?.competencias.length === 0) return;

    const valoresPsicometria = competencias?.competencias.reduce(
      (acc, comp) => {
        const clavePsicometria = nombreCompetenciaMap;
        acc = cedulaFromNav || "";
        return acc;
      },
      {},
    );

    setFormData((prev) => ({ ...prev, ...valoresPsicometria }));
  }, [cedulaFromNav, competencias]);

  useEffect(() => {
    if (cedulaFromNav && dependencias) {
      const dep = dependencias.dependencias.find(
        (d) => d.nombre === cedulaFromNav.dependencia,
      );

      setFormData((prev) => ({
        ...prev,
        // Verificar en back que dato y de que
        revisa: "",
        elabora: "",
        avaladoPor: "",
        adscripcion: dep
          ? {
              idDependencia: dep.idDependencia,
              nomber: dep.nombre,
              zona: dep.zona,
            }
          : null,
        //-----
        analista: "",
        antecedentesFamiliaresUV: "",
        conclusiones: "",
        edad: "",
        educacionFormal: "",
        evaluacionConocimientos: "",
        expectativaLaboral: "",
        experiencia: "",
        experienciaRelacionada: "",
        fechaElaboracionPropuesta: cedulaFromNav.fechaElaboracionCedulaInterna
          ? cedulaFromNav.fechaElaboracionCedulaInterna.split("T")[0]
          : "",
        FKIdProceso: cedulaFromNav.idProceso,
        hermesNotificacion: cedulaFromNav.hermesNotificacion || "",
        idCedula: cedulaFromNav.FKIdClasificacionCedula
          ? Number(cedulaFromNav.FKIdClasificacionCedula)
          : 0,
        nombreCandidato: cedulaFromNav.candidato || "",
        numPlaza: cedulaFromNav.numeroPlaza || "",
        puesto: "",
        referidoPor: "",
        resultados: "",
        resultadoHabilidadesExcel: "",
        resultadoHabilidadesWord: "",
        resultadoOrtografia: "",
      }));
    }
  }, [cedulaFromNav, dependencias, loadingDependencias]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const [procesoCargado, setProcesoCargado] =
    useState<IGetProcesoContratacion | null>();
  const buscarIdProceso = async () => {
    try {
      let responseProcesoContratacion: IResponseHTTP<IGetProcesoContratacion>;
      let currentDependencia: IResponseHTTP<IDependenciaBase>;
      responseProcesoContratacion =
        await new ProcesoContratacionService().getProcesoContratacionById(
          Number(formData.FKIdProceso),
        );

      if (responseProcesoContratacion.mensaje!) {
        currentDependencia = await new CatalogoService().getDependenciaById(
          responseProcesoContratacion.mensaje.procesoContratación
            .FKIdDependencia,
        );
        setDependenciaById(currentDependencia.mensaje);
      }

      const cedulaMatch = dataCedulaTipos!.find((opt) =>
        opt.cedula
          .toLowerCase()
          .includes(
            responseProcesoContratacion.mensaje.procesoContratación.funcionDesempeniar?.toLowerCase() ||
              "",
          ),
      );

      if (responseProcesoContratacion.mensaje) {
        setProcesoCargado(responseProcesoContratacion.mensaje);
        setFormData((prev) => ({
          ...prev,
          hermesNotificacion:
            procesoCargado?.procesoContratación.hermesNotificacion || "",
          educacion: procesoCargado?.procesoContratación.educacionFormal || "",
          avaladoPor: procesoCargado?.procesoContratación.avaladoPor || "",
          idProceso: procesoCargado?.procesoContratación.idProceso,
          numeroPlaza: procesoCargado?.procesoContratación.numPlaza || "",
          nombre: procesoCargado?.procesoContratación.nombreCandidato || "",
          word:
            procesoCargado?.procesoContratación.resultadoHabilidadesWord || "",
          excel:
            procesoCargado?.procesoContratación.resultadoHabilidadesExcel || "",
          ortografia:
            procesoCargado?.procesoContratación.resultadoOrtografia || "",
          evaluacionConocimientos:
            procesoCargado?.procesoContratación
              .resultadoEvaluacionConocimiento || "",
          adscripcion: currentDependencia
            ? {
                idDependencia: currentDependencia.mensaje.idDependencia,
                nombre: currentDependencia.mensaje.nombre,
                zona: currentDependencia.mensaje.zona,
              }
            : null,
        }));
      }
    } catch (error) {
      console.error("Error cargando datos iniciales: ", error);
    }
  };

  useEffect(() => {
    if (!procesoCargado || !loadingCedulaTipos) return;
    const normalizar = (t) =>
      t
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") || "";
    const cedulaMatch = dataCedulaTipos?.find((opt) =>
      normalizar(opt.cedula).includes(
        normalizar(procesoCargado.procesoContratación.funcionDesempeniar),
      ),
    );

    if (cedulaMatch) {
      setFormData((prev) => ({
        ...prev,
        cedulaSeleccionada: cedulaMatch.idTipoCedula,
      }));
    }
  }, [procesoCargado, loadingCedulaTipos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.hermesNotificacion.trim()) {
      mostrarToast("❌ Por favor ingresa un hermes", "error");
      return;
    }

    if (!formData.idCedula || formData.idCedula === 0) {
      mostrarToast(
        `⚠️ Debes seleccionar un tipo de cédula antes de guardar`,
        "error",
      );
      return;
    }
    try {
      const responseCedula: IResponseHTTP<string | number> =
        await new CedulaService().postCedulaInterna({
           // Verificar en back que dato y de que
            revisa: formData.revisa,
            elabora: formData.elabora,
            avaladoPor: formData.avaladoPor,
            adscripcion: IDependenciaFormCedula | null;
            //-----
            analista: string;
            antecedentesFamiliaresUV: string;
            conclusiones: string;
            edad: string;
            educacionFormal: string;
            evaluacionConocimientos: string;
            expectativaLaboral: string;
            experiencia: string;
            experienciaRelacionada: string;
            fechaElaboracionPropuesta: string;
            FKIdProceso: number;
            hermesNotificacion: string;
            idCedula: number;
            nombreCandidato: string;
            numPlaza: string;
            puesto: string;
            referidoPor: string;
            resultados: string;
            resultadoHabilidadesExcel: string;
            resultadoHabilidadesWord: string;
            resultadoOrtografia: string;
        });
        
        await new CedulaService().postCedulaInterna({
          ...formData,
          FKIdProceso: Number(formData.idProceso),
        });

      let idCedula: number = 0;
      if (responseCedula.error) {
        if (typeof responseCedula.mensaje === "number")
          idCedula = Number(responseCedula);
      }
      if (!idCedula)
        throw new Error("No se recibió el ID de la cédula registrada");

      const responseRegistrarResultad: IResponseHTTP<string> =
        await new CedulaService().postResultadoCedulaInterna(formData);
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
        await new ProcesoContratacionService().putProcesoContratacion(
          Number(formData.FKIdProceso),
          solicitudData,
        );
      if (respProceso && !respProceso.error) {
        mostrarToast(
          "✅  Cédula, resultados y base de datos actualizados correctamente",
          "exito",
        );
      } else {
        mostrarToast(
          "⚠️ Se guardó la cédula y resultados, pero hubo error al actualizar la base de datos",
          "error",
        );
      }
    } catch (error) {
      console.error(
        `CrearCedulaInterna.tsx - Error registrando cédula:\n${error}`,
      );
      mostrarToast("❗ Error registrando.\nIntente más tarde.", "error");
    }
  };
  //----

  const handleGenerarPDF = async () => {
    try {
      const existingPdfBytes = await fetch("/CedulaInternaEditable.pdf").then(
        (res) => res.arrayBuffer(),
      );
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const form = pdfDoc.getForm();

      form.getTextField("nombre").setText(formData.nombreCandidato || "");
      form.getTextField("edad").setText(formData.edad + " años" || "");
      form.getTextField("hermes").setText(formData.hermesNotificacion || "");
      form.getTextField("numeroPlaza").setText(formData.numPlaza || "");
      form
        .getTextField("fechaElaboracion")
        .setText(formData.fechaElaboracionPropuesta || "");
      form.getTextField("educacionFormal").setText(formData.educacionFormal || "");
      form.getTextField("puesto").setText(formData.puesto || "");
      form
        .getTextField("adscripcion")
        .setText(formData.adscripcion?.nombreCandidato || "");
      form.getTextField("referido").setText(formData.referidoPor || "");
      form
        .getTextField("antecedentesFamiliares")
        .setText(formData.antecedentesFamiliaresUV || "");
      form.getTextField("resultadoWord").setText(formData.resultadoHabilidadesWord || "");
      form.getTextField("resultadoExcel").setText(formData.resultadoHabilidadesExcel || "");
      form
        .getTextField("resultadoOrtografia")
        .setText(formData.resultadoOrtografia || "");
      form
        .getTextField("evaluacionConocimientos")
        .setText(formData.evaluacionConocimientos || "");
      form
        .getTextField("expectativaLaboral")
        .setText(formData.expectativaLaboral || "");
      form
        .getTextField("experienciaRelacionada")
        .setText(formData.expectativaLaboral || "");
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
      competencias?.competencias.slice(0, 11).forEach((item, index) => {
        const i = index + 1;
        const nombreCompetencia = item.nombreCompetencia || "";
        const perfil = Number(item.perfil) || 0;
        const keyPsicometria =
          nombreCompetenciaMap[item.nombreCompetencia];
        const valorPsicometria = Number(formData[keyPsicometria]) || 0;
        sumaPerfil = sumaPerfil + perfil;
        sumaPsicometria = sumaPsicometria + valorPsicometria;
        try {
          form.getTextField(`competencia${i}`).setText(nombreCompetencia);
        } catch {}
        try {
          form.getTextField(`perfil${i}`).setText(perfil.toString());
        } catch {}
        try {
          form
            .getTextField(`psicometria${i}`)
            .setText(valorPsicometria.toString());
        } catch {}
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
        try {
          field.acroField.setBorderWidth(0);
          field.acroField.setBorderColor(undefined);
        } catch (e) {}
      });
      form.flatten();
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const fileName = `CedulaInterna_${formData.hermesNotificacion || "SinHermes"}.pdf`;
      saveAs(blob, fileName);
      mostrarToast("PDF generado correctamente.", "error")
    } catch (error) {
      console.error("CrearCedulaInterna.tsx - Error generando PDF:\n", error);
      mostrarToast("Ocurrió un error al generar el PDF.", "error")
    }
  };

  return (
    <>
      {/* Toast de notificación */}
      <Toast texto={toast.texto} tipo={toast.tipo} />
      <main className="main-content">
        {/* Icono de ayuda */}
        <div className="help-icon" onClick={() => setShowToastHelp(true)}>
          <FiHelpCircle />
        </div>

        {/* Modal de ayuda */}
        {showToastHelp && (
          <div
            className="modal-overlay"
            onClick={() => setShowToastHelp(false)}
          >
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
              <button
                className="btn-cerrar"
                onClick={() => setShowToastHelp(false)}
              >
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
                options={dependencias?.dependencias.map((dep) => ({
                  value: dep.idDependencia,
                  label: dep.nombre,
                  zona: dep.zona,
                }))}
                value={formData.adscripcion}
                onChange={(selectedOption) => {
                  handleInputChange(
                    "adscripcion",
                    String(selectedOption?.label),
                  );
                  handleInputChange(
                    "region",
                    selectedOption ? selectedOption.zona : "",
                  );
                  handleInputChange(
                    "IdDependencia",
                    String(selectedOption?.value),
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
                options={dataCedulaTipos ?? []}
                value={
                  dataCedulaTipos?.find(
                    (option) => option.idTipoCedula === formData.FKIdProceso,
                  ) || null
                }
                onChange={(option) =>
                  handleInputChange(
                    "cedulaSeleccionada",
                    option ? option.cedula : "",
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
                  {competencias?.length > 0 ? (
                    competencias?.map((item, i) => (
                      <tr key={i}>
                        <td>{item.nombreCompetencia}</td>
                        <td>{item.perfil}</td>
                        <td>
                          <input
                            type="number"
                            className="form-input"
                            value={
                              formData[
                                nombreCompetenciaMap[item.nombreCompetencia]
                              ] || ""
                            }
                            onChange={(e) => {
                              const key =
                                nombreCompetenciaMap[item.nombreCompetencia];
                              handleInputChange(key, e.target.value);
                            }}
                            placeholder="Ingresa valor"
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center" }}>
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
    </>
  );
}

export default CrearCedulaInterna;
