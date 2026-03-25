import React, {
  useState,
  useContext,
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
import MainHeader from "@/components/header/MainHeader";

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
  const fieldId = useId();

  const datosProceso = JSON.parse(
    sessionStorage.getItem("datosOficio") || "{}",
  );

  const [formData, setFormData] = useState<IFormData>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const data: IFormData = {
      categoriaAutorizada: datosProceso.categoriaAutorizada || "",
      categoriaOrigen: datosProceso.categoriaOrigen || "",
      copiaCarbon: "",
      cuerpo: "",
      dirigido: "",
      fecha: `${yyyy}-${mm}-${dd}`,
      folio: datosProceso.folio || "",
      idProcesoContratacion: datosProceso.idProcesoContratacion || "",
      motivo: datosProceso.motivo || "",
      nombreCandidato: datosProceso.nombreCandidato || "",
      plaza: datosProceso.plaza || "",
      puestoDirigido: "",
      puestoOrigen: "",
      tipoOficio: "",
      titularPlaza: datosProceso.titularPlaza || "",
    };
    return data;
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
      folio: formData.folio,
      plaza: formData.plaza,
      motivo: formData.motivo,
      titularPlaza: formData.titularPlaza,
      categoriaOrigen: formData.categoriaOrigen,
      categoriaAutorizada: formData.categoriaAutorizada,
      nombreCandidato: formData.nombreCandidato,
    };

    if (formData.tipoOficio === "5.1 y 5.2") {
      texto = oficio51y52(dataOficio);
    }

    if (formData.tipoOficio === "4.1 y 4.2") {
      texto = oficio41y42(dataOficio);
    }

    if (formData.tipoOficio === "4.3 (Licencia)") {
      texto = oficio43Licencia(dataOficio);
    }

    if (formData.tipoOficio === "4.3 (Medica)") {
      texto = oficio43Medica(dataOficio);
    }

    if (formData.tipoOficio === "Cita") {
      texto = oficioCita(dataOficio);
    }

    if (texto) {
      setFormData((prev) => ({ ...prev, cuerpo: texto }));
    }

    if (formData.copiaCarbon.trim() === "") {
      setFormData((prev) => ({ ...prev, copiaCarbon: copiaCarbon }));
    }
  }, [
    formData.tipoOficio,
    formData.folio,
    formData.plaza,
    formData.motivo,
    formData.titularPlaza,
    formData.categoriaOrigen,
    formData.categoriaAutorizada,
    formData.nombreCandidato,
  ]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    try {
      const respuesta: IResponseHTTP<string> =
        await new ProcesoContratacionService().postOficio({
          FKIdProcesoContratacion: formData.idProcesoContratacion,
          folio: formData.folio,
          fecha: formData.fecha,
          dirigido: formData.dirigido,
          puestoDirigido: formData.puestoDirigido,
          machote: formData.cuerpo,
          piePagina: formData.copiaCarbon,
          tipo: formData.tipoOficio,
          // Verificar en backend
          idOficio: 1,
        });

      mostrarToast("✅ Oficio guardado correctamente", "exito");
    } catch (error) {
      console.error("Error al registrar oficio", error);

      mostrarToast("❌ Error al guardar el oficio", "error");
    }
  };

  return (
    <>
      {/* Toast de notificación */}
      <Toast texto={toast.texto} tipo={toast.tipo} />

      <main className="main-content-solicitud">
        <MainHeader title="Generar oficio" subtitle="Gestión de oficios" />

        <form className="form-grid" onSubmit={handleSubmit}>
          {/*  TIPO DE OFICIO */}
          <div
            className="form-group-solicitud"
            style={{ gridColumn: "span 3" }}
          >
            <label
              htmlFor={`${fieldId}-tipoOficio`}
              className="form-label-solicitud"
            >
              Tipo de Oficio
            </label>
            <select
              id="generar-tipo-oficio"
              className="form-input-solicitud"
              value={formData.tipoOficio}
              onChange={(e) => {
                formData.tipoOficio = e.target.value;
              }}
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
          <h3 className="section-title">Datos del proceso</h3>

          <div className="form-group-solicitud">
            <label htmlFor="generar-folio" className="form-label-solicitud">
              Folio
            </label>
            <input
              id="generar-folio"
              type="text"
              className="form-input-solicitud"
              value={formData.folio}
              onChange={(e) => handleInputChange("folio", e.target.value)}
            />
          </div>

          <div className="form-group-solicitud">
            <label htmlFor="generar-plaza" className="form-label-solicitud">
              Plaza
            </label>
            <input
              id="generar-plaza"
              type="text"
              className="form-input-solicitud"
              value={formData.plaza}
              onChange={(e) => handleInputChange("plaza", e.target.value)}
            />
          </div>

          <div className="form-group-solicitud">
            <label htmlFor="generar-motivo" className="form-label-solicitud">
              Motivo
            </label>
            <input
              id="generar-motivo"
              type="text"
              className="form-input-solicitud"
              value={formData.motivo}
              onChange={(e) => handleInputChange("motivo", e.target.value)}
            />
          </div>

          <div className="form-group-solicitud">
            <label
              htmlFor="generar-titular-plaza"
              className="form-label-solicitud"
            >
              Titular de la Plaza
            </label>
            <input
              id="generar-titular-plaza"
              type="text"
              className="form-input-solicitud"
              value={formData.titularPlaza}
              onChange={(e) =>
                handleInputChange("titularPlaza", e.target.value)
              }
            />
          </div>

          <div className="form-group-solicitud">
            <label
              htmlFor="generar-categoria-origen"
              className="form-label-solicitud"
            >
              Categoría/Puesto (origen)
            </label>
            <input
              id="generar-categoria-origen"
              type="text"
              className="form-input-solicitud"
              value={formData.categoriaOrigen}
              onChange={(e) =>
                handleInputChange("categoriaOrigen", e.target.value)
              }
            />
          </div>

          <div className="form-group-solicitud">
            <label
              htmlFor="generar-categoria-autorizada"
              className="form-label-solicitud"
            >
              Categoría por autorizar
            </label>
            <input
              id="generar-categoria-autorizada"
              type="text"
              className="form-input-solicitud"
              value={formData.categoriaAutorizada}
              onChange={(e) =>
                handleInputChange("categoriaAutorizada", e.target.value)
              }
            />
          </div>

          <div className="form-group-solicitud">
            <label htmlFor="generar-candidato" className="form-label-solicitud">
              Nombre del candidato
            </label>
            <input
              id="generar-candidato"
              type="text"
              className="form-input-solicitud"
              value={formData.nombreCandidato}
              onChange={(e) =>
                handleInputChange("nombreCandidato", e.target.value)
              }
            />
          </div>

          {/* DATOS DEL OFICIO */}
          <h3 className="section-title">Datos del oficio</h3>

          <div className="form-group-solicitud">
            <label
              htmlFor="generar-folio-oficio"
              className="form-label-solicitud"
            >
              Folio del oficio
            </label>
            <input
              id="generar-folio-oficio"
              type="text"
              className="form-input-solicitud"
              value={formData.folio}
              onChange={(e) => handleInputChange("folio", e.target.value)}
            />
          </div>

          <div className="form-group-solicitud">
            <label
              htmlFor="generar-fecha-lugar"
              className="form-label-solicitud"
            >
              Fecha y lugar{" "}
            </label>
            <input
              id="generar-fecha-lugar"
              type="text"
              className="form-input-solicitud"
              value={formData.fecha}
              onChange={(e) => handleInputChange("fecha", e.target.value)}
            />
          </div>

          <div className="form-group-solicitud">
            <label
              htmlFor="generar-destinatario"
              className="form-label-solicitud"
            >
              Destinatario
            </label>
            <input
              id="generar-dirigido"
              type="text"
              className="form-input-solicitud"
              value={formData.puestoDirigido}
              onChange={(e) =>
                handleInputChange("puestoDirigido", e.target.value)
              }
            />
          </div>

          <div className="form-group-solicitud">
            <label
              htmlFor="generar-puesto-destinatario"
              className="form-label-solicitud"
            >
              Puesto (destinatario)
            </label>
            <input
              id="generar-puesto-destinatario"
              type="text"
              className="form-input-solicitud"
              value={formData.puestoDirigido}
              onChange={(e) =>
                handleInputChange("puestoDirigido", e.target.value)
              }
            />
          </div>

          {/* TEXT AREAS */}
          <div
            className="form-group-solicitud"
            style={{ gridColumn: "span 3" }}
          >
            <label
              htmlFor="generar-cuerpo-oficio"
              className="form-label-solicitud"
            >
              Cuerpo del Oficio
            </label>
            <textarea
              id="generar-cuerpo-oficio"
              className="large-textarea-solicitud2"
              value={formData.cuerpo}
              onChange={(e) => handleInputChange("cuerpo", e.target.value)}
            />
          </div>

          <div
            className="form-group-solicitud"
            style={{ gridColumn: "span 3" }}
          >
            <label
              htmlFor="generar-copia-carbon"
              className="form-label-solicitud"
            >
              Copia Carbón
            </label>
            <textarea
              id="generar-copia-carbon"
              className="large-textarea-solicitud3"
              value={formData.copiaCarbon}
              onChange={(e) => handleInputChange("copiaCarbon", e.target.value)}
            />
          </div>
          <div className="action-buttons">
            <div
              className="form-group-solicitud"
              style={{ gridColumn: "span 3", textAlign: "center" }}
            >
              <button type="submit" className="btn-guardar">
                Guardar
              </button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}

export default GenerarOficio;
