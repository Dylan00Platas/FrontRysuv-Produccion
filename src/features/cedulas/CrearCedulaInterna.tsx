import { useEffect, useState, useId } from "react";
import { useLocation } from "react-router-dom";
import { FaSave } from "react-icons/fa";
import { saveAs } from "file-saver";
import {
  PDFDocument,
  StandardFonts,
  PDFTextField,
  PDFCheckBox,
  PDFDropdown,
  PDFRadioGroup,
} from "pdf-lib";
import Select from "react-select";

import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Alert/Floating/Toast";
import ProcesoContratacionService from "@/services/ProcesoContratacionService";
import CatalogoService from "@/services/CatalogosService";
import CedulaService from "@/services/CedulaService";
import IResponseHTTP from "@/interfaces/http/Response";
import { IGetCompetenciasClasificacionCedula } from "@/schemas/cedulas/GetCompetencia";
import { IDependenciaBase } from "@/schemas/catalogos/GetDependencia";
import { ITipoCedulaBase } from "@/schemas/catalogos/GetTipoCedula";
import { IGetProcesoContratacion } from "@/schemas/procesos-contratacion/GetProcesoContratacion";
import { useDependencias } from "@/hooks/useDependencias";
import { useDependenciaById } from "@/hooks/useDependenciaById";
import { useCedulaTipos } from "@/hooks/useCedulaTipos";
import { getNombreCompetenciaKey } from "@/utils/Constants";
import ManageFiles from "@/utils/ManageFiles";
import MainHeader from "@/components/header/MainHeader";
import { InputField } from "@/components/input/InputField";
import {
  ButtonShowModalHelp,
  ModalHelp,
} from "@/components/Alert/Floating/ModalHelp";
import FormSectionCard from "@/components/card/FormSectionCard";
import { CustomButton } from "@/components/button/CustomButton";
import { TextAreaField } from "@/components/input/TextareaField";

// Interfaces de UI ---------------------------------------------------------
interface IPostCedulaInternaForm {
  // Verificar en back que dato y de que
  revisa: string;
  elabora: string;
  avaladoPor: string;
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
  perfil: string;
  puesto: string;
  psicometriaAnalisisProblemas: string;
  psicometriaComunicacion: string;
  psicometriaControlActividades: string;
  psicometriaDinamismo: string;
  psicometriaEnfoqueCalidad: string;
  psicometriaEnfoqueResultados: string;
  psicometriaInnovacion: string;
  psicometriaLiderazgo: string;
  psicometriaNegociacion: string;
  psicometriaOrientacionAlServicio: string;
  psicometriaPensamientoEstrategico: string;
  psicometriaPlaneacionOrganizacion: string;
  psicometriaRelacionesInterpersonales: string;
  psicometriaSensibilidadALineamientos: string;
  psicometriaTomaDecisiones: string;
  psicometriaTrabajoEnEquipo: string;
  referidoPor: string;
  resultados: string;
  resultadoHabilidadesExcel: string;
  resultadoHabilidadesWord: string;
  resultadoOrtografia: string;
}
type InputCompatibleKeys = {
  [K in keyof IPostCedulaInternaForm]: IPostCedulaInternaForm[K] extends
    | string
    | number
    ? K
    : never;
}[keyof IPostCedulaInternaForm];

const inputKeys: InputCompatibleKeys[] = [
  "psicometriaAnalisisProblemas",
  "psicometriaComunicacion",
  "psicometriaControlActividades",
  "psicometriaDinamismo",
  "psicometriaEnfoqueCalidad",
  "psicometriaEnfoqueResultados",
  "psicometriaInnovacion",
  "psicometriaLiderazgo",
  "psicometriaNegociacion",
  "psicometriaOrientacionAlServicio",
  "psicometriaPensamientoEstrategico",
  "psicometriaPlaneacionOrganizacion",
  "psicometriaRelacionesInterpersonales",
  "psicometriaSensibilidadALineamientos",
  "psicometriaTomaDecisiones",
  "psicometriaTrabajoEnEquipo",
];

/**
 * interface IFormData {
 *    idCandidato: number;
 *    hermesNotificacion: string;
 *    numPlaza: string;
 *    fechaElaboracion: string;
 *    nombreCandidato: string;
 *    edad: string;
 *    educacionFormal: string;
 *    avaladoPor: string;
 *    puesto: string;
 *    adscripcion:
 *      idDependencia: number;
 *      nombre: string;
 *      zona: string;
 *    referidoPor: string
 *    antecedentesFamiliaresUV: string;
 *    confirmacionCedula:
 *      seleccionarCedula: number;
 *    competencias:
 *      competencia: string;
 *      perfil: string;
 *      psicometria: string;
 *    conocimientosEspecificas:
 *      resultadoHabilidadesWord: string;
 *      resultadoHabilidadesExcel: string;
 *      resultadoOrtografia: string;
 *      evaluacionConocimientos: string;
 *    conclusiones:
 *      expectativaLaboral: string;
 *      experienciaRelacionada: string;
 *      experiencia: string;
 *      conclusiones: string;
 *      resultados: string;
 * }
 */
interface IDependenciaFormCedula {
  idDependencia: number;
  nombre: string;
  zona: string;
}

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
      fechaElaboracionPropuesta: `${yyyy}-${mm}-${dd}`,
      FKIdProceso: 0,
      hermesNotificacion: "",
      idCedula: 0,
      nombreCandidato: "",
      numPlaza: "",
      perfil: "",
      puesto: "",
      psicometriaAnalisisProblemas: "",
      psicometriaComunicacion: "",
      psicometriaControlActividades: "",
      psicometriaDinamismo: "",
      psicometriaEnfoqueCalidad: "",
      psicometriaEnfoqueResultados: "",
      psicometriaInnovacion: "",
      psicometriaLiderazgo: "",
      psicometriaNegociacion: "",
      psicometriaOrientacionAlServicio: "",
      psicometriaPensamientoEstrategico: "",
      psicometriaPlaneacionOrganizacion: "",
      psicometriaRelacionesInterpersonales: "",
      psicometriaSensibilidadALineamientos: "",
      psicometriaTomaDecisiones: "",
      psicometriaTrabajoEnEquipo: "",
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
    if (!cedulaFromNav || !competencias?.competencias?.length) return;

    const valoresPsicometria = competencias!!.competencias.reduce<
      Record<string, string>
    >((acc, comp) => {
      const key = getNombreCompetenciaKey(comp.nombreCompetencia);
      if (key) {
        acc[key] = cedulaFromNav[key] ?? "";
      }
      return acc;
    }, {});

    setFormData((prev) => ({ ...prev, ...valoresPsicometria }));
  }, [cedulaFromNav, competencias]);

  // Carga inicial desde la navegación
  useEffect(() => {
    if (!cedulaFromNav || !dataDependencias) return;
    const dep =
      dataDependencias.dependencias.find(
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
      psicometriaAnalisisProblemas: "",
      psicometriaComunicacion: "",
      psicometriaControlActividades: "",
      psicometriaDinamismo: "",
      psicometriaEnfoqueCalidad: "",
      psicometriaEnfoqueResultados: "",
      psicometriaInnovacion: "",
      psicometriaLiderazgo: "",
      psicometriaNegociacion: "",
      psicometriaOrientacionAlServicio: "",
      psicometriaPensamientoEstrategico: "",
      psicometriaPlaneacionOrganizacion: "",
      psicometriaRelacionesInterpersonales: "",
      psicometriaSensibilidadALineamientos: "",
      psicometriaTomaDecisiones: "",
      psicometriaTrabajoEnEquipo: "",
      referidoPor: "",
      resultados: "",
      resultadoHabilidadesExcel: "",
      resultadoHabilidadesWord: "",
      resultadoOrtografia: "",
    }));
  }, [cedulaFromNav, dataDependencias, loadingDependencias]);

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
      console.log(proceso)
      const currentDependencia: IResponseHTTP<IDependenciaBase> =
        await new CatalogoService().getDependenciaById(
          proceso.procesoContratacion.FKIdDependencia,
        );
      const dep = currentDependencia.mensaje ?? null;

      setProcesoCargado(proceso);

      setFormData((prev) => ({
        ...prev,
        adscripcion: dep
          ? {
              idDependencia: dep.idDependencia,
              nombre: dep.nombre,
              zona: dep.zona,
            }
          : null,
        avaladoPor: proceso.procesoContratacion.avaladoPor || "",
        educacionFormal: proceso.procesoContratacion.educacionFormal || "",
        evaluacionConocimientos:
          proceso.procesoContratacion.resultadoEvaluacionConocimiento || "",
        FKIdProceso: proceso.procesoContratacion.idProceso || prev.FKIdProceso,
        hermesNotificacion:
          proceso.procesoContratacion.hermesNotificacion || "",
        nombreCandidato: proceso.procesoContratacion.nombreCandidato || "",
        numPlaza: proceso.procesoContratacion.numPlaza || "",
        resultadoHabilidadesExcel:
          String(proceso.procesoContratacion.resultadoHabilidadesExcel) || "",
        resultadoHabilidadesWord:
          String(proceso.procesoContratacion.resultadoHabilidadesWord) || "",
        resultadoOrtografia:
          String(proceso.procesoContratacion.resultadoOrtografia) || "",
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
        normalizar(procesoCargado.procesoContratacion.funcionDesempeniar),
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
          adscripcion: formData.adscripcion,
          analista: formData.analista,
          antecedentesFamiliaresUV: formData.antecedentesFamiliaresUV,
          aprobadoDireccion: false,
          aprobadoJefeOficina: false,
          archivoAdjunto: false,
          avaladoPor: formData.avaladoPor,
          competenciaDesarrollar: "",
          competenciaReforzar: "",
          competenciasSobresaliente: "",
          conclusiones: formData.conclusiones,
          descripcionDesarrollar: "",
          descripcionReforzar: "",
          edad: formData.edad,
          educacionFormal: formData.educacionFormal,
          efectoContratacion: "",
          elabora: formData.elabora,
          evaluacionConocimientos: formData.evaluacionConocimientos,
          expectativaLaboral: formData.expectativaLaboral,
          experiencia: formData.experiencia,
          experienciaRelacionada: formData.experienciaRelacionada,
          fechaCedulaInterna: "",
          fechaCedulaResultados: "",
          fechaElaboracionPropuesta: formData.fechaElaboracionPropuesta,
          FKIdClasificacionCedula: 0,
          FKIdProceso: 0,
          FKIdResultado: 0,
          FKIdTipoCedula: 0,
          hermesNotificacion: formData.hermesNotificacion,
          idCedula: formData.idCedula,
          motivoCedulaInterna: "",
          motivoCedulaResultados: "",
          nombreCandidato: formData.nombreCandidato,
          numPlaza: formData.numPlaza,
          oficioAutorizacionDeOcupacion: "",
          plaza: "",
          puesto: formData.puesto,
          referidoPor: formData.referidoPor,
          resultadoHabilidadesExcel: formData.resultadoHabilidadesExcel,
          resultadoHabilidadesWord: formData.resultadoHabilidadesWord,
          resultadoOrtografia: formData.resultadoOrtografia,
          resultados: formData.resultados,
          revisa: formData.revisa,
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

      await new CedulaService().postResultadoCedulaInterna({
        FKIdCedula: formData.idCedula,
        psicometriaAnalisisProblemas: Number(
          formData.psicometriaAnalisisProblemas,
        ),
        psicometriaComunicacion: Number(formData.psicometriaComunicacion),
        psicometriaControlActividades: Number(
          formData.psicometriaControlActividades,
        ),
        psicometriaDinamismo: Number(formData.psicometriaDinamismo),
        psicometriaEnfoqueCalidad: Number(formData.psicometriaEnfoqueCalidad),
        psicometriaEnfoqueResultados: Number(
          formData.psicometriaEnfoqueResultados,
        ),
        psicometriaInnovacion: Number(formData.psicometriaInnovacion),
        psicometriaLiderazgo: Number(formData.psicometriaLiderazgo),
        psicometriaNegociacion: Number(formData.psicometriaNegociacion),
        psicometriaOrientacionAlServicio: Number(
          formData.psicometriaOrientacionAlServicio,
        ),
        psicometriaPensamientoEstrategico: Number(
          formData.psicometriaPensamientoEstrategico,
        ),
        psicometriaPlaneacionOrganizacion: Number(
          formData.psicometriaPlaneacionOrganizacion,
        ),
        psicometriaRelacionesInterpersonales: Number(
          formData.psicometriaRelacionesInterpersonales,
        ),
        psicometriaSensibilidadALineamientos: Number(
          formData.psicometriaSensibilidadALineamientos,
        ),
        psicometriaTomaDecisiones: Number(formData.psicometriaTomaDecisiones),
        psicometriaTrabajoEnEquipo: Number(formData.psicometriaTrabajoEnEquipo),
        resultadoPorcentaje: Number(formData.resultados),
      });

      const solicitudData = {
        FKIdDependencia: formData.adscripcion!.idDependencia,
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
        .setText(formData.adscripcion?.nombre ?? "");
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
        const perfil = item.idCompetencia || 0;
        const keyPsicometrias = getNombreCompetenciaKey(
          item.nombreCompetencia,
        ) as keyof IPostCedulaInternaForm;
        const valorPsicometria = Number(formData[keyPsicometrias]) || 0;

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
        // Cast al tipo concreto para acceder a updateAppearances
        if (field instanceof PDFTextField) {
          field.updateAppearances(font);
        } else if (field instanceof PDFCheckBox) {
          field.updateAppearances();
        } else if (field instanceof PDFDropdown) {
          field.updateAppearances(font);
        } else if (field instanceof PDFRadioGroup) {
          field.updateAppearances();
        }
      });

      form.flatten();
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([ManageFiles.toArrayBuffer(pdfBytes)], {
        type: "application/pdf",
      });
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
      <ButtonShowModalHelp onClick={() => setShowToastHelp(true)} />
      <ModalHelp
        isOpen={showToastHelp}
        onClose={() => setShowToastHelp(false)}
        title="Ayuda"
        warningText="⚠️ Si modificas información cargada automáticamente y presionas 'Guardar' el cambio será irreversible."
        showWarning={true}
      >
        <p className="text-sm text-slate-600 leading-relaxed">
          Aquí podrás llenar los datos generales, competencias y resultados de
          un <strong className="text-slate-800">candidato</strong>.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          Ingresa el{" "}
          <strong className="text-slate-800">
            Identificador del candidato
          </strong>{" "}
          y presiona el icono de la lupa 🔍 para cargar la información
          disponible en la base de datos.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          Al finalizar, puedes{" "}
          <strong className="text-slate-800">guardar</strong> la cédula o{" "}
          <strong className="text-slate-800">generar el PDF</strong> con todos
          los datos capturados.
        </p>
      </ModalHelp>

      <main className="ml-65 w-[calc(100%-260px)] px-[4%] py-[2%] overflow-y-auto min-h-screen bg-slate-50">
        <MainHeader
          title="Crear cédula interna"
          subtitle="Gestión de cédulas"
        />

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* ── Card: Datos generales ── */}
          <FormSectionCard title="Datos generales">
            {/* ID de proceso con buscador */}
            <InputField
              id={`${fieldID}-FKIdProceso`}
              label="ID de proceso:"
              type="number"
              placeholder="ID de proceso"
              name="FKIdProceso"
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
              showSearchButton={true}
              onSearch={buscarIdProceso}
              searchButtonTitle="Buscar proceso por ID"
            />
            {/* Campos simples */}
            {[
              {
                id: "hermesNotificacion",
                label: "Hermes:",
                type: "text",
                placeholder: "",
              },
              {
                id: "numPlaza",
                label: "Número de Plaza",
                type: "text",
                placeholder: "",
              },
              {
                id: "fechaElaboracionPropuesta",
                label: "Fecha de Elaboración",
                type: "date",
                placeholder: "",
              },
              {
                id: "nombreCandidato",
                label: "Nombre de candidato",
                type: "text",
                placeholder: "",
              },
              { id: "edad", label: "Edad", type: "number", placeholder: "" },
              {
                id: "educacionFormal",
                label: "Educación Formal",
                type: "text",
                placeholder: "",
              },
              {
                id: "avaladoPor",
                label: "Avalado por",
                type: "text",
                placeholder: "",
              },
              {
                id: "puesto",
                label: "Puesto solicitable",
                type: "text",
                placeholder: "",
              },
              {
                id: "referidoPor",
                label: "Referido Por",
                type: "text",
                placeholder: "",
              },
              {
                id: "antecedentesFamiliaresUV",
                label: "Antecedentes Familia UV",
                type: "text",
                placeholder: "",
              },
            ].map(({ id, label, type }) => (
              <div key={id} className="flex flex-col gap-1.5">
                <InputField
                  id={`${fieldID}-${id}-${label}`}
                  label={label}
                  labelClassName="text-xs font-semibold text-slate-500 uppercase tracking-wide"
                  type={type}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder:text-slate-300 transition-all duration-200 focus:outline-none focus:border-[#18529d] focus:ring-2 focus:ring-[#18529d]/10 hover:border-slate-300"
                  value={
                    (formData[id as keyof typeof formData] as string) ?? ""
                  }
                  onChange={(e) => {
                    const val =
                      id === "edad"
                        ? e.target.value.replace(/\D/g, "").slice(0, 3)
                        : e.target.value;
                    handleInputChange(id as keyof IPostCedulaInternaForm, val);
                  }}
                />
              </div>
            ))}

            {/* Adscripción */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={`${fieldID}-adscripcion`}
                className="text-xs font-semibold text-slate-500 uppercase tracking-wide"
              >
                Adscripción
              </label>
              <Select<IDependenciaFormCedula>
                id={`${fieldID}-adscripcion`}
                options={
                  dataDependencias?.dependencias.map((dep) => ({
                    idDependencia: dep.idDependencia,
                    nombre: dep.nombre,
                    zona: dep.zona,
                  })) ?? []
                }
                getOptionLabel={(o) => o.nombre}
                getOptionValue={(o) => String(o.idDependencia)}
                value={formData.adscripcion}
                onChange={(selected) =>
                  handleInputChange(
                    "adscripcion",
                    selected
                      ? {
                          idDependencia: selected.idDependencia,
                          nombre: selected.nombre,
                          zona: selected.zona,
                        }
                      : null,
                  )
                }
                placeholder="Escribe o selecciona..."
                isClearable
                isSearchable
              />
            </div>
          </FormSectionCard>

          {/* ── Card: Competencias ── */}
          <FormSectionCard title="Competencias">
            <div className="flex flex-col">
              {/* Selector de cédula */}
              <div className="flex flex-col gap-1.5 max-w-sm">
                <label
                  htmlFor={`${fieldID}-idCedula`}
                  className="text-xs font-semibold text-slate-500 uppercase tracking-wide"
                >
                  Seleccionar Cédula
                </label>
                <Select<ITipoCedulaBase>
                  id={`${fieldID}-idCedula`}
                  options={dataCedulaTipos?.tiposCedula ?? []}
                  getOptionLabel={(o) => o.cedula}
                  getOptionValue={(o) => String(o.idTipoCedula)}
                  value={
                    dataCedulaTipos?.tiposCedula.find(
                      (o) => o.idTipoCedula === formData.idCedula,
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

              {/* Tabla */}
              <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm table-fixed">
                  <thead>
                    <tr className="bg-linear-to-r from-[#18529d] to-[#1a6abf] text-white">
                      <th className="w-1/3 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider opacity-90">
                        Competencia
                      </th>
                      <th className="w-1/3 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider opacity-90">
                        Perfil
                      </th>
                      <th className="w-1/3 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider opacity-90">
                        Psicometría
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {competencias?.competencias &&
                    competencias.competencias.length > 0 ? (
                      competencias.competencias.map((item, i) => (
                        <tr
                          key={item.idCompetencia}
                          className={
                            i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                          }
                        >
                          <td className="px-4 py-3 text-slate-700 font-medium">
                            {item.idCompetencia}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {item.nombreCompetencia}
                          </td>
                          <td className="px-4 py-3">
                            <InputField
                              value={formData[inputKeys[i]] ?? ""}
                              onChange={(e) =>
                                handleInputChange(
                                  inputKeys[i],
                                  typeof formData[inputKeys[i]] === "number"
                                    ? Number(e.target.value)
                                    : e.target.value,
                                )
                              }
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="text-center py-10 text-slate-400 text-sm"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-2xl opacity-30">📋</span>
                            <span>
                              Selecciona una cédula para ver sus competencias
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </FormSectionCard>

          {/* ── Card: Conocimientos específicos ── */}
          <FormSectionCard title="Conocimientos específicos">
            {(
              [
                { label: "Word", key: "resultadoHabilidadesWord" },
                { label: "Excel", key: "resultadoHabilidadesExcel" },
                {
                  label: "Ortografía y Redacción",
                  key: "resultadoOrtografia",
                },
                {
                  label: "Evaluación de Conocimientos",
                  key: "evaluacionConocimientos",
                },
              ] as { label: string; key: keyof IPostCedulaInternaForm }[]
            ).map(({ label, key }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <InputField
                  id={`${fieldID}-${key}-${label}`}
                  label={label}
                  type="text"
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
          </FormSectionCard>

          {/* ── Card: Conclusiones ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <FormSectionCard title="Conclusiones">
              <div className="flex flex-col">
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
                  <TextAreaField
                    id={`${fieldID}-${key}`}
                    key={key}
                    label={label}
                    value={(formData[key] as string) ?? ""}
                    onChange={(e) =>
                      handleInputChange(
                        key,
                        e.target.value as IPostCedulaInternaForm[typeof key],
                      )
                    }
                  />
                ))}
              </div>
            </FormSectionCard>
          </div>

          {/* ── Botones de acción ── */}
          <div className="flex items-center justify-end gap-3 pb-10 max-[900px]:justify-center">
            <CustomButton variant="save" type="submit" icon={<FaSave />}>
              Guardar
            </CustomButton>
            <CustomButton variant="pdf" onClick={handleGenerarPDF}>
              Generar PDF
            </CustomButton>
          </div>
        </form>
      </main>
    </>
  );
}

export default CrearCedulaInterna;
