import { useId } from "react";
import { useLocation } from "react-router-dom";

import "./CandidatoNoBeneficiado.css";
import MainHeader from "@/components/header/MainHeader";
import { InputField } from "@/components/input/InputField";

// Interfaces de UI ---------------------------------------------------------
interface ICandidatoNoBeneficiado {
	nombre: string;
	profesion: string;
	region: string;
	resultado: string;
	fechaEvaluacion: string;
	numCarpeta: string;
}
const CANDIDATO_VACIO: ICandidatoNoBeneficiado = {
	nombre: "",
	profesion: "",
	region: "",
	resultado: "",
	fechaEvaluacion: "",
	numCarpeta: "",
};

function CandidatoNoBeneficiado() {
	const fieldID = useId();
	const location = useLocation();

	// Obtencion de datos de query ----------------------------------------------
	const candidato: ICandidatoNoBeneficiado = location.state?.candidato
		? {
				nombre: location.state.candidato.nombre ?? "",
				profesion: location.state.candidato.profesion ?? "",
				region: location.state.candidato.region ?? "",
				resultado: location.state.candidato.resultado ?? "",
				fechaEvaluacion: location.state.candidato.fechaEvaluacion ?? "",
				numCarpeta: location.state.candidato.numCarpeta ?? "",
			}
		: CANDIDATO_VACIO;

	return (
		<>
			<MainHeader title="Candidatos" subtitle="Gestión de candidatos" />

			<div className="contenido-cedula-inner">
				{/* Sin onSubmit: formulario de solo lectura, no envía datos */}
				<form className="form-grid">
					<InputField
						label="Nombre:"
						id={`${fieldID}-nombre`}
						type="text"
						defaultValue={candidato.nombre}
						readOnly
					/>

					<InputField
						label="Profesión:"
						id={`${fieldID}-profesion`}
						type="text"
						defaultValue={candidato.profesion}
						readOnly
					/>

					<InputField
						label="Región:"
						id={`${fieldID}-region`}
						type="text"
						defaultValue={candidato.region}
						readOnly
					/>

					<InputField
						label="Resultado:"
						id={`${fieldID}-resultado`}
						type="text"
						defaultValue={candidato.resultado}
						readOnly
					/>

					<InputField
						label="Fecha de evaluación de competencias:"
						id={`${fieldID}-fechaEvaluacion`}
						type="date"
						defaultValue={candidato.fechaEvaluacion}
						readOnly
					/>

					<InputField
						label="N° carpeta digital:"
						id={`${fieldID}-numCarpeta`}
						type="text"
						defaultValue={String(candidato.numCarpeta)}
						readOnly
					/>
				</form>
			</div>
		</>
	);
}

export default CandidatoNoBeneficiado;
