import React, {
  useState,
  useEffect,
  useCallback,
  useId,
} from "react";
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
import IResponseHTTP from "@/interfaces/http/Response";
import IDatosOficio from "@/interfaces/oficios/DatosOficio";
import "./GenerarOficio.css";

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
    if (formData.tipoOficio === "4.3 (Licencia)") texto = oficio43Licencia(dataOficio);
    if (formData.tipoOficio === "4.3 (Medica)") texto = oficio43Medica(dataOficio);
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

      <main className="main-content-generar-oficio">
        <div className="page-header-generar-oficio">
          <p className="page-subtitle-generar-oficio">Gestión de documentos</p>
          <h1 className="page-title-generar-oficio">Generar Oficio</h1>
        </div>

        <form className="card-generar-oficio form-grid-generar-oficio" onSubmit={handleSubmit}>

          {/* TIPO DE OFICIO */}
          <div className="form-group-generar-oficio span-3">
            <label htmlFor="generar-tipo-oficio" className="form-label-generar-oficio">
              Tipo de Oficio
            </label>
            <select
              id="generar-tipo-oficio"
              className="form-input-generar-oficio"
              value={formData.tipoOficio}
              onChange={(e) => handleInputChange("tipoOficio", e.target.value)}
            >
              <option value="">Seleccione una opción</option>
              <option value="5.1 y 5.2">5.1 y 5.2</option>
              <option value="4.1 y 4.2">4.1 y 4.2</option>
              <option value="4.3 (Licencia)">4.3 (Licencia)</option>
              <option value="4.3 (Medica)">4.3 (Médica)</option>
              <option value="Cita">Cita</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          {/* DATOS DEL PROCESO */}
          <h3 className="section-title-generar-oficio">Datos del proceso</h3>

          <div className="form-group-generar-oficio">
            <label htmlFor="generar-folio" className="form-label-generar-oficio">
              Folio
            </label>
            <input
              id="generar-folio"
              type="text"
              className="form-input-generar-oficio"
              value={formData.folio}
              onChange={(e) => handleInputChange("folio", e.target.value)}
            />
          </div>

          <div className="form-group-generar-oficio">
            <label htmlFor="generar-plaza" className="form-label-generar-oficio">
              Plaza
            </label>
            <input
              id="generar-plaza"
              type="text"
              className="form-input-generar-oficio"
              value={formData.plaza}
              onChange={(e) => handleInputChange("plaza", e.target.value)}
            />
          </div>

          <div className="form-group-generar-oficio">
            <label htmlFor="generar-motivo" className="form-label-generar-oficio">
              Motivo
            </label>
            <input
              id="generar-motivo"
              type="text"
              className="form-input-generar-oficio"
              value={formData.motivo}
              onChange={(e) => handleInputChange("motivo", e.target.value)}
            />
          </div>

          <div className="form-group-generar-oficio">
            <label htmlFor="generar-titular-plaza" className="form-label-generar-oficio">
              Titular de la Plaza
            </label>
            <input
              id="generar-titular-plaza"
              type="text"
              className="form-input-generar-oficio"
              value={formData.titularPlaza}
              onChange={(e) => handleInputChange("titularPlaza", e.target.value)}
            />
          </div>

          <div className="form-group-generar-oficio">
            <label htmlFor="generar-categoria-origen" className="form-label-generar-oficio">
              Categoría/Puesto (origen)
            </label>
            <input
              id="generar-categoria-origen"
              type="text"
              className="form-input-generar-oficio"
              value={formData.categoriaOrigen}
              onChange={(e) => handleInputChange("categoriaOrigen", e.target.value)}
            />
          </div>

          <div className="form-group-generar-oficio">
            <label htmlFor="generar-categoria-autorizada" className="form-label-generar-oficio">
              Categoría por autorizar
            </label>
            <input
              id="generar-categoria-autorizada"
              type="text"
              className="form-input-generar-oficio"
              value={formData.categoriaAutorizada}
              onChange={(e) => handleInputChange("categoriaAutorizada", e.target.value)}
            />
          </div>

          <div className="form-group-generar-oficio">
            <label htmlFor="generar-candidato" className="form-label-generar-oficio">
              Nombre del candidato
            </label>
            <input
              id="generar-candidato"
              type="text"
              className="form-input-generar-oficio"
              value={formData.nombreCandidato}
              onChange={(e) => handleInputChange("nombreCandidato", e.target.value)}
            />
          </div>

          {/* DATOS DEL OFICIO */}
          <h3 className="section-title-generar-oficio">Datos del oficio</h3>

          <div className="form-group-generar-oficio">
            <label htmlFor="generar-folio-oficio" className="form-label-generar-oficio">
              Folio del oficio
            </label>
            <input
              id="generar-folio-oficio"
              type="text"
              className="form-input-generar-oficio"
              value={formData.folio}
              onChange={(e) => handleInputChange("folio", e.target.value)}
            />
          </div>

          <div className="form-group-generar-oficio">
            <label htmlFor="generar-fecha-lugar" className="form-label-generar-oficio">
              Fecha y lugar
            </label>
            <input
              id="generar-fecha-lugar"
              type="text"
              className="form-input-generar-oficio"
              value={formData.fecha}
              onChange={(e) => handleInputChange("fecha", e.target.value)}
            />
          </div>

          <div className="form-group-generar-oficio">
            <label htmlFor="generar-dirigido" className="form-label-generar-oficio">
              Destinatario
            </label>
            <input
              id="generar-dirigido"
              type="text"
              className="form-input-generar-oficio"
              value={formData.dirigido}
              onChange={(e) => handleInputChange("dirigido", e.target.value)}
            />
          </div>

          <div className="form-group-generar-oficio">
            <label htmlFor="generar-puesto-destinatario" className="form-label-generar-oficio">
              Puesto (destinatario)
            </label>
            <input
              id="generar-puesto-destinatario"
              type="text"
              className="form-input-generar-oficio"
              value={formData.puestoDirigido}
              onChange={(e) => handleInputChange("puestoDirigido", e.target.value)}
            />
          </div>

          {/* TEXT AREAS */}
          <div className="form-group-generar-oficio span-3">
            <label htmlFor="generar-cuerpo-oficio" className="form-label-generar-oficio">
              Cuerpo del Oficio
            </label>
            <textarea
              id="generar-cuerpo-oficio"
              className="form-textarea-generar-oficio tall"
              value={formData.cuerpo}
              onChange={(e) => handleInputChange("cuerpo", e.target.value)}
            />
          </div>

          <div className="form-group-generar-oficio span-3">
            <label htmlFor="generar-copia-carbon" className="form-label-generar-oficio">
              Copia Carbón
            </label>
            <textarea
              id="generar-copia-carbon"
              className="form-textarea-generar-oficio"
              value={formData.copiaCarbon}
              onChange={(e) => handleInputChange("copiaCarbon", e.target.value)}
            />
          </div>

          {/* BOTONES */}
          <div className="action-buttons-generar-oficio">
            <button type="submit" className="btn-guardar-oficio">
              Guardar
            </button>
          </div>

        </form>
      </main>
    </>
  );
}

export default GenerarOficio;