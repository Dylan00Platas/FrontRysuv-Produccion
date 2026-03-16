import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Select, { SingleValue } from "react-select";

import "./NoBeneficiados.css";
import { useDependencias } from "@/hooks/useDependencias";
import { useProcesosNoBeneficiados } from "@/hooks/useProcesosNoBeneficiados";

// Interfaces de UI ---------------------------------------------------------
interface ICargaDatos {
  id: number;
  nombre: string;
  profesion: string;
  resultado: string;
  region: string;
  fechaEvaluacion: string;
  numCarpeta: number;
}
interface IFiltro {
  region: string;
  profesion: string;
  resultado: string;
}
interface ISelectOption {
  value: string;
  label: string;
}
const FILTRO_INICIAL: IFiltro = { region: "", profesion: "", resultado: "" };

function NoBeneficiados() {
  const navigate = useNavigate();
  const { data: dataDependencias, loading: loadingDeps } = useDependencias();
  const {
    data: dataProcesosNoBeneficiados,
    loading: loadingProcesos,
    error: errorProcesos,
  } = useProcesosNoBeneficiados();

  // Filtros -------------------------------------------------------------------
  const [filtros, setFiltros] = useState<IFiltro>(FILTRO_INICIAL);

  const handleFiltro =
    (campo: keyof IFiltro) => (opcion: SingleValue<ISelectOption>) => {
      setFiltros((prev) => ({ ...prev, [campo]: opcion?.value ?? "" }));
    };

  // Mapeo de procesos a ICargaDatos -------------------------------------------
  const candidatos = useMemo<ICargaDatos[]>(() => {
    if (!dataProcesosNoBeneficiados?.procesos) return [];

    return dataProcesosNoBeneficiados.procesos.map((p) => {
      const zonaDependencia =
        dataDependencias?.dependencias.find(
          (d) => d.idDependencia === p.FKIdDependencia,
        )?.zona ?? "Sin región";

      return {
        id: p.idProceso,
        nombre: p.nombreCandidato,
        profesion: p.categoriaPuestoOrigen || "Sin dato",
        resultado: p.resultadoProcesoEvaluacion || "Sin resultado",
        region: zonaDependencia,
        fechaEvaluacion: p.fechaEvaluacionCompetencias
          ? p.fechaEvaluacionCompetencias.split("T")[0]
          : "",
        numCarpeta: p.numCarpeta || 0,
      };
    });
  }, [dataProcesosNoBeneficiados, dataDependencias]);

  // Opciones de filtros ---------------------------------------------------------
  const regionOptions = useMemo<ISelectOption[]>(
    () =>
      [...new Set(candidatos.map((c) => c.region))].map((r) => ({
        value: r,
        label: r,
      })),
    [candidatos],
  );

  const profesionOptions = useMemo<ISelectOption[]>(
    () =>
      [...new Set(candidatos.map((c) => c.profesion))].map((p) => ({
        value: p,
        label: p,
      })),
    [candidatos],
  );

  const resultadoOptions = useMemo<ISelectOption[]>(
    () =>
      [...new Set(candidatos.map((c) => c.resultado))].map((r) => ({
        value: r,
        label: r,
      })),
    [candidatos],
  );

  // Aplicación de filtrado -----------------------------------------------------
  // MEJORA: useMemo para no re-filtrar en cada render.
  const candidatosFiltrados = useMemo<ICargaDatos[]>(
    () =>
      candidatos.filter(
        (c) =>
          (!filtros.region || filtros.region === c.region) &&
          (!filtros.profesion || filtros.profesion === c.profesion) &&
          (!filtros.resultado || filtros.resultado === c.resultado),
      ),
    [candidatos, filtros],
  );

  // Estados de carga / error --------------------------------------------------
  const isLoading = loadingDeps || loadingProcesos;

  if (isLoading) {
    return (
      <main className="main-content">
        <p className="estado-mensaje">Cargando datos…</p>
      </main>
    );
  }

  if (errorProcesos) {
    return (
      <main className="main-content">
        <p className="estado-mensaje estado-error">
          Error al cargar los datos. Intente más tarde.
        </p>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="page-header2">
        <h1 className="page-title2">No beneficiados</h1>
      </div>

      <div className="contenido-candidatos-inner">
        {/* Filtros */}
        <div className="filtros-combobox">
          <div>
            <label>Región</label>
            <Select<ISelectOption>
              options={regionOptions}
              value={
                regionOptions.find((o) => o.value === filtros.region) ?? null
              }
              onChange={handleFiltro("region")}
              placeholder="Selecciona región…"
              isClearable
            />
          </div>

          <div>
            <label>Profesión</label>
            <Select<ISelectOption>
              options={profesionOptions}
              value={
                profesionOptions.find((o) => o.value === filtros.profesion) ??
                null
              }
              onChange={handleFiltro("profesion")}
              placeholder="Selecciona profesión…"
              isClearable
              isSearchable
            />
          </div>

          <div>
            <label>Resultado</label>
            <Select<ISelectOption>
              options={resultadoOptions}
              value={
                resultadoOptions.find((o) => o.value === filtros.resultado) ??
                null
              }
              onChange={handleFiltro("resultado")}
              placeholder="Selecciona resultado…"
              isClearable
            />
          </div>
        </div>

        {/* Tabla */}
        <table className="tabla-candidatos">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Profesión</th>
              <th>Resultado</th>
              <th>Región</th>
            </tr>
          </thead>
          <tbody>
            {candidatosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center">
                  No hay candidatos con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              candidatosFiltrados.map((c) => (
                <tr
                  key={c.id}
                  className="clickable-row"
                  onClick={() =>
                    navigate("/candidato-no-beneficiado", {
                      state: { candidato: c },
                    })
                  }
                >
                  <td>{c.nombre}</td>
                  <td>{c.profesion}</td>
                  <td>{c.resultado}</td>
                  <td>{c.region}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default NoBeneficiados;
