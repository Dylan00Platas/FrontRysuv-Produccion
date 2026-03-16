import { useEffect, useRef, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import { PDFDocument } from "pdf-lib";
import { FaSearch } from "react-icons/fa";
import { FiHelpCircle } from "react-icons/fi";
import Select from "react-select";
import * as echarts from "echarts";
import * as fontkit from "fontkit";

import "./CrearConstancia.css";
import CedulaService from "@/services/CedulaService.js";
import ManageFiles from "@/utils/ManageFiles";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Alert/Floating/Toast";
import {
  IDependenciaBase,
  IGetDependencias,
} from "@/schemas/catalogos/GetDependencia";
import { useDependenciaById } from "@/hooks/useDependenciaById";
import { useDependencias } from "@/hooks/useDependencias";
import { useProcesoTipos } from "@/hooks/useProcesoTipos";
import {
  IGetTiposProceso,
  ITipoProcesoBase,
} from "@/schemas/catalogos/GetTipoProceso";
import IResponseHTTP from "@/interfaces/http/Response";
import { IGetCedulaExterna } from "@/schemas/cedulas-externas/GetCedulaExterna";
import { IGetCedula } from "@/schemas/cedulas/GetCedula";
import ProcesoContratacionService from "@/services/ProcesoContratacionService";
import { IGetCompetenciasClasificacionCedula } from "@/schemas/cedulas/GetCompetencia";

function CrearConstancia() {
  // Utils ---------------------------------------------------------------------
  const navigate = useNavigate();
  const fechaActual = new Date();
  const dia = fechaActual.getDate().toString().padStart(2, "0");
  const mes = (fechaActual.getMonth() + 1).toString().padStart(2, "0");
  const año = fechaActual.getFullYear();
  const fechaFormateada = `${dia}/${mes}/${año}`;
  const { toast, mostrarToast } = useToast();
  const [showHelp, setShowHelp] = useState(false);

  // Obtención de datos ---------------------------------------------------------
  // Obtención de cedula.folio desde query
  const location = useLocation();
  const cedulaFromNav = location.state?.cedula || null;
  const [porcentajeHabilidades, setPorcentajeHabilidades] = useState(0);

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

  // Tipos de proceso de contratación --------------------------------------------
  const {
    data: dataProcesoTipos,
    loading: loadingProcesoTipos,
    error: errorProcesoTipos,
  } = useProcesoTipos();
  const [procesoTipos, setProcesoTipos] = useState<IGetTiposProceso | null>();
  useEffect(() => {
    setProcesoTipos(dataProcesoTipos);
  }, [dataDependencias]);

  const {
    data: dataProcesoTipoById,
    loading: loadingProcesoTipoById,
    error: errorProcesoTipoById,
  } = useProcesoTipos();
  const [procesoTipoById, setProcesoTipoById] =
    useState<ITipoProcesoBase | null>();
  const [procesoTipoId, setProcesoTipoId] = useState(0);

  // Manejo de archivo PDf -------------------------------------------------------
  const archivoUrl = location.state?.archivoUrl || null;
  const [filePDF, setFilePDF] = useState(null);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [archivoBase64, setArchivoBase64] = useState("");
  const fileInputRef = useRef(null);
  const { mostrarPDF, archivoNombre } = location.state || {};

  // Manejo de dragging archivo --------------------------------------------------
  const [isDragging, setIsDragging] = useState(false);
  useEffect(() => {
    const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDrop = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (!file) return;

      if (file.type !== "application/pdf") {
        mostrarToast("Por favor suelta un archivo PDF válido", "advertencia");
        return;
      }

      // Mostrar el nombre y el archivo
      setFilePDF(file);
      setNombreArchivo(file.name);

      // Leerlo como Base64
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setArchivoBase64(reader.result?.split(",")[1]);
        }
      };
      reader.readAsDataURL(file);

      // Simular selección en el input
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
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

  // -----------------------------------------------------------------------------

  const [aprobadoJefeOficina, setAprobadoJefeOficina] = useState(false);
  const [aprobadoDireccion, setAprobadoDireccion] = useState(false);

  const chartGaugeRef = useRef(null);
  const chartRadarRef = useRef(null);

  useEffect(() => {
    if (
      cedulaFromNav?.FKIdTipoCedula === 2 &&
      cedulaFromNav?.FKIdTipoProceso === 2
    ) {
      setProcesoTipoId(2);
    }
  }, [cedulaFromNav]);

  useEffect(() => {
    if (chartRadarRef.current) {
      const chartRadar = echarts.init(chartRadarRef.current);

      const option = {
        title: {},
        tooltip: {},
        radar: {
          indicator: [{ name: "", max: 100 }],
        },
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
      };

      chartRadar.setOption(option);
      return () => chartRadar.dispose();
    }
  }, []);

  useEffect(() => {
    cargarDependencias();
  }, []);

  useEffect(() => {
    const fetchCedulaExterna = async () => {
      try {
        if (cedulaFromNav?.idCedula) {
          const token = localStorage.getItem("token");
          console.log(
            "🔍 Buscando cédula externa con ID:",
            cedulaFromNav.idCedula,
          );

          const response: IResponseHTTP<IGetCedulaExterna> =
            await new CedulaService().getCedulaExterna(cedulaFromNav.idCedula);

          if (
            response.error == false ||
            response.mensaje.documento.archivo?.length <= 0
          ) {
            mostrarToast(
              "⚠️ No se encontró archivo designado a esta cédula externa.",
              "error",
            );
            return;
          }
          // Guardamos el PDF en base64 para mostrarlo en pantalla
          setArchivoBase64(response.mensaje.documento.archivo);
          setNombreArchivo(
            response.mensaje.documento.nombre ||
              `${response.mensaje.documento.nombre}.pdf`,
          );
          setPdfVisible(true);
        } else {
          mostrarToast(
            "ℹ️ No se encontró idCedula, no se buscará archivo externo.",
            "advertencia",
          );
        }
      } catch (error) {
        console.error(
          "CrearConstancia.tsx - Error al buscar archivo de cédula externa:\n",
          error,
        );
        mostrarToast("❌ Error al obtener la cédula externa:", "exito");
      }
    };

    fetchCedulaExterna();
  }, [cedulaFromNav]);

  useEffect(() => {
    if (chartGaugeRef.current) {
      const chart = echarts.init(chartGaugeRef.current);

      const option = {
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
            axisTick: {
              length: 12,
              lineStyle: { color: "#464646", width: 1 },
            },
            splitLine: {
              length: 20,
              lineStyle: { color: "#000000ff", width: 3 },
            },
            axisLabel: {
              color: "#464646",
              fontSize: 11,
              distance: -45,
              rotate: "tangential",
              formatter: function (value) {
                const percent = Math.round(value * 100);
                return percent % 10 === 0 ? `${percent}%` : "";
              },
            },
            title: {
              offsetCenter: [0, "-10%"],
              fontSize: 20,
            },
            detail: {
              fontSize: 30,
              offsetCenter: [0, "-35%"],
              valueAnimation: true,
              formatter: function (value) {
                return Math.round(value * 100) + "%";
              },
              color: "inherit",
            },
            data: [{ value: porcentajeHabilidades / 100, name: "Competencia" }],
          },
        ],
      };

      chart.setOption(option);
      return () => chart.dispose();
    }
  }, [porcentajeHabilidades]);

  useEffect(() => {
    if (cedulaFromNav) {
      useDependenciaById(cedulaFromNav.idDependencia);
      setAprobadoJefeOficina(!!cedulaFromNav.aprobadoJefeOficina);
      setAprobadoDireccion(!!cedulaFromNav.aprobadoDireccion);

      setFormData((prev) => ({
        ...prev,
        idProceso: cedulaFromNav.idProceso || "",
        hermesNotificacion: cedulaFromNav.hermesNotificacion || "",
        titular: cedulaFromNav.titularPlaza || "",
        edad: cedulaFromNav.edad || "",
        oficio: cedulaFromNav.oficioAutorizacionDeOcupacion || "",
        educacion: cedulaFromNav.educacionFormal || "",
        experiencia: cedulaFromNav.experienciaRelacionada || "",
        evaluacion: cedulaFromNav.evaluacionConocimientos || "",
        idDependencia: cedulaFromNav.IdDependencia || "",

        sobresaliente: cedulaFromNav.competenciasSobresaliente || "",
        reforzar: cedulaFromNav.competenciaReforzar || "",
        desarrollar: cedulaFromNav.competenciaDesarrollar || "",
        efectos: cedulaFromNav.efectoContratacion || "",

        cualitativoDesarrollar: cedulaFromNav.descripcionDesarrollar || "",
        cualitativoReforzar: cedulaFromNav.descripcionReforzar || "",

        habilidades:
          `Puntuación de habilidades en Excel: ${
            cedulaFromNav.resultadoHabilidadesExcel || "N/A"
          } | ` +
          `Puntuación de habilidades en Word: ${
            cedulaFromNav.resultadoHabilidadesWord || "N/A"
          } | ` +
          `Puntuación de habilidades en Ortografía y redacción: ${
            cedulaFromNav.resultadoOrtografia || "N/A"
          } `,

        FKIdProceso: cedulaFromNav.idProceso || "",

        temporalidad:
          cedulaFromNav.FKIdTemporalDefinitiva === 1
            ? "1"
            : cedulaFromNav.FKIdTemporalDefinitiva === 2
              ? "2"
              : "",

        puesto: cedulaFromNav.puesto || "",
        plaza: cedulaFromNav.plaza || "",
        nombre: cedulaFromNav.candidato || "",

        resultadoFinal: cedulaFromNav.resultadoProcesoEvaluacion || "",

        adscripcion: dependenciaById
          ? {
              idDependencia: dependenciaById.idDependencia,
              nombre: dependenciaById.nombre,
              zona: dependenciaById.zona,
            }
          : null,
        region: dependenciaById ? dependenciaById.zona : "",
      }));
    }
  }, [cedulaFromNav, dependenciasCargadas, dependencias]);

  const [formData, setFormData] = useState({
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
  });

  const mapFormDataToCedula = (formData) => {
    return {
      hermesNotificacion: formData.hermesNotificacion || "",
      edad: formData.edad || "",
      educacionFormal: formData.educacion || "",
      experiencia: formData.experiencia || "",
      puesto: formData.puesto || "",
      plaza: formData.plaza || "",
      oficio: formData.oficio || "",
      evaluacionConocimientos: formData.evaluacion || "",

      competenciasSobresaliente: formData.sobresaliente || "",
      competenciaReforzar: formData.reforzar || "",
      competenciaDesarrollar: formData.desarrollar || "",

      descripcionReforzar: formData.cualitativoReforzar || "",
      descripcionDesarrollar: formData.cualitativoDesarrollar || "",
      resultadoProcesoEvaluacion: formData.resultadoFinal || "",
      efectoContratacion: formData.efectos || "",
      habilidades: formData.habilidades || "",

      FKIdProceso: formData.FKIdProceso || null,
      numeroPlaza: formData.numeroPlaza || "",
      nombreCandidato: formData.nombreCandidato || "",
      titularPlaza: formData.titular || "",
    };
  };

  const handleBuscarCedula = async () => {
    try {
      if (!formData.idProceso) {
        mostrarToast(
          " ⚠️ Por favor ingresa el identificador y presiona la lupa.",
          "advertencia",
        );
        return;
      }
      const proceso: IResponseHTTP<IGetCedula> =
        await new CedulaService().getCedulaInternaIdProceso(formData.idProceso);

      if (!proceso) {
        mostrarToast(
          "No se encontró la cédula o los datos iniciales.",
          "advertencia",
        );
        return;
      }

      useDependenciaById(proceso.mensaje.cedula.FKIdDependencia);

      const updatedFormData = {
        edad: cedula.edad || "",
        experiencia: cedula.experienciaRelacionada || "",
        puesto: cedula.puesto || "",
        cualitativoReforzar: cedula.descripcionReforzar || "",
        cualitativoDesarrollar: cedula.descripcionDesarrollar || "",
        sobresaliente: cedula.competenciaSobresaliente || "",
        reforzar: cedula.competenciaReforzar || "",
        desarrollar: cedula.competenciaDesarrollar || "",
        efectos: cedula.efectoContratacion || formData.efectos,
        resultadoFinal: proceso.resultadoProcesoEvaluacion || "",
        educacion: proceso.educacionFormal || "",
        FKIdProceso: proceso.idProceso,
        hermesNotificacion: proceso.hermesNotificacion || "",
        nombre: proceso.nombreCandidato || "",
        titular: proceso.titularPlaza || "",
        habilidades:
          "Puntuación de habilidades de Excel: " +
          (proceso.resultadoHabilidadesExcel || "N/A") +
          " Puntuación de habilidades de Word: " +
          (proceso.resultadoHabilidadesWord || "N/A") +
          "Puntuación de habilidades en Ortografía y redacción: " +
          (proceso.resultadoOrtografia || "N/A"),
        temporalidad:
          proceso.FKIdTemporalDefinitiva === 1
            ? "1"
            : proceso.FKIdTemporalDefinitiva === 2
              ? "2"
              : "",
        adscripcion: {},
        region: "",
      };

      if (dependenciaById) {
        updatedFormData.adscripcion = {
          idDependencia: dependenciaById.idDependencia,
          nombre: dependenciaById.nombre,
          zona: dependenciaById.zona,
        };
        updatedFormData.region = dependenciaById.zona;
      } else {
        updatedFormData.adscripcion = {};
        updatedFormData.region = "";
      }

      setFormData((prev) => ({ ...prev, ...updatedFormData }));
      setProcesoTipoId(proceso.FKIdTipoProceso);
    } catch (err) {
      console.error("Error al buscar cédula:", err);
      alert("Ocurrió un error al buscar la cédula");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (mostrarPDF && archivoBase64) {
      try {
        const nombreDescarga =
          cedulaFromNav?.documento?.nombre || archivoNombre || "Documento.pdf"; // fallback

        // Mostrar PDF dentro del iframe
        ManageFiles.mostrarPdf(archivoBase64);

        // Si el iframe tiene un botón de descarga, puedes forzar que use este nombre:
        const link = document.createElement("a");
        link.href = `data:application/pdf;base64,${archivoBase64}`;
        link.download = nombreDescarga;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Error al mostrar o descargar PDF:", error);
      }
    }
  }, [mostrarPDF, archivoBase64]);

  const handleGenerarPDF = async () => {
    const existingPdfBytes = await fetch("/CedulaResultadosEditable.pdf").then(
      (res) => res.arrayBuffer(),
    );
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);
    const form = pdfDoc.getForm();

    if (typeof handleCrearGraficas === "function") {
      await handleCrearGraficas();
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    form.getTextField("hermes").setText(formData.hermesNotificacion);
    form.getTextField("adscripcion").setText(formData.adscripcion?.label || "");
    form.getTextField("region").setText(formData.region);
    form.getTextField("plaza").setText(formData.plaza);
    form.getTextField("puesto").setText(formData.puesto);
    form.getTextField("titular").setText(formData.titular);
    form.getTextField("oficio").setText(formData.oficio);
    form
      .getTextField("temporalidad")
      .setText(formData.temporalidad == "Temporal" ? "Temporal" : "Definitiva");
    form.getTextField("nombre").setText(formData.nombre);
    form.getTextField("edad").setText(formData.edad + " años");
    form.getTextField("educacion").setText(formData.educacion);
    form.getTextField("experiencia").setText(formData.experiencia);
    form.getTextField("sobresaliente").setText(formData.sobresaliente);
    form.getTextField("reforzar").setText(formData.reforzar);
    form.getTextField("desarrollar").setText(formData.desarrollar);
    form.getTextField("habilidades").setText(formData.habilidades);
    form.getTextField("conocimientos").setText(formData.evaluacion);
    form.getTextField("contratacion").setText(formData.efectos);
    form.getTextField("fecha1").setText(fechaFormateada);
    form.getTextField("fecha2").setText(fechaFormateada);
    form.getTextField("resultado").setText(formData.resultadoFinal || "");

    form
      .getTextField("cualitativoReforzar")
      .setText(formData.cualitativoReforzar);
    form
      .getTextField("cualitativoDesarrollar")
      .setText(formData.cualitativoDesarrollar);

    const fontBytes = await fetch("/gill.TTF").then((res) => res.arrayBuffer());
    const gillSansFont = await pdfDoc.embedFont(fontBytes);
    form.getFields().forEach((field) => {
      field.updateAppearances(gillSansFont);
      field.acroField.setBorderWidth(0);
      field.acroField.setBorderColor(undefined);
    });

    form.flatten();
    const firstPage = pdfDoc.getPage(0);
    const pageWidth = firstPage.getWidth();

    let gaugeImageEmbed = null;
    if (chartGaugeRef.current) {
      const gaugeChart = echarts.getInstanceByDom(chartGaugeRef.current);
      const gaugeDataUrl = gaugeChart.getDataURL({
        type: "png",
        pixelRatio: 10,
        backgroundColor: "transparent",
      });
      const gaugeBytes = await fetch(gaugeDataUrl).then((res) =>
        res.arrayBuffer(),
      );
      gaugeImageEmbed = await pdfDoc.embedPng(gaugeBytes);
    }

    let radarImageEmbed = null;
    if (chartRadarRef.current) {
      const radarChart = echarts.getInstanceByDom(chartRadarRef.current);
      const radarDataUrl = radarChart.getDataURL({
        type: "png",
        pixelRatio: 5,
        backgroundColor: "transparent",
      });
      const radarBytes = await fetch(radarDataUrl).then((res) =>
        res.arrayBuffer(),
      );
      radarImageEmbed = await pdfDoc.embedPng(radarBytes);
    }

    // --- DIBUJAR GRÁFICOS EN EL PDF ---
    if (gaugeImageEmbed || radarImageEmbed) {
      const imageWidth = 230;
      const imageHeight = 150;
      const yPosition = 350;
      const spacing = 40;

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

    /**
     * TODO-Desarrollo:
     * Obtener por medio de cookie
     * Eliminar firma de /public
     */
    if (usuario?.FKidTipoAcceso === 1 || usuario?.FKidTipoAcceso === 4) {
      try {
        const firmaBytes = await fetch("/Firma_AVC.png").then((res) =>
          res.arrayBuffer(),
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
        mostrarToast(" ❌ Error al agregar la firma AVC.", "error");
      }
    }
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const hermesNumber = formData.hermesNotificacion || "SinHermes";
    const fileName = `CedulaResultados_${hermesNumber}.pdf`;
    saveAs(blob, fileName);
  };

  const mapFormDataToSolicitud = (formData) => {
    return {
      titularPlaza: formData.titular || "",
      experiencia: formData.experiencia || "",
      resultadoConocimiento: formData.resultadoConocimiento || "",
      educacionFormal: formData.educacion || "",
      resultadoEvaluacion: formData.resultadoFinal || "",

      candidato: formData.nombreCandidato || "",
      edad: formData.edad || "",
      idDependencia: formData.adscripcion?.value ?? null,
      tipo:
        formData.temporalidad === "1"
          ? 1
          : formData.temporalidad === "2"
            ? 2
            : null,
      puesto: formData.puesto || "",
      resultadoFinal: formData.resultadoFinal || "",
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.FKIdProceso) {
        mostrarToast(
          `⚠️ Por favor primero busca el identificador con la lupa para poder guardar la cédula.`,
          "advertencia",
        );
        return;
      }
      const token = localStorage.getItem("token");

      const cedulaData = mapFormDataToCedula(formData);
      cedulaData.aprobadoJefeOficina = aprobadoJefeOficina;
      cedulaData.aprobadoDireccion = aprobadoDireccion;

      console.log(cedulaData);

      const response: IResponseHTTP<string> =
        await new CedulaService().postResultadoCedulaInterna(cedulaData);
      if (response.error == false) {
        try {
          const solicitudData = mapFormDataToSolicitud(formData);
          const respSolicitud: IResponseHTTP<string> =
            await new ProcesoContratacionService().putProcesoContratacion(
              formData.FKIdProceso,
              solicitudData,
            );
          if (respSolicitud && !respSolicitud.error) {
            mostrarToast(" ✅ Cédula registrada correctamente", "exito");

            if (!response.error && response.estado === 200) {
              if (archivoBase64 && nombreArchivo) {
                await new CedulaService().postResultadoCedulaExterna({
                  FKIdCedula: Number(response.mensaje),
                  nombre: nombreArchivo,
                  archivo: archivoBase64,
                });
              }
            }
            setTimeout(() => {
              navigate(-1);
            }, 2000);
          } else {
            mostrarToast(
              "⚠️ La cédula se guardó, pero hubo un error al actualizar la base de datos.",
              "error",
            );
          }
        } catch (err) {
          console.error(
            "CrearConstancia.tsx - Error al actualizar solicitud:\n",
            err,
          );
          mostrarToast(
            "⚠️ La cédula se guardó, pero hubo un error al actualizar la base de datos.",
            "error",
          );
        }
      } else {
        mostrarToast("Ocurrió un error al registrar la cédula.", "error");
      }
    } catch (err) {
      console.error(
        "CrearConstanciaInterma.tsx - Error al registrar cédula:\n",
        err,
      );
      mostrarToast(
        `❌ Error: Ocurrió un error al registrar la cédula.`,
        "error",
      );
    }
  };

  const handleCrearGraficas = async () => {
    try {
      if (!formData.FKIdProceso) {
        mostrarToast(
          `⚠️  Por favor busca el identificador con la lupa para poder crear las gráficas `,
          "advertencia",
        );
        return;
      }

      const response: IResponseHTTP<IGetCompetenciasClasificacionCedula> =
        await new CedulaService().getResultadosIdProceso(formData.FKIdProceso);

      if (
        !response ||
        !response.error ||
        response.mensaje.competencias?.length <= 0
      ) {
        mostrarToast("No se recibieron datos de competencias.", "advertencia");
        return;
      }

      const resultado = response.mensaje.competencias[0];
      if (
        resultado.resultadoPorcentaje !== undefined &&
        resultado.resultadoPorcentaje !== null
      ) {
        setPorcentajeHabilidades(resultado.resultadoPorcentaje);
      }

      // Filtrar campos no nulos y que comiencen con "psicometria"
      const competencias = Object.entries(resultado)
        .filter(
          ([key, value]) => key.startsWith("psicometria") && value !== null,
        )
        .reduce((acc, [key, value]) => {
          // Quita el prefijo "psicometria" y mejora la legibilidad
          const nombre = key
            .replace("psicometria", "")
            .replace(/([A-Z])/g, " $1")
            .trim();
          acc[nombre] = value;
          return acc;
        }, {});

      if (Object.keys(competencias).length === 0) {
        alert("No hay competencias válidas para graficar.");
        return;
      }

      console.log("✅ Competencias procesadas:", competencias);

      // --- Construcción dinámica del gráfico ---
      const indicadores = Object.keys(competencias).map((nombre) => ({
        name: nombre,
        max: 4, // Escala de 1 a 5 según tus valores psicométricos
        // Aquí agregamos formatter para romper nombres largos en varias líneas
        nameFormatter: (name) => {
          const maxChars = 15; // número máximo de caracteres por línea
          if (name.length <= maxChars) return name;
          const regex = new RegExp(`.{1,${maxChars}}`, "g");
          return name.match(regex).join("\n");
        },
      }));

      const valores = Object.values(competencias);

      // Destruir gráfico anterior si existe
      if (chartRadarRef.current) {
        const oldChart = echarts.getInstanceByDom(chartRadarRef.current);
        if (oldChart) oldChart.dispose();
      }

      const chartRadar = echarts.init(chartRadarRef.current);

      const option = {
        tooltip: {},
        radar: {
          indicator: indicadores,
          radius: "65%",
          axisName: {
            formatter: (name) => {
              // fallback por si nameFormatter no se aplica
              const maxChars = 15;
              if (name.length <= maxChars) return name;
              const regex = new RegExp(`.{1,${maxChars}}`, "g");
              return name.match(regex).join("\n");
            },
            lineHeight: 15,
            rich: {},
          },
        },
        series: [
          {
            name: "Evaluación",
            type: "radar",
            data: [
              {
                value: valores,
                name: "Candidato",
                areaStyle: { opacity: 0.3 },
                lineStyle: { width: 2 },
                symbol: "circle",
                symbolSize: 6,
              },
            ],
          },
        ],
      };

      chartRadar.setOption(option);
    } catch (error) {
      console.error("Error al crear gráficas:", error);
      alert("Ocurrió un error al crear las gráficas. Ver consola.");
    }
  };

  const [pdfVisible, setPdfVisible] = useState(false);

  useEffect(() => {
    if (mostrarPDF && archivoBase64) {
      setFilePDF(`data:application/pdf;base64,${archivoBase64}`);
      setNombreArchivo(archivoNombre || "Documento.pdf");
      setPdfVisible(true);
    }
  }, [mostrarPDF, archivoBase64, archivoNombre]);

  return (
    <>
      {/* Toast de notificación */}
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
                Esta es la ventana de generar cédula de resultados . En el campo
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
            {[
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
            ].map(({ label, key, withButton }) => (
              <div key={key} className="form-group">
                <label className="form-label-evaluacion">{label}</label>
                {withButton ? (
                  <div className="input-with-button">
                    <input
                      type="text"
                      className="form-input"
                      value={formData[key]}
                      onChange={(e) => handleInputChange(key, e.target.value)}
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
                    value={formData[key]}
                    onChange={(e) => handleInputChange(key, e.target.value)}
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
                  handleInputChange("temporalidad", e.target.value)
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
            {[
              { label: "Nombre", key: "nombre" },
              { label: "Edad", key: "edad" },
              { label: "Educación Formal", key: "educacion" },
              {
                label: "Experiencia relacionada al puesto",
                key: "experiencia",
              },
            ].map(({ label, key }) => (
              <div key={key} className="form-group">
                <label className="form-label-evaluacion">{label}</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData[key]}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (key === "edad") {
                      value = value.replace(/\D/g, "");
                      value = value.slice(0, 3);
                    }
                    handleInputChange(key, value);
                  }}
                />
              </div>
            ))}

            {tipoProceso === 1 && (
              <>
                <h3 className="section-title">Competencias</h3>
                {[
                  { label: "Sobresaliente", key: "sobresaliente" },
                  { label: "A Reforzar", key: "reforzar" },
                  { label: "A Desarrollar", key: "desarrollar" },
                  { label: "Habilidades Digitales", key: "habilidades" },
                  { label: "Evaluación de conocimientos", key: "evaluacion" },
                  { label: "Efectos de contratación", key: "efectos" },
                ].map(({ label, key }) => (
                  <div
                    key={key}
                    className="form-group"
                    style={{ gridColumn: "span 3" }}
                  >
                    <label className="form-label-evaluacion">{label}</label>
                    <textarea
                      className="large-textarea"
                      value={formData[key]}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                    />
                  </div>
                ))}
                <div className="form-group">
                  <h3 className="section-title">Resultado Final</h3>{" "}
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
                {[
                  { label: "Reforzar", key: "cualitativoReforzar" },
                  { label: "Desarrollar", key: "cualitativoDesarrollar" },
                ].map(({ label, key }) => (
                  <div
                    key={key}
                    className="form-group"
                    style={{ gridColumn: "span 3" }}
                  >
                    <label className="form-label-evaluacion">{label}</label>
                    <textarea
                      className="large-textarea"
                      value={formData[key]}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                    />
                  </div>
                ))}

                {/*
              
            
            <div className="form-group">
              <label className="form-label-evaluacion">Revisa </label>
              <input type="text" className="form-input"
                value={formData.valida}
                onChange={(e) => handleInputChange('valida', e.target.value)} />
              <small className="form-note">JEFE DE LA OFICINA DE EVALUACIÓN DE PERSONAL Y PROYECTOS DE RECURSOS HUMANOS </small>
            </div>
            <div className="form-group">
              <label className="form-label-evaluacion">Valida</label>
              <input type="text" className="form-input"
                value={formData.revisa}
                onChange={(e) => handleInputChange('revisa', e.target.value)} />
              <small className="form-note">JEFE DE DEPARTAMENTO DE EV </small>
            </div>
            <div className="form-group">
              <label className="form-label-evaluacion">Aprueba</label>
              <input type="text" className="form-input"
                value={formData.aprueba}
                onChange={(e) => handleInputChange('aprueba', e.target.value)} />
              <small className="form-note">DIRECTORA GENERAL DE RECURSOS HUMANOS</small>
            </div>  
            */}

                <div className="charts-container">
                  <div ref={chartGaugeRef} className="chart-box"></div>
                </div>

                <div className="charts-container">
                  <div ref={chartRadarRef} className="chart-box"></div>
                </div>

                <div className="action-buttons">
                  <button
                    type="button"
                    className="btn-graficas"
                    onClick={handleCrearGraficas}
                  >
                    Crear Gráficas
                  </button>{" "}
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

                {/*  Botones flotantes de aprobación */}
                <div className="floating-approval-buttons">
                  <button
                    className={`btn-aprobacion ${aprobadoJefeOficina ? "activo" : ""}`}
                    onClick={() => setAprobadoJefeOficina(!aprobadoJefeOficina)}
                    disabled={usuario?.FKidTipoAcceso !== 1}
                  >
                    🧾 Jefe de Oficina
                  </button>

                  <button
                    className={`btn-aprobacion ${aprobadoDireccion ? "activo" : ""}`}
                    onClick={() => setAprobadoDireccion(!aprobadoDireccion)}
                    disabled={usuario?.FKidTipoAcceso !== 4}
                  >
                    🗂️ Jefe de Departamento
                  </button>
                </div>
              </>
            )}

            {tipoProceso === 2 && (
              <div className="action-buttons">
                <button type="submit" className="btn-guardar">
                  Guardar
                </button>
                <label htmlFor="archivoPDF" className="styled-file-input">
                  {nombreArchivo ? nombreArchivo : "Seleccionar archivo PDF"}
                </label>

                <input
                  type="file"
                  id="archivoPDF"
                  accept="application/pdf"
                  ref={fileInputRef}
                  className="hidden-file-input"
                  onChange={async (e) => {
                    const archivo = e.target.files[0];
                    if (archivo) {
                      setNombreArchivo(archivo.name);
                      setFilePDF(archivo);
                      const base64 = await ManageFiles.pdfToBase64(archivo);
                      setArchivoBase64(base64);
                      console.log("Archivo convertido a Base64 correctamente.");
                    }
                  }}
                />

                {archivoUrl && (
                  <div className="pdf-preview-container">
                    <h3>📄 Documento adjunto: {archivoNombre}</h3>
                    <button
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

        {pdfVisible && archivoBase64 && (
          <div className="pdf-viewer-container">
            <div className="pdf-viewer-header">
              {/* 1. Contenedor solo para el título/nombre del archivo */}
              <div className="pdf-viewer-title">
                <span>📄 {nombreArchivo}</span>
              </div>

              {/* 2. El botón de descarga ahora está fuera del contenedor del título */}
              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = `data:application/pdf;base64,${archivoBase64}`;
                  link.download = nombreArchivo || "Documento.pdf";
                  link.click();
                }}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  border: "none",
                  color: "white",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "background 0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "rgba(255, 255, 255, 0.3)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "rgba(255, 255, 255, 0.15)")
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
