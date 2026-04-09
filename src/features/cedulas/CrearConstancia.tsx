import {
	useEffect,
	useRef,
	useState,
	useCallback,
	useMemo,
	useId,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import {
	PDFTextField,
	PDFCheckBox,
	PDFDropdown,
	PDFRadioGroup,
	PDFDocument,
} from "pdf-lib";
import Select from "react-select";
import * as echarts from "echarts";
import * as fontkit from "fontkit";

import "./CrearConstancia.css";
import CedulaService from "@/services/CedulaService";
import ManageFiles from "@/utils/ManageFiles";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Alert/Floating/Toast";
import { useDependencias } from "@/hooks/useDependencias";
import { useProcesoTipos } from "@/hooks/useProcesoTipos";
import IResponseHTTP from "@/services/connection/APIResponse";
import { IGetCedulaExterna } from "@/schemas/cedulas-externas/GetCedulaExterna";
import { ICedulaBase, IGetCedula } from "@/schemas/cedulas/GetCedula";
import ProcesoContratacionService from "@/services/ProcesoContratacionService";
import {
	ICompetenciaClasificacionCedulaBase,
	IGetCompetenciasClasificacionCedula,
} from "@/schemas/cedulas/GetCompetencia";
import { ICedulaResultados } from "@/schemas/cedulas/PostResultadoCedula";
import { useCookie } from "@/hooks/useCookie";
import MainHeader from "@/components/header/MainHeader";
import { InputField } from "@/components/input/InputField";
import {
	ButtonShowModalHelp,
	ModalHelp,
} from "@/components/Alert/Floating/ModalHelp";
import FormSectionCard from "@/components/card/FormSectionCard";
import { SelectField } from "@/components/input/SelectField";
import { TextAreaField } from "@/components/input/TextareaField";
import { CustomButton } from "@/components/button/CustomButton";

// Interfaces de UI ---------------------------------------------------------
interface IDependenciaOption {
	idDependencia: number;
	nombre: string;
	zona: string;
}
interface IFormData {
	adscripcion: IDependenciaOption | null;
	aprueba: string;
	cualitativoDesarrollar: string;
	cualitativoReforzar: string;
	desarrollar: string;
	edad: string;
	efectos: string;
	educacion: string;
	evaluacion: string;
	experiencia: string;
	fechaCedulaResultados: string;
	FKIdProceso: number | string;
	habilidades: string;
	hermesNotificacion: string;
	nombreCandidato: string;
	numPlaza: string;
	oficio: string;
	puesto: string;
	reforzar: string;
	resultadoFinal: string;
	revisa: string;
	sobresaliente: string;
	temporalidad: "1" | "2" | "";
	titular: string;
	valida: string;
}

const hoy = new Date();
const fechaFormateada = `${String(hoy.getDate()).padStart(2, "0")}/${String(
	hoy.getMonth() + 1,
).padStart(2, "0")}/${hoy.getFullYear()}`;

function mapFormDataToCedula(
	formData: IFormData,
	aprobadoJefeOficina: boolean,
	aprobadoDireccion: boolean,
) {
	const today = new Date();
	const yyyy = today.getFullYear();
	const mm = String(today.getMonth() + 1).padStart(2, "0");
	const dd = String(today.getDate()).padStart(2, "0");
	return {
		aprobadoDireccion,
		aprobadoJefeOficina,
		competenciaDesarrollar: formData.desarrollar,
		competenciaReforzar: formData.reforzar,
		competenciasSobresaliente: formData.sobresaliente,
		descripcionDesarrollar: formData.cualitativoDesarrollar,
		descripcionReforzar: formData.cualitativoReforzar,
		efectoContratacion: formData.efectos,
		edad: formData.edad,
		educacionFormal: formData.educacion,
		evaluacionConocimientos: formData.evaluacion,
		experiencia: formData.experiencia,
		fechaCedulaResultados: `${yyyy}-${mm}-${dd}`,
		FKIdProceso: formData.FKIdProceso || null,
		habilidades: formData.habilidades,
		hermesNotificacion: formData.hermesNotificacion,
		numPlaza: formData.numPlaza,
		oficio: formData.oficio,
		puesto: formData.puesto,
		resultadoProcesoEvaluacion: formData.resultadoFinal,
		titularPlaza: formData.titular,
	};
}

function mapFormDataToSolicitud(formData: IFormData) {
	return {
		titularPlaza: formData.titular,
		experiencia: formData.experiencia,
		educacionFormal: formData.educacion,
		resultadoEvaluacion: formData.resultadoFinal,
		edad: formData.edad,
		idDependencia: formData.adscripcion?.idDependencia ?? null,
		tipo: Number(formData.temporalidad),
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
	adscripcion: null,
	aprueba: "",
	cualitativoDesarrollar: "",
	cualitativoReforzar: "",
	desarrollar: "",
	edad: "",
	efectos:
		"En caso de la contratación, y en cumplimiento a los Lineamientos específicos para el ejercicio del gasto AAAA, la persona titular de la Dependencia deberá realizar el movimiento de alta con fecha DD de MM de AAAA, o, en caso de que sea festivo o inhábil, a partir del día siguiente, en el Subsistema de Recursos Humanos, tal como se establece en la Guía para la captura de movimientos de alta de personal en el SsRH.",
	educacion: "",
	evaluacion: "",
	experiencia: "",
	fechaCedulaResultados: "",
	FKIdProceso: "",
	habilidades: "",
	hermesNotificacion: "",
	nombreCandidato: "",
	numPlaza: "",
	oficio: "",
	puesto: "",
	reforzar: "",
	resultadoFinal: "",
	revisa: "",
	sobresaliente: "",
	temporalidad: "",
	titular: "",
	valida: "",
};

async function cargarPdfDesdeUrl(url: string): Promise<string> {
	const bytes = await fetch(url).then((r) => r.arrayBuffer());
	return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

function CrearConstancia() {
	const navigate = useNavigate();
	const { toast, mostrarToast } = useToast();
	const { currentUser, checkSession } = useCookie();
	const fieldID = useId();
	useEffect(() => {
		checkSession();
	}, [currentUser]);

	const [showHelp, setShowHelp] = useState(false);
	const [formData, setFormData] = useState<IFormData>(FORM_INICIAL);
	const [aprobadoJefeOficina, setAprobadoJefeOficina] = useState(false);
	const [aprobadoDireccion, setAprobadoDireccion] = useState(false);
	const [porcentajeHabilidades, setPorcentajeHabilidades] = useState(0);
	const [tipoProceso, setTipoProceso] = useState<number>(0);

	const [filePDF, setFilePDF] = useState<File | null>(null);
	const [nombreArchivo, setNombreArchivo] = useState("");
	const [archivoBase64, setArchivoBase64] = useState("");
	const [pdfVisible, setPdfVisible] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Gráficas
	const chartGaugeRef = useRef<HTMLDivElement>(null);
	const chartRadarRef = useRef<HTMLDivElement>(null);

	// Dependencias -----------------------------------------------------------
	const { data: dataDependencias } = useDependencias();
	const { data: dataProcesoTipos } = useProcesoTipos();
	const dependenciasOptions = useMemo<IDependenciaOption[]>(
		() =>
			dataDependencias?.dependencias.map((dep) => ({
				idDependencia: dep.idDependencia,
				nombre: dep.nombre,
				zona: dep.zona,
			})) ?? [],
		[dataDependencias],
	);

	// Carga inicial desde navegación ------------------------------------------
	const location = useLocation();
	const cedulaFromNav = location.state?.cedula ?? null;
	const { mostrarPDF, archivoNombre, archivoUrl } = (location.state ?? {}) as {
		mostrarPDF?: boolean;
		archivoNombre?: string;
		archivoUrl?: string;
	};
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
		const dep =
			dataDependencias?.dependencias.find(
				(d) => d.idDependencia === cedulaFromNav.idDependencia,
			) ?? null;

		setFormData((prev) => ({
			...prev,
			adscripcion: dep
				? {
						idDependencia: dep.idDependencia,
						nombre: dep.nombre,
						zona: dep.zona,
					}
				: null,
			// TODO-Desarrollo: Falta aprueba
			cualitativoDesarrollar: cedulaFromNav.descripcionDesarrollar ?? "",
			cualitativoReforzar: cedulaFromNav.descripcionReforzar ?? "",
			desarrollar: cedulaFromNav.competenciaDesarrollar ?? "",
			edad: cedulaFromNav.edad ?? "",
			efectos: cedulaFromNav.efectoContratacion ?? prev.efectos,
			educacion: cedulaFromNav.educacionFormal ?? "",
			evaluacion: cedulaFromNav.evaluacionConocimientos ?? "",
			experiencia: cedulaFromNav.experienciaRelacionada ?? "",
			FKIdProceso: cedulaFromNav.idProceso ?? "",
			habilidades: buildHabilidades(cedulaFromNav),
			hermesNotificacion: cedulaFromNav.hermesNotificacion ?? "",
			nombreCandidato: cedulaFromNav.candidato ?? "",
			numPlaza: cedulaFromNav.plaza ?? "",
			oficio: cedulaFromNav.oficioAutorizacionDeOcupacion ?? "",
			puesto: cedulaFromNav.puesto ?? "",
			reforzar: cedulaFromNav.competenciaReforzar ?? "",
			resultadoFinal: cedulaFromNav.resultadoProcesoEvaluacion ?? "",
			// TODO-Desarrollo: Falta revisa
			sobresaliente: cedulaFromNav.competenciasSobresaliente ?? "",
			temporalidad: cedulaFromNav.temporalidad,
			titular: cedulaFromNav.titularPlaza ?? "",
		}));
	}, [cedulaFromNav, dataDependencias]);

	// Manejo de cédula/archivo externo ----------------------------------------
	useEffect(() => {
		if (!cedulaFromNav?.idCedula) return;

		let cancelado = false;

		const fetchCedulaExterna = async () => {
			try {
				const response: IResponseHTTP<IGetCedulaExterna> =
					await new CedulaService().getCedulaExterna(cedulaFromNav.idCedula);

				if (cancelado) return;

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
				mostrarToast("❌ Error al obtener la cédula externa.", "error");
			}
		};

		fetchCedulaExterna();
		return () => {
			cancelado = true;
		};
	}, [cedulaFromNav, mostrarToast]);

	// Mostrar PDF desde navegación ---------------------------------------------
	useEffect(() => {
		if (!mostrarPDF || !archivoUrl) return;
		let cancelado = false;
		cargarPdfDesdeUrl(archivoUrl).then((b64) => {
			if (cancelado) return;
			setArchivoBase64(b64);
			setNombreArchivo(archivoNombre ?? "Documento.pdf");
			setPdfVisible(true);
		});
		return () => {
			cancelado = true;
		};
	}, [mostrarPDF, archivoUrl, archivoNombre]);

	// Drag & Drop --------------------------------------------------------------
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
	}, [mostrarToast]);

	// Gráfica -----------------------------------------------------------------
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

	// Gráfica radar ----------------------------------------------------------
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

	// Manejadores de eventos -------------------------------------------------
	const handleInputChange = (field: string, value: any) => {
		setFormData((prev) => {
			const newData = { ...prev };
			const parts = field.split(".");
			if (parts.length === 2) {
				const [parent, child] = parts;
				(newData as any)[parent] = {
					...(prev as any)[parent],
					[child]: value,
				};
			} else {
				(newData as any)[field] = value;
			}
			return newData;
		});
	};

	const handleBuscarCedula = async () => {
		if (!formData.FKIdProceso) {
			mostrarToast(
				"⚠️ Por favor ingresa el identificador y presiona la lupa.",
				"advertencia",
			);
			return;
		}

		try {
			const response: IResponseHTTP<IGetCedula> =
				await new CedulaService().getCedulaInternaIdProceso(
					Number(formData.FKIdProceso),
				);

			if (!response?.mensaje) {
				mostrarToast(
					"No se encontró la cédula o los datos iniciales.",
					"advertencia",
				);
				return;
			}

			const cedulaData: ICedulaBase = response.mensaje?.cedula[0];

			const dep =
				dataDependencias?.dependencias.find(
					(d) => d.idDependencia === cedulaData.adscripcion?.idDepndencia,
				) ?? null;

			setFormData((prev) => ({
				...prev,
				adscripcion: dep
					? {
							idDependencia: dep.idDependencia,
							nombre: dep.nombre,
							zona: dep.zona,
						}
					: null,
				aprueba: cedulaData.aprueba || "",
				cualitativoDesarrollar: cedulaData.descripcionDesarrollar ?? "",
				cualitativoReforzar: cedulaData.descripcionReforzar ?? "",
				desarrollar: cedulaData.competenciaDesarrollar ?? "",
				edad: cedulaData.edad ?? "",
				efectos: cedulaData.efectoContratacion ?? prev.efectos,
				educacion: cedulaData.educacionFormal ?? "",
				evaluacionConocimientos: cedulaData.evaluacionConocimientos ?? "",
				experiencia: cedulaData.experienciaRelacionada ?? "",
				FKIdProceso: cedulaData.FKIdProceso ?? prev.FKIdProceso,
				habilidades: buildHabilidades(cedulaData),
				hermesNotificacion: cedulaData.hermesNotificacion ?? "",
				nombreCandidato: cedulaData.nombreCandidato ?? "",
				numPlaza: cedulaData.numPlaza ?? "",
				oficio: cedulaData.oficio ?? "",
				puesto: cedulaData.puesto ?? "",
				reforzar: cedulaData.competenciaReforzar ?? "",
				resultadoFinal: cedulaData.resultadoProcesoEvaluacion ?? "",
				revisa: cedulaData.revisa ?? "",
				sobresaliente: cedulaData.competenciasSobresaliente ?? "",
				temporalidad: cedulaData.temporalidad,
				titular: cedulaData.titularPlaza ?? "",
				valida: cedulaData.valida ?? "",
			}));

			setTipoProceso(cedulaData.FKIdTipoCedula ?? 0);
		} catch (err) {
			console.error("CrearConstancia.tsx - Error al buscar cédula:\n", err);
			mostrarToast("❌ Ocurrió un error al buscar la cédula.", "error");
		}
	};

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
				await new CedulaService().getResultadosIdProceso(
					Number(formData.FKIdProceso),
				);

			if (
				!response ||
				response.error ||
				!response.mensaje?.competencias?.length
			) {
				mostrarToast("No se recibieron datos de competencias.", "advertencia");
				return;
			}

			const resultado: ICompetenciaClasificacionCedulaBase =
				response.mensaje.competencias[0];

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
			if (chartGaugeRef.current) {
				echarts.getInstanceByDom(chartGaugeRef.current)?.dispose();
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

	// Generar PDF -------------------------------------------------------------
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
			await new Promise<void>((resolve) => {
				const chart = chartGaugeRef.current
					? echarts.getInstanceByDom(chartGaugeRef.current)
					: null;
				if (!chart) return resolve();
				chart.on("finished", () => resolve(), { once: true });
			});

			const setField = (name: string, value: string) => {
				form.getTextField(name).setText(value ?? "");
			};

			setField("nombreDependencia", formData.adscripcion?.nombre ?? "");
			setField("regionDependencia", formData.adscripcion?.zona || "");
			// TODO-Desarrollar: Falta aprueba
			setField("cualitativoDesarrollar", formData.cualitativoDesarrollar);
			setField("cualitativoReforzar", formData.cualitativoReforzar);
			setField("desarrollar", formData.desarrollar);
			setField("edad", formData.edad ? `${formData.edad} años` : "");
			setField("efectos", formData.efectos);
			setField("educacion", formData.educacion);
			setField("evaluacion", formData.evaluacion);
			setField("experiencia", formData.experiencia);
			// TODO-Desarrollar: Falta FKIdProceso
			setField("fecha1", fechaFormateada);
			setField("fecha2", fechaFormateada);
			setField("habilidades", formData.habilidades);
			setField("hermesNotificacion", formData.hermesNotificacion);
			setField("nombreCandidato", formData.nombreCandidato);
			setField("numPlaza", formData.numPlaza);
			setField("oficio", formData.oficio);
			setField("puesto", formData.puesto);
			setField("reforzar", formData.reforzar);
			setField("resultadoFinal", formData.resultadoFinal);
			// TODO-Desarrollar: Falta revisa
			setField("sobresaliente", formData.sobresaliente);
			setField(
				"temporalidad",
				formData.temporalidad === "1" ? "Temporal" : "Definitiva",
			);
			setField("titular", formData.titular);

			const fontBytes = await fetch("/gill.TTF").then((r) => r.arrayBuffer());
			const gillSansFont = await pdfDoc.embedFont(fontBytes);
			form.getFields().forEach((field) => {
				try {
					if (field instanceof PDFTextField)
						field.updateAppearances(gillSansFont);
					else if (field instanceof PDFDropdown)
						field.updateAppearances(gillSansFont);
					else if (field instanceof PDFCheckBox) field.updateAppearances();
					else if (field instanceof PDFRadioGroup) field.updateAppearances();
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
					gaugeImageEmbed = await pdfDoc.embedPng(new Uint8Array(bytes));
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

			if (currentUser?.idAcceso === 1 || currentUser?.idAcceso === 4) {
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
			const blob = new Blob([ManageFiles.toArrayBuffer(pdfBytes)], {
				type: "application/pdf",
			});
			saveAs(
				new Blob([blob], { type: "application/pdf" }),
				`CedulaResultados_${formData.hermesNotificacion || "SinHermes"}.pdf`,
			);
		} catch (err) {
			console.error("CrearConstancia.tsx - Error generando PDF:\n", err);
			mostrarToast("❌ Error al generar el PDF.", "error");
		}
	};

	// Submit -------------------------------------------------------------------
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
			const cedulaResultados: ICedulaResultados = {
				aprobadoDireccion: aprobadoDireccion,
				aprobadoJefeOficina: aprobadoJefeOficina,
				competenciaDesarrollar: formData.cualitativoDesarrollar,
				competenciaReforzar: formData.cualitativoReforzar,
				competenciasSobresaliente: formData.sobresaliente,
				descripcionDesarrollar: formData.cualitativoDesarrollar,
				descripcionReforzar: formData.reforzar,
				edad: formData.edad,
				efectoContratacion: formData.efectos,
				educacionFormal: formData.educacion,
				evaluacionConocimientos: formData.evaluacion,
				experienciaRelacionada: formData.experiencia,
				FKIdProceso: formData.FKIdProceso,
				FKIdTipoCedula: Number(formData.FKIdProceso),
				fechaCedulaResultados: formData.fechaCedulaResultados,
				oficioAutorizacionDeOcupacion: formData.oficio,
				plaza: formData.numPlaza,
				puesto: formData.puesto,
				resultadoProcesoEvaluacion: formData.resultadoFinal,
			};
			const response: IResponseHTTP<string> =
				await new CedulaService().postResultadoCedulaInterna(cedulaResultados);

			if (!response.error) {
				const solicitudData = mapFormDataToSolicitud(formData);
				const respSolicitud: IResponseHTTP<string> =
					await new ProcesoContratacionService().putProcesoContratacion(
						Number(formData.FKIdProceso),
						solicitudData,
					);

				if (respSolicitud && !respSolicitud.error) {
					mostrarToast("✅ Cédula registrada correctamente", "exito");

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

	return (
		<>
			<Toast texto={toast.texto} tipo={toast.tipo} />
			<ButtonShowModalHelp onClick={() => setShowHelp(true)} />
			<ModalHelp
				isOpen={showHelp}
				onClose={() => setShowHelp(false)}
				title="Ayuda"
				warningText="⚠️ Si modificas información cargada automáticamente y presionas 'Guardar' el cambio será irreversible."
				showWarning={true}>
				<h2>Ayuda</h2>
				<p>
					Esta es la ventana de generar cédula de resultados. En el campo id
					ingresa el identificador del candidato (lo puedes encontrar en
					Evaluación) y presiona el icono de lupa para completar la información
					que la base de datos tenga.
				</p>
				<p>
					Presiona el botón crear gráficas para generar las gráficas de
					competencias y habilidades.
				</p>
				<p>
					Al finalizar, puedes exportar la cédula en un PDF o guardar la cédula
					para terminarla más tarde.
				</p>
				<p>
					<strong>
						Nota: si modificas la información de los campos que haya obtenido la
						base de datos (como Nombre, Edad o titular) y presionas "GUARDAR" la
						información se modificará también en la base de datos.
					</strong>
				</p>
			</ModalHelp>

			<main className="ml-65 w-[calc(100%-260px)] px-[4%] py-[2%] overflow-y-auto min-h-screen bg-slate-50">
				<MainHeader title="Cédula de resultados" subtitle="Cédulas" />
				<form onSubmit={handleSubmit} className="flex flex-col gap-6">
					<FormSectionCard title="Datos de la solicitud de contratación">
						<InputField
							id={`${fieldID}-idProceso`}
							label="ID del proceso"
							value={String(formData.FKIdProceso ?? "")}
							onChange={(e) => handleInputChange("FKIdProceso", e.target.value)}
							showSearchButton={true}
							onSearch={handleBuscarCedula}
							searchButtonTitle="Buscar proceso por ID"
						/>
						{(
							[
								{ label: "Hermes:", key: "hermesNotificacion" },
								{ label: "Plaza:", key: "plaza" },
								{ label: "Puesto:", key: "puesto" },
								{ label: "Titular de la plaza:", key: "titular" },
								{ label: "Oficio de autorización:", key: "oficio" },
							] as {
								label: string;
								key: keyof IFormData;
								withButton?: boolean;
							}[]
						).map(({ label, key }) => (
							<InputField
								id={`${fieldID}-${key}-${label}`}
								label={label}
								key={key}
								value={String(formData[key] ?? "")}
								onChange={(e) =>
									handleInputChange(
										key,
										e.target.value as IFormData[typeof key],
									)
								}
							/>
						))}
						<SelectField
							label="Temporalidad:"
							options={[
								{ value: 1, label: "Temporal" },
								{ value: 2, label: "Definitiva" },
							]}
							value={formData.temporalidad}
							onChange={(e) =>
								handleInputChange(
									"temporalidad",
									e as IFormData["temporalidad"],
								)
							}
						/>

						<div>
							<label
								htmlFor="constancia-adscripcion"
								className="form-label-evaluacion">
								Adscripción
							</label>
							<Select<IDependenciaOption>
								inputId="constancia-adscripcion"
								options={dependenciasOptions}
								value={formData.adscripcion}
								onChange={(selected) => {
									handleInputChange("adscripcion.nombre", selected ?? null);
									handleInputChange("adscripcion.zona", selected?.zona ?? "");
								}}
								placeholder="Escribe o selecciona una adscripción"
								isClearable
								isSearchable
							/>
						</div>
						<InputField
							id={`${fieldID}-region-constancia`}
							label="Región:"
							className="form-input"
							value={formData.adscripcion?.zona}
							readOnly
						/>
					</FormSectionCard>
					<FormSectionCard title="Datos del candidato">
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
							<div key={key}>
								<InputField
									id={`${fieldID}-${key}-${label}`}
									label={label}
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
					</FormSectionCard>

					<FormSectionCard title="Datos de la cédula interna">
						{(tipoProceso <= 1 || tipoProceso === null) && (
							<p>Por favor seleccione un ID de proceso</p>
						)}

						{/* Tipo 1: Cédula interna */}
						{tipoProceso === 1 && (
							<>
								<h3 className="section-title">Competencias</h3>
								{(
									[
										{ label: "Sobresaliente", key: "sobresaliente" },
										{ label: "A Reforzar", key: "reforzar" },
										{ label: "A Desarrollar", key: "desarrollar" },
										{ label: "Habilidades Digitales", key: "habilidades" },
										{
											label: "Evaluación de conocimientos",
											key: "evaluacion",
										},
										{ label: "Efectos de contratación", key: "efectos" },
									] as { label: string; key: keyof IFormData }[]
								).map(({ label, key }) => (
									<TextAreaField
										label={label}
										key={key}
										value={String(formData[key] ?? "")}
										onChange={(e) =>
											handleInputChange(
												key,
												e.target.value as IFormData[typeof key],
											)
										}
									/>
								))}

								<SelectField
									label="Resultado final:"
									options={[
										{ value: "Recomendable", label: "Recomendable" },
										{
											value: "Recomendable con observaciones",
											label: "Recomendable con observaciones",
										},
										{ value: "No recomendable", label: "No recomendable" },
									]}
									value={formData.resultadoFinal}
									onChange={(e) => handleInputChange("resultadoFinal", e)}
								/>

								<h3 className="section-title">
									Resultados cualitativos del sistema de evaluación
								</h3>
								{(
									[
										{ label: "Reforzar", key: "cualitativoReforzar" },
										{ label: "Desarrollar", key: "cualitativoDesarrollar" },
									] as { label: string; key: keyof IFormData }[]
								).map(({ label, key }) => (
									<InputField
										label={label}
										key={key}
										value={String(formData[key] ?? "")}
										onChange={(e) =>
											handleInputChange(
												key,
												e.target.value as IFormData[typeof key],
											)
										}
									/>
								))}

								<div className="flex justify-center items-center gap-10 mt-5 flex-wrap">
									<div ref={chartGaugeRef} className="w-100 h-75" />
								</div>
								<div className="flex justify-center items-center gap-10 mt-5 flex-wrap">
									<div ref={chartRadarRef} className="w-100 h-75" />
								</div>

								<div className="col-[span_3] flex justify-start mt-5">
									<CustomButton onClick={handleCrearGraficas}>
										Crear gráficas
									</CustomButton>
									<CustomButton type="submit" variant="save">
										Guardar
									</CustomButton>
									<CustomButton variant="pdf" onClick={handleGenerarPDF}>
										Generar PDF
									</CustomButton>
								</div>

								<div className="fixed top-24 right-5 flex flex-col gap-3 z-50">
									<CustomButton
										className={`btn-aprobacion ${aprobadoJefeOficina ? "activo" : ""}`}
										onClick={() => setAprobadoJefeOficina((v) => !v)}
										disabled={currentUser?.idAcceso !== 1}>
										Jefe de Oficina
									</CustomButton>
									<CustomButton
										className={`btn-aprobacion ${aprobadoDireccion ? "activo" : ""}`}
										onClick={() => setAprobadoDireccion((v) => !v)}
										disabled={currentUser?.idAcceso !== 4}>
										Jefe de Departamento
									</CustomButton>
								</div>
							</>
						)}

						{/* Tipo 2: Cédula externa */}
						{tipoProceso === 2 && (
							<div className="col-[span_3] flex justify-start mt-5">
								<CustomButton variant="save" type="submit">
									Guardar
								</CustomButton>

								<InputField
									id={`${fieldID}-archivoPDF`}
									label={nombreArchivo || "Seleccionar archivo PDF"}
									type="file"
									accept="application/pdf"
									ref={fileInputRef}
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
									<div className="bg-[#f7f7f7] border border-solid border-[#ccc] rounded-[10px] p-4 mb-6 text-center">
										<h3>📄 Documento adjunto: {archivoNombre}</h3>
										<CustomButton
											onClick={() => window.open(archivoUrl, "_blank")}>
											Ver PDF
										</CustomButton>
									</div>
								)}

								{isDragging && (
									<div className="fixed top-0 left-0 w-full h-full bg-[rgba(30,144,255,0.2)] backdrop-filter backdrop-blur-sm flex justify-center items-center animate-[fadeIn_0.3s_ease]">
										<div className="text-[2rem] font-bold text-[#0056b3] bg-[white] border-[3px] border-dashed border-[#007bff] px-16 py-8 rounded-[20px] animate-[bounce_1s_infinite_alternate]">
											📂 Suelta aquí
										</div>
									</div>
								)}
							</div>
						)}
					</FormSectionCard>
				</form>

				<FormSectionCard title="Visualización del PDF de la cédula">
					{(tipoProceso <= 1 || tipoProceso === null) && (
						<p>Por favor seleccione un ID de proceso</p>
					)}

					{/* Visor de PDF */}
					{pdfVisible && archivoBase64 && (
						<div className="mt-7.5 rounded-xl bg-[linear-gradient(145deg,#f9faff,#ffffff)] [box-shadow:0_6px_18px_rgba(0,0,0,0.12)] overflow-hidden [transition:all_0.3s_ease] animate-[fadeIn_0.4s_ease-in-out] w-full max-w-full">
							<div className="flex justify-between items-center bg-[#18529d] px-4.5 py-2.5 text-[15px] font-semibold rounded-tl-xl rounded-tr-xl">
								<div className="pdf-viewer-title">
									<span>📄 {nombreArchivo}</span>
								</div>
								<CustomButton
									onClick={() => {
										const link = document.createElement("a");
										link.href = `data:application/pdf;base64,${archivoBase64}`;
										link.download = nombreArchivo || "Documento.pdf";
										link.click();
									}}
									onMouseEnter={(e) =>
										((
											e.currentTarget as HTMLButtonElement
										).style.backgroundColor = "rgba(255,255,255,0.3)")
									}
									onMouseLeave={(e) =>
										((
											e.currentTarget as HTMLButtonElement
										).style.backgroundColor = "rgba(255,255,255,0.15)")
									}>
									Descargar
								</CustomButton>
							</div>
							<div className="w-full h-200 border-none bg-[#fafafa] justify-between">
								<iframe
									src={`data:application/pdf;base64,${archivoBase64}`}
									title="Vista previa del PDF"
									className="w-full h-full border-none rounded-bl-xl rounded-br-xl"
								/>
							</div>
						</div>
					)}
				</FormSectionCard>
			</main>
		</>
	);
}

export default CrearConstancia;
