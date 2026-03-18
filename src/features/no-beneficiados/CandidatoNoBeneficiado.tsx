import { useId } from "react";
import { useLocation } from "react-router-dom";

import "./CandidatoNoBeneficiado.css";
import { Toast } from "@/components/Alert/Floating/Toast";

// Interfaces de UI ---------------------------------------------------------
interface ICandidatoNoBeneficiado {
  nombre: string;
  profesion: string;
  region: string;
  resultado: string;
  fechaEvaluacion: string;
  numCarpeta: string;
}
const CANDIDATO_VACIO: ICandidatoNoBeneficiado = {
  nombre: "",
  profesion: "",
  region: "",
  resultado: "",
  fechaEvaluacion: "",
  numCarpeta: "",
};

function CandidatoNoBeneficiado() {
  const fieldID = useId();
  const location = useLocation();

  // Obtencion de datos de query ----------------------------------------------
  const candidato: ICandidatoNoBeneficiado = location.state?.candidato
    ? {
        nombre: location.state.candidato.nombre ?? "",
        profesion: location.state.candidato.profesion ?? "",
        region: location.state.candidato.region ?? "",
        resultado: location.state.candidato.resultado ?? "",
        fechaEvaluacion: location.state.candidato.fechaEvaluacion ?? "",
        numCarpeta: location.state.candidato.numCarpeta ?? "",
      }
    : CANDIDATO_VACIO;

  return (
    <>
      <main className="main-content">
        <div className="page-header2">
          <h1 className="page-title2">Candidato No Beneficiado</h1>
        </div>

        <div className="contenido-cedula-inner">
          {/* Sin onSubmit: formulario de solo lectura, no envía datos */}
          <form className="form-grid">
            <div className="form-group">
              <label htmlFor={`${fieldID}-nombre`}>Nombre</label>
              <input
                id={`${fieldID}-nombre`}
                type="text"
                className="form-input"
                defaultValue={candidato.nombre}
                readOnly
              />
            </div>

            <div className="form-group">
              <label htmlFor={`${fieldID}-profesion`}>Profesión</label>
              <input
                id={`${fieldID}-profesion`}
                type="text"
                className="form-input"
                defaultValue={candidato.profesion}
                readOnly
              />
            </div>

            <div className="form-group">
              <label htmlFor={`${fieldID}-region`}>Región</label>
              <input
                id={`${fieldID}-region`}
                type="text"
                className="form-input"
                defaultValue={candidato.region}
                readOnly
              />
            </div>

            <div className="form-group">
              <label htmlFor={`${fieldID}-resultado`}>Resultado</label>
              <input
                id={`${fieldID}-resultado`}
                type="text"
                className="form-input"
                defaultValue={candidato.resultado}
                readOnly
              />
            </div>

            <div className="form-group">
              <label htmlFor={`${fieldID}-fechaEvaluacion`}>
                Fecha de Evaluación de Competencias
              </label>
              <input
                id={`${fieldID}-fechaEvaluacion`}
                type="date"
                className="form-input"
                defaultValue={candidato.fechaEvaluacion}
                readOnly
              />
            </div>

            <div className="form-group">
              <label htmlFor={`${fieldID}-numCarpeta`}>
                N. Carpeta Digital
              </label>
              <input
                id={`${fieldID}-numCarpeta`}
                type="text"
                className="form-input"
                defaultValue={String(candidato.numCarpeta)}
                readOnly
              />
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

export default CandidatoNoBeneficiado;
