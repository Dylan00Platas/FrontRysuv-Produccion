import clsx from "clsx";
import Select, { Props as SelectProps, GroupBase } from "react-select";

export interface ReactSelectFieldProps<
  Option = unknown,
  IsMulti extends boolean = false, //isMulti
  Group extends GroupBase<Option> = GroupBase<Option>,
> extends SelectProps<Option, IsMulti, Group> {
  label?: string;
  labelClassName?: string;
  error?: string;
  required?: boolean;
  containerClassName?: string;
}

export const ReactSelectField = <
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({
  label,
  labelClassName,
  error,
  required,
  containerClassName,
  className,
  styles,
  ...props
}: ReactSelectFieldProps<Option, IsMulti, Group>) => {
  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      minHeight: "42px",
      borderColor: error ? "#fca5a5" : state.isFocused ? "#18529d" : "#e2e8f0",
      boxShadow: error
        ? "0 0 0 1px #fca5a5"
        : state.isFocused
          ? "0 0 0 2px rgba(24, 82, 157, 0.1)"
          : "none",
      "&:hover": {
        borderColor: error ? "#fca5a5" : "#cbd5e1",
      },
      ...styles?.control,
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#18529d"
        : state.isFocused
          ? "#f1f5f9"
          : "white",
      color: state.isSelected ? "white" : "#1e293b",
      "&:active": {
        backgroundColor: state.isSelected ? "#18529d" : "#e2e8f0",
      },
      ...styles?.option,
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "#94a3b8",
      ...styles?.placeholder,
    }),
    ...styles,
  };

  return (
    <div className={clsx("flex flex-col gap-1", containerClassName)}>
      {label && (
        <label
          htmlFor={props.inputId}
          className={clsx(
            "text-sm font-medium text-slate-700",
            error && "text-red-600",
            labelClassName,
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <Select<Option, IsMulti, Group>
        {...props}
        styles={customStyles}
        className={clsx("react-select-container", className)}
        classNamePrefix="react-select"
      />

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
};

/*
interface IDependenciaOption {
  idDependencia: number;
  nombre: string;
  zona: string;
}

<ReactSelectField<IDependenciaOption>
  label="Adscripción"
  inputId="constancia-adscripcion"
  options={dependenciasOptions}
  value={formData.adscripcion}
  onChange={(selected) => {
    handleInputChange("adscripcion", selected);
  }}
  getOptionLabel={(option) => `${option.nombre} (${option.zona})`}
  getOptionValue={(option) => String(option.idDependencia)}
  placeholder="Escribe o selecciona una adscripción"
  isClearable
  isSearchable
  required
/>

// Con opciones simples (array de strings)
const opcionesSimples = [
  { value: "opcion1", label: "Opción 1" },
  { value: "opcion2", label: "Opción 2" },
];
<ReactSelectField
  label="Selecciona una opción"
  options={opcionesSimples}
  value={selectedOption}
  onChange={setSelectedOption}
  placeholder="Seleccionar..."
  error={!selectedOption ? "Este campo es requerido" : undefined}
/>

// Con múltiples selecciones
<ReactSelectField
  label="Categorías"
  options={categoriasOptions}
  isMulti
  value={categoriasSeleccionadas}
  onChange={setCategoriasSeleccionadas}
  placeholder="Selecciona una o más categorías"
/>

// Con estilos personalizados adicionales
<ReactSelectField
  label="Adscripción"
  options={dependenciasOptions}
  value={formData.adscripcion}
  onChange={(selected) => handleInputChange("adscripcion", selected)}
  getOptionLabel={(option) => option.nombre}
  getOptionValue={(option) => String(option.idDependencia)}
  placeholder="Buscar adscripción..."
  isClearable
  isSearchable
  containerClassName="w-full"
  className="text-sm"
  styles={{
    menu: (base) => ({
      ...base,
      zIndex: 50,
    }),
  }}
/>
 */
