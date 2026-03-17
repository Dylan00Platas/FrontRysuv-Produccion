import { useState, useContext, useEffect } from "react";
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

function GenerarOficio() {
  const { toast, mostrarToast } = useToast();

  const [tipoOficio, setTipoOficio] = useState("");

  const datosProceso = JSON.parse(
    sessionStorage.getItem("datosOficio") || "{}",
  );

  const [formData, setFormData] = useState({
    idProcesoContratacion: datosProceso.idProcesoContratacion || "",
    folio: datosProceso.folio || "",
    plaza: datosProceso.plaza || "",
    motivo: datosProceso.motivo || "",
    titularPlaza: datosProceso.titularPlaza || "",
    categoriaOrigen: datosProceso.categoriaOrigen || "",
    categoriaAutorizada: datosProceso.categoriaAutorizada || "",
    candidato: datosProceso.candidato || "",
    cuerpo: "",
    copiaCarbon: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    let texto = "";

    if (tipoOficio === "5.1 y 5.2") {
      texto = oficio51y52(formData);
    }

    if (tipoOficio === "4.1 y 4.2") {
      texto = oficio41y42(formData);
    }

    if (tipoOficio === "4.3 (Licencia)") {
      texto = oficio43Licencia(formData);
    }

    if (tipoOficio === "4.3 (Medica)") {
      texto = oficio43Medica(formData);
    }

    if (tipoOficio === "Cita") {
      texto = oficioCita(formData);
    }

    if (texto) {
      setFormData((prev) => ({ ...prev, cuerpo: texto }));
    }

    if (formData.copiaCarbon.trim() === "") {
      setFormData((prev) => ({ ...prev, copiaCarbon: copiaCarbon }));
    }
  }, [
    tipoOficio,
    formData.folio,
    formData.plaza,
    formData.motivo,
    formData.titularPlaza,
    formData.categoriaOrigen,
    formData.categoriaAutorizada,
    formData.candidato,
  ]);

  /* ======================================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const datosBackend = {
        FKIdProcesoContratacion: formData.idProcesoContratacion,
        folio: formData.folioOficio,
        fecha: formData.fechaOficio,
        dirigido: formData.destinatario,
        puestoDirigido: formData.puestoDestinatario,
        machote: formData.cuerpo,
        piePagina: formData.copiaCarbon,
        tipo: tipoOficio,
        // Verificar en backend
        idOficio: 1,
      };
      const respuesta: IResponseHTTP<string> =
        await new ProcesoContratacionService().postOficio(datosBackend);

      mostrarToast("✅ Oficio guardado correctamente", "exito");
    } catch (error) {
      console.error("Error al registrar oficio", error);

      setMensaje({
        texto: "❌ Error al guardar el oficio",
        tipo: "error",
      });
    }
  };

  return (
    <>
      {/* Toast de notificación */}
      <Toast texto={toast.texto} tipo={toast.tipo} />

      <main className="main-content-solicitud">
        {mensaje.texto && (
          <div className={`mensaje-flotante ${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}

        <div className="page-header-solicitud">
          <h1 className="page-title-solicitud">Generar Oficio</h1>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          {/* ======================= TIPO DE OFICIO ======================= */}
          <div
            className="form-group-solicitud"
            style={{ gridColumn: "span 3" }}
          >
            <label className="form-label-solicitud">Tipo de Oficio</label>
            <select
              className="form-input-solicitud"
              value={tipoOficio}
              onChange={(e) => setTipoOficio(e.target.value)}
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

          {/* ======================= DATOS DEL PROCESO ======================= */}
          <h3 className="section-title">Datos del proceso</h3>

          <div className="form-group-solicitud">
            <label className="form-label-solicitud">Folio</label>
            <input
              type="text"
              className="form-input-solicitud"
              value={formData.folio}
              onChange={(e) => handleInputChange("folio", e.target.value)}
            />
          </div>

          <div className="form-group-solicitud">
            <label className="form-label-solicitud">Plaza</label>
            <input
              type="text"
              className="form-input-solicitud"
              value={formData.plaza}
              onChange={(e) => handleInputChange("plaza", e.target.value)}
            />
          </div>

          <div className="form-group-solicitud">
            <label className="form-label-solicitud">Motivo</label>
            <input
              type="text"
              className="form-input-solicitud"
              value={formData.motivo}
              onChange={(e) => handleInputChange("motivo", e.target.value)}
            />
          </div>

          <div className="form-group-solicitud">
            <label className="form-label-solicitud">Titular de la Plaza</label>
            <input
              type="text"
              className="form-input-solicitud"
              value={formData.titularPlaza}
              onChange={(e) =>
                handleInputChange("titularPlaza", e.target.value)
              }
            />
          </div>

          <div className="form-group-solicitud">
            <label className="form-label-solicitud">
              Categoría/Puesto (origen)
            </label>
            <input
              type="text"
              className="form-input-solicitud"
              value={formData.categoriaOrigen}
              onChange={(e) =>
                handleInputChange("categoriaOrigen", e.target.value)
              }
            />
          </div>

          <div className="form-group-solicitud">
            <label className="form-label-solicitud">
              Categoría por autorizar
            </label>
            <input
              type="text"
              className="form-input-solicitud"
              value={formData.categoriaAutorizada}
              onChange={(e) =>
                handleInputChange("categoriaAutorizada", e.target.value)
              }
            />
          </div>

          <div className="form-group-solicitud">
            <label className="form-label-solicitud">Nombre del candidato</label>
            <input
              type="text"
              className="form-input-solicitud"
              value={formData.candidato}
              onChange={(e) => handleInputChange("candidato", e.target.value)}
            />
          </div>

          {/* ======================= DATOS DEL OFICIO ======================= */}
          <h3 className="section-title">Datos del oficio</h3>

          <div className="form-group-solicitud">
            <label className="form-label-solicitud">Folio del oficio</label>
            <input
              type="text"
              className="form-input-solicitud"
              value={formData.folioOficio}
              onChange={(e) => handleInputChange("folioOficio", e.target.value)}
            />
          </div>

          <div className="form-group-solicitud">
            <label className="form-label-solicitud">Fecha y lugar </label>
            <input
              type="text"
              className="form-input-solicitud"
              value={formData.fechaOficio}
              onChange={(e) => handleInputChange("fechaOficio", e.target.value)}
            />
          </div>

          <div className="form-group-solicitud">
            <label className="form-label-solicitud">Destinatario</label>
            <input
              type="text"
              className="form-input-solicitud"
              value={formData.destinatario}
              onChange={(e) =>
                handleInputChange("destinatario", e.target.value)
              }
            />
          </div>

          <div className="form-group-solicitud">
            <label className="form-label-solicitud">
              Puesto (destinatario)
            </label>
            <input
              type="text"
              className="form-input-solicitud"
              value={formData.puestoDestinatario}
              onChange={(e) =>
                handleInputChange("puestoDestinatario", e.target.value)
              }
            />
          </div>

          {/* ======================= TEXT AREAS ======================= */}
          <div
            className="form-group-solicitud"
            style={{ gridColumn: "span 3" }}
          >
            <label className="form-label-solicitud">Cuerpo del Oficio</label>
            <textarea
              className="large-textarea-solicitud2"
              value={formData.cuerpo}
              onChange={(e) => handleInputChange("cuerpo", e.target.value)}
            />
          </div>

          <div
            className="form-group-solicitud"
            style={{ gridColumn: "span 3" }}
          >
            <label className="form-label-solicitud">Copia Carbón</label>
            <textarea
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
