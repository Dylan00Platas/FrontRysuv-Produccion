import React from "react";
import clsx from "clsx";

export interface CheckboxFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange"
> {
  className?: string;
  label?: string;
  labelClassName?: string;
  description?: string;
  error?: string;
  onChange?: (checked: boolean) => void;
  checked?: boolean;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  className,
  label,
  labelClassName,
  description,
  error,
  onChange,
  checked = false,
  id,
  disabled,
  required,
  ...props
}) => {
  const checkboxId =
    id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked);
  };

  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      <div className="flex items-start gap-3">
        <div className="relative flex items-center justify-center">
          <input
            id={checkboxId}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            required={required}
            className={clsx(
              "rounded border-slate-300 text-[#18529d] focus:ring-[#18529d]/20 focus:ring-2 focus:ring-offset-0 transition-colors duration-200 cursor-pointer",
              error && "border-red-300 focus:ring-red-500/20",
              disabled && "bg-slate-100 cursor-not-allowed opacity-60",
              "checked:bg-[#18529d] checked:hover:bg-[#1a6abf] checked:focus:bg-[#18529d]",
              "hover:border-[#18529d]",
            )}
            {...props}
          />
        </div>

        <div className="flex flex-col gap-0.5">
          {label && (
            <label
              htmlFor={checkboxId}
              className={clsx(
                "font-medium text-slate-700 cursor-pointer select-none",
                disabled && "cursor-not-allowed opacity-60",
                labelClassName,
              )}
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}

          {description && (
            <p className={clsx("text-slate-500", disabled && "opacity-60")}>
              {description}
            </p>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-red-600 mt-1 ml-8">{error}</p>}
    </div>
  );
};

/*
// Uso básico
<CheckboxField
  label="Acepto los términos y condiciones"
  checked={aceptaTerminos}
  onChange={setAceptaTerminos}
/>

// Con descripción
<CheckboxField
  label="Recordar mis datos"
  description="No volver a preguntar en este dispositivo"
  checked={recordarDatos}
  onChange={setRecordarDatos}
/>

// Con error de validación
<CheckboxField
  label="Acepto los términos y condiciones"
  checked={aceptaTerminos}
  onChange={setAceptaTerminos}
  error={!aceptaTerminos ? "Debes aceptar los términos para continuar" : undefined}
  required
/>

// Diferentes tamaños
<CheckboxField
  label="Checkbox pequeño"
  size="sm"
  checked={checked}
  onChange={setChecked}
/>

<CheckboxField
  label="Checkbox mediano (default)"
  size="md"
  checked={checked}
  onChange={setChecked}
/>

<CheckboxField
  label="Checkbox grande"
  size="lg"
  checked={checked}
  onChange={setChecked}
/>

// Deshabilitado
<CheckboxField
  label="Opción deshabilitada"
  checked={false}
  disabled
/>

// Grupo de checkboxes
<div className="space-y-3">
  <CheckboxField
    label="Opción 1"
    checked={opcion1}
    onChange={setOpcion1}
  />
  <CheckboxField
    label="Opción 2"
    checked={opcion2}
    onChange={setOpcion2}
  />
  <CheckboxField
    label="Opción 3"
    checked={opcion3}
    onChange={setOpcion3}
  />
</div>

// Con estado inicial
<CheckboxField
  label="Activar notificaciones"
  description="Recibirás alertas por correo"
  checked={notificaciones}
  onChange={(checked) => {
    if (checked) {
      console.log("Notificaciones activadas");
    } else {
      console.log("Notificaciones desactivadas");
    }
    setNotificaciones(checked);
  }}
/>
 */
