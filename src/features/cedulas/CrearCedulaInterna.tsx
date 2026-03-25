import { useEffect, useState, useId } from "react";
import { useLocation } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { FiHelpCircle } from "react-icons/fi";
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

import "./CrearCedulaInterna.css";
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

      const currentDependencia: IResponseHTTP<IDependenciaBase> =
        await new CatalogoService().getDependenciaById(
          proceso.procesoContratación.FKIdDependencia,
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
        avaladoPor: proceso.procesoContratación.avaladoPor || "",
        educacionFormal: proceso.procesoContratación.educacionFormal || "",
        evaluacionConocimientos:
          proceso.procesoContratación.resultadoEvaluacionConocimiento || "",
        FKIdProceso: proceso.procesoContratación.idProceso || prev.FKIdProceso,
        hermesNotificacion:
          proceso.procesoContratación.hermesNotificacion || "",
        nombreCandidato: proceso.procesoContratación.nombreCandidato || "",
        numPlaza: proceso.procesoContratación.numPlaza || "",
        resultadoHabilidadesExcel:
          String(proceso.procesoContratación.resultadoHabilidadesExcel) || "",
        resultadoHabilidadesWord:
          String(proceso.procesoContratación.resultadoHabilidadesWord) || "",
        resultadoOrtografia:
          String(proceso.procesoContratación.resultadoOrtografia) || "",
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

      <main className="flex-1 overflow-auto">
        <div
          role="button"
          tabIndex={0}
          className="help-icon"
          onClick={() => setShowToastHelp(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setShowToastHelp(true);
          }}
        >
          <FiHelpCircle />
        </div>

        {showToastHelp && (
          <div
            role="presentation"
            className="modal-overlay"
            onClick={() => setShowToastHelp(false)}
            onKeyDown={() => setShowToastHelp(false)}
          >
            <div
              role="presentation"
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
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

        <MainHeader title="Cédulas" subtitle="Crear cédula interna" />

        <div className="flex-1 justify-center p-5 overflow-auto">
          <form
            className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))]"
            onSubmit={handleSubmit}
          >
            {/* ID de candidato */}
            <div className="form-group">
              {/* TODO-Desarrollo: verificar de donde sacar el ID del Candidato */}
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
                Nombre de candidato
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
                Edad del candidato
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
                Puesto solicitable
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
                  dataDependencias?.dependencias.map((dep) => ({
                    idDependencia: dep.idDependencia,
                    nombre: dep.nombre,
                    zona: dep.zona,
                  })) ?? []
                }
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
            <h3 className="col-[span_3] text-[20px] font-semibold mt-5 mb-2.5 text-[#18529d] justify-self-start">
              Confirmación de Competencias
            </h3>
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
                      const key = getNombreCompetenciaKey(
                        item.nombreCompetencia,
                      );
                      return (
                        // TODO-Desarrollo: Verificar columnas y sus datos.
                        <tr key={item.idCompetencia}>
                          <td>{item.nombreCompetencia}</td>
                          <td>{item.idCompetencia}</td>
                          <td>
                            {inputKeys.map((key) => (
                              <input
                                type="text"
                                className="form-input"
                                value={formData[key] ?? ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    key,
                                    (typeof formData[key] === "number"
                                      ? Number(e.target.value)
                                      : e.target
                                          .value) as IPostCedulaInternaForm[typeof key],
                                  )
                                }
                              />
                            ))}
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
                  htmlFor={`${fieldID}-${key}`}
                  className="form-label-evaluacion"
                >
                  {label}
                </label>
                <input
                  id={`${fieldID}-${key}`}
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
                  htmlFor={`${fieldID}-${key}`}
                  className="form-label-evaluacion"
                >
                  {label}
                </label>
                <textarea
                  id={`${fieldID}-${key}`}
                  className="w-full h-[30px] px-[6px] py-[4px] text-[12px] border-[1px] border-solid border-[#b0b0b0] rounded-[4px] bg-[#fff] text-[#000] [transition:all_0.2s_ease-in-out] box-border w-full resize-y"
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

            <div className="pb-20">
              <button
                type="submit"
                className="w-40 h-8 bg-[#199532] text-white border-none rounded-md text-[13px] font-semibold cursor-pointer [transition:background_0.2s_ease] min-w-40 hover:bg-[#147a28]"
              >
                Guardar
              </button>
              <button
                type="button"
                className="w-40 h-8 bg-[#721995] text-white border-none rounded-md text-[13px] font-semibold cursor-pointer [transition:background_0.2s_ease] min-w-40 hover:bg-[#571372]"
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
