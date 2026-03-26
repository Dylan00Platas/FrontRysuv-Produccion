import { useState } from "react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { PDFDocument, PDFFont, PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit"
import {PDFTextField} from "pdf-lib"
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
      form.getTextField("puestoDirigido").setText(formData.puestoDestinatario || "");
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
          let lines: string[] = [];

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
              page.drawText(lineText, { x, y: cursorY, size: fontSize, font });
            } else {
              const textWidth = font.widthOfTextAtSize(lineText.replace(/ /g, ""), fontSize);
              const totalSpaces = wordsInLine.length - 1;
              const spaceWidth = (width - textWidth) / totalSpaces;
              let cursorX = x;

              wordsInLine.forEach((word) => {
                page.drawText(word, { x: cursorX, y: cursorY, size: fontSize, font });
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
        page.drawText(text, { x: rightX - textWidth, y, size: fontSize, font });
      }

      drawRightAlignedText(page, String(formData.folioOficio), 553, 650, gillSans, 11);
      drawRightAlignedText(page, String(formData.fechaOficio), 553, 636, gillSans, 11);
      drawJustifiedText(page, formData.cuerpo, 120, 560, 450, gillSans, 11, 14);

      form.getFields().forEach((field) => {
        if (field instanceof PDFTextField) {
          field.updateAppearances(gillSans);
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([ManageFiles.toArrayBuffer(pdfBytes)], { type: "application/pdf" });
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
              children: [new TextRun({ text: formData.cuerpo })],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({ text: `C.c.p. ${formData.copiaCarbon}`, italics: true }),
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

          {/* Folio */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label
              htmlFor="ver-folio-oficio"
              style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151", letterSpacing: "0.01em" }}
            >
              Folio del oficio
            </label>
            <input
              id="ver-folio-oficio"
              type="text"
              value={formData.folioOficio}
              readOnly
              style={{
                height: "38px",
                padding: "0 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.875rem",
                color: "#111827",
                backgroundColor: "#f9fafb",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
                cursor: "not-allowed",
              }}
            />
          </div>

          {/* Fecha */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label
              htmlFor="ver-fecha-oficio"
              style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151", letterSpacing: "0.01em" }}
            >
              Fecha del oficio
            </label>
            <input
              id="ver-fecha-oficio"
              type="text"
              value={formData.fechaOficio}
              readOnly
              style={{
                height: "38px",
                padding: "0 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.875rem",
                color: "#111827",
                backgroundColor: "#f9fafb",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
                cursor: "not-allowed",
              }}
            />
          </div>

          {/* Destinatario */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label
              htmlFor="ver-destinatario"
              style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151", letterSpacing: "0.01em" }}
            >
              Destinatario
            </label>
            <input
              id="ver-destinatario"
              type="text"
              value={formData.destinatario}
              readOnly
              style={{
                height: "38px",
                padding: "0 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.875rem",
                color: "#111827",
                backgroundColor: "#f9fafb",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
                cursor: "not-allowed",
              }}
            />
          </div>

          {/* Puesto destinatario */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label
              htmlFor="ver-puesto-destinatario"
              style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151", letterSpacing: "0.01em" }}
            >
              Puesto (destinatario)
            </label>
            <input
              id="ver-puesto-destinatario"
              type="text"
              value={formData.puestoDestinatario}
              readOnly
              style={{
                height: "38px",
                padding: "0 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.875rem",
                color: "#111827",
                backgroundColor: "#f9fafb",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
                cursor: "not-allowed",
              }}
            />
          </div>

          {/* Cuerpo */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
              gridColumn: "span 3",
            }}
          >
            <label
              htmlFor="ver-cuerpo-oficio"
              style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151", letterSpacing: "0.01em" }}
            >
              Cuerpo del Oficio
            </label>
            <textarea
              id="ver-cuerpo-oficio"
              value={formData.cuerpo}
              readOnly
              style={{
                padding: "0.65rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.875rem",
                color: "#111827",
                backgroundColor: "#f9fafb",
                resize: "vertical",
                minHeight: "220px",
                lineHeight: 1.6,
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
                fontFamily: "inherit",
                cursor: "not-allowed",
              }}
            />
          </div>

          {/* Copia carbón */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
              gridColumn: "span 3",
            }}
          >
            <label
              htmlFor="ver-copia-carbon"
              style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151", letterSpacing: "0.01em" }}
            >
              Copia Carbón
            </label>
            <textarea
              id="ver-copia-carbon"
              value={formData.copiaCarbon}
              readOnly
              style={{
                padding: "0.65rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.875rem",
                color: "#111827",
                backgroundColor: "#f9fafb",
                resize: "vertical",
                minHeight: "90px",
                lineHeight: 1.6,
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
                fontFamily: "inherit",
                cursor: "not-allowed",
              }}
            />
          </div>

          {/* Botones */}
          <div
            style={{
              gridColumn: "span 3",
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              marginTop: "0.75rem",
            }}
          >
            <button
              type="button"
              onClick={handleGenerarPDF}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#14234a";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1a2e5a";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              }}
              style={{
                padding: "0.55rem 1.75rem",
                backgroundColor: "#1a2e5a",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background-color 0.15s, transform 0.1s",
              }}
            >
              Generar PDF
            </button>

            <button
              type="button"
              onClick={handleGenerarWord}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#15803d";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#16a34a";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              }}
              style={{
                padding: "0.55rem 1.75rem",
                backgroundColor: "#16a34a",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background-color 0.15s, transform 0.1s",
              }}
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