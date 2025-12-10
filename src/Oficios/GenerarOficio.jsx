import { useState, useContext, useEffect } from "react";
import Sidebar from "../Componentes/Sidebar";
import { UsuarioContext } from "../Auxiliares/UsuarioContext.jsx";

function GenerarOficio() {
  const { usuario } = useContext(UsuarioContext);

  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const [tipoOficio, setTipoOficio] = useState(""); // ⬅ Nuevo estado

  const [formData, setFormData] = useState({
    folio: "",
    plaza: "",
    motivo: "",
    titularPlaza: "",
    categoriaOrigen: "",
    categoriaAutorizada: "",
    candidato: "",

    folioOficio: "",
    fechaOficio: "",
    destinatario: "",
    puestoDestinatario: "",
    cuerpo: "",
    copiaCarbon: ""
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /* ========================================================================
     CUANDO SE CAMBIE EL TIPO DE OFICIO, LLENAR AUTOMÁTICAMENTE EL CUERPO
     ======================================================================== */
  useEffect(() => {
    if (tipoOficio === "5.1 y 5.2") {
      const texto = `
En respuesta a la petición recibida a través del Sistema de Administración y Seguimiento de Correspondencia (Hermes) identificada con el folio ${formData.folio}, en relación a la ocupación temporal de la plaza ${formData.plaza}, misma que deriva del ${formData.motivo} del C. ${formData.titularPlaza} quien ocupaba la plaza con categoría ${formData.categoriaOrigen}, al respecto, con fundamento en los artículos 210 y 211 del Estatuto General de la Universidad Veracruzana, para no interferir en el desarrollo de las actividades sustantivas y el cumplimiento de resultados de la Dependencia, se autoriza la ocupación temporal de la plaza como suplente con categoría de ${formData.categoriaAutorizada} al C. ${formData.candidato} a partir del 15 de octubre y hasta el 31 de diciembre de 2025; lo anterior, en tanto se efectúa el proceso, conforme a lo indicado en los numerales 1.4, 5.1 y 5.2 de los “Lineamientos para la ocupación de plazas vacantes del personal administrativo de Confianza” para ocupar la plaza de manera definitiva. No omito mencionar que no se reconocerán compromisos contraídos previos a la presente autorización ni los que excedan el periodo reconocido formalmente.

Se adjunta cédula de resultados.

Por lo anterior, atentamente se solicita, realizar el movimiento de alta en el Subsistema de Recursos Humanos, tal como se establece en la Guía para la captura de movimientos de alta de personal en SsRH.

Sin más por el momento, aprovecho la ocasión para enviarle saludos cordiales.
      `;

      setFormData((prev) => ({
        ...prev,
        cuerpo: texto.trim()
      }));
    }
  }, [tipoOficio, formData.folio, formData.plaza, formData.motivo, formData.titularPlaza, formData.categoriaOrigen, formData.categoriaAutorizada, formData.candidato]);

  /* ======================================================================== */

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Datos del oficio:", formData);

    setMensaje({
      texto: "✅ Oficio guardado correctamente",
      tipo: "exito",
    });

    setTimeout(() => {
      setMensaje({ texto: "", tipo: "" });
    }, 2500);
  };

  return (
    <div className="iniciar-solicitud-page">
      <Sidebar tipoAcceso={usuario.FKidTipoAcceso} />

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
          <div className="form-group-solicitud" style={{ gridColumn: "span 3" }}>
            <label className="form-label-solicitud">Tipo de Oficio</label>
            <select
              className="form-input-solicitud"
              value={tipoOficio}
              onChange={(e) => setTipoOficio(e.target.value)}
            >
              <option value="">Seleccione una opción</option>
              <option value="5.1 y 5.2">5.1 y 5.2</option>
              <option value="4.1 y 4.2">4.1 y 4.2</option>
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
              onChange={(e) => handleInputChange("titularPlaza", e.target.value)}
            />
          </div>

          <div className="form-group-solicitud">
            <label className="form-label-solicitud">Categoría/Puesto (origen)</label>
            <input
              type="text"
              className="form-input-solicitud"
              value={formData.categoriaOrigen}
              onChange={(e) => handleInputChange("categoriaOrigen", e.target.value)}
            />
          </div>

          <div className="form-group-solicitud">
            <label className="form-label-solicitud">Categoría por autorizar</label>
            <input
              type="text"
              className="form-input-solicitud"
              value={formData.categoriaAutorizada}
              onChange={(e) => handleInputChange("categoriaAutorizada", e.target.value)}
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
            <label className="form-label-solicitud">Fecha del oficio</label>
            <input
              type="date"
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
              onChange={(e) => handleInputChange("destinatario", e.target.value)}
            />
          </div>

          <div className="form-group-solicitud">
            <label className="form-label-solicitud">Puesto (destinatario)</label>
            <input
              type="text"
              className="form-input-solicitud"
              value={formData.puestoDestinatario}
              onChange={(e) => handleInputChange("puestoDestinatario", e.target.value)}
            />
          </div>

          {/* ======================= TEXT AREAS ======================= */}
          <div className="form-group-solicitud" style={{ gridColumn: "span 3" }}>
            <label className="form-label-solicitud">Cuerpo del Oficio</label>
            <textarea
              className="large-textarea-solicitud2"
              value={formData.cuerpo}
              onChange={(e) => handleInputChange("cuerpo", e.target.value)}
            />
          </div>

          <div className="form-group-solicitud" style={{ gridColumn: "span 3" }}>
            <label className="form-label-solicitud">Copia Carbón</label>
            <textarea
              className="large-textarea-solicitud3"
              value={formData.copiaCarbon}
              onChange={(e) => handleInputChange("copiaCarbon", e.target.value)}
            />
          </div>

          <div className="form-group-solicitud" style={{ gridColumn: "span 3", textAlign: "center" }}>
            <button type="submit" className="btn-guardar">
              Guardar
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}

export default GenerarOficio;
