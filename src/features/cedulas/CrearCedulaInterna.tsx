import { useEffect, useState, useId } from "react";
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
  IDependenciaFormCedula,
} from "@/schemas/catalogos/GetDependencia";
import {
  IGetTiposCedula,
  ITipoCedulaBase,
} from "@/schemas/catalogos/GetTipoCedula";
import { useCedulaTipos } from "@/hooks/useCedulaTipos";
import ProcesoContratacionService from "@/services/ProcesoContratacionService";
import { IGetProcesoContratacion } from "@/schemas/procesos-contratacion/GetProcesoContratacion";
import { useDependenciaById } from "@/hooks/useDependenciaById";
import CatalogoService from "@/services/CatalogosService";
import { nombreCompetenciaMap } from "@/utils/Constants";
import { IPostCedulaInternaForm } from "@/schemas/cedulas/PostCedula";

function CrearCedulaInterna() {
  // Utils ------------------------------------------------------------------
  const { toast, mostrarToast } = useToast();
  const [showToastHelp, setShowToastHelp] = useState(false);
  const fieldID = useId();
  // formData con formateo inicial ------------------------------------------
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
  const [tiposCedula, setTiposCedula] = useState<IGetTiposCedula | null>();
  useEffect(() => {
    setTiposCedula(dataCedulaTipos);
  }, [dataCedulaTipos]);

  // Obtener competencias clasificacion cedula ----------------------------------
  const [competencias, setCompetencias] =
    useState<IGetCompetenciasClasificacionCedula | null>(null);
  useEffect(() => {
    if (!formData.idCedula) return;

    const cargarCompetencias = async () => {
      try {
        const response: IResponseHTTP<IGetCompetenciasClasificacionCedula> =
          await new CedulaService().getCompetenciasClasificacionCedula(
            Number(formData.idCedula),
          );
        setCompetencias(response.mensaje);
      } catch (error) {
        console.error(
          "CrearCedulaInterna.tsx - Error cargando competencias:\n",
          error,
        );
      }
    };
    cargarCompetencias();
  }, [formData.idCedula]);

  // Navegación con estado (cédula preexistente) --------------------------------
  // Obtención de cedula.folio desde query
  const location = useLocation();
  const cedulaFromNav = location.state?.cedula || null;

  // Mapea los valores de psicometría al formData cuando llegan competencias
  useEffect(() => {
    if (!cedulaFromNav || competencias?.competencias?.length === 0) return;

    const valoresPsicometria = competencias!!.competencias.reduce<
      Record<string, string>
    >((acc, comp) => {
      const key = nombreCompetenciaMap[comp.nombreCompetencia];
      if (key) {
        acc[key] = cedulaFromNav[key] ?? "";
      }
      return acc;
    }, {});

    setFormData((prev) => ({ ...prev, ...valoresPsicometria }));
  }, [cedulaFromNav, competencias]);

  // Carga inicial desde la navegación
  useEffect(() => {
    if (!cedulaFromNav || !dependencias) return;
    const dep =
      dependencias.dependencias.find(
        (d) => d.idDependencia === cedulaFromNav.idDependencia,
      ) ?? null;

    setFormData((prev) => ({
      ...prev,
      revisa: "",
      elabora: "",
      avaladoPor: cedulaFromNav.avaladoPor ?? "",
      adscripcion: dep
        ? {
            idDependencia: dep.idDependencia,
            nombre: dep.nombre,
            zona: dep.zona,
          }
        : null,
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
      FKIdProceso: cedulaFromNav.idProceso ?? 0,
      hermesNotificacion: cedulaFromNav.hermesNotificacion ?? "",
      idCedula: cedulaFromNav.FKIdClasificacionCedula
        ? Number(cedulaFromNav.FKIdClasificacionCedula)
        : 0,
      nombreCandidato: cedulaFromNav.candidato ?? "",
      numPlaza: cedulaFromNav.numeroPlaza ?? "",
      puesto: "",
      referidoPor: "",
      resultados: "",
      resultadoHabilidadesExcel: "",
      resultadoHabilidadesWord: "",
      resultadoOrtografia: "",
    }));
  }, [cedulaFromNav, dependencias, loadingDependencias]);

  // Actualizar campos ----------------------------------------------------------
  const handleInputChange = <K extends keyof IPostCedulaInternaForm>(
    field: K,
    value: IPostCedulaInternaForm[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Búsqueda cédula por FKIdProceso --------------------------------------------
  const [procesoCargado, setProcesoCargado] =
    useState<IGetProcesoContratacion | null>(null);

  const buscarIdProceso = async () => {
    try {
      const responseProcesoContratacion: IResponseHTTP<IGetProcesoContratacion> =
        await new ProcesoContratacionService().getProcesoContratacionById(
          Number(formData.FKIdProceso),
        );

      if (!responseProcesoContratacion.mensaje) return;

      const proceso = responseProcesoContratacion.mensaje;

      const currentDependencia: IResponseHTTP<IDependenciaBase> =
        await new CatalogoService().getDependenciaById(
          proceso.procesoContratación.FKIdDependencia,
        );
      const dep = currentDependencia.mensaje ?? null;

      setProcesoCargado(proceso);

      setFormData((prev) => ({
        ...prev,
        hermesNotificacion:
          proceso.procesoContratación.hermesNotificacion ?? "",
        educacionFormal: proceso.procesoContratación.educacionFormal ?? "",
        avaladoPor: proceso.procesoContratación.avaladoPor ?? "",
        FKIdProceso: proceso.procesoContratación.idProceso ?? prev.FKIdProceso,
        numPlaza: proceso.procesoContratación.numPlaza ?? "",
        nombreCandidato: proceso.procesoContratación.nombreCandidato ?? "",
        resultadoHabilidadesWord:
          Number(proceso.procesoContratación.resultadoHabilidadesWord) ?? 0,
        resultadoHabilidadesExcel:
          Number(proceso.procesoContratación.resultadoHabilidadesExcel) ?? 0,
        resultadoOrtografia:
          proceso.procesoContratación.resultadoOrtografia ?? "",
        evaluacionConocimientos:
          proceso.procesoContratación.resultadoEvaluacionConocimiento ?? "",
        adscripcion: dep
          ? {
              idDependencia: dep.idDependencia,
              nombre: dep.nombre,
              zona: dep.zona,
            }
          : null,
      }));
    } catch (error) {
      console.error(
        "CrearCedulaInterna.tsx - Error cargando datos iniciales:\n",
        error,
      );
      mostrarToast(
        " ❌ Error al buscar el proceso. Intente de nuevo.",
        "error",
      );
    }
  };

  // Selecciona automáticamente el tipo de cédula cuando carga el proceso -------
  useEffect(() => {
    if (!procesoCargado || loadingCedulaTipos) return;

    const normalizar = (t?: string) =>
      t
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") ?? "";

    const cedulaMatch = dataCedulaTipos?.tiposCedula.find((opt) =>
      normalizar(opt.cedula).includes(
        normalizar(procesoCargado.procesoContratación.funcionDesempeniar),
      ),
    );

    if (cedulaMatch) {
      setFormData((prev) => ({
        ...prev,
        idCedula: cedulaMatch.idTipoCedula,
      }));
    }
  }, [procesoCargado, loadingCedulaTipos, dataCedulaTipos]);

  // Manejo de sumbit de formulario ---------------------------------------------
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.hermesNotificacion.trim()) {
      mostrarToast("⚠️ Por favor ingresa un hermes", "advertencia");
      return;
    }

    if (!formData.idCedula || formData.idCedula === 0) {
      mostrarToast(
        "⚠️ Debes seleccionar un tipo de cédula antes de guardar",
        "advertencia",
      );
      return;
    }

    try {
      const responseCedula: IResponseHTTP<string | number> =
        await new CedulaService().postCedulaInterna({
          revisa: formData.revisa,
          elabora: formData.elabora,
          avaladoPor: formData.avaladoPor,
          adscripcion: formData.adscripcion,
          analista: formData.analista,
          antecedentesFamiliaresUV: formData.antecedentesFamiliaresUV,
          conclusiones: formData.conclusiones,
          edad: formData.edad,
          educacionFormal: formData.educacionFormal,
          evaluacionConocimientos: formData.evaluacionConocimientos,
          expectativaLaboral: formData.expectativaLaboral,
          experiencia: formData.experiencia,
          experienciaRelacionada: formData.experienciaRelacionada,
          fechaElaboracionPropuesta: formData.fechaElaboracionPropuesta,
          FKIdProceso: Number(formData.FKIdProceso),
          hermesNotificacion: formData.hermesNotificacion,
          idCedula: formData.idCedula,
          nombreCandidato: formData.nombreCandidato,
          numPlaza: formData.numPlaza,
          puesto: formData.puesto,
          referidoPor: formData.referidoPor,
          resultados: formData.resultados,
          resultadoHabilidadesExcel: formData.resultadoHabilidadesExcel,
          resultadoHabilidadesWord: formData.resultadoHabilidadesWord,
          resultadoOrtografia: formData.resultadoOrtografia,
        });

      if (responseCedula.error) {
        throw new Error(
          typeof responseCedula.mensaje === "string"
            ? responseCedula.mensaje
            : "Error al registrar la cédula",
        );
      }

      const idCedula = Number(responseCedula.mensaje);
      if (!idCedula)
        throw new Error("No se recibió el ID de la cédula registrada");

      await new CedulaService().postResultadoCedulaInterna(formData);

      const solicitudData = {
        FKIdDependencia: formData.adscripcion?.idDependencia ?? null,
        numeroPlaza: formData.numPlaza,
        nombreCandidato: formData.nombreCandidato,
        resultadoHabilidadesWord: formData.resultadoHabilidadesWord,
        resultadoHabilidadesExcel: formData.resultadoHabilidadesExcel,
        resultadoOrtografia: formData.resultadoOrtografia,
        evaluacionConocimientos: formData.evaluacionConocimientos,
        avaladoPor: formData.avaladoPor,
        educacionFormal: formData.educacionFormal,
      };

      const respProceso =
        await new ProcesoContratacionService().putProcesoContratacion(
          Number(formData.FKIdProceso),
          solicitudData,
        );

      if (respProceso && !respProceso.error) {
        mostrarToast(
          "✅ Cédula, resultados y base de datos actualizados correctamente",
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
      mostrarToast("❗ Error registrando. Intente más tarde.", "error");
    }
  };

  // Manejo del PDF -------------------------------------------------------------
  const handleGenerarPDF = async () => {
    try {
      const existingPdfBytes = await fetch("/CedulaInternaEditable.pdf").then(
        (res) => res.arrayBuffer(),
      );
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const form = pdfDoc.getForm();

      form.getTextField("nombre").setText(formData.nombreCandidato ?? "");
      form
        .getTextField("edad")
        .setText(formData.edad ? `${formData.edad} años` : "");
      form.getTextField("hermes").setText(formData.hermesNotificacion ?? "");
      form.getTextField("numeroPlaza").setText(formData.numPlaza ?? "");
      form
        .getTextField("fechaElaboracion")
        .setText(formData.fechaElaboracionPropuesta ?? "");
      form
        .getTextField("educacionFormal")
        .setText(formData.educacionFormal ?? "");
      form.getTextField("puesto").setText(formData.puesto ?? "");
      form
        .getTextField("adscripcion")
        .setText(formData.adscripcion?.nombreCandidato ?? "");
      form.getTextField("referido").setText(formData.referidoPor ?? "");
      form
        .getTextField("antecedentesFamiliares")
        .setText(formData.antecedentesFamiliaresUV ?? "");
      form
        .getTextField("resultadoWord")
        .setText(formData.resultadoHabilidadesWord ?? "");
      form
        .getTextField("resultadoExcel")
        .setText(formData.resultadoHabilidadesExcel ?? "");
      form
        .getTextField("resultadoOrtografia")
        .setText(formData.resultadoOrtografia ?? "");
      form
        .getTextField("evaluacionConocimientos")
        .setText(formData.evaluacionConocimientos ?? "");
      form
        .getTextField("expectativaLaboral")
        .setText(formData.expectativaLaboral ?? "");
      form
        .getTextField("experienciaRelacionada")
        .setText(formData.experienciaRelacionada ?? "");
      form.getTextField("experiencia").setText(formData.experiencia ?? "");
      form.getTextField("conclusiones").setText(formData.conclusiones ?? "");
      form.getTextField("resultado").setText(formData.resultados ?? "");

      // NOTE: "usuario" debe venir de un contexto/hook de autenticación
      // form.getTextField("analista").setText(`Lic. ${usuario.nombre} ...`);
      form.getTextField("jefeOficina").setText("Mtro. Alvaro Vallejo Carmona");

      let sumaPerfil = 0;
      let sumaPsicometria = 0;

      competencias?.competencias.slice(0, 11).forEach((item, index) => {
        const i = index + 1;
        const nombreCompetencia = item.nombreCompetencia ?? "";
        const perfil = Number(item.perfil) || 0;
        const keyPsicometria = nombreCompetenciaMap[
          item.nombreCompetencia
        ] as keyof IPostCedulaInternaForm;
        const valorPsicometria = Number(formData[keyPsicometria]) || 0;

        sumaPerfil += perfil;
        sumaPsicometria += valorPsicometria;

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

      const resultadoCuantitativoPorcentaje =
        sumaPerfil > 0
          ? ((sumaPsicometria / sumaPerfil) * 100).toFixed(0)
          : "0";

      form
        .getTextField("resultadoCuantitativo")
        .setText(`${resultadoCuantitativoPorcentaje}%`);

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      form.getFields().forEach((field) => {
        field.updateAppearances(font);
        try {
          field.acroField.setBorderWidth(0);
          field.acroField.setBorderColor(undefined);
        } catch {}
      });

      form.flatten();
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const fileName = `CedulaInterna_${formData.hermesNotificacion || "SinHermes"}.pdf`;
      saveAs(blob, fileName);
      // FIX: el toast de éxito usaba tipo "error"
      mostrarToast("✅ PDF generado correctamente.", "exito");
    } catch (error) {
      console.error("CrearCedulaInterna.tsx - Error generando PDF:\n", error);
      mostrarToast("Ocurrió un error al generar el PDF.", "error");
    }
  };

  return (
    <>
      <Toast texto={toast.texto} tipo={toast.tipo} />

      <main className="main-content">
        <div className="help-icon" onClick={() => setShowToastHelp(true)}>
          <FiHelpCircle />
        </div>

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
                  presionas "Guardar", los cambios se reflejarán también en la
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
            {/* ID de candidato */}
            <div className="form-group">
              <label htmlFor={`${fieldID}-FKIdProceso`} className="form-label">
                ID de candidato
              </label>
              <div className="input-with-button">
                <input
                  id={`${fieldID}-FKIdProceso`}
                  type="number"
                  className="form-input"
                  value={formData.FKIdProceso}
                  onChange={(e) =>
                    handleInputChange("FKIdProceso", Number(e.target.value))
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
              <label
                htmlFor={`${fieldID}-hermesNotificacion`}
                className="form-label-evaluacion"
              >
                Hermes
              </label>
              <input
                id={`${fieldID}-hermesNotificacion`}
                type="text"
                className="form-input"
                value={formData.hermesNotificacion}
                onChange={(e) =>
                  handleInputChange("hermesNotificacion", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label
                htmlFor={`${fieldID}-numPlaza`}
                className="form-label-evaluacion"
              >
                Número de Plaza
              </label>
              <input
                id={`${fieldID}-numPlaza`}
                type="text"
                className="form-input"
                value={formData.numPlaza}
                onChange={(e) => handleInputChange("numPlaza", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label
                htmlFor={`${fieldID}-fechaElaboracionPropuesta`}
                className="form-label-evaluacion"
              >
                Fecha de Elaboración
              </label>
              <input
                id={`${fieldID}-fechaElaboracionPropuesta`}
                type="date"
                className="form-input"
                value={formData.fechaElaboracionPropuesta}
                onChange={(e) =>
                  handleInputChange("fechaElaboracionPropuesta", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label
                htmlFor={`${fieldID}-nombreCandidato`}
                className="form-label-evaluacion"
              >
                Nombre
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
                htmlFor={`${fieldID}-edad`}
                className="form-label-evaluacion"
              >
                Edad
              </label>
              <input
                id={`${fieldID}-edad`}
                type="text"
                className="form-input"
                value={formData.edad}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 3);
                  handleInputChange("edad", value);
                }}
              />
            </div>

            <div className="form-group">
              <label
                htmlFor={`${fieldID}-educacionFormal`}
                className="form-label-evaluacion"
              >
                Educación Formal
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

            <div className="form-group">
              <label
                htmlFor={`${fieldID}-avaladoPor`}
                className="form-label-evaluacion"
              >
                Avalado por
              </label>
              <input
                id={`${fieldID}-avaladoPor`}
                type="text"
                className="form-input"
                value={formData.avaladoPor}
                onChange={(e) =>
                  handleInputChange("avaladoPor", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label
                htmlFor={`${fieldID}-puesto`}
                className="form-label-evaluacion"
              >
                Puesto
              </label>
              <input
                id={`${fieldID}-puesto`}
                type="text"
                className="form-input"
                value={formData.puesto}
                onChange={(e) => handleInputChange("puesto", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label
                htmlFor={`${fieldID}-adscripcion`}
                className="form-label-evaluacion"
              >
                Adscripción
              </label>
              <Select<IDependenciaFormCedula>
                id={`${fieldID}-adscripcion`}
                options={
                  dependencias?.dependencias.map((dep) => ({
                    idDependencia: dep.idDependencia,
                    nombre: dep.nombre,
                    zona: dep.zona,
                  })) ?? []
                }
                // FIX: props de react-select correctas para objetos custom
                getOptionLabel={(o) => o.nombre}
                getOptionValue={(o) => String(o.idDependencia)}
                value={formData.adscripcion}
                onChange={(selected) => {
                  handleInputChange(
                    "adscripcion",
                    selected
                      ? {
                          idDependencia: selected.idDependencia,
                          nombre: selected.nombre,
                          zona: selected.zona,
                        }
                      : null,
                  );
                }}
                placeholder="Escribe o selecciona una adscripción"
                isClearable
                isSearchable
              />
            </div>

            <div className="form-group">
              <label
                htmlFor={`${fieldID}-referidoPor`}
                className="form-label-evaluacion"
              >
                Referido Por
              </label>
              <input
                id={`${fieldID}-referidoPor`}
                type="text"
                className="form-input"
                value={formData.referidoPor}
                onChange={(e) =>
                  handleInputChange("referidoPor", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label
                htmlFor={`${fieldID}-antecedentesFamiliaresUV`}
                className="form-label-evaluacion"
              >
                Antecedentes Familia UV
              </label>
              <input
                id={`${fieldID}-antecedentesFamiliaresUV`}
                type="text"
                className="form-input"
                value={formData.antecedentesFamiliaresUV}
                onChange={(e) =>
                  handleInputChange("antecedentesFamiliaresUV", e.target.value)
                }
              />
            </div>

            {/* Selección de cédula */}
            <h3 className="section-title">Confirmación de Competencias</h3>
            <div className="form-group col-span-3">
              <label
                htmlFor={`${fieldID}-idCedula`}
                className="form-label-evaluacion"
              >
                Seleccionar Cédula
              </label>
              <Select<ITipoCedulaBase>
                id={`${fieldID}-idCedula`}
                className="select-cedula"
                options={dataCedulaTipos?.tiposCedula ?? []}
                getOptionLabel={(o) => o.cedula}
                getOptionValue={(o) => String(o.idTipoCedula)}
                value={
                  dataCedulaTipos?.tiposCedula.find(
                    (option) => option.idTipoCedula === formData.idCedula,
                  ) ?? null
                }
                onChange={(option) =>
                  handleInputChange(
                    "idCedula",
                    option ? option.idTipoCedula : 0,
                  )
                }
                placeholder="Selecciona o escribe..."
                isClearable
                isSearchable
              />
            </div>

            {/* Tabla de competencias */}
            <div className="tabla-competencias grid-cols-3">
              <table>
                <thead>
                  <tr>
                    <th>Competencia</th>
                    <th>Perfil</th>
                    <th>Psicometría</th>
                  </tr>
                </thead>
                <tbody>
                  {competencias?.competencias &&
                  competencias.competencias.length > 0 ? (
                    competencias.competencias.map((item, i) => {
                      const key = nombreCompetenciaMap[
                        item.nombreCompetencia
                      ] as keyof IPostCedulaInternaForm;
                      return (
                        <tr key={i}>
                          <td>{item.nombreCompetencia}</td>
                          <td>{item.idCompetencia}</td>
                          <td>
                            <input
                              type="number"
                              className="form-input"
                              value={(formData[key] as string) ?? ""}
                              onChange={(e) =>
                                handleInputChange(
                                  key,
                                  e.target
                                    .value as IPostCedulaInternaForm[typeof key],
                                )
                              }
                              placeholder="Ingresa valor"
                            />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center">
                        Selecciona una cédula para ver sus competencias
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Conocimientos específicos */}
            {(
              [
                { label: "Word", key: "resultadoHabilidadesWord" },
                { label: "Excel", key: "resultadoHabilidadesExcel" },
                { label: "Ortografía y Redacción", key: "resultadoOrtografia" },
                {
                  label: "Evaluación de Conocimientos",
                  key: "evaluacionConocimientos",
                },
              ] as { label: string; key: keyof IPostCedulaInternaForm }[]
            ).map(({ label, key }) => (
              <div key={key} className="form-group">
                <label
                  htmlFor={`${fieldID}-conocimientosEspecificos`}
                  className="form-label-evaluacion"
                >
                  {label}
                </label>
                <input
                  id={`${fieldID}-conocimientosEspecificos`}
                  type="text"
                  className="form-input"
                  value={(formData[key] as string) ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      key,
                      e.target.value as IPostCedulaInternaForm[typeof key],
                    )
                  }
                />
              </div>
            ))}

            {/* Conclusiones */}
            <h3 className="section-title">Conclusiones</h3>
            {(
              [
                {
                  label: "Expectativas laborales y económicas",
                  key: "expectativaLaboral",
                },
                {
                  label: "Experiencia relacionada al puesto",
                  key: "experienciaRelacionada",
                },
                {
                  label: "Experiencia (Periodo, Funciones, Organización)",
                  key: "experiencia",
                },
                { label: "Conclusiones", key: "conclusiones" },
                { label: "Resultados", key: "resultados" },
              ] as { label: string; key: keyof IPostCedulaInternaForm }[]
            ).map(({ label, key }) => (
              <div key={key} className="form-group col-span-3">
                <label
                  htmlFor={`${fieldID}-conclusiones`}
                  className="form-label-evaluacion"
                >
                  {label}
                </label>
                <textarea
                  id={`${fieldID}-conclusiones`}
                  className="large-textarea"
                  value={(formData[key] as string) ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      key,
                      e.target.value as IPostCedulaInternaForm[typeof key],
                    )
                  }
                />
              </div>
            ))}

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
