import { useState, useContext, useEffect, useId } from "react";
import Select, { SingleValue } from "react-select";
import esLocale from "@fullcalendar/core/locales/es";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";

import "./Agenda.css";
import Sidebar from "@/layout/sidebar/Sidebar.jsx";
import SolicitudService from "@/services/SolicitudService.js";
import UserContext from "@/utils/UserContext.jsx";
import { mapColorEstado, resolverColor } from "@/utils/CatalogosNoseDonde";
import { getEventosAgenda, solicitudAEvento } from "@/utils/features/Agendas";
import { IEventoAgenda } from "@/utils/features/EventoAgenda";
import { IEventoSeleccionado } from "@/utils/features/EventoSeleccionado";
import ISolicitudProceso from "@/interfaces/procesos/Solicitud";
import { EventClickArg, EventDropArg } from "@fullcalendar/core/index.js";
import IActualizarSolicitud from "@/interfaces/solicitudes/ActualizarSolicitud";
import { IActualizarEstadoCita } from "@/utils/features/ActualizarEstadoCita";

interface OpcionEstado {
  value: string;
  label: string;
}

function Agenda() {
  const currentUser = useContext(UserContext);
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
      <main className="agenda-main">
        <div className="page-header2">
          <h1 className="page-title2">Agenda</h1>
        </div>

        <div className="agenda-container">
          <FullCalendar
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
            ]}
            initialView="dayGridMonth"
            eventDrop={handleEventDrop}
            //TODO-Desarrollo: Validate cookie
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

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      {modalAbierto && eventoSeleccionado && (
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Cita</h2>

            <label className="modal-label">Candidato:</label>
            <p className="modal-text">{eventoSeleccionado.candidato}</p>

            <label htmlFor={`${fieldID}-date`} className="modal-label">
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
              className="h-6.25 w-100 modal-input custom-date"
            />

            <label className="modal-label">Estado:</label>
            <Select<OpcionEstado>
              className="modal-select"
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
              // CORRECCIÓN: se usa === con String() para comparación segura de tipos
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

            <div className="modal-checkbox">
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

            <div className="modal-buttons">
              <button
                className="modal-btnGuardar"
                onClick={handleGuardarCambios}
              >
                Guardar
              </button>
              <button
                className="modal-btnCerrar"
                onClick={() => setModalAbierto(false)}
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
