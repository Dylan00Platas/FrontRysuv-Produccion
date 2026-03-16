import ILabelValue from "@/interfaces/LabelValue";

export function mapEstado(fk: number): string {
  switch (fk) {
    case 1:
      return "Citado";
    case 2:
      return "Evaluado";
    case 4:
      return "En revisión";
    case 5:
      return "En firma";
    case 6:
      return "Notificado";
    case 7:
      return "Cancelado";
    case 8:
      return "Terminado";
    case 9:
      return "Pendiente (cita)";
    case 10:
      return "Entregado (cita)";
    case 11:
      return "Citado";
    case 12:
    case 13:
    case 14:
    case 15:
      return "En procesamiento";
    default:
      return "En proceso";
  }
}

export function generarOpcionesMeses(n = 4): ILabelValue[] {
  const hoy = new Date();
  return Array.from({ length: n }, (_, i) => {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const label = fecha
      .toLocaleString("es-ES", { month: "long", year: "numeric" })
      .replace(/^\w/, (c) => c.toUpperCase());
    return {
      value: `${fecha.getFullYear()}-${fecha.getMonth() + 1}`,
      label,
    };
  });
}
