import SolicitudService from "@/services/SolicitudService";
import { mapColorEstado, resolverColor } from "../CatalogosNoseDonde";
import ISolicitudProceso from "@/interfaces/procesos/Solicitud";
import { IEventoAgenda } from "../../interfaces/agendas/EventoAgenda";

// TODO-Desarrollo: Asignar mejor nombre a función
export async function getEventosAgenda(): Promise<IEventoAgenda[]> {
  try {
    const responseData: Record<string, ISolicitudProceso> =
      await new SolicitudService().obtenerSolicitudes();

    if (!responseData) [];

    const nuevosEventos = Object.values(responseData)
      .filter((s) => s.fechaEntrevista)
      .filter((s) => s.FKIdEstadoProcesoContratacion !== 7)
      .map((s) => {
        const colorBase = s.atendioCita
          ? "#d11a2a"
          : mapColorEstado(s.FKIdEstadoProcesoContratacion);

        const data: IEventoAgenda = {
          id: String(s.idProceso),
          extendedProps: {
            citaVirtual: s.citaVirtual,
            atendioCita: s.atendioCita,
            candidato: s.nombreCandidato,
            estado: s.FKIdEstadoProcesoContratacion,
          },
          title: s.citaVirtual
            ? "🛜 " + (s.nombreCandidato || "Sin nombre") + " "
            : s.nombreCandidato || "Sin nombre",
          start: new Date(s.fechaEntrevista).toISOString().split("T")[0],
          allDay: true,
          backgroundColor: colorBase,
          borderColor: colorBase,
          borderWidth: s.citaVirtual ? 8 : 1,
          ...(s.citaVirtual && {
            borderColor: "#3498db",
            borderWidth: 3,
          }),
          display: "block",
        };

        return data;
      });

    return nuevosEventos;
  } catch (err) {
    console.error("Error:", err);
    return [];
  }
}

export function solicitudAEvento(s: ISolicitudProceso): IEventoAgenda {
  const colorBase = resolverColor(
    s.FKIdEstadoProcesoContratacion,
    s.atendioCita,
  );

  return {
    id: String(s.idProceso),
    title: s.citaVirtual
      ? `🛜 ${s.nombreCandidato || "Sin nombre"} `
      : s.nombreCandidato || "Sin nombre",
    start: s.fechaEntrevista!.split("T")[0],
    allDay: true,
    backgroundColor: colorBase,
    // CORRECCIÓN: la lógica anterior tenía borderColor duplicado y
    // contradictorio (se asignaba colorBase y luego se sobreescribía con azul
    // en el spread condicional). Ahora es explícito y lineal.
    borderColor: s.citaVirtual ? "#3498db" : colorBase,
    display: "block",
    extendedProps: {
      candidato: s.nombreCandidato,
      citaVirtual: s.citaVirtual,
      estado: s.FKIdEstadoProcesoContratacion,
      atendioCita: s.atendioCita,
    },
  };
}
