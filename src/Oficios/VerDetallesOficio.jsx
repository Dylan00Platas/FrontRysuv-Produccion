import { useState, useContext, useEffect } from "react";
import Sidebar from "../Componentes/Sidebar";
import { UsuarioContext } from "../Auxiliares/UsuarioContext.jsx";

import { saveAs } from "file-saver";
import * as fontkit from "fontkit";
import { PDFDocument, StandardFonts } from "pdf-lib";

function VerDetallesOficio() {
  const { usuario } = useContext(UsuarioContext);

  // Datos cargados desde sessionStorage (cuando el usuario seleccionó un oficio)
  const datos = JSON.parse(sessionStorage.getItem("detallesOficio") || "{}");

  const [formData, setFormData] = useState({
    folioOficio: datos.folio || "",
    fechaOficio: datos.fecha ? datos.fecha.substring(0, 10) : "",
    destinatario: datos.dirigido || "",
    puestoDestinatario: datos.puestoDirigido || "",
    cuerpo: datos.machote || "",
    copiaCarbon: datos.piePagina || ""
  });


const handleGenerarPDF = async () => {
  try {
    const pdfUrl = "/oficio_editable_final.pdf";  // 👉 Vite carga desde /public
    const fontUrl = "/gill.TTF";

    const response = await fetch(pdfUrl);
    console.log("STATUS FETCH:", response.status);

    const existingPdfBytes = await response.arrayBuffer();

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);

    const form = pdfDoc.getForm();

    form.getTextField("folio").setText(formData.folioOficio || "");
    form.getTextField("fecha").setText(formData.fechaOficio || "");
    form.getTextField("dirigido").setText(formData.destinatario || "");
    form.getTextField("puestoDirigido").setText(formData.puestoDestinatario || "");
    form.getTextField("cuerpoOficio").setText(formData.cuerpo || "");
    form.getTextField("copiaCarbon").setText(formData.copiaCarbon || "");

    const fontBytes = await fetch(fontUrl).then(res => res.arrayBuffer());
    const gillSansFont = await pdfDoc.embedFont(fontBytes);

    form.getFields().forEach((field) => {
      field.updateAppearances(gillSansFont);
      try {
        field.acroField.setBorderWidth(0);
        field.acroField.setBorderColor(undefined);
      } catch (e) {}
    });

    form.flatten();

    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `Oficio_${formData.folioOficio}.pdf`;
    link.click();

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("❌ Error generando PDF:", error);
  }
};


  return (
    <div className="iniciar-solicitud-page">
      <Sidebar tipoAcceso={usuario.FKidTipoAcceso} />

      <main className="main-content-solicitud">
        <div className="page-header-solicitud">
          <h1 className="page-title-solicitud">Detalles del Oficio</h1>
        </div>

        <form className="form-grid">

          {/* ======================= DATOS DEL OFICIO ======================= */}
          <h3 className="section-title">Datos del oficio</h3>

          <div className="form-group-solicitud">
            <label className="form-label-solicitud">Folio del oficio</label>
            <input
              type="text"
              className="form-input-solicitud"
              value={formData.folioOficio}
              readOnly
            />
          </div>

          <div className="form-group-solicitud">
            <label className="form-label-solicitud">Fecha del oficio</label>
            <input
              type="date"
              className="form-input-solicitud"
              value={formData.fechaOficio}
              readOnly
            />
          </div>

          <div className="form-group-solicitud">
            <label className="form-label-solicitud">Destinatario</label>
            <input
              type="text"
              className="form-input-solicitud"
              value={formData.destinatario}
              readOnly
            />
          </div>

          <div className="form-group-solicitud">
            <label className="form-label-solicitud">Puesto (destinatario)</label>
            <input
              type="text"
              className="form-input-solicitud"
              value={formData.puestoDestinatario}
              readOnly
            />
          </div>

          {/* ======================= TEXT AREAS NO EDITABLES ======================= */}
          <div className="form-group-solicitud" style={{ gridColumn: "span 3" }}>
            <label className="form-label-solicitud">Cuerpo del Oficio</label>
            <textarea
              className="large-textarea-solicitud2"
              value={formData.cuerpo}
              readOnly
            />
          </div>

          <div className="form-group-solicitud" style={{ gridColumn: "span 3" }}>
            <label className="form-label-solicitud">Copia Carbón</label>
            <textarea
              className="large-textarea-solicitud3"
              value={formData.copiaCarbon}
              readOnly
            />
          </div>

<button
  type="button"
  className="btn-generar"
  onClick={handleGenerarPDF}
>
  Generar PDF
</button> 
        </form>
      </main>
    </div>
  );
}

export default VerDetallesOficio;
