import resolverColor from "../CatalogosNoseDonde";
import ISolicitudProceso from "@/interfaces/procesos/Solicitud";
import IEventoAgenda from "../../interfaces/agendas/EventoAgenda";

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
