export default class ManageFiles {
  /**
   * Convierte un archivo PDF a una cadena Base64.
   * @param {string} rutaArchivo - Ruta del archivo PDF a convertir.
   * @returns {string} - Cadena Base64 del archivo PDF.
   */
  static async pdfToBase64(archivo: File) {
    if (!archivo || archivo.type !== "application/pdf") {
      throw new Error("El archivo debe ser un PDF válido.");
    }

    return new Promise((resolve, reject) => {
      const lector: FileReader = new FileReader();
      lector.onload = () => {
        const base64 = (lector.result as string)?.split(",")[1];
        resolve(base64);
      };
      lector.onerror = (error) => reject(error);
      lector.readAsDataURL(archivo);
    });
  }

  /**
   * Convierte una cadena Base64 en un archivo PDF.
   * @param {string} base64 - Cadena Base64 del archivo PDF.
   * @param {string} rutaSalida - Ruta donde se guardará el PDF generado.
   */

  static base64APdf(base64: string) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: "application/pdf" });
  }

  /**
   * Abre el PDF directamente en una nueva pestaña o iframe.
   */
  static mostrarPdf(base64: string) {
    const blob = this.base64APdf(base64);
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }

  /**
   * Descarga el PDF con un nombre específico.
   */
  static descargarPdf(base64: string, nombreArchivo: string = "documento.pdf") {
    const blob = this.base64APdf(base64);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = nombreArchivo;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}
