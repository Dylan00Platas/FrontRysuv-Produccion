import React from "react";
import clsx from "clsx";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectFieldProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "onChange"
> {
  className?: string;
  label?: string;
  labelClassName?: string;
  options: SelectOption[];
  placeholder?: string;
  onChange?: (value: string | number) => void;
  value?: string | number;
  error?: string;
  required?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  className,
  label,
  labelClassName,
  options,
  placeholder = "Seleccionar",
  onChange,
  value,
  error,
  required,
  id,
  disabled,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value);
  };

  const selectElement = (
    <div className="relative">
      <select
        id={id}
        value={value ?? ""}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        className={clsx(
          "w-full px-3 py-2.5 text-sm border rounded-lg bg-white text-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 appearance-none cursor-pointer",
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
            : "border-slate-200 focus:border-[#18529d] focus:ring-2 focus:ring-[#18529d]/10 hover:border-slate-300",
          disabled && "bg-slate-50 cursor-not-allowed text-slate-500",
          className,
        )}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {/* Icono de flecha personalizado */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          className={clsx(
            "w-4 h-4 transition-colors",
            error ? "text-red-400" : "text-slate-400",
            disabled && "text-slate-300",
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={id}
          className={clsx(
            "text-sm font-medium",
            error ? "text-red-600" : "text-slate-700",
            labelClassName,
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {selectElement}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
};

/*
// Uso básico
<SelectField
  label="Resultado Final"
  options={[
    { value: "Recomendable", label: "Recomendable" },
    { value: "Recomendable con observaciones", label: "Recomendable con observaciones" },
    { value: "No recomendable", label: "No recomendable" }
  ]}
  value={formData.resultadoFinal}
  onChange={(value) => handleInputChange("resultadoFinal", value)}
  placeholder="Seleccionar"
/>

// Con opciones deshabilitadas
<SelectField
  label="Estado"
  options={[
    { value: "activo", label: "Activo" },
    { value: "inactivo", label: "Inactivo", disabled: true },
    { value: "pendiente", label: "Pendiente" }
  ]}
  value={estado}
  onChange={setEstado}
/>

// Con validación de error
<SelectField
  label="Resultado Final"
  options={resultadosOptions}
  value={formData.resultadoFinal}
  onChange={(value) => handleInputChange("resultadoFinal", value)}
  error={!formData.resultadoFinal ? "Este campo es requerido" : undefined}
  required
/>

// Deshabilitado
<SelectField
  label="Resultado Final"
  options={resultadosOptions}
  value={formData.resultadoFinal}
  disabled={isReadOnly}
/>

// Sin label
<SelectField
  options={resultadosOptions}
  value={formData.resultadoFinal}
  onChange={(value) => handleInputChange("resultadoFinal", value)}
  placeholder="Seleccione un resultado"
/>
 */
