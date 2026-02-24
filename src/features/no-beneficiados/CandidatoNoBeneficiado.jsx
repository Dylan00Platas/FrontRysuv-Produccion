import { useState, useEffect, useContext } from "react";

import "./CandidatoNoBeneficiado.css";
import Sidebar from "@/components/layout/sidebar/Sidebar.jsx";
import { UserContext } from "@/utils/UserContext.jsx";

function CandidatoNoBeneficiado() {
  const { usuario } = useContext(UserContext);

  const [formData, setFormData] = useState({
    nombre: "",
    profesion: "",
    region: "",
    resultado: "",
    fechaEvaluacion: "",
    carpetaDigital: "",
  });

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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Candidato No Beneficiado:", formData);
  };

  return (
    <div className="candidato-page">
      <Sidebar tipoAcceso={usuario.FKidTipoAcceso} />
      <main className="main-content">
        <div className="page-header2">
          <h1 className="page-title2">Candidato No Beneficiado</h1>
        </div>
        <div className="contenido-cedula-inner">
          <form className="form-grid" onSubmit={handleSubmit}>
            {/* Campos */}
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                className="form-input"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                readOnly
              />
            </div>
            <div className="form-group">
              <label>Profesión</label>
              <input
                type="text"
                className="form-input"
                value={formData.profesion}
                onChange={(e) => handleInputChange("profesion", e.target.value)}
                readOnly
              />
            </div>
            <div className="form-group">
              <label>Región</label>
              <input
                type="text"
                className="form-input"
                value={formData.region}
                onChange={(e) => handleInputChange("region", e.target.value)}
                readOnly
              />
            </div>
            <div className="form-group">
              <label>Resultado</label>
              <input
                type="text"
                className="form-input"
                value={formData.resultado}
                onChange={(e) => handleInputChange("resultado", e.target.value)}
                readOnly
              />
            </div>
            <div className="form-group">
              <label>Fecha de Evaluación de Competencias</label>
              <input
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
              <label>N. Carpeta Digital</label>
              <input
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
    </div>
  );
}

export default CandidatoNoBeneficiado;
