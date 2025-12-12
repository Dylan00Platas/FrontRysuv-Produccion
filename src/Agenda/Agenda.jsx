import { useState, useContext, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import Sidebar from "../Componentes/Sidebar";
import "./Agenda.css";
import Select from "react-select";

import esLocale from "@fullcalendar/core/locales/es";

import { UsuarioContext } from "../Auxiliares/UsuarioContext.jsx";
import SolicitudServicio from "../Servicios/SolicitudServicio.js";

function Agenda() {
  const { usuario } = useContext(UsuarioContext);
  const [eventos, setEventos] = useState([]);

  // Estado para modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

  // Colores según estado
  const mapColorEstado = (estado) => {
    switch (estado) {
      case 9:
        return "#f1c40f";
      case 10:
        return "#e67e22";
      case 11:
        return "green";
      default:
        return "green";
    }
  };

  
  useEffect(() => {
    async function cargarEventos() {
      try {
        const token = localStorage.getItem("token");
        const servicio = new SolicitudServicio();

        const data = await servicio.obtenerSolicitudes(token);
        if (!data) return;

   const nuevosEventos = Object.values(data)
  .filter(s => s.fechaEntrevista)               
  .filter(s => s.FKIdEstadoProcesoContratacion !== 7)  
  .map(s => {
    const colorBase = s.atendioCita ? "#d11a2a" : mapColorEstado(s.FKIdEstadoProcesoContratacion);

    return {
      id: String(s.idProceso),
      candidato: s.nombreCandidato,
      citaVirtual: s.citaVirtual,
      estado: s.FKIdEstadoProcesoContratacion,
      atendioCita: s.atendioCita,

      title: s.citaVirtual 
        ? "🛜 " + (s.nombreCandidato || "Sin nombre") + " "
        : (s.nombreCandidato || "Sin nombre"),

      start: s.fechaEntrevista.split("T")[0],
      allDay: true,

      backgroundColor: colorBase,
      borderColor: colorBase,
      borderWidth: s.citaVirtual ? 8 : 1,

  ...(s.citaVirtual && {
    borderColor: "#3498db",
    borderWidth: 3
    
  }),


      display: "block"
    };
  });


        setEventos(nuevosEventos);
      } catch (err) {
        console.error("Error:", err);
      }
    }

    cargarEventos();
  }, []);


  const handleEventClick = (info) => {
    setEventoSeleccionado({
      id: info.event.id,
      title: info.event.title,
      fecha: info.event.startStr,
      candidato: info.event.extendedProps.candidato,
      citaVirtual: info.event.extendedProps.citaVirtual,
      estado: info.event.extendedProps.estado,
  atendioCita: info.event.extendedProps.atendioCita ?? false    });

    setModalAbierto(true);
  };


const handleGuardarCambios = async () => {
  try {
    const token = localStorage.getItem("token");
    const servicio = new SolicitudServicio();

    const payload = {
      fechaEntrevista: eventoSeleccionado.fecha,
      estado: Number(eventoSeleccionado.estado),
      citaVirtual: eventoSeleccionado.citaVirtual,
      atendioCita: eventoSeleccionado.atendioCita ? true : false
    };

    await servicio.editarSolicitud(eventoSeleccionado.id, payload, token);


    const colorFinal = eventoSeleccionado.atendioCita
      ? "#d11a2a"
      : mapColorEstado(Number(eventoSeleccionado.estado));

    setEventos((prev) =>
      prev.map((ev) =>
        ev.id === eventoSeleccionado.id
          ? {
              ...ev,
              start: eventoSeleccionado.fecha,
              estado: Number(eventoSeleccionado.estado),
              citaVirtual: eventoSeleccionado.citaVirtual,
              atendioCita: eventoSeleccionado.atendioCita,

              backgroundColor: colorFinal,
              borderColor: colorFinal,
              borderWidth: eventoSeleccionado.citaVirtual ? 8 : 1
            }
          : ev
      )
    );

    setModalAbierto(false);

  } catch (error) {
    console.error("Error al guardar cambios:", error);
    alert("❌ Error al guardar los cambios");
  }
};



const handleEventDrop = async (info) => {
  const id = info.event.id;
  const nuevaFecha = info.event.startStr;

  try {
    const token = localStorage.getItem("token");
    const servicio = new SolicitudServicio();

    const eventoOriginal = eventos.find((ev) => ev.id === id);

    const payload = {
      fechaEntrevista: nuevaFecha,
      estado: Number(eventoOriginal.estado),
      atendioCita: eventoOriginal.atendioCita,

      citaVirtual: eventoOriginal.citaVirtual   // ← 🔥 mantiene citaVirtual TRUE/FALSE correctamente
    };

    await servicio.editarSolicitud(id, payload, token);

    setEventos((prev) =>
      prev.map((ev) =>
        ev.id === id
? {
    ...ev,
    start: nuevaFecha,
    backgroundColor: eventoOriginal.atendioCita ? "#d11a2a" : mapColorEstado(Number(eventoOriginal.estado)),
    borderColor: eventoOriginal.atendioCita ? "#d11a2a" : mapColorEstado(Number(eventoOriginal.estado))
  }          : ev
      )
    );

  } catch (error) {
    console.error("❌ Error al actualizar fecha por drag & drop:", error);
    alert("No se pudo actualizar la fecha. Se revertirá.");
    info.revert();
  }
};



  return (
    <div className="agenda-page">
      <Sidebar tipoAcceso={usuario.FKidTipoAcceso} />

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
              listPlugin
            ]}
            initialView="dayGridMonth"
            eventDrop={handleEventDrop}
editable={usuario.FKidTipoAcceso !== 2}
eventDurationEditable={false}

            locale={esLocale}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"
            }}
            events={eventos}
            eventClick={handleEventClick}
            height="80vh"
          />
        </div>
      </main>

{/* ---------------- MODAL ---------------- */}
{modalAbierto && (
  <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>

      <h2 className="modal-title">Cita</h2>

      {/* CANDIDATO */}
      <label className="modal-label">Candidato:</label>
      <p className="modal-text">{eventoSeleccionado.candidato}</p>

      {/* FECHA */}
      <label className="modal-label">Fecha:</label>
      <input
        type="date"
        className="modal-input custom-date"
        style={{ height: "25px", width: "100%" }}
        value={eventoSeleccionado.fecha.split("T")[0]}
        onChange={(e) =>
          setEventoSeleccionado({
            ...eventoSeleccionado,
            fecha: e.target.value
          })
        }
      />

      {/* ESTADO */}
      <label className="modal-label">Estado:</label>
      <Select
  className="modal-select"
  classNamePrefix="react-select"
  isDisabled={![9, 10, 11].includes(Number(eventoSeleccionado.estado))}  // ⬅️ BLOQUEA SI NO ES 9/10/11
  styles={{
    control: (base) => ({
      ...base,
      width: "105%",
      minHeight: "45px",
      height: "45px",
      opacity: ![9, 10, 11].includes(Number(eventoSeleccionado.estado)) ? 0.6 : 1  // pequeño efecto visual
    })
  }}
  value={[
    { value: "9", label: "Pendiente (cita)" },
    { value: "10", label: "Entregado (cita)" },
    { value: "11", label: "Citado" }
  ].find((opt) => opt.value == eventoSeleccionado.estado)}
  onChange={(opcion) =>
    setEventoSeleccionado({
      ...eventoSeleccionado,
      estado: opcion.value
    })
  }
  options={[
    { value: "9", label: "Pendiente (cita)" },
    { value: "10", label: "Entregado (cita)" },
    { value: "11", label: "Citado" }
  ]}
/>

<div className="modal-checkbox">
  <input
    type="checkbox"
    checked={eventoSeleccionado.atendioCita || false}
    onChange={(e) =>
      setEventoSeleccionado({
        ...eventoSeleccionado,
        atendioCita: e.target.checked
      })
    }
  />
  <label>No asistió</label>
</div>



      {/* BOTONES */}
      <div className="modal-buttons">
        <button className="modal-btnGuardar" onClick={handleGuardarCambios}>
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



    </div>
  );
}

export default Agenda;
