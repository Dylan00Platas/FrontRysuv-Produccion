export default interface IEventoAgenda {
  id: string;
  title: string;
  start: string;
  allDay: boolean;
  backgroundColor: string;
  borderColor: string;
  display: "block";
  extendedProps: {
    candidato: string;
    citaVirtual: boolean;
    estado: number;
    atendioCita: boolean;
  };
}
