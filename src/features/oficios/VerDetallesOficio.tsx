import { useState, useContext } from "react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { PDFDocument, PDFFont, PDFPage } from "pdf-lib";
import * as fontkit from "fontkit";
import ManageFiles from "@/utils/ManageFiles";
import MainHeader from "@/components/header/MainHeader";

function VerDetallesOficio() {
  const datos = JSON.parse(sessionStorage.getItem("detallesOficio") || "{}");

  const [formData, setFormData] = useState({
    folioOficio: datos.folio || "",
    fechaOficio: datos.fecha || "",
    destinatario: datos.dirigido || "",
    puestoDestinatario: datos.puestoDirigido || "",
    cuerpo: datos.machote || "",
    copiaCarbon: datos.piePagina || "",
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

      const fontBytes = await fetch(fontUrl).then((res) => res.arrayBuffer());
      const gillSans = await pdfDoc.embedFont(fontBytes);

      form.getTextField("dirigido").setText(formData.destinatario || "");
      form
        .getTextField("puestoDirigido")
        .setText(formData.puestoDestinatario || "");
      form.getTextField("copiaCarbon").setText(formData.copiaCarbon || "");
      form.getTextField("folio").setText("");
      form.getTextField("fecha").setText("");

      const page = pdfDoc.getPages()[0];

      function drawJustifiedText(
        page: PDFPage,
        text: string,
        x: number,
        y: number,
        width: number,
        font: PDFFont,
        fontSize: number,
        lineHeight: number,
      ) {
        const paragraphs = text.replace(/\r\n/g, "\n").split(/\n{1,}/);

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
                fontSize,
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

      function drawRightAlignedText(
        page: PDFPage,
        text: string,
        rightX: number,
        y: number,
        font: PDFFont,
        fontSize: number,
      ) {
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        page.drawText(text, {
          x: rightX - textWidth,
          y,
          size: fontSize,
          font,
        });
      }

      drawRightAlignedText(page, formData.folioOficio, 553, 650, gillSans, 11);

      drawRightAlignedText(page, formData.fechaOficio, 553, 636, gillSans, 11);

      drawJustifiedText(page, formData.cuerpo, 120, 560, 450, gillSans, 11, 14);

      form.getFields().forEach((field) => {
        field.updateAppearances(gillSans);
        field.acroField.setBorderWidth(0);
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([ManageFiles.toArrayBuffer(pdfBytes)], {
        type: "application/pdf",
      });
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

  const handleGenerarWord = async () => {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: `Folio: ${formData.folioOficio}\nFecha: ${formData.fechaOficio}`,
                  bold: true,
                }),
              ],
            }),

            new Paragraph({ text: "" }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `${formData.destinatario}\n${formData.puestoDestinatario}`,
                  bold: true,
                }),
              ],
            }),

            new Paragraph({ text: "" }),

            new Paragraph({
              children: [
                new TextRun({
                  text: formData.cuerpo,
                }),
              ],
            }),

            new Paragraph({ text: "" }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `C.c.p. ${formData.copiaCarbon}`,
                  italics: true,
                }),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Oficio_${formData.folioOficio}.docx`);
  };

  return (
    <>
      <main className="main-content-solicitud">
        <MainHeader title="Detalles de oficio" subtitle="Gestión de oficios" />

        <form className="form-grid">
          <h3 className="section-title">Datos del oficio</h3>

          <div className="form-group-solicitud">
            <label htmlFor="ver-folio-oficio" className="form-label-solicitud">
              Folio del oficio
            </label>
            <input
              id="ver-folio-oficio"
              type="text"
              className="form-input-solicitud"
              value={formData.folioOficio}
              readOnly
            />
          </div>

          <div className="form-group-solicitud">
            <label htmlFor="ver-fecha-oficio" className="form-label-solicitud">
              Fecha del oficio
            </label>
            <input
              id="ver-fecha-oficio"
              type="text"
              className="form-input-solicitud"
              value={formData.fechaOficio}
              readOnly
            />
          </div>

          <div className="form-group-solicitud">
            <label htmlFor="ver-destinatario" className="form-label-solicitud">
              Destinatario
            </label>
            <input
              id="ver-destinatario"
              type="text"
              className="form-input-solicitud"
              value={formData.destinatario}
              readOnly
            />
          </div>

          <div className="form-group-solicitud">
            <label
              htmlFor="ver-puesto-destinatario"
              className="form-label-solicitud"
            >
              Puesto (destinatario)
            </label>
            <input
              id="ver-puesto-destinatario"
              type="text"
              className="form-input-solicitud"
              value={formData.puestoDestinatario}
              readOnly
            />
          </div>

          <div
            className="form-group-solicitud"
            style={{ gridColumn: "span 3" }}
          >
            <label htmlFor="ver-cuerpo-oficio" className="form-label-solicitud">
              Cuerpo del Oficio
            </label>
            <textarea
              id="ver-cuerpo-oficio"
              className="large-textarea-solicitud2"
              value={formData.cuerpo}
              readOnly
            />
          </div>

          <div
            className="form-group-solicitud"
            style={{ gridColumn: "span 3" }}
          >
            <label htmlFor="ver-copia-carbon" className="form-label-solicitud">
              Copia Carbón
            </label>
            <textarea
              id="ver-copia-carbon"
              className="large-textarea-solicitud3"
              value={formData.copiaCarbon}
              readOnly
            />
          </div>

          <div className="action-buttons">
            <button
              type="button"
              className="btn-generar"
              onClick={handleGenerarPDF}
            >
              Generar PDF
            </button>

            <button
              type="button"
              className="btn-ver-oficios"
              onClick={handleGenerarWord}
            >
              Descargar Word
            </button>
          </div>
        </form>
      </main>
    </>
  );
}

export default VerDetallesOficio;
