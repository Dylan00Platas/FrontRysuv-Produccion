/**
 * Elimina propiedades de un objeto cuyo valor sea "" o undefined.
 * @param obj Objeto de entrada
 * @returns Nuevo objeto sin valores vacíos ni undefined
 */
function cleanEmptyValues<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, value]) => value !== "" && value !== undefined,
    ),
  ) as Partial<T>;
}
