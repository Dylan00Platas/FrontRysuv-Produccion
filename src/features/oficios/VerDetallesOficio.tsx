import { useState } from "react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { PDFDocument, PDFFont, PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { PDFTextField } from "pdf-lib";
import ManageFiles from "@/utils/ManageFiles";
import MainHeader from "@/components/header/MainHeader";
import { InputField } from "@/components/input/InputField";
import FormSectionCard from "@/components/card/FormSectionCard";
import { TextAreaField } from "@/components/input/TextAreaField";
import { CustomButton } from "@/components/button/CustomButton";
import { FaSave } from "react-icons/fa";

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
				page.drawText(text, { x: rightX - textWidth, y, size: fontSize, font });
			}

			drawRightAlignedText(
				page,
				String(formData.folioOficio),
				553,
				650,
				gillSans,
				11,
			);
			drawRightAlignedText(
				page,
				String(formData.fechaOficio),
				553,
				636,
				gillSans,
				11,
			);
			drawJustifiedText(page, formData.cuerpo, 120, 560, 450, gillSans, 11, 14);

			form.getFields().forEach((field) => {
				if (field instanceof PDFTextField) {
					field.updateAppearances(gillSans);
				}
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
							children: [new TextRun({ text: formData.cuerpo })],
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
			<MainHeader title="Detalles de oficio" subtitle="Gestión de oficios" />

			<form className="flex flex-col gap-6">
				<FormSectionCard title="Datos del oficio:">
					<div className="flex flex-col gap-6">
						{/* Fila 1: Folio + Fecha */}
						<div className="flex flex-col sm:flex-row gap-6">
							<InputField
								label="Folio del oficio:"
								id="ver-folio-oficio"
								type="text"
								value={formData.folioOficio}
								readOnly
								className="cursor-not-allowed"
							/>
							<InputField
								label="Fecha del oficio:"
								id="ver-fecha-oficio"
								type="text"
								value={formData.fechaOficio}
								readOnly
								className="cursor-not-allowed"
							/>
						</div>

						{/* Fila 2: Destinatario + Puesto */}
						<div className="flex flex-col sm:flex-row gap-6 w-full">
							<InputField
								label="Destinatario:"
								id="ver-destinatario"
								type="text"
								value={formData.destinatario}
								readOnly
								className="cursor-not-allowed w-full"
							/>
							<InputField
								label="Puesto (destinatario):"
								id="ver-puesto-destinatario"
								type="text"
								value={formData.puestoDestinatario}
								readOnly
								className="cursor-not-allowed"
							/>
						</div>

						{/* Fila 3: Textareas */}
						<div className="flex flex-col gap-6">
							<TextAreaField
								label="Cuerpo del oficio:"
								id="ver-cuerpo-oficio"
								value={formData.cuerpo}
								readOnly
								className="cursor-not-allowed"
							/>
							<TextAreaField
								label="Copia carbón:"
								id="ver-copia-carbon"
								value={formData.copiaCarbon}
								readOnly
								className="cursor-not-allowed"
							/>
						</div>
					</div>
				</FormSectionCard>

				{/* Botones de acción */}
				<div className="flex items-center gap-3 pb-10 sm:justify-end justify-center">
					<CustomButton
						variant="pdf"
						type="button"
						icon={<FaSave />}
						onClick={handleGenerarPDF}>
						Obtener{"\n"}.pdf
					</CustomButton>
					<CustomButton
						variant="edit"
						type="button"
						onClick={handleGenerarWord}>
						Obtener{"\n"}.word
					</CustomButton>
				</div>
			</form>
		</>
	);
}

export default VerDetallesOficio;
