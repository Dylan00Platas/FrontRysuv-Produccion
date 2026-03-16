import { useCallback, useEffect, useState } from "react";
import { ICedulaBase } from "@/schemas/cedulas/GetCedula";
import CedulaService from "@/services/CedulaService";
import IGettingData from "@/interfaces/GettingData";

interface IUseCedulas extends IGettingData<ICedulaBase[] | null> {
  refetch: () => Promise<void>;
}

export function useCedulas(): IUseCedulas {
  const [data, setData] = useState<ICedulaBase[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCedulas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await new CedulaService().getCedulasInternas();

      if (response.error === false && response.mensaje) {
        setData(response.mensaje.cedulas);
      } else {
        setError("No hay cedulas internas registradas.");
      }
    } catch (err) {
      console.error(
        `useCedulas.ts - Error al obtener cédulas internas:\n ${error}`,
      );
      setError("Error al obtener cedulas internas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCedulas();
  }, [fetchCedulas]);

  return { data, loading, error, refetch: fetchCedulas };
}
