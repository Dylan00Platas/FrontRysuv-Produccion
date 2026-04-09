import React, { useState, useEffect, useCallback, useId } from "react";
import {
	oficio51y52,
	oficio41y42,
	oficio43Licencia,
	oficioCita,
	oficio43Medica,
	copiaCarbon,
} from "@/utils/Constants";
import { Toast } from "@/components/Alert/Floating/Toast";
import { useToast } from "@/hooks/useToast";
import ProcesoContratacionService from "@/services/ProcesoContratacionService";
import IResponseHTTP from "@/services/connection/APIResponse";
import IDatosOficio from "@/interfaces/oficios/DatosOficio";
import MainHeader from "@/components/header/MainHeader";
import "./GenerarOficio.css";
import { SelectField } from "@/components/input/SelectField";
import FormSectionCard from "@/components/card/FormSectionCard";
import { InputField } from "@/components/input/InputField";
import { TextAreaField } from "@/components/input/TextAreaField";
import { CustomButton } from "@/components/button/CustomButton";
import { FaPlus } from "react-icons/fa";

interface IFormData {
	categoriaAutorizada: string;
	categoriaOrigen: string;
	copiaCarbon: string;
	cuerpo: string;
	dirigido: string;
	fecha: string;
	folio: string;
	idProcesoContratacion: number;
	motivo: string;
	nombreCandidato: string;
	plaza: string;
	puestoDirigido: string;
	puestoOrigen: string;
	tipoOficio: string;
	titularPlaza: string;
}

function GenerarOficio() {
	const { toast, mostrarToast } = useToast();

	const datosProceso = JSON.parse(
		sessionStorage.getItem("datosOficio") || "{}",
	);

	const [formData, setFormData] = useState<IFormData>(() => {
		const today = new Date();
		const yyyy = today.getFullYear();
		const mm = String(today.getMonth() + 1).padStart(2, "0");
		const dd = String(today.getDate()).padStart(2, "0");
		return {
			categoriaAutorizada: datosProceso.categoriaAutorizada || "",
			categoriaOrigen: datosProceso.categoriaOrigen || "",
			copiaCarbon: "",
			cuerpo: "",
			dirigido: "",
			fecha: `${yyyy}-${mm}-${dd}`,
			folio: datosProceso.folio || "",
			idProcesoContratacion: datosProceso.idProcesoContratacion || 0,
			motivo: datosProceso.motivo || "",
			nombreCandidato: datosProceso.nombreCandidato || "",
			plaza: datosProceso.plaza || "",
			puestoDirigido: "",
			puestoOrigen: "",
			tipoOficio: "",
			titularPlaza: datosProceso.titularPlaza || "",
		};
	});

	const handleInputChange = useCallback(
		<K extends keyof IFormData>(field: K, value: IFormData[K]) => {
			setFormData((prev) => ({ ...prev, [field]: value }));
		},
		[],
	);

	useEffect(() => {
		let texto = "";
		const dataOficio: IDatosOficio = {
			folio: String(formData.folio),
			plaza: formData.plaza,
			motivo: formData.motivo,
			titularPlaza: formData.titularPlaza,
			categoriaOrigen: formData.categoriaOrigen,
			categoriaAutorizada: formData.categoriaAutorizada,
			nombreCandidato: formData.nombreCandidato,
		};

		if (formData.tipoOficio === "5.1 y 5.2") texto = oficio51y52(dataOficio);
		if (formData.tipoOficio === "4.1 y 4.2") texto = oficio41y42(dataOficio);
		if (formData.tipoOficio === "4.3 (Licencia)")
			texto = oficio43Licencia(dataOficio);
		if (formData.tipoOficio === "4.3 (Medica)")
			texto = oficio43Medica(dataOficio);
		if (formData.tipoOficio === "Cita") texto = oficioCita(dataOficio);

		if (texto) setFormData((prev) => ({ ...prev, cuerpo: texto }));
		if (formData.copiaCarbon.trim() === "") {
			setFormData((prev) => ({ ...prev, copiaCarbon: copiaCarbon }));
		}
	}, [
		formData.tipoOficio,
		formData.folio,
		String(formData.plaza),
		formData.motivo,
		formData.titularPlaza,
		formData.categoriaOrigen,
		formData.categoriaAutorizada,
		formData.nombreCandidato,
	]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			await new ProcesoContratacionService().postOficio({
				FKIdProcesoContratacion: formData.idProcesoContratacion,
				folio: String(formData.folio),
				fecha: formData.fecha,
				dirigido: formData.dirigido,
				puestoDirigido: formData.puestoDirigido,
				machote: formData.cuerpo,
				piePagina: formData.copiaCarbon,
				tipo: formData.tipoOficio,
				idOficio: 1,
			});
			mostrarToast("Oficio guardado correctamente", "exito");
		} catch (error) {
			console.error("Error al registrar oficio", error);
			mostrarToast("Error al guardar el oficio", "error");
		}
	};

	return (
		<>
			<Toast texto={toast.texto} tipo={toast.tipo} />

			<main className="ml-65 w-[calc(100%-260px)] px-[4%] py-[2%] overflow-y-auto">
				<MainHeader title="Generar oficio" subtitle="Gestión de oficios" />

				<form onSubmit={handleSubmit} className="flex flex-col gap-6">
					{/* TIPO DE OFICIO */}

					<SelectField
						label="Tipo de oficio:"
						id="generar-tipo-oficio"
						value={formData.tipoOficio}
						onChange={(e: string | number) =>
							handleInputChange("tipoOficio", e.toString())
						}
						options={[
							{ value: "5.1 y 5.2", label: "5.1 y 5.2" },
							{ value: "4.1 y 4.2", label: "4.1 y 4.2" },
							{ value: "4.3 (Licencia)", label: "4.3 (Licencia)" },
							{ value: "4.3 (Licencia)", label: "4.3 (Licencia)" },
							{ value: "4.3 (Medica)", label: "4.3 (Médica)" },
							{ value: "Cita", label: "Cita" },
							{ value: "Otros", label: "Otros" },
						]}
					/>
					<FormSectionCard title="Datos del proceso">
						<InputField
							label="Folio:"
							id="generar-folio"
							type="text"
							value={formData.folio}
							onChange={(
								e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
							) => handleInputChange("folio", e.target.value)}
						/>

						<InputField
							label="Plaza:"
							id="generar-plaza"
							type="text"
							value={formData.plaza}
							onChange={(
								e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
							) => handleInputChange("plaza", e.target.value)}
						/>

						<InputField
							label="Motivo:"
							id="generar-motivo"
							type="text"
							value={formData.motivo}
							onChange={(
								e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
							) => handleInputChange("motivo", e.target.value)}
						/>
						<InputField
							label="Titular de la plaza:"
							id="generar-titular-plaza"
							type="text"
							value={formData.titularPlaza}
							onChange={(
								e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
							) => handleInputChange("titularPlaza", e.target.value)}
						/>

						<InputField
							label="Categoría/Puesto (origen):"
							id="generar-categoria-origen"
							type="text"
							value={formData.categoriaOrigen}
							onChange={(
								e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
							) => handleInputChange("categoriaOrigen", e.target.value)}
						/>

						<InputField
							label="Categoría por autorizar:"
							id="generar-categoria-autorizada"
							type="text"
							value={formData.categoriaAutorizada}
							onChange={(
								e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
							) => handleInputChange("categoriaAutorizada", e.target.value)}
						/>

						<InputField
							label="Nombre del candidato:"
							id="generar-candidato"
							type="text"
							value={formData.nombreCandidato}
							onChange={(
								e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
							) => handleInputChange("nombreCandidato", e.target.value)}
						/>
					</FormSectionCard>

					<FormSectionCard title="Datos del oficio">
						<InputField
							label="Folio del oficio:"
							id="generar-folio-oficio"
							type="text"
							value={formData.folio}
							onChange={(e) => handleInputChange("folio", e.target.value)}
						/>

						<InputField
							label="Fecha y lugar"
							id="generar-fecha-lugar"
							type="text"
							value={formData.fecha}
							onChange={(e) => handleInputChange("fecha", e.target.value)}
						/>

						<InputField
							label="Destinatario:"
							id="generar-dirigido"
							type="text"
							value={formData.dirigido}
							onChange={(e) => handleInputChange("dirigido", e.target.value)}
						/>

						<InputField
							label="Puesto (destinatario):"
							id="generar-puesto-destinatario"
							type="text"
							value={formData.puestoDirigido}
							onChange={(e) =>
								handleInputChange("puestoDirigido", e.target.value)
							}
						/>

						<TextAreaField
							label="Cuerpo del oficio:"
							id="generar-cuerpo-oficio"
							value={formData.cuerpo}
							onChange={(e) => handleInputChange("cuerpo", e.target.value)}
						/>

						<TextAreaField
							label="Copia carbón:"
							id="generar-copia-carbon"
							value={formData.copiaCarbon}
							onChange={(e) => handleInputChange("copiaCarbon", e.target.value)}
						/>
					</FormSectionCard>

					<div className="flex items-center justify-end gap-3 pb-10 max-[900px]:justify-center">
						<CustomButton variant="cancel" onClick={() => {}}>
							Cancelar
						</CustomButton>

						<CustomButton
							type="submit"
							variant="save"
							icon={<FaPlus />}
							onClick={() => {}}>
							Guardar
						</CustomButton>
					</div>
				</form>
			</main>
		</>
	);
}

export default GenerarOficio;
