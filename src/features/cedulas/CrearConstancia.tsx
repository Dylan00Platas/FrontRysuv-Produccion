import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import { PDFDocument } from "pdf-lib";
import { FaSearch } from "react-icons/fa";
import { FiHelpCircle } from "react-icons/fi";
import Select from "react-select";
import * as echarts from "echarts";
import * as fontkit from "fontkit";

import "./CrearConstancia.css";
import CedulaService from "@/services/CedulaService";
import ManageFiles from "@/utils/ManageFiles";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Alert/Floating/Toast";
import { IDependenciaBase } from "@/schemas/catalogos/GetDependencia";
import { useDependencias } from "@/hooks/useDependencias";
import { useProcesoTipos } from "@/hooks/useProcesoTipos";
import IResponseHTTP from "@/interfaces/http/Response";
import { IGetCedulaExterna } from "@/schemas/cedulas-externas/GetCedulaExterna";
import { IGetCedula } from "@/schemas/cedulas/GetCedula";
import ProcesoContratacionService from "@/services/ProcesoContratacionService";
import { IGetCompetenciasClasificacionCedula } from "@/schemas/cedulas/GetCompetencia";
// NOTE: conecta con tu contexto de autenticación
// import { useAuth } from "@/hooks/useAuth";

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

interface IDependenciaOption {
  value: number;
  label: string;
  zona: string;
}

interface IFormData {
  idProceso: string | number;
  hermesNotificacion: string;
  adscripcion: IDependenciaOption | null;
  region: string;
  plaza: string;
  puesto: string;
  titular: string;
  oficio: string;
  temporalidad: "1" | "2" | "";
  nombre: string;
  edad: string;
  educacion: string;
  experiencia: string;
  sobresaliente: string;
  reforzar: string;
  desarrollar: string;
  habilidades: string;
  evaluacion: string;
  resultadoFinal: string;
  efectos: string;
  cualitativoReforzar: string;
  cualitativoDesarrollar: string;
  valida: string;
  revisa: string;
  aprueba: string;
  FKIdProceso: number | string;
  idDependencia: number | string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers puros (fuera del componente)
// ─────────────────────────────────────────────────────────────────────────────

const hoy = new Date();
const fechaFormateada = `${String(hoy.getDate()).padStart(2, "0")}/${String(
  hoy.getMonth() + 1,
).padStart(2, "0")}/${hoy.getFullYear()}`;

// FIX: había dos funciones mapFormData* con tipos implícitos `any`.
// Se tipan correctamente como funciones puras fuera del componente.
function mapFormDataToCedula(
  formData: IFormData,
  aprobadoJefeOficina: boolean,
  aprobadoDireccion: boolean,
) {
  return {
    hermesNotificacion: formData.hermesNotificacion,
    edad: formData.edad,
    educacionFormal: formData.educacion,
    experiencia: formData.experiencia,
    puesto: formData.puesto,
    plaza: formData.plaza,
    oficio: formData.oficio,
    evaluacionConocimientos: formData.evaluacion,
    competenciasSobresaliente: formData.sobresaliente,
    competenciaReforzar: formData.reforzar,
    competenciaDesarrollar: formData.desarrollar,
    descripcionReforzar: formData.cualitativoReforzar,
    descripcionDesarrollar: formData.cualitativoDesarrollar,
    resultadoProcesoEvaluacion: formData.resultadoFinal,
    efectoContratacion: formData.efectos,
    habilidades: formData.habilidades,
    FKIdProceso: formData.FKIdProceso || null,
    titularPlaza: formData.titular,
    aprobadoJefeOficina,
    aprobadoDireccion,
  };
}

function mapFormDataToSolicitud(formData: IFormData) {
  return {
    titularPlaza: formData.titular,
    experiencia: formData.experiencia,
    educacionFormal: formData.educacion,
    resultadoEvaluacion: formData.resultadoFinal,
    edad: formData.edad,
    idDependencia: formData.adscripcion?.value ?? null,
    tipo:
      formData.temporalidad === "1"
        ? 1
        : formData.temporalidad === "2"
          ? 2
          : null,
    puesto: formData.puesto,
    resultadoFinal: formData.resultadoFinal,
  };
}

function buildHabilidades(proc: {
  resultadoHabilidadesExcel?: string;
  resultadoHabilidadesWord?: string;
  resultadoOrtografia?: string;
}): string {
  return (
    `Puntuación de habilidades en Excel: ${proc.resultadoHabilidadesExcel ?? "N/A"} | ` +
    `Puntuación de habilidades en Word: ${proc.resultadoHabilidadesWord ?? "N/A"} | ` +
    `Puntuación de habilidades en Ortografía y redacción: ${proc.resultadoOrtografia ?? "N/A"}`
  );
}

const FORM_INICIAL: IFormData = {
  idProceso: "",
  hermesNotificacion: "",
  adscripcion: null,
  region: "",
  plaza: "",
  puesto: "",
  titular: "",
  oficio: "",
  temporalidad: "",
  nombre: "",
  edad: "",
  educacion: "",
  experiencia: "",
  sobresaliente: "",
  reforzar: "",
  desarrollar: "",
  habilidades: "",
  evaluacion: "",
  resultadoFinal: "",
  efectos:
    "En caso de la contratación, y en cumplimiento a los Lineamientos específicos para el ejercicio del gasto AAAA, la persona titular de la Dependencia deberá realizar el movimiento de alta con fecha DD de MM de AAAA, o, en caso de que sea festivo o inhábil, a partir del día siguiente, en el Subsistema de Recursos Humanos, tal como se establece en la Guía para la captura de movimientos de alta de personal en el SsRH.",
  cualitativoReforzar: "",
  cualitativoDesarrollar: "",
  valida: "",
  revisa: "",
  aprueba: "",
  FKIdProceso: "",
  idDependencia: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────

function CrearConstancia() {
  const navigate = useNavigate();
  const { toast, mostrarToast } = useToast();
  // NOTE: descomenta cuando tengas el contexto de autenticación:
  // const { usuario } = useAuth();
  const usuario = undefined as { FKidTipoAcceso?: number } | undefined; // placeholder

  const [showHelp, setShowHelp] = useState(false);
  const [formData, setFormData] = useState<IFormData>(FORM_INICIAL);
  const [aprobadoJefeOficina, setAprobadoJefeOficina] = useState(false);
  const [aprobadoDireccion, setAprobadoDireccion] = useState(false);
  const [porcentajeHabilidades, setPorcentajeHabilidades] = useState(0);
  const [tipoProceso, setTipoProceso] = useState<number>(0);

  // PDF / archivo
  const [filePDF, setFilePDF] = useState<File | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [archivoBase64, setArchivoBase64] = useState("");
  const [pdfVisible, setPdfVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gráficas
  const chartGaugeRef = useRef<HTMLDivElement>(null);
  const chartRadarRef = useRef<HTMLDivElement>(null);

  // ── Navegación ───────────────────────────────────────────────────────────────
  const location = useLocation();
  const cedulaFromNav = location.state?.cedula ?? null;
  const { mostrarPDF, archivoNombre, archivoUrl } = (location.state ?? {}) as {
    mostrarPDF?: boolean;
    archivoNombre?: string;
    archivoUrl?: string;
  };

  // ── Datos remotos ────────────────────────────────────────────────────────────
  // FIX: se eliminaron los useEffect + useState espejo de cada hook.
  // FIX: useProcesoTipos se instanciaba DOS veces — solo se necesita una.
  // FIX: useDependenciaById se llamaba dentro de useEffect y handleBuscarCedula,
  //      lo que viola las reglas de hooks. Se reemplaza por llamadas directas
  //      al servicio CatalogoService.getDependenciaById().
  const { data: dataDependencias } = useDependencias();
  const { data: dataProcesoTipos } = useProcesoTipos();

  // MEJORA: useMemo — no recrea el array en cada render
  const dependenciasOptions = useMemo<IDependenciaOption[]>(
    () =>
      dataDependencias?.dependencias.map((dep) => ({
        value: dep.idDependencia,
        label: dep.nombre,
        zona: dep.zona,
      })) ?? [],
    [dataDependencias],
  );

  // ── Carga inicial desde navegación ───────────────────────────────────────────
  useEffect(() => {
    if (!cedulaFromNav) return;

    setAprobadoJefeOficina(!!cedulaFromNav.aprobadoJefeOficina);
    setAprobadoDireccion(!!cedulaFromNav.aprobadoDireccion);

    if (
      cedulaFromNav.FKIdTipoCedula === 2 &&
      cedulaFromNav.FKIdTipoProceso === 2
    ) {
      setTipoProceso(2);
    }

    // Busca la dependencia directamente en el array ya disponible en lugar de
    // llamar al hook useDependenciaById() (violación de reglas de hooks)
    const dep =
      dataDependencias?.dependencias.find(
        (d) => d.idDependencia === cedulaFromNav.idDependencia,
      ) ?? null;

    setFormData((prev) => ({
      ...prev,
      idProceso: cedulaFromNav.idProceso ?? "",
      hermesNotificacion: cedulaFromNav.hermesNotificacion ?? "",
      titular: cedulaFromNav.titularPlaza ?? "",
      edad: cedulaFromNav.edad ?? "",
      oficio: cedulaFromNav.oficioAutorizacionDeOcupacion ?? "",
      educacion: cedulaFromNav.educacionFormal ?? "",
      experiencia: cedulaFromNav.experienciaRelacionada ?? "",
      evaluacion: cedulaFromNav.evaluacionConocimientos ?? "",
      idDependencia: cedulaFromNav.IdDependencia ?? "",
      sobresaliente: cedulaFromNav.competenciasSobresaliente ?? "",
      reforzar: cedulaFromNav.competenciaReforzar ?? "",
      desarrollar: cedulaFromNav.competenciaDesarrollar ?? "",
      efectos: cedulaFromNav.efectoContratacion ?? prev.efectos,
      cualitativoDesarrollar: cedulaFromNav.descripcionDesarrollar ?? "",
      cualitativoReforzar: cedulaFromNav.descripcionReforzar ?? "",
      habilidades: buildHabilidades(cedulaFromNav),
      FKIdProceso: cedulaFromNav.idProceso ?? "",
      temporalidad:
        cedulaFromNav.FKIdTemporalDefinitiva === 1
          ? "1"
          : cedulaFromNav.FKIdTemporalDefinitiva === 2
            ? "2"
            : "",
      puesto: cedulaFromNav.puesto ?? "",
      plaza: cedulaFromNav.plaza ?? "",
      nombre: cedulaFromNav.candidato ?? "",
      resultadoFinal: cedulaFromNav.resultadoProcesoEvaluacion ?? "",
      adscripcion: dep
        ? { value: dep.idDependencia, label: dep.nombre, zona: dep.zona }
        : null,
      region: dep?.zona ?? "",
    }));
  }, [cedulaFromNav, dataDependencias]);

  // ── Cédula externa (archivo PDF) ─────────────────────────────────────────────
  useEffect(() => {
    if (!cedulaFromNav?.idCedula) return;

    let cancelado = false;

    const fetchCedulaExterna = async () => {
      try {
        const response: IResponseHTTP<IGetCedulaExterna> =
          await new CedulaService().getCedulaExterna(cedulaFromNav.idCedula);

        if (cancelado) return;

        // FIX: la condición original era `response.error == false` para verificar
        // ÉXITO, lo que es incorrecto — debería ser `!response.error`.
        // Además mezclaba OR con una condición de longitud, lo cual evaluaba
        // siempre como verdadero si el error era false (cortocircuito OR).
        if (response.error || !response.mensaje?.documento?.archivo?.length) {
          mostrarToast(
            "⚠️ No se encontró archivo designado a esta cédula externa.",
            "error",
          );
          return;
        }

        setArchivoBase64(response.mensaje.documento.archivo);
        setNombreArchivo(response.mensaje.documento.nombre ?? "Documento.pdf");
        setPdfVisible(true);
      } catch (error) {
        console.error(
          "CrearConstancia.tsx - Error al buscar archivo de cédula externa:\n",
          error,
        );
        // FIX: el tipo del toast era "exito" en un catch — debería ser "error"
        mostrarToast("❌ Error al obtener la cédula externa.", "error");
      }
    };

    fetchCedulaExterna();
    return () => {
      cancelado = true;
    };
  }, [cedulaFromNav]);

  // ── Mostrar PDF desde navegación ──────────────────────────────────────────────
  // FIX: había DOS useEffect que respondían a {mostrarPDF, archivoBase64} haciendo
  // cosas distintas (uno descargaba automáticamente, otro actualizaba el estado).
  // Se unificaron en uno solo que solo actualiza el estado; la descarga automática
  // se eliminó porque confunde al usuario sin interacción explícita.
  useEffect(() => {
    if (mostrarPDF && archivoBase64) {
      setNombreArchivo(archivoNombre ?? "Documento.pdf");
      setPdfVisible(true);
    }
  }, [mostrarPDF, archivoBase64, archivoNombre]);

  // ── Drag & Drop ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer?.files?.[0];
      if (!file) return;

      if (file.type !== "application/pdf") {
        mostrarToast("Por favor suelta un archivo PDF válido", "advertencia");
        return;
      }

      setFilePDF(file);
      setNombreArchivo(file.name);

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setArchivoBase64(result.split(",")[1]);
      };
      reader.readAsDataURL(file);

      if (fileInputRef.current) {
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInputRef.current.files = dt.files;
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  // ── Gráfica gauge ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!chartGaugeRef.current) return;

    const chart = echarts.init(chartGaugeRef.current);
    chart.setOption({
      series: [
        {
          type: "gauge",
          startAngle: 180,
          endAngle: 0,
          center: ["50%", "75%"],
          radius: "90%",
          min: 0,
          max: 1,
          splitNumber: 10,
          axisLine: {
            lineStyle: {
              width: 10,
              color: [
                [
                  1,
                  new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: "#FF0000" },
                    { offset: 0.25, color: "#FF7F00" },
                    { offset: 0.5, color: "#FFD700" },
                    { offset: 0.75, color: "#007BFF" },
                    { offset: 1, color: "#03a803ff" },
                  ]),
                ],
              ],
            },
          },
          pointer: {
            icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
            length: "6%",
            width: 10,
            offsetCenter: [0, "-60%"],
            itemStyle: { color: "black" },
          },
          axisTick: { length: 12, lineStyle: { color: "#464646", width: 1 } },
          splitLine: {
            length: 20,
            lineStyle: { color: "#000000ff", width: 3 },
          },
          axisLabel: {
            color: "#464646",
            fontSize: 11,
            distance: -45,
            rotate: "tangential",
            formatter: (value: number) => {
              const pct = Math.round(value * 100);
              return pct % 10 === 0 ? `${pct}%` : "";
            },
          },
          title: { offsetCenter: [0, "-10%"], fontSize: 20 },
          detail: {
            fontSize: 30,
            offsetCenter: [0, "-35%"],
            valueAnimation: true,
            formatter: (value: number) => `${Math.round(value * 100)}%`,
            color: "inherit",
          },
          data: [{ value: porcentajeHabilidades / 100, name: "Competencia" }],
        },
      ],
    });

    return () => chart.dispose();
  }, [porcentajeHabilidades]);

  // ── Gráfica radar (vacía inicial — se rellena en handleCrearGraficas) ─────────
  useEffect(() => {
    if (!chartRadarRef.current) return;

    const chart = echarts.init(chartRadarRef.current);
    chart.setOption({
      tooltip: {},
      radar: { indicator: [{ name: "", max: 100 }] },
      series: [
        {
          name: "Evaluación",
          type: "radar",
          data: [
            {
              value: [80, 90, 70, 85, 75, 88],
              name: "Candidato A",
              areaStyle: { opacity: 0.2 },
            },
          ],
        },
      ],
    });

    return () => chart.dispose();
  }, []);

  // ── Helper para actualizar campos ────────────────────────────────────────────
  const handleInputChange = useCallback(
    <K extends keyof IFormData>(field: K, value: IFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  // ── Búsqueda de cédula por ID ─────────────────────────────────────────────────
  const handleBuscarCedula = async () => {
    if (!formData.idProceso) {
      mostrarToast(
        "⚠️ Por favor ingresa el identificador y presiona la lupa.",
        "advertencia",
      );
      return;
    }

    try {
      const response: IResponseHTTP<IGetCedula> =
        await new CedulaService().getCedulaInternaIdProceso(formData.idProceso);

      if (!response?.mensaje) {
        mostrarToast(
          "No se encontró la cédula o los datos iniciales.",
          "advertencia",
        );
        return;
      }

      // FIX: el código original usaba variables no declaradas `cedula` y `proceso`
      // mezcladas — `cedula` era undefined (nunca declarada), y `proceso` apuntaba
      // al response completo, no al objeto interno. Se normaliza a `cedulaData`.
      const cedulaData = response.mensaje.cedula;

      // FIX: useDependenciaById() se llamaba aquí como hook dentro de una función
      // asíncrona — violación de reglas de hooks. Se reemplaza por búsqueda en array.
      const dep =
        dataDependencias?.dependencias.find(
          (d) => d.idDependencia === cedulaData.FKIdDependencia,
        ) ?? null;

      setFormData((prev) => ({
        ...prev,
        edad: cedulaData.edad ?? "",
        experiencia: cedulaData.experienciaRelacionada ?? "",
        puesto: cedulaData.puesto ?? "",
        cualitativoReforzar: cedulaData.descripcionReforzar ?? "",
        cualitativoDesarrollar: cedulaData.descripcionDesarrollar ?? "",
        sobresaliente: cedulaData.competenciaSobresaliente ?? "",
        reforzar: cedulaData.competenciaReforzar ?? "",
        desarrollar: cedulaData.competenciaDesarrollar ?? "",
        efectos: cedulaData.efectoContratacion ?? prev.efectos,
        resultadoFinal: cedulaData.resultadoProcesoEvaluacion ?? "",
        educacion: cedulaData.educacionFormal ?? "",
        FKIdProceso: cedulaData.idProceso ?? prev.FKIdProceso,
        hermesNotificacion: cedulaData.hermesNotificacion ?? "",
        nombre: cedulaData.nombreCandidato ?? "",
        titular: cedulaData.titularPlaza ?? "",
        habilidades: buildHabilidades(cedulaData),
        temporalidad:
          cedulaData.FKIdTemporalDefinitiva === 1
            ? "1"
            : cedulaData.FKIdTemporalDefinitiva === 2
              ? "2"
              : "",
        adscripcion: dep
          ? { value: dep.idDependencia, label: dep.nombre, zona: dep.zona }
          : null,
        region: dep?.zona ?? "",
      }));

      setTipoProceso(cedulaData.FKIdTipoProceso ?? 0);
    } catch (err) {
      console.error("CrearConstancia.tsx - Error al buscar cédula:\n", err);
      mostrarToast("❌ Ocurrió un error al buscar la cédula.", "error");
    }
  };

  // ── Crear gráficas ────────────────────────────────────────────────────────────
  const handleCrearGraficas = useCallback(async () => {
    if (!formData.FKIdProceso) {
      mostrarToast(
        "⚠️ Por favor busca el identificador con la lupa para poder crear las gráficas.",
        "advertencia",
      );
      return;
    }

    try {
      const response: IResponseHTTP<IGetCompetenciasClasificacionCedula> =
        await new CedulaService().getResultadosIdProceso(formData.FKIdProceso);

      // FIX: la condición era `!response.error` para verificar éxito pero estaba
      // negada — si error=false (éxito), !false=true, OK. Pero el segundo operando
      // `response.mensaje.competencias?.length <= 0` era redundante con el primero.
      // Se reescribe con intención explícita.
      if (
        !response ||
        response.error ||
        !response.mensaje?.competencias?.length
      ) {
        mostrarToast("No se recibieron datos de competencias.", "advertencia");
        return;
      }

      const resultado = response.mensaje.competencias[0];

      if (resultado.resultadoPorcentaje != null) {
        setPorcentajeHabilidades(resultado.resultadoPorcentaje);
      }

      const competencias = Object.entries(resultado)
        .filter(
          ([key, value]) => key.startsWith("psicometria") && value !== null,
        )
        .reduce<Record<string, unknown>>((acc, [key, value]) => {
          const nombre = key
            .replace("psicometria", "")
            .replace(/([A-Z])/g, " $1")
            .trim();
          acc[nombre] = value;
          return acc;
        }, {});

      if (Object.keys(competencias).length === 0) {
        mostrarToast(
          "No hay competencias válidas para graficar.",
          "advertencia",
        );
        return;
      }

      // Destruir instancia anterior antes de crear una nueva
      if (chartRadarRef.current) {
        echarts.getInstanceByDom(chartRadarRef.current)?.dispose();
      }

      const chartRadar = echarts.init(chartRadarRef.current!);
      const maxChars = 15;
      const wrapLabel = (name: string) =>
        name.length <= maxChars
          ? name
          : name.match(new RegExp(`.{1,${maxChars}}`, "g"))!.join("\n");

      chartRadar.setOption({
        tooltip: {},
        radar: {
          indicator: Object.keys(competencias).map((nombre) => ({
            name: nombre,
            max: 4,
          })),
          radius: "65%",
          axisName: {
            formatter: wrapLabel,
            lineHeight: 15,
          },
        },
        series: [
          {
            name: "Evaluación",
            type: "radar",
            data: [
              {
                value: Object.values(competencias),
                name: "Candidato",
                areaStyle: { opacity: 0.3 },
                lineStyle: { width: 2 },
                symbol: "circle",
                symbolSize: 6,
              },
            ],
          },
        ],
      });
    } catch (error) {
      console.error("CrearConstancia.tsx - Error al crear gráficas:\n", error);
      mostrarToast("❌ Ocurrió un error al crear las gráficas.", "error");
    }
  }, [formData.FKIdProceso]);

  // ── Generar PDF ───────────────────────────────────────────────────────────────
  const handleGenerarPDF = async () => {
    try {
      const existingPdfBytes = await fetch(
        "/CedulaResultadosEditable.pdf",
      ).then((res) => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      pdfDoc.registerFontkit(fontkit);
      const form = pdfDoc.getForm();

      // Genera gráficas antes de exportar
      await handleCrearGraficas();
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // FIX: formData.adscripcion?.label era el campo correcto porque la opción
      // tiene { value, label, zona }. En el código original se usaba
      // formData.adscripcion?.label correctamente aquí, pero en el Select de
      // adscripción se guardaba el objeto completo (correcto) mientras que en
      // handleBuscarCedula se asignaba `adscripcion: {}` (tipo incorrecto).
      // Ahora siempre se guarda como IDependenciaOption | null.
      const setField = (name: string, value: string) => {
        try {
          form.getTextField(name).setText(value ?? "");
        } catch {}
      };

      setField("hermes", formData.hermesNotificacion);
      setField("adscripcion", formData.adscripcion?.label ?? "");
      setField("region", formData.region);
      setField("plaza", formData.plaza);
      setField("puesto", formData.puesto);
      setField("titular", formData.titular);
      setField("oficio", formData.oficio);
      setField(
        "temporalidad",
        formData.temporalidad === "1" ? "Temporal" : "Definitiva",
      );
      setField("nombre", formData.nombre);
      setField("edad", formData.edad ? `${formData.edad} años` : "");
      setField("educacion", formData.educacion);
      setField("experiencia", formData.experiencia);
      setField("sobresaliente", formData.sobresaliente);
      setField("reforzar", formData.reforzar);
      setField("desarrollar", formData.desarrollar);
      setField("habilidades", formData.habilidades);
      setField("conocimientos", formData.evaluacion);
      setField("contratacion", formData.efectos);
      setField("fecha1", fechaFormateada);
      setField("fecha2", fechaFormateada);
      setField("resultado", formData.resultadoFinal);
      setField("cualitativoReforzar", formData.cualitativoReforzar);
      setField("cualitativoDesarrollar", formData.cualitativoDesarrollar);

      const fontBytes = await fetch("/gill.TTF").then((r) => r.arrayBuffer());
      const gillSansFont = await pdfDoc.embedFont(fontBytes);
      form.getFields().forEach((field) => {
        field.updateAppearances(gillSansFont);
        try {
          field.acroField.setBorderWidth(0);
          field.acroField.setBorderColor(undefined);
        } catch {}
      });
      form.flatten();

      const firstPage = pdfDoc.getPage(0);
      const pageWidth = firstPage.getWidth();

      // Embed gauge chart
      let gaugeImageEmbed = null;
      if (chartGaugeRef.current) {
        const gaugeChart = echarts.getInstanceByDom(chartGaugeRef.current);
        if (gaugeChart) {
          const dataUrl = gaugeChart.getDataURL({
            type: "png",
            pixelRatio: 10,
            backgroundColor: "transparent",
          });
          const bytes = await fetch(dataUrl).then((r) => r.arrayBuffer());
          gaugeImageEmbed = await pdfDoc.embedPng(bytes);
        }
      }

      // Embed radar chart
      let radarImageEmbed = null;
      if (chartRadarRef.current) {
        const radarChart = echarts.getInstanceByDom(chartRadarRef.current);
        if (radarChart) {
          const dataUrl = radarChart.getDataURL({
            type: "png",
            pixelRatio: 5,
            backgroundColor: "transparent",
          });
          const bytes = await fetch(dataUrl).then((r) => r.arrayBuffer());
          radarImageEmbed = await pdfDoc.embedPng(bytes);
        }
      }

      if (gaugeImageEmbed || radarImageEmbed) {
        const imageWidth = 230,
          imageHeight = 150,
          yPosition = 350,
          spacing = 40;
        if (gaugeImageEmbed) {
          firstPage.drawImage(gaugeImageEmbed, {
            x: pageWidth / 2 - imageWidth - spacing / 2,
            y: yPosition - 15,
            width: imageWidth,
            height: imageHeight + 15,
          });
        }
        if (radarImageEmbed) {
          firstPage.drawImage(radarImageEmbed, {
            x: pageWidth / 2 + spacing / 2,
            y: yPosition,
            width: imageWidth - 10,
            height: imageHeight - 10,
          });
        }
      }

      // Firma (solo para ciertos tipos de acceso)
      // TODO: obtener usuario desde contexto/cookie, no hardcodeado
      if (usuario?.FKidTipoAcceso === 1 || usuario?.FKidTipoAcceso === 4) {
        try {
          const firmaBytes = await fetch("/Firma_AVC.png").then((r) =>
            r.arrayBuffer(),
          );
          const firmaImage = await pdfDoc.embedPng(firmaBytes);
          const firmaDims = firmaImage.scale(0.15);
          firstPage.drawImage(firmaImage, {
            x: 95,
            y: 60,
            width: firmaDims.width,
            height: firmaDims.height,
          });
        } catch (err) {
          console.error("CrearConstancia.tsx - Error agregando firma:\n", err);
          mostrarToast("❌ Error al agregar la firma AVC.", "error");
        }
      }

      const pdfBytes = await pdfDoc.save();
      saveAs(
        new Blob([pdfBytes], { type: "application/pdf" }),
        `CedulaResultados_${formData.hermesNotificacion || "SinHermes"}.pdf`,
      );
    } catch (err) {
      console.error("CrearConstancia.tsx - Error generando PDF:\n", err);
      mostrarToast("❌ Error al generar el PDF.", "error");
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.FKIdProceso) {
      mostrarToast(
        "⚠️ Por favor primero busca el identificador con la lupa para poder guardar la cédula.",
        "advertencia",
      );
      return;
    }

    try {
      const cedulaData = mapFormDataToCedula(
        formData,
        aprobadoJefeOficina,
        aprobadoDireccion,
      );

      const response: IResponseHTTP<string> =
        await new CedulaService().postResultadoCedulaInterna(cedulaData);

      // FIX: la condición original era `response.error == false` (correcto en
      // lógica pero comparación débil). Se cambia a `!response.error`.
      if (!response.error) {
        const solicitudData = mapFormDataToSolicitud(formData);
        const respSolicitud: IResponseHTTP<string> =
          await new ProcesoContratacionService().putProcesoContratacion(
            Number(formData.FKIdProceso),
            solicitudData,
          );

        if (respSolicitud && !respSolicitud.error) {
          mostrarToast("✅ Cédula registrada correctamente", "exito");

          // Guardar archivo externo si existe
          // FIX: se eliminó la doble comprobación `!response.error && response.estado === 200`
          // que era redundante con el if exterior. También se eliminó el token que
          // se leía de localStorage pero nunca se usaba.
          if (archivoBase64 && nombreArchivo) {
            await new CedulaService().postResultadoCedulaExterna({
              FKIdCedula: Number(response.mensaje),
              nombre: nombreArchivo,
              archivo: archivoBase64,
            });
          }

          setTimeout(() => navigate(-1), 2000);
        } else {
          mostrarToast(
            "⚠️ La cédula se guardó, pero hubo un error al actualizar la base de datos.",
            "error",
          );
        }
      } else {
        mostrarToast("❌ Ocurrió un error al registrar la cédula.", "error");
      }
    } catch (err) {
      console.error("CrearConstancia.tsx - Error al registrar cédula:\n", err);
      mostrarToast("❌ Error al registrar la cédula.", "error");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      <Toast texto={toast.texto} tipo={toast.tipo} />

      <main className="main-content">
        <div className="help-icon" onClick={() => setShowHelp(true)}>
          <FiHelpCircle />
        </div>

        {showHelp && (
          <div className="modal-overlay" onClick={() => setShowHelp(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Ayuda</h2>
              <p>
                Esta es la ventana de generar cédula de resultados. En el campo
                id ingresa el identificador del candidato (lo puedes encontrar
                en Evaluación) y presiona el icono de lupa para completar la
                información que la base de datos tenga.
              </p>
              <p>
                Presiona el botón crear gráficas para generar las gráficas de
                competencias y habilidades.
              </p>
              <p>
                Al finalizar, puedes exportar la cédula en un PDF o guardar la
                cédula para terminarla más tarde.
              </p>
              <p>
                <strong>
                  Nota: si modificas la información de los campos que haya
                  obtenido la base de datos (como Nombre, Edad o titular) y
                  presionas "GUARDAR" la información se modificará también en la
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
          <h1 className="page-title2">Cédula de Resultados</h1>
        </div>

        <div className="contenido-constancia-inner">
          <form className="form-grid" onSubmit={handleSubmit}>
            <h3 className="section-title">
              Datos de la solicitud de contratación
            </h3>

            {(
              [
                {
                  label: "Identificador de candidato",
                  key: "idProceso",
                  withButton: true,
                },
                { label: "Hermes", key: "hermesNotificacion" },
                { label: "Plaza", key: "plaza" },
                { label: "Puesto", key: "puesto" },
                { label: "Titular de la plaza", key: "titular" },
                { label: "Oficio de autorización", key: "oficio" },
              ] as {
                label: string;
                key: keyof IFormData;
                withButton?: boolean;
              }[]
            ).map(({ label, key, withButton }) => (
              <div key={key} className="form-group">
                <label className="form-label-evaluacion">{label}</label>
                {withButton ? (
                  <div className="input-with-button">
                    <input
                      type="text"
                      className="form-input"
                      value={String(formData[key] ?? "")}
                      onChange={(e) =>
                        handleInputChange(
                          key,
                          e.target.value as IFormData[typeof key],
                        )
                      }
                    />
                    <button
                      type="button"
                      className="btn-lupa"
                      onClick={handleBuscarCedula}
                    >
                      <FaSearch />
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    className="form-input"
                    value={String(formData[key] ?? "")}
                    onChange={(e) =>
                      handleInputChange(
                        key,
                        e.target.value as IFormData[typeof key],
                      )
                    }
                  />
                )}
              </div>
            ))}

            <div className="form-group">
              <label className="form-label-evaluacion">Temporalidad</label>
              <select
                className="form-input"
                value={formData.temporalidad}
                onChange={(e) =>
                  handleInputChange(
                    "temporalidad",
                    e.target.value as IFormData["temporalidad"],
                  )
                }
              >
                <option value="" disabled hidden>
                  Seleccionar
                </option>
                <option value="1">Temporal</option>
                <option value="2">Definitiva</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label-evaluacion">Adscripción</label>
              {/* FIX: dependencias.map() se llamaba directamente sobre el estado
                  que podía ser null/undefined, causando un crash en runtime.
                  Ahora se usa dependenciasOptions (memoizado, nunca undefined). */}
              <Select<IDependenciaOption>
                options={dependenciasOptions}
                value={formData.adscripcion}
                onChange={(selected) => {
                  handleInputChange("adscripcion", selected ?? null);
                  handleInputChange("region", selected?.zona ?? "");
                }}
                placeholder="Escribe o selecciona una adscripción"
                isClearable
                isSearchable
              />
            </div>

            <div className="form-group">
              <label className="form-label-evaluacion">Región</label>
              <input
                type="text"
                className="form-input"
                value={formData.region}
                readOnly
              />
            </div>

            <h3 className="section-title">Datos del candidato</h3>

            {(
              [
                { label: "Nombre", key: "nombre" },
                { label: "Edad", key: "edad" },
                { label: "Educación Formal", key: "educacion" },
                {
                  label: "Experiencia relacionada al puesto",
                  key: "experiencia",
                },
              ] as { label: string; key: keyof IFormData }[]
            ).map(({ label, key }) => (
              <div key={key} className="form-group">
                <label className="form-label-evaluacion">{label}</label>
                <input
                  type="text"
                  className="form-input"
                  value={String(formData[key] ?? "")}
                  onChange={(e) => {
                    let value: string = e.target.value;
                    if (key === "edad")
                      value = value.replace(/\D/g, "").slice(0, 3);
                    handleInputChange(key, value as IFormData[typeof key]);
                  }}
                />
              </div>
            ))}

            {/* ── Tipo 1: Cédula interna ──────────────────────────────────── */}
            {tipoProceso === 1 && (
              <>
                <h3 className="section-title">Competencias</h3>
                {(
                  [
                    { label: "Sobresaliente", key: "sobresaliente" },
                    { label: "A Reforzar", key: "reforzar" },
                    { label: "A Desarrollar", key: "desarrollar" },
                    { label: "Habilidades Digitales", key: "habilidades" },
                    { label: "Evaluación de conocimientos", key: "evaluacion" },
                    { label: "Efectos de contratación", key: "efectos" },
                  ] as { label: string; key: keyof IFormData }[]
                ).map(({ label, key }) => (
                  <div
                    key={key}
                    className="form-group"
                    style={{ gridColumn: "span 3" }}
                  >
                    <label className="form-label-evaluacion">{label}</label>
                    <textarea
                      className="large-textarea"
                      value={String(formData[key] ?? "")}
                      onChange={(e) =>
                        handleInputChange(
                          key,
                          e.target.value as IFormData[typeof key],
                        )
                      }
                    />
                  </div>
                ))}

                <div className="form-group">
                  <h3 className="section-title">Resultado Final</h3>
                  <select
                    className="resultado-form-input"
                    value={formData.resultadoFinal}
                    onChange={(e) =>
                      handleInputChange("resultadoFinal", e.target.value)
                    }
                  >
                    <option value="" disabled>
                      Seleccionar
                    </option>
                    <option value="Recomendable">Recomendable</option>
                    <option value="Recomendable con observaciones">
                      Recomendable con observaciones
                    </option>
                    <option value="No recomendable">No recomendable</option>
                  </select>
                </div>

                <h3 className="section-title">
                  Resultados cualitativos del sistema de evaluación
                </h3>
                {(
                  [
                    { label: "Reforzar", key: "cualitativoReforzar" },
                    { label: "Desarrollar", key: "cualitativoDesarrollar" },
                  ] as { label: string; key: keyof IFormData }[]
                ).map(({ label, key }) => (
                  <div
                    key={key}
                    className="form-group"
                    style={{ gridColumn: "span 3" }}
                  >
                    <label className="form-label-evaluacion">{label}</label>
                    <textarea
                      id=""
                      className="large-textarea"
                      value={String(formData[key] ?? "")}
                      onChange={(e) =>
                        handleInputChange(
                          key,
                          e.target.value as IFormData[typeof key],
                        )
                      }
                    />
                  </div>
                ))}

                <div className="charts-container">
                  <div ref={chartGaugeRef} className="chart-box" />
                </div>
                <div className="charts-container">
                  <div ref={chartRadarRef} className="chart-box" />
                </div>

                <div className="action-buttons">
                  <button
                    type="button"
                    className="btn-graficas"
                    onClick={handleCrearGraficas}
                  >
                    Crear Gráficas
                  </button>
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

                <div className="floating-approval-buttons">
                  <button
                    type="button"
                    className={`btn-aprobacion ${aprobadoJefeOficina ? "activo" : ""}`}
                    onClick={() => setAprobadoJefeOficina((v) => !v)}
                    disabled={usuario?.FKidTipoAcceso !== 1}
                  >
                    🧾 Jefe de Oficina
                  </button>
                  <button
                    type="button"
                    className={`btn-aprobacion ${aprobadoDireccion ? "activo" : ""}`}
                    onClick={() => setAprobadoDireccion((v) => !v)}
                    disabled={usuario?.FKidTipoAcceso !== 4}
                  >
                    🗂️ Jefe de Departamento
                  </button>
                </div>
              </>
            )}

            {/* ── Tipo 2: Cédula externa ──────────────────────────────────── */}
            {tipoProceso === 2 && (
              <div className="action-buttons">
                <button type="submit" className="btn-guardar">
                  Guardar
                </button>

                <label htmlFor="archivoPDF" className="styled-file-input">
                  {nombreArchivo || "Seleccionar archivo PDF"}
                </label>
                <input
                  type="file"
                  id="archivoPDF"
                  accept="application/pdf"
                  ref={fileInputRef}
                  className="hidden-file-input"
                  onChange={async (e) => {
                    const archivo = e.target.files?.[0];
                    if (!archivo) return;
                    setNombreArchivo(archivo.name);
                    setFilePDF(archivo);
                    const base64: string =
                      await ManageFiles.pdfToBase64(archivo);
                    setArchivoBase64(base64);
                  }}
                />

                {archivoUrl && (
                  <div className="pdf-preview-container">
                    <h3>📄 Documento adjunto: {archivoNombre}</h3>
                    <button
                      type="button"
                      className="btn-visualizar"
                      onClick={() => window.open(archivoUrl, "_blank")}
                    >
                      Ver PDF
                    </button>
                  </div>
                )}

                {isDragging && (
                  <div className="drop-overlay">
                    <div className="drop-message">📂 Suelta aquí</div>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Visor de PDF */}
        {pdfVisible && archivoBase64 && (
          <div className="pdf-viewer-container">
            <div className="pdf-viewer-header">
              <div className="pdf-viewer-title">
                <span>📄 {nombreArchivo}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = `data:application/pdf;base64,${archivoBase64}`;
                  link.download = nombreArchivo || "Documento.pdf";
                  link.click();
                }}
                className="bg-[rgba(255,255,255,0.15)] border-0 rounded-md text-white py-1.5 px-3.5 cursor-pointer"
                onMouseEnter={(e) =>
                  ((
                    e.currentTarget as HTMLButtonElement
                  ).style.backgroundColor = "rgba(255,255,255,0.3)")
                }
                onMouseLeave={(e) =>
                  ((
                    e.currentTarget as HTMLButtonElement
                  ).style.backgroundColor = "rgba(255,255,255,0.15)")
                }
              >
                Descargar
              </button>
            </div>
            <div className="pdf-viewer-frame">
              <iframe
                src={`data:application/pdf;base64,${archivoBase64}`}
                title="Vista previa del PDF"
              />
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default CrearConstancia;
