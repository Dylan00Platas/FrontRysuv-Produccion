import { useEffect, useState } from "react";
import IGettingData from "@/interfaces/GettingData";
import ProcesoContratacionService from "@/services/ProcesoContratacionService";
import { IGetProcesosContratacionCandidatosNoBeneficiados } from "@/schemas/procesos-contratacion/GetProcesoContratacion";
import IResponseHTTP from "@/interfaces/http/Response";

export function useProcesosNoBeneficiados(): IGettingData<IGetProcesosContratacionCandidatosNoBeneficiados> {
  const [data, setData] =
    useState<IGetProcesosContratacionCandidatosNoBeneficiados | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProcesosNoBeneficiados = async () => {
      try {
        setLoading(true);
        const response: IResponseHTTP<IGetProcesosContratacionCandidatosNoBeneficiados> =
          await new ProcesoContratacionService().getProcesosContratacionNoBeneficiados();

        if (response.error == false && response.mensaje) {
          setData(response.mensaje);
        } else {
          setError(
            "No hay procesos de contratación con candidato no fue beneficiado",
          );
        }
      } catch (err) {
        console.error(
          `useProcesosNoBenedifiados.ts - Error al obtener procesos de contratación con candidato no fue beneficiado:\n ${error}`,
        );
        setError(
          "Error al obtener procesos de contratación con candidato no fue beneficiado.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProcesosNoBeneficiados();
  }, []);

  return { data, loading, error };
}
