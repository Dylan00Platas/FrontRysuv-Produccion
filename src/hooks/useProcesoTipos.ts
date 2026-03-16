import { useCallback, useEffect, useState } from "react";
import IGettingData from "@/interfaces/GettingData";
import CatalogoService from "@/services/CatalogosService";
import {
  IGetTiposProceso,
  ITipoProcesoBase,
} from "@/schemas/catalogos/GetTipoProceso";

interface IUseProcesoTipos extends IGettingData<IGetTiposProceso | null> {
  refetch: () => Promise<void>;
}

export function useProcesoTipos(): IUseProcesoTipos {
  const [data, setData] = useState<IGetTiposProceso | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProcesoTipos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await new CatalogoService().getTiposProceso();

      if (response.error === false && response.mensaje) {
        setData(response.mensaje);
      } else {
        setError("No hay tipos de proceso de contratación existentes");
      }
    } catch (err) {
      console.error(
        `useProcesoTipos.ts - Error al obtener tipos de procesos de contratación \n ${error}`,
      );
      setError("Error al obtener tipos de procesos de contratación.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProcesoTipos();
  }, [fetchProcesoTipos]);

  return { data, loading, error, refetch: fetchProcesoTipos };
}
