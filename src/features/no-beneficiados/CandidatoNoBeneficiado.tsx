import { useState, useEffect, SubmitEvent, useId } from "react";

import "./CandidatoNoBeneficiado.css";
import { useLocation } from "react-router-dom";

function CandidatoNoBeneficiado() {
  const fieldID = useId();

  const [formData, setFormData] = useState({
    nombre: "",
    profesion: "",
    region: "",
    resultado: "",
    fechaEvaluacion: "",
    carpetaDigital: "",
  });

  const location = useLocation();
  const cedulaFromNav = location.state?.cedula || null;
  useEffect(() => {
    if (location.state && location.state.candidato) {
      const c = location.state.candidato;
      setFormData({
        nombre: c.nombre || "",
        profesion: c.profesion || "",
        region: c.region || "",
        resultado: c.resultado || "",
        fechaEvaluacion: c.fechaEvaluacion || "",
        carpetaDigital: c.numCarpeta || "",
      });
    }
  }, [location.state]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    console.log("Candidato No Beneficiado: ", formData);
  };

  return (
    <main className="main-content">
      <div className="page-header2">
        <h1 className="page-title2">Candidato No Beneficiado</h1>
      </div>
      <div className="contenido-cedula-inner">
        <form className="form-grid" onSubmit={handleSubmit}>
          {/* Campos */}
          <div className="form-group">
            <label htmlFor={`${fieldID}-nombreCandidato`}>Nombre</label>
            <input
              id={`${fieldID}-nombreCandidato`}
              type="text"
              className="form-input"
              value={formData.nombre}
              onChange={(e) => handleInputChange("nombre", e.target.value)}
              readOnly
            />
          </div>
          <div className="form-group">
            <label htmlFor={`${fieldID}-profesion`}>Profesión</label>
            <input
              id={`${fieldID}-profesion`}
              type="text"
              className="form-input"
              value={formData.profesion}
              onChange={(e) => handleInputChange("profesion", e.target.value)}
              readOnly
            />
          </div>
          <div className="form-group">
            <label htmlFor={`${fieldID}-region`}>Región</label>
            <input
              id={`${fieldID}-region`}
              type="text"
              className="form-input"
              value={formData.region}
              onChange={(e) => handleInputChange("region", e.target.value)}
              readOnly
            />
          </div>
          <div className="form-group">
            <label htmlFor={`${fieldID}-resultado`}>Resultado</label>
            <input
              id={`${fieldID}-resultado`}
              type="text"
              className="form-input"
              value={formData.resultado}
              onChange={(e) => handleInputChange("resultado", e.target.value)}
              readOnly
            />
          </div>
          <div className="form-group">
            <label htmlFor={`${fieldID}-fechaEvaluacionCompetencias`}>
              Fecha de Evaluación de Competencias
            </label>
            <input
              id={`${fieldID}-fechaEvaluacionCompetencias`}
              type="date"
              className="form-input"
              value={formData.fechaEvaluacion}
              onChange={(e) =>
                handleInputChange("fechaEvaluacion", e.target.value)
              }
              readOnly
            />
          </div>
          <div className="form-group">
            <label htmlFor={`${fieldID}-numCarpetaDigital`}>
              N. Carpeta Digital
            </label>
            <input
              id={`${fieldID}-numCarpetaDigital`}
              type="text"
              className="form-input"
              value={formData.carpetaDigital}
              onChange={(e) =>
                handleInputChange("carpetaDigital", e.target.value)
              }
              readOnly
            />
          </div>
        </form>
      </div>
    </main>
  );
}

export default CandidatoNoBeneficiado;
