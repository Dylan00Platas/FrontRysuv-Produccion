import { Toast } from "@/components/Alert/Floating/Toast";
import MainHeader from "@/components/header/MainHeader";
import { useToast } from "@/hooks/useToast";
import IResponseHTTP from "@/services/connection/APIResponse";
import {
	IGetOficiosProcesoContratacion,
	IOficioProcesoContratacionBase,
} from "@/schemas/procesos-contratacion/GetOficioProcesoContratacion";
import ProcesoContratacionService from "@/services/ProcesoContratacionService";
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import "./VerOficios.css";

function VerOficios() {
	const { toast } = useToast();
	const navigate = useNavigate();
	const datosIdProceso = JSON.parse(
		sessionStorage.getItem("datosVerOficios") || "{}",
	);
	const idProceso = datosIdProceso.idProceso;
	const [oficios, setOficios] = useState<IOficioProcesoContratacionBase[]>([]);
	const [oficiosFiltrados, setOficiosFiltrados] = useState<
		IOficioProcesoContratacionBase[]
	>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchOficios = async () => {
			try {
				const response: IResponseHTTP<IGetOficiosProcesoContratacion> =
					await new ProcesoContratacionService().getOficio(idProceso);

				if (response.mensaje) {
					const adaptados: IOficioProcesoContratacionBase[] =
						response.mensaje.oficios.map((o, idx) => ({
							id: o.idOficio ?? idx,
							idOficio: o.idOficio,
							FKIdProcesoContratacion: o.FKIdProcesoContratacion,
							tipo: o.tipo || "Sin tipo",
							dirigido: o.dirigido || "Sin destinatario",
							fecha: o.fecha || "Sin fecha",
							folio: o.folio || "",
							machote: o.machote || "",
							piePagina: o.piePagina || "",
							puestoDirigido: o.puestoDirigido || "",
						}));
					setOficios(adaptados);
					setOficiosFiltrados(adaptados);
				}
			} catch (err) {
				console.error("Error al obtener oficios:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchOficios();
	}, [idProceso]);

	// Filtro
	useEffect(() => {
		const filtrados = oficios.filter((o) => {
			const texto = `${o.tipo} ${o.dirigido} ${o.fecha}`.toLowerCase();
			return texto.includes(searchTerm.toLowerCase());
		});
		setOficiosFiltrados(filtrados);
	}, [searchTerm, oficios]);

	const verDetalles = (oficio: IOficioProcesoContratacionBase) => {
		sessionStorage.setItem("detallesOficio", JSON.stringify(oficio));
		navigate("/Ver-detalles-oficio");
	};

	return (
		<>
			<Toast texto={toast.texto} tipo={toast.tipo} />

			<MainHeader
				title="Oficios relacionados a proceso"
				subtitle="Gestión de oficios"
			/>

			<div className="filtros-bar-ver-oficios">
				<div className="filtro-busqueda-ver-oficios">
					<FaSearch className="search-icon-ver-oficios" />
					<input
						type="text"
						placeholder="Buscar..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
			</div>

			{loading ? (
				<p className="mensaje-cargando-ver-oficios">Cargando oficios...</p>
			) : oficiosFiltrados.length === 0 ? (
				<div className="mensaje-vacio-ver-oficios">
					<h2>No hay oficios</h2>
					<p>Este proceso no tiene oficios registrados.</p>
				</div>
			) : (
				<table className="tabla-oficios">
					<thead>
						<tr>
							<th>Tipo</th>
							<th>Dirigido</th>
							<th>Fecha</th>
						</tr>
					</thead>
					<tbody>
						{oficiosFiltrados.map((o) => (
							<tr key={o.idOficio} onClick={() => verDetalles(o)}>
								<td>{o.tipo}</td>
								<td>{o.dirigido}</td>
								<td>{o.fecha}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</>
	);
}

export default VerOficios;
