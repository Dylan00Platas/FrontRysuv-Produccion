// useCedulasFilter.ts
import ILabelValue from "@/interfaces/LabelValue";
import { ICedulaBase } from "@/schemas/cedulas/GetCedula";
import { useState, useMemo } from "react";
import type { SingleValue } from "react-select";

const SEARCH_FIELDS = [
  "folio",
  "nombreCandidato",
  "dependencia",
  "puesto",
  "resultado",
] as const;

function matchesCedula(
  c: ICedulaBase,
  filtro: SingleValue<ILabelValue>,
): boolean {
  if (!filtro?.value) return c.estado !== true;
  if (filtro.value === "Archivadas") return c.estado === true;
  return c.folio === filtro.value && c.estado !== true;
}

function matchesFilters(
  c: ICedulaBase,
  dependencia: SingleValue<ILabelValue>,
  resultado: SingleValue<ILabelValue>,
): boolean {
  return (
    (!dependencia || c.dependencia === dependencia.value) &&
    (!resultado || c.resultado === resultado.value)
  );
}

function matchesSearch(cedula: ICedulaBase, term: string): boolean {
  if (!term) return true;
  const t = term.toLowerCase();
  return SEARCH_FIELDS.some((field) => cedula[field].toLowerCase().includes(t));
}

interface UseCedulasFilterReturn {
  // Filtros
  cedulaFiltro: SingleValue<ILabelValue>;
  dependenciaFiltro: SingleValue<ILabelValue>;
  resultadoFiltro: SingleValue<ILabelValue>;
  searchTerm: string;
  // Setters
  setCedulaFiltro: (v: SingleValue<ILabelValue>) => void;
  setDependenciaFiltro: (v: SingleValue<ILabelValue>) => void;
  setResultadoFiltro: (v: SingleValue<ILabelValue>) => void;
  setSearchTerm: (v: string) => void;
  // Resultado
  cedulasFiltradas: ICedulaBase[];
  resetFilters: () => void;
}

export function useCedulasFiltradas(
  cedulas: ICedulaBase[] | null,
): UseCedulasFilterReturn {
  const [cedulaFiltro, setCedulaFiltro] =
    useState<SingleValue<ILabelValue>>(null);
  const [dependenciaFiltro, setDependenciaFiltro] =
    useState<SingleValue<ILabelValue>>(null);
  const [resultadoFiltro, setResultadoFiltro] =
    useState<SingleValue<ILabelValue>>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const cedulasFiltradas = useMemo(
    () =>
      (cedulas ?? []).filter(
        (c) =>
          matchesCedula(c, cedulaFiltro) &&
          matchesFilters(c, dependenciaFiltro, resultadoFiltro) &&
          matchesSearch(c, searchTerm),
      ),
    [cedulas, cedulaFiltro, dependenciaFiltro, resultadoFiltro, searchTerm],
  );

  function resetFilters() {
    setCedulaFiltro(null);
    setDependenciaFiltro(null);
    setResultadoFiltro(null);
    setSearchTerm("");
  }

  return {
    cedulaFiltro,
    dependenciaFiltro,
    resultadoFiltro,
    searchTerm,
    setCedulaFiltro,
    setDependenciaFiltro,
    setResultadoFiltro,
    setSearchTerm,
    cedulasFiltradas,
    resetFilters,
  };
}
