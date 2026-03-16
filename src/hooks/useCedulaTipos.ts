import { useCallback, useEffect, useState } from "react";
import CedulaService from "@/services/CedulaService";
import IGettingData from "@/interfaces/GettingData";
import {
  IGetTiposCedula,
  ITipoCedulaBase,
} from "@/schemas/catalogos/GetTipoCedula";
import CatalogoService from "@/services/CatalogosService";

interface IUseCedulaTipos extends IGettingData<IGetTiposCedula | null> {
  refetch: () => Promise<void>;
}

export function useCedulaTipos(): IUseCedulaTipos {
  const [data, setData] = useState<IGetTiposCedula | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCedulaTipos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await new CatalogoService().getTiposCedula();

      if (response.error === false && response.mensaje) {
        setData(response.mensaje);
      } else {
        setError("No hay tipos de cedulas registradas.");
      }
    } catch (err) {
      console.error(
        `useCedulaTipos.ts - Error al obtener tipos de cedulas:\n ${error}`,
      );
      setError("Error al obtener tipos de cedulas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCedulaTipos();
  }, [fetchCedulaTipos]);

  return { data, loading, error, refetch: fetchCedulaTipos };
}
