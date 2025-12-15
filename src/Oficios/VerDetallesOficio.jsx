import { useState, useContext, useEffect } from "react";
import Sidebar from "../Componentes/Sidebar";
import { UsuarioContext } from "../Auxiliares/UsuarioContext.jsx";

import { saveAs } from "file-saver";
import * as fontkit from "fontkit";
import { PDFDocument, StandardFonts } from "pdf-lib";

function VerDetallesOficio() {
  const { usuario } = useContext(UsuarioContext);


  const datos = JSON.parse(sessionStorage.getItem("detallesOficio") || "{}");

  const [formData, setFormData] = useState({
    folioOficio: datos.folio || "",
    fechaOficio: datos.fecha || "",
    destinatario: datos.dirigido || "",
    puestoDestinatario: datos.puestoDirigido || "",
    cuerpo: datos.machote || "",
    copiaCarbon: datos.piePagina || ""
  });


const handleGenerarPDF = async () => {
  try {
    const pdfUrl = "/oficioEditable3.pdf";
    const fontUrl = "/gill.TTF";

    const response = await fetch(pdfUrl);
    const existingPdfBytes = await response.arrayBuffer();

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);

    const form = pdfDoc.getForm();

    const fontBytes = await fetch(fontUrl).then(res => res.arrayBuffer());
    const gillSans = await pdfDoc.embedFont(fontBytes);

    form.getTextField("dirigido").setText(formData.destinatario || "");
    form.getTextField("puestoDirigido").setText(formData.puestoDestinatario || "");
    form.getTextField("copiaCarbon").setText(formData.copiaCarbon || "");
    form.getTextField("folio").setText("");
    form.getTextField("fecha").setText("");

    const page = pdfDoc.getPages()[0];

    function drawJustifiedText(page, text, x, y, width, font, fontSize, lineHeight) {
      const paragraphs = text
        .replace(/\r\n/g, "\n")
        .split(/\n{1,}/);

      let cursorY = y;

      paragraphs.forEach((paragraph) => {
        if (!paragraph.trim()) {
          cursorY -= lineHeight;
          return;
        }

        const words = paragraph.split(" ");
        let line = "";
        let lines = [];

        words.forEach((word) => {
          const testLine = line + word + " ";
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);

          if (testWidth > width && line !== "") {
            lines.push(line.trim());
            line = word + " ";
          } else {
            line = testLine;
          }
        });

        lines.push(line.trim());

        lines.forEach((lineText, index) => {
          const isLastLine = index === lines.length - 1;
          const wordsInLine = lineText.split(" ");

          if (isLastLine || wordsInLine.length === 1) {
            page.drawText(lineText, {
              x,
              y: cursorY,
              size: fontSize,
              font,
            });
          } else {
            const textWidth = font.widthOfTextAtSize(
              lineText.replace(/ /g, ""),
              fontSize
            );

            const totalSpaces = wordsInLine.length - 1;
            const spaceWidth = (width - textWidth) / totalSpaces;

            let cursorX = x;

            wordsInLine.forEach((word) => {
              page.drawText(word, {
                x: cursorX,
                y: cursorY,
                size: fontSize,
                font,
              });

              cursorX += font.widthOfTextAtSize(word, fontSize) + spaceWidth;
            });
          }

          cursorY -= lineHeight;
        });

        cursorY -= lineHeight * 0.8;
      });
    }

     form.flatten();



    function drawRightAlignedText(page, text, rightX, y, font, fontSize) {
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      page.drawText(text, {
        x: rightX - textWidth,
        y,
        size: fontSize,
        font,
      });
    }

    drawRightAlignedText(
      page,
      formData.folioOficio,
      553,
      650,
      gillSans,
      11
    );

    drawRightAlignedText(
      page,
      formData.fechaOficio,
      553,
      636,
      gillSans,
      11
    );

    drawJustifiedText(
      page,
      formData.cuerpo,
      120,
      560,
      450,
      gillSans,
      11,
      14
    );

    form.getFields().forEach((field) => {
      try {
        field.updateAppearances(gillSans);
        field.acroField.setBorderWidth(0);
      } catch {}
    });

   
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
              type="text"
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
