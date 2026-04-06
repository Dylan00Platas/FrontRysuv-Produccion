import AsyncSelect from "react-select/async";

// Componente AsyncSelectField si necesitas búsqueda asíncrona
export const AsyncReactSelectField = <Option,>({
  label,
  error,
  required,
  ...props
}: any) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <AsyncSelect<Option>
        {...props}
        styles={{
          control: (base: any, state: any) => ({
            ...base,
            borderColor: error
              ? "#fca5a5"
              : state.isFocused
                ? "#18529d"
                : "#e2e8f0",
            boxShadow: error
              ? "0 0 0 1px #fca5a5"
              : state.isFocused
                ? "0 0 0 2px rgba(24, 82, 157, 0.1)"
                : "none",
            "&:hover": {
              borderColor: error ? "#fca5a5" : "#cbd5e1",
            },
          }),
        }}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
};

// Uso
const loadOptions = async (inputValue: string) => {
  // TODO-Desarrollo:
  const response = await fetch(`/api/dependencias?search=${inputValue}`);
  const data = await response.json();
  return data.map((item: any) => ({
    value: item.idDependencia,
    label: item.nombre,
    zona: item.zona,
  }));
};

/*
<AsyncReactSelectField
  label="Buscar adscripción"
  loadOptions={loadOptions}
  onChange={(selected) => handleInputChange("adscripcion", selected)}
  placeholder="Escribe para buscar..."
  isClearable
/>;
*/
