import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Select, { SingleValue } from "react-select";

import "./NoBeneficiados.css";
import { useDependencias } from "@/hooks/useDependencias";
import { useProcesosNoBeneficiados } from "@/hooks/useProcesosNoBeneficiados";
import ILabelValue from "@/interfaces/LabelValue";
import MainHeader from "@/components/header/MainHeader";

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
    (campo: keyof IFiltro) => (opcion: SingleValue<ILabelValue>) => {
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
  const regionOptions = useMemo<ILabelValue[]>(
    () =>
      [...new Set(candidatos.map((c) => c.region))].map((r) => ({
        value: r,
        label: r,
      })),
    [candidatos],
  );

  const profesionOptions = useMemo<ILabelValue[]>(
    () =>
      [...new Set(candidatos.map((c) => c.profesion))].map((p) => ({
        value: p,
        label: p,
      })),
    [candidatos],
  );

  const resultadoOptions = useMemo<ILabelValue[]>(
    () =>
      [...new Set(candidatos.map((c) => c.resultado))].map((r) => ({
        value: r,
        label: r,
      })),
    [candidatos],
  );

  // Aplicación de filtrado -----------------------------------------------------
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

  return (
    <main className="ml-65 w-[calc(100%-260px)] px-[4%] py-[2%] overflow-y-auto min-h-screen bg-slate-50">
      <MainHeader
        title="Candidatos no beneficiados"
        subtitle="Gestión de candidatos"
      />

      <div className="contenido-candidatos-inner">
        {/* Filtros */}
        <div className="filtros-combobox">
          <div>
            <label htmlFor="nb-region">Región</label>
            <Select<ILabelValue>
              inputId="nb-region"
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
            <label htmlFor="nb-profesion">Profesión</label>
            <Select<ILabelValue>
              inputId="nb-profesion"
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
            <label htmlFor="nb-resultado">Resultado</label>
            <Select<ILabelValue>
              inputId="nb-resultado"
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
