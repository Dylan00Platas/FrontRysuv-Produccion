import { useEffect, useState, useRef } from "react";
import { FaSearch, FaTimesCircle, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

import "./Panorama.css";
import CedulaService from "@/services/CedulaService";
import IResponseHTTP from "@/services/connection/APIResponse";
import {
	ICedulaBase,
	IGetCedulas,
	IGetCedulasActivas,
} from "@/schemas/cedulas/GetCedula";
import ILabelValue from "@/interfaces/LabelValue";
import ProcesoContratacionService from "@/services/ProcesoContratacionService";
import {
	IGetProcesosContratacion,
	IProcesoContratacionBase,
} from "@/schemas/procesos-contratacion/GetProcesoContratacion";
import MainHeader from "@/components/header/MainHeader";

// Utils -------------------------------------------------------------------
function mapEstado(fk: number): string {
	const estados: Record<number, string> = {
		1: "Citado",
		2: "Evaluado",
		3: "En procesamiento",
		4: "En revisión",
		5: "En firma",
		6: "Notificado",
		7: "Cancelado",
		8: "Terminado",
		13: "Inicio procesamiento",
		14: "Procesamiento oficio",
		15: "Fin procesamiento",
	};
	return estados[fk] ?? "Por iniciar";
}

function uniqueOptions(values: string[]): ILabelValue[] {
	return [...new Set(values)].map((v) => ({ value: v, label: v }));
}

// Interfaces de UI ---------------------------------------------------------
interface IProcesoAdaptado {
	idProceso: number;
	folio: string;
	hermesNotificacion: string;
	nombreCandidato: string;
	puesto: string;
	estado: string;
	fechaRecibido: string;
	// TODO-Desarrollo: reemplazar con campo real de dependencia
	dependencia: string;
}

interface ICompetencia {
	idProceso: number | null;
	nombreCandidato: string;
	competenciaReforzar: string;
	competenciaDesarrollar: string;
	capacitado: boolean;
}

interface IFiltrosEvaluacion {
	estado: ILabelValue | null;
	dependencia: ILabelValue | null;
}

// Constantes ----------------------------------------------------------------
const ESTADOS_OCULTOS = ["Terminado", "Cancelado"] as const;

const OPCIONES_FILTRO_CEDULA: ILabelValue[] = [
	{
		value: "Pendiente de validar Jefe de Departamento",
		label: "Pendiente de validar Jefe de Departamento",
	},
	{
		value: "Pendiente de validar Jefe de Oficina",
		label: "Pendiente de validar Jefe de Oficina",
	},
	{ value: "Todas las cédulas", label: "Todas las cédulas" },
];

function Panorama() {
	const navigate = useNavigate();

	// Estados de Evaluaciones
	const [evaluaciones, setEvaluaciones] = useState<IProcesoAdaptado[]>([]);
	const [evaluacionesFiltradas, setEvaluacionesFiltradas] = useState<
		IProcesoAdaptado[]
	>([]);
	const [estadoOptions, setEstadoOptions] = useState<ILabelValue[]>([]);
	const [dependenciaOptions, setDependenciaOptions] = useState<ILabelValue[]>(
		[],
	);
	const [filtros, setFiltros] = useState<IFiltrosEvaluacion>({
		estado: null,
		dependencia: null,
	});
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(true);
	const [evaluacionesRaw, setEvaluacionesRaw] = useState<
		IProcesoContratacionBase[]
	>([]);

	// Estados de Cédulas
	const [cedulas, setCedulas] = useState<ICedulaBase[]>([]);
	const [cedulasFiltradas, setCedulasFiltradas] = useState<ICedulaBase[]>([]);
	const [filtroCedula, setFiltroCedula] = useState<ILabelValue>(
		OPCIONES_FILTRO_CEDULA[0],
	);
	const [dependenciaCedulaOptions, setDependenciaCedulaOptions] = useState<
		ILabelValue[]
	>([]);
	const [dependenciaCedulaFiltro, setDependenciaCedulaFiltro] =
		useState<ILabelValue | null>(null);
	const [searchCedula, setSearchCedula] = useState("");
	const [loadingCedulas, setLoadingCedulas] = useState(true);

	// Estados de Competencias
	const [competencias, setCompetencias] = useState<ICompetencia[]>([]);
	const [loadingCompetencias, setLoadingCompetencias] = useState(true);

	// Referencias a secciones
	const evaluacionesRef = useRef<HTMLElement>(null);
	const cedulasRef = useRef<HTMLElement>(null);
	const competenciasRef = useRef<HTMLElement>(null);

	// Cargar Evaluaciones ----------------------------------------------------
	useEffect(() => {
		const fetchEvaluaciones = async () => {
			try {
				const data: IResponseHTTP<IGetProcesosContratacion> =
					await new ProcesoContratacionService().getProcesosContratacion();

				setEvaluacionesRaw(data.mensaje.procesos);

				const dataFiltrada = data.mensaje.procesos.filter(
					(s) => s.FKIdAcceso !== null,
				);

				const adaptadas: IProcesoAdaptado[] = dataFiltrada.map((s, idx) => ({
					idProceso: s.idProceso ?? idx,
					folio: s.folio ?? "",
					hermesNotificacion: s.hermesNotificacion ?? "",
					nombreCandidato: s.nombreCandidato ?? "Sin candidato",
					puesto: s.categoriaPuestoOrigen ?? "Sin puesto",
					estado: mapEstado(s.FKIdEstadoProcesoContratacion),
					fechaRecibido: s.fechaRecibido
						? new Date(s.fechaRecibido).toLocaleDateString("es-MX")
						: "Sin fecha",
					// TODO-Desarrollo: reemplazar con campo real de dependencia
					dependencia: s.nombreCandidato ?? "Sin dependencia",
				}));

				setEvaluaciones(adaptadas);
				setEvaluacionesFiltradas(
					adaptadas.filter(
						(e) =>
							!ESTADOS_OCULTOS.includes(
								e.estado as (typeof ESTADOS_OCULTOS)[number],
							),
					),
				);
				setEstadoOptions(uniqueOptions(adaptadas.map((e) => e.estado)));
				setDependenciaOptions(
					uniqueOptions(adaptadas.map((e) => e.dependencia)),
				);
			} catch (error) {
				console.error("Error cargando evaluaciones:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchEvaluaciones();
	}, []);

	// Filtros de Evaluaciones -------------------------------------------------
	useEffect(() => {
		let filtradas = [...evaluaciones];

		// Si no hay filtro de estado activo, ocultar terminados y cancelados
		if (!filtros.estado) {
			filtradas = filtradas.filter(
				(e) =>
					!ESTADOS_OCULTOS.includes(
						e.estado as (typeof ESTADOS_OCULTOS)[number],
					),
			);
		} else {
			filtradas = filtradas.filter((e) => e.estado === filtros.estado!.value);
		}

		if (filtros.dependencia) {
			filtradas = filtradas.filter(
				(e) => e.dependencia === filtros.dependencia!.value,
			);
		}

		if (searchTerm.trim()) {
			const term = searchTerm.toLowerCase();
			filtradas = filtradas.filter(
				(e) =>
					e.nombreCandidato.toLowerCase().includes(term) ||
					e.folio.toLowerCase().includes(term) ||
					e.puesto.toLowerCase().includes(term),
			);
		}

		setEvaluacionesFiltradas(filtradas);
	}, [filtros, searchTerm, evaluaciones]);

	// Cargar Cédulas (solo FKIdTipoCedula: 2) ----------------------------------
	useEffect(() => {
		const cargarCedulas = async () => {
			try {
				setLoadingCedulas(true);
				const response: IResponseHTTP<IGetCedulas> =
					await new CedulaService().getCedulasInternas();

				const cedulasTipo2 = response.mensaje.cedulas.filter(
					(c) => c.FKIdTipoCedula === 2,
				);

				setCedulas(cedulasTipo2);
				setDependenciaCedulaOptions(
					uniqueOptions(cedulasTipo2.map((c) => c.dependencia ?? "N/A")),
				);
			} catch (err) {
				console.error("Error cargando cédulas:", err);
			} finally {
				setLoadingCedulas(false);
			}
		};

		cargarCedulas();
	}, []);

	// Filtros de Cédulas -------------------------------------------------------
	useEffect(() => {
		let filtradas = [...cedulas];

		switch (filtroCedula?.value) {
			case "Pendiente de validar Jefe de Departamento":
				filtradas = filtradas.filter(
					(c) =>
						c.FKIdTipoCedula === 2 &&
						c.aprobadoJefeOficina === true &&
						(c.aprobadoDireccion === null || c.aprobadoDireccion === false),
				);
				break;
			case "Pendiente de validar Jefe de Oficina":
				filtradas = filtradas.filter(
					(c) =>
						c.FKIdTipoCedula === 2 &&
						(c.aprobadoJefeOficina === null || c.aprobadoJefeOficina === false),
				);
				break;
			case "Todas las cédulas":
			default:
				filtradas = filtradas.filter((c) => c.FKIdTipoCedula === 2);
				break;
		}

		if (dependenciaCedulaFiltro) {
			filtradas = filtradas.filter(
				(c) => c.dependencia === dependenciaCedulaFiltro.value,
			);
		}

		if (searchCedula.trim()) {
			const term = searchCedula.toLowerCase();
			filtradas = filtradas.filter(
				(c) =>
					(c.hermesNotificacion ?? "").toLowerCase().includes(term) ||
					(c.nombreCandidato ?? "").toLowerCase().includes(term) ||
					(c.adscripcion?.nombre ?? "").toLowerCase().includes(term) ||
					(c.puesto ?? "").toLowerCase().includes(term),
			);
		}

		setCedulasFiltradas(filtradas);
	}, [cedulas, filtroCedula, dependenciaCedulaFiltro, searchCedula]);

	// Cargar Competencias -----------------------------------------------------
	const cargarCompetencias = async () => {
		try {
			setLoadingCompetencias(true);
			const data: IResponseHTTP<IGetCedulasActivas> =
				await new CedulaService().getCedulasInternasActivas();

			const adaptadas: ICompetencia[] = data.mensaje.cedulas
				.filter((c) => c.FKIdTipoCedula !== 1 && c.capacitado !== true)
				.map((c) => ({
					idProceso: c.FKIdProceso ?? null,
					nombreCandidato: c.nombreCandidato ?? "N/A",
					competenciaReforzar: c.competenciaReforzar ?? "N/A",
					competenciaDesarrollar: c.competenciaDesarrollar ?? "N/A",
					capacitado: false,
				}));

			setCompetencias(adaptadas);
		} catch (err) {
			console.error("Error cargando competencias de candidatos:", err);
		} finally {
			setLoadingCompetencias(false);
		}
	};

	useEffect(() => {
		cargarCompetencias();
	}, []);

	// Guardar competencias capacitadas --------------------------------------
	const handleGuardarCapacitados = async () => {
		try {
			const seleccionados = competencias.filter((c) => c.capacitado);

			for (const candidato of seleccionados) {
				if (candidato.idProceso !== null) {
					await new ProcesoContratacionService().putProcesoContratacion(
						candidato.idProceso,
						{ candidato: true },
					);
				} else {
					console.warn("Candidato sin idProceso:", candidato);
				}
			}

			await cargarCompetencias();
		} catch (error) {
			console.error("Error al capacitar candidatos:", error);
			alert("Ocurrió un error al guardar los candidatos.");
		}
	};

	// Exportar competencias a Excel -------------------------------------------
	const handleExportarExcel = async () => {
		const { default: xlsx } = await import("xlsx-js-style");

		const fecha = new Date().toLocaleDateString("es-MX").replaceAll("/", "-");

		const datosProcesados = competencias.map((c) => ({
			nombre: c.nombreCandidato,
			reforzar: c.competenciaReforzar
				? c.competenciaReforzar.split(",").map((x) => x.trim())
				: [],
			desarrollar: c.competenciaDesarrollar
				? c.competenciaDesarrollar.split(",").map((x) => x.trim())
				: [],
		}));

		const maxReforzar = Math.max(
			...datosProcesados.map((d) => d.reforzar.length),
			0,
		);
		const maxDesarrollar = Math.max(
			...datosProcesados.map((d) => d.desarrollar.length),
			0,
		);

		const headers = [
			"Nombre del Candidato",
			...Array.from(
				{ length: maxReforzar },
				(_, i) => `Competencia a Reforzar ${i + 1}`,
			),
			...Array.from(
				{ length: maxDesarrollar },
				(_, i) => `Competencia a Desarrollar ${i + 1}`,
			),
		];

		const rows = datosProcesados.map((d) => [
			d.nombre,
			...Array.from({ length: maxReforzar }, (_, i) => d.reforzar[i] ?? ""),
			...Array.from(
				{ length: maxDesarrollar },
				(_, i) => d.desarrollar[i] ?? "",
			),
		]);

		const ws = xlsx.utils.aoa_to_sheet([headers, ...rows]);
		ws["!cols"] = headers.map(() => ({ wch: 25 }));

		// Estilo de encabezado
		const headerStyle = {
			font: { bold: true, color: { rgb: "FFFFFF" } },
			alignment: { horizontal: "center" },
			fill: { patternType: "solid", fgColor: { rgb: "008000" } },
		};
		headers.forEach((_, colIdx) => {
			const cellAddress = xlsx.utils.encode_cell({ r: 0, c: colIdx });
			if (ws[cellAddress]) ws[cellAddress].s = headerStyle;
		});

		const wb = xlsx.utils.book_new();
		xlsx.utils.book_append_sheet(wb, ws, "Candidatos");
		xlsx.writeFile(wb, `Tabla Candidatos - ${fecha}.xlsx`);
	};

	// Helpers de UI -----------------------------------------------------------
	const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
		ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	const handleToggleCapacitado = (idx: number, checked: boolean) => {
		setCompetencias((prev) =>
			prev.map((item, i) =>
				i === idx ? { ...item, capacitado: checked } : item,
			),
		);
	};

	return (
		<main className="ml-65 w-[calc(100%-260px)] px-[4%] py-[2%] overflow-y-auto min-h-screen bg-slate-50">
			<MainHeader title="Panorama general" subtitle="Estadísticas" />

			<div className="main-content-inner">
				{/* SECCIÓN EVALUACIONES */}
				<section className="stats-section" ref={evaluacionesRef}>
					<h2 className="section-title">📋 Evaluaciones</h2>

					<div className="filtros-combobox">
						<div>
							<p>Estado</p>
							<Select
								options={estadoOptions}
								value={filtros.estado}
								onChange={(v) => setFiltros((p) => ({ ...p, estado: v }))}
								isClearable
							/>
						</div>
						<div>
							<p>Dependencia</p>
							<Select
								options={dependenciaOptions}
								value={filtros.dependencia}
								onChange={(v) => setFiltros((p) => ({ ...p, dependencia: v }))}
								isClearable
							/>
						</div>
						<div className="filtro-busqueda" style={{ marginTop: "2.8%" }}>
							<FaSearch className="search-icon" />
							<input
								type="text"
								placeholder="Buscar..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
					</div>

					{loading ? (
						<p>Cargando evaluaciones...</p>
					) : (
						<table className="tabla-candidatos">
							<thead>
								<tr>
									<th>Folio/Hermés</th>
									<th>Nombre</th>
									<th>Puesto</th>
									<th>Fecha recibido</th>
									<th>Dependencia</th>
									<th style={{ width: "15%" }}>Estado</th>
								</tr>
							</thead>
							<tbody>
								{evaluacionesFiltradas.map((e) => (
									<tr
										key={e.idProceso} // FIX: era e.id (campo inexistente)
										title="Doble clic para abrir en evaluación"
										onDoubleClick={() => {
											const procesoOriginal = evaluacionesRaw.find(
												(s) => s.idProceso === e.idProceso, // FIX: era e.id
											);
											navigate("/evaluacion", { state: procesoOriginal });
										}}
										style={{ cursor: "pointer" }}>
										<td>{e.folio + "/ " + e.hermesNotificacion}</td>
										<td>{e.nombreCandidato}</td>{" "}
										{/* FIX: era e.nombre (campo inexistente) */}
										<td>{e.puesto}</td>
										<td>{e.fechaRecibido}</td>
										<td>{e.dependencia}</td>
										<td>
											<span
												className={`estado-badge ${e.estado.toLowerCase().replace(/\s/g, "")}`}>
												{e.estado}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</section>

				<hr className="section-divider" />

				{/* SECCIÓN CÉDULAS */}
				<section className="stats-section" ref={cedulasRef}>
					<h2 className="section-title">📑 Cédulas</h2>

					<div className="filtros-combobox">
						<div>
							<p>Tipo de filtro</p>
							<Select
								options={OPCIONES_FILTRO_CEDULA}
								value={filtroCedula}
								onChange={(v) => v && setFiltroCedula(v)}
							/>
						</div>
						<div>
							<p>Dependencia</p>
							<Select
								options={dependenciaCedulaOptions}
								value={dependenciaCedulaFiltro}
								onChange={setDependenciaCedulaFiltro}
								isClearable
							/>
						</div>
						<div className="filtro-busqueda" style={{ marginTop: "2.8%" }}>
							<FaSearch className="search-icon" />
							<input
								type="text"
								placeholder="Buscar..."
								value={searchCedula}
								onChange={(e) => setSearchCedula(e.target.value)}
							/>
						</div>
					</div>

					{loadingCedulas ? (
						<p>Cargando cédulas...</p>
					) : (
						<table className="tabla-candidatos">
							<thead>
								<tr>
									<th>Folio/Hermés</th>
									<th>Nombre candidato</th>
									<th>Dependencia</th>
									<th>Puesto</th>
									<th>Aprobado jefe oficina</th>
									<th>Aprobado jefe Departamento</th>
								</tr>
							</thead>
							<tbody>
								{cedulasFiltradas.map((c) => (
									<tr
										key={c.idCedula}
										onClick={() =>
											navigate("/crear-cedula", { state: { cedula: c } })
										}
										style={{ cursor: "pointer" }}>
										{/* FIX: concatenación con paréntesis para correcta precedencia de || */}
										<td>
											{(c.folio ?? "") + "/" + (c.hermesNotificacion ?? "")}
										</td>
										<td>{c.nombreCandidato ?? "N/A"}</td>
										<td>{c.adscripcion?.nombre ?? "N/A"}</td>
										<td>{c.puesto ?? "N/A"}</td>
										<td>
											{c.aprobadoJefeOficina ? (
												<FaCheckCircle style={{ color: "green" }} />
											) : (
												<FaTimesCircle style={{ color: "red" }} />
											)}
										</td>
										<td>
											{c.aprobadoDireccion === true ? (
												<FaCheckCircle style={{ color: "green" }} />
											) : (
												<FaTimesCircle style={{ color: "red" }} />
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</section>

				<hr className="section-divider" />

				{/* SECCIÓN COMPETENCIAS */}
				<section className="stats-section" ref={competenciasRef}>
					<h2 className="section-title">💡 Competencias de candidatos</h2>

					{loadingCompetencias ? (
						<p>Cargando competencias...</p>
					) : competencias.length === 0 ? (
						<p>No se encontraron competencias activas.</p>
					) : (
						<>
							<table className="tabla-candidatos">
								<thead>
									<tr>
										<th>Nombre del candidato</th>
										<th>Competencias a Reforzar</th>
										<th>Competencias a Desarrollar</th>
										<th>Capacitado</th>
									</tr>
								</thead>
								<tbody>
									{competencias.map((c, idx) => (
										// FIX: key con idx como fallback seguro; idProceso puede ser null
										<tr key={c.idProceso ?? `comp-${idx}`}>
											<td>{c.nombreCandidato}</td>
											<td>{c.competenciaReforzar}</td>
											<td>{c.competenciaDesarrollar}</td>
											<td>
												<input
													type="checkbox"
													checked={c.capacitado}
													onChange={(e) =>
														handleToggleCapacitado(idx, e.target.checked)
													}
												/>
											</td>
										</tr>
									))}
								</tbody>
							</table>

							<div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
								{competencias.some((c) => c.capacitado) && (
									<button
										className="boton-guardar"
										onClick={handleGuardarCapacitados}>
										Guardar
									</button>
								)}
								<button
									className="boton-exportar"
									onClick={handleExportarExcel}>
									Exportar
								</button>
							</div>
						</>
					)}
				</section>
			</div>

			{/* Botones de navegación flotantes */}
			<div className="floating-buttons">
				<button onClick={() => scrollToSection(evaluacionesRef)}>
					📋 Evaluaciones
				</button>
				<button onClick={() => scrollToSection(cedulasRef)}>📑 Cédulas</button>
				<button onClick={() => scrollToSection(competenciasRef)}>
					💡 Competencias
				</button>
			</div>
		</main>
	);
}

export default Panorama;
