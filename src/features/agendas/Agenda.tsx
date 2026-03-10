import { useState, useContext, useEffect, useId } from "react";
import Select, { SingleValue } from "react-select";
import esLocale from "@fullcalendar/core/locales/es";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";

import "./Agenda.css";
import SolicitudService from "@/services/SolicitudService.js";
import { resolverColor } from "@/utils/CatalogosNoseDonde";
import { solicitudAEvento } from "@/utils/features/Agendas";
import { IEventoAgenda } from "@/interfaces/agendas/EventoAgenda";
import { IEventoSeleccionado } from "@/interfaces/agendas/EventoSeleccionado";
import { EventClickArg, EventDropArg } from "@fullcalendar/core/index.js";
import { IActualizarEstadoCita } from "@/interfaces/agendas/ActualizarEstadoCita";
import ISolicitudProceso from "@/interfaces/procesos/Solicitud";

interface OpcionEstado {
  value: string;
  label: string;
}

function Agenda() {
  const [eventos, setEventos] = useState<IEventoAgenda[]>([]);
  // Estado para modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] =
    useState<IEventoSeleccionado | null>(null);
  const ESTADOS_EDITABLES: number[] = [9, 10, 11];
  const OPCIONES_ESTADO: OpcionEstado[] = [
    { value: "9", label: "Pendiente (cita)" },
    { value: "10", label: "Entregado (cita)" },
    { value: "11", label: "Citado" },
  ];
  const fieldID = useId();

  useEffect(() => {
    async function cargarEventos(): Promise<void> {
      try {
        const data: Record<string, ISolicitudProceso> | null =
          await new SolicitudService().obtenerSolicitudes();

        if (!data) return;

        const solicitudes = Object.values(data) as ISolicitudProceso[];
        const nuevosEventos = solicitudes
          .filter((s) => Boolean(s.fechaEntrevista))
          .filter((s) => s.FKIdEstadoProcesoContratacion !== 7)
          .map(solicitudAEvento);

        setEventos(nuevosEventos);
      } catch (err) {
        console.error("Error al cargar eventos:", err);
      }
    }
    cargarEventos();
  }, []);

  const handleEventClick = (info: EventClickArg): void => {
    const props = info.event.extendedProps as IEventoAgenda["extendedProps"];

    setEventoSeleccionado({
      id: Number(info.event.id), // TODO-Desarrollo: Check
      title: info.event.title,
      fecha: info.event.startStr,
      candidato: props.candidato,
      citaVirtual: props.citaVirtual,
      estado: props.estado,
      // CORRECCIÓN: ?? false asegura boolean aunque extendedProps lo devuelva undefined
      atendioCita: props.atendioCita ?? false,
    });

    setModalAbierto(true);
  };

  const handleGuardarCambios = async (): Promise<void> => {
    if (!eventoSeleccionado) return;

    try {
      const payload: IActualizarEstadoCita = {
        idEventoSeleccionado: eventoSeleccionado.estado,
        fechaEntrevista: eventoSeleccionado.fecha,
        atendioCita: eventoSeleccionado.atendioCita,
        citaVirtual: eventoSeleccionado.citaVirtual,
        estado: eventoSeleccionado.estado,
      };

      const response: any = await new SolicitudService().editarSolicitud(
        payload,
      );

      const colorFinal = resolverColor(
        eventoSeleccionado.estado,
        eventoSeleccionado.atendioCita,
      );

      setEventos((prev) =>
        prev.map((ev) =>
          ev.id === String(eventoSeleccionado.id)
            ? {
                ...ev,
                start: eventoSeleccionado.fecha,
                backgroundColor: colorFinal,
                borderColor: eventoSeleccionado.citaVirtual
                  ? "#3498db"
                  : colorFinal,
                extendedProps: {
                  ...ev.extendedProps,
                  estado: eventoSeleccionado.estado,
                  citaVirtual: eventoSeleccionado.citaVirtual,
                  atendioCita: eventoSeleccionado.atendioCita,
                },
              }
            : ev,
        ),
      );

      setModalAbierto(false);
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      alert("❌ Error al guardar los cambios");
    }
  };

  const handleEventDrop = async (info: EventDropArg): Promise<void> => {
    const idEventoSeleccionado: string = info.event.id;
    const nuevaFecha: string = info.event.startStr;

    const eventoOriginal: IEventoAgenda | undefined = eventos.find(
      (ev) => ev.id === idEventoSeleccionado,
    );
    if (!eventoOriginal) return;

    try {
      const eventoOriginal = eventos.find(
        (ev) => ev.id === idEventoSeleccionado,
      );

      const payload: IActualizarEstadoCita = {
        idEventoSeleccionado: idEventoSeleccionado,
        fechaEntrevista: nuevaFecha,
        estado: eventoOriginal!!.extendedProps.estado,
        atendioCita: eventoOriginal!!.extendedProps.atendioCita,
        citaVirtual: eventoOriginal!!.extendedProps.citaVirtual,
      };

      await new SolicitudService().editarSolicitud(payload);

      const colorFinal = resolverColor(payload.estado, payload.atendioCita);

      setEventos((prev) =>
        prev.map((ev) =>
          ev.id === idEventoSeleccionado
            ? {
                ...ev,
                start: nuevaFecha,
                backgroundColor: colorFinal,
                borderColor: payload.citaVirtual ? "#3498db" : colorFinal,
              }
            : ev,
        ),
      );
    } catch (error) {
      console.error("❌ Error al actualizar fecha por drag & drop:", error);
      alert("No se pudo actualizar la fecha. Se revertirá.");
      info.revert();
    }
  };

  return (
    <>
      <main className="ml-65 w-[calc(100%-260px)] px-[4%] py-[2%] overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
            Gestión de fechas de eventos y procesos
          </p>
          <h1 className="text-3xl font-extrabold text-[#18529d] tracking-tight">
            Agenda
          </h1>
          <div className="mt-2 h-1 w-16 rounded-full bg-linear-to-r from-[#18529d] to-[#199532]" />
        </div>

        <div className="bg-white p-3.75 rounded-[10px] shadow-[0_3px_8px_rgba(0,0,0,0.1)] -mt-[3%]">
          <FullCalendar
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
            ]}
            initialView="dayGridMonth"
            eventDrop={handleEventDrop}
            editable={true}
            eventDurationEditable={false}
            locale={esLocale}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            events={eventos}
            eventClick={handleEventClick}
            height="80vh"
          />
        </div>
      </main>

      {/* ── Modal ───────────────────────────────────────────────────────── */}
      {modalAbierto && eventoSeleccionado && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-2000"
          onClick={() => setModalAbierto(false)}
        >
          <div
            className="bg-white p-6.25 rounded-xl w-87.5 shadow-[0_4px_12px_rgba(0,0,0,0.2)] animate-[fadeIn_0.3s_ease] font-[Kulim_Park,sans-serif]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[2.5rem] font-bold text-[#18529d] mb-37.5 -mt-3.75 pb-3.75">
              Cita
            </h2>

            <label className="mt-2.5 font-semibold text-[#18529d]">
              Candidato:
            </label>
            <p className="mt-1">{eventoSeleccionado.candidato}</p>

            <label
              htmlFor={`${fieldID}-date`}
              className="mt-2.5 font-semibold text-[#18529d] block"
            >
              Fecha:
            </label>
            <input
              id={`${fieldID}-date`}
              type="date"
              value={String(eventoSeleccionado.fecha)}
              onChange={(e) =>
                setEventoSeleccionado({
                  ...eventoSeleccionado,
                  fecha: e.target.value,
                })
              }
              className="w-full px-2 py-2 mt-1.5 rounded-md border border-[#ccc] h-6.25"
            />

            <label className="mt-2.5 font-semibold text-[#18529d] block">
              Estado:
            </label>
            <Select<OpcionEstado>
              className="modal-select" /* react-select necesita esta clase para overrides */
              classNamePrefix="react-select"
              isDisabled={
                !ESTADOS_EDITABLES.includes(Number(eventoSeleccionado.estado))
              }
              styles={{
                control: (base) => ({
                  ...base,
                  width: "105%",
                  minHeight: "45px",
                  height: "45px",
                  opacity: !ESTADOS_EDITABLES.includes(
                    Number(eventoSeleccionado.estado),
                  )
                    ? 0.6
                    : 1,
                }),
              }}
              value={
                OPCIONES_ESTADO.find(
                  (opt) => opt.value === String(eventoSeleccionado.estado),
                ) ?? null
              }
              onChange={(opcion: SingleValue<OpcionEstado>) => {
                if (opcion) {
                  setEventoSeleccionado({
                    ...eventoSeleccionado,
                    estado: Number(opcion.value),
                  });
                }
              }}
              options={OPCIONES_ESTADO}
            />

            <div className="flex items-center mt-3 gap-2">
              <input
                id={`${fieldID}-atendioCita`}
                type="checkbox"
                checked={eventoSeleccionado.atendioCita}
                onChange={(e) =>
                  setEventoSeleccionado({
                    ...eventoSeleccionado,
                    atendioCita: e.target.checked,
                  })
                }
              />
              <label htmlFor={`${fieldID}-atendioCita`}>No asistió</label>
            </div>

            <div className="flex flex-col gap-0">
              <button
                onClick={handleGuardarCambios}
                className="mt-6.25 w-full py-2.5 bg-[#199532] text-white border-none rounded-md cursor-pointer hover:bg-[#157929] transition-colors duration-200"
              >
                Guardar
              </button>
              <button
                onClick={() => setModalAbierto(false)}
                className="mt-6.25 w-full py-2.5 bg-[#18529d] text-white border-none rounded-md cursor-pointer hover:bg-[#0f3d75] transition-colors duration-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Agenda;
