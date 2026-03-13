import ILabelValue from "@/interfaces/LabelValue";

/**
 * Genera un arreglo de objetos { value, label } únicos
 * a partir de una propiedad de un arreglo de cédulas.
 */
export function getUniqueOptionsLabelValue<T>(
  data: T[],
  key: keyof T,
): ILabelValue[] {
  return [...new Set(data.map((item) => item[key] as string))].map((val) => ({
    value: val,
    label: val,
  }));
}
