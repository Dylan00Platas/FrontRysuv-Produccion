import { useEffect, useState } from "react";
import CatalogoService from "@/services/CatalogosService";
import { IDependenciaBase } from "@/schemas/catalogos/GetDependencia";
import IGettingData from "@/interfaces/GettingData";

export function useDependenciaById(
  id?: number,
): IGettingData<IDependenciaBase> {
  const [data, setData] = useState<IDependenciaBase | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id == null) return;

    const fetchDependencia = async () => {
      try {
        setLoading(true);
        const response = await new CatalogoService().getDependenciaById(id);

        if (response.error === false && response.mensaje) {
          setData(response.mensaje);
          setError(null);
        } else {
          setError("No hay dependencia registrada con ese ID.");
        }
      } catch (err) {
        console.error(
          `useDependenciaById.ts - Error al obtener dependencia por ID:\n ${err}`,
        );
        setError("Error al obtener dependencia por ID.");
      } finally {
        setLoading(false);
      }
    };

    fetchDependencia();
  }, [id]);

  return { data, loading, error };
}
