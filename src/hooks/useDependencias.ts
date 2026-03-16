import { useEffect, useState } from "react";
import CatalogoService from "@/services/CatalogosService";
import { IGetDependencias } from "@/schemas/catalogos/GetDependencia";
import IGettingData from "@/interfaces/GettingData";

export function useDependencias(): IGettingData<IGetDependencias> {
  const [data, setData] = useState<IGetDependencias | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDependencias = async () => {
      try {
        setLoading(true);
        const response = await new CatalogoService().getDependencias();

        if (response.error == false && response.mensaje) {
          setData(response.mensaje);
        } else {
          setError("No hay dependencias registradas.");
        }
      } catch (err) {
        console.error(
          `useDependencias.ts - Error al obtener dependencias:\n ${error}`,
        );
        setError("Error al obtener dependencias.");
      } finally {
        setLoading(false);
      }
    };

    fetchDependencias();
  }, []);

  return { data, loading, error };
}
