// Estilos custom para react-select (fuera del componente)
export const selectStyles = {
  control: (base: object, state: { isFocused: boolean }) => ({
    ...base,
    borderColor: state.isFocused ? "#18529d" : "#e2e8f0",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(24,82,157,0.15)" : "none",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "#f8fafc",
    "&:hover": { borderColor: "#18529d" },
    minHeight: "40px",
  }),
  option: (
    base: object,
    state: { isSelected: boolean; isFocused: boolean },
  ) => ({
    ...base,
    fontSize: "13px",
    backgroundColor: state.isSelected
      ? "#18529d"
      : state.isFocused
        ? "#eff6ff"
        : "white",
    color: state.isSelected ? "white" : "#334155",
  }),
  placeholder: (base: object) => ({
    ...base,
    color: "#94a3b8",
    fontSize: "13px",
  }),
  singleValue: (base: object) => ({
    ...base,
    color: "#1e293b",
    fontSize: "13px",
  }),
};

// Componente badge (fuera del componente Cedulas o en archivo propio)
export function CedulaBadge({ tipo }: { tipo: string }) {
  const config: Record<string, { label: string; classes: string }> = {
    Interna: {
      label: "Interna",
      classes: "bg-pink-100 text-pink-700 ring-1 ring-pink-200",
    },
    Resultados: {
      label: "Resultados",
      classes: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    },
    Archivadas: {
      label: "Archivada",
      classes: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
    },
  };

  const { label, classes } = config[tipo] ?? {
    label: tipo,
    classes: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${classes}`}
    >
      {label}
    </span>
  );
}
