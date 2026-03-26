import React from "react";
import clsx from "clsx";

type ButtonVariant =
  | "submit"
  | "save"
  | "cancel"
  | "pdf"
  | "delete"
  | "edit"
  | "search"
  | "custom";

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  submit:
    "bg-linear-to-r from-[#18529d] to-[#1a6abf] hover:from-[#0f3d76] hover:to-[#135a9e] text-white",
  save: "bg-linear-to-r from-[#199532] to-[#2eb54a] hover:from-[#147a28] hover:to-[#27a040] text-white",
  cancel:
    "bg-linear-to-r from-[#dc2626] to-[#ef4444] hover:from-[#b91c1c] hover:to-[#dc2626] text-white",
  pdf: "bg-linear-to-r from-[#721995] to-[#8e24aa] hover:from-[#52126b] hover:to-[#6a1b9a] text-white",
  delete:
    "bg-linear-to-r from-[#dc2626] to-[#ef4444] hover:from-[#b91c1c] hover:to-[#dc2626] text-white",
  edit: "bg-linear-to-r from-[#f59e0b] to-[#fbbf24] hover:from-[#d97706] hover:to-[#f59e0b] text-white",
  search:
    "bg-linear-to-r from-[#18529d] to-[#1a6abf] hover:from-[#0f3d76] hover:to-[#135a9e] text-white",
  custom: "",
};

const sizeStyles = {
  sm: "px-4 py-2 text-xs gap-1.5",
  md: "px-6 py-2.5 text-sm gap-2",
  lg: "px-8 py-3 text-base gap-2.5",
};

export const CustomButton: React.FC<CustomButtonProps> = ({
  variant = "submit",
  children,
  icon,
  fullWidth = false,
  size = "md",
  className,
  type = "button",
  ...props
}) => {
  const isSubmit = variant === "submit" || type === "submit";

  return (
    <button
      type={isSubmit ? "submit" : type}
      className={clsx(
        "flex items-center justify-center rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-200",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
/**
import { FaSave, FaFilePdf, FaTrash, FaEdit, FaSearch, FaTimes } from "react-icons/fa";

// Botón Guardar (submit)
<Button variant="save" type="submit" icon={<FaSave />}>
  Guardar
</Button>

// Botón Cancelar
<Button variant="cancel" onClick={() => console.log("cancelado")} icon={<FaTimes />}>
  Cancelar
</Button>

// Botón Generar PDF
<Button variant="pdf" onClick={handleGenerarPDF} icon={<FaFilePdf />}>
  Generar PDF
</Button>

// Botón Eliminar
<Button variant="delete" onClick={handleEliminar} icon={<FaTrash />}>
  Eliminar
</Button>

// Botón Editar
<Button variant="edit" onClick={handleEditar} icon={<FaEdit />}>
  Editar
</Button>

// Botón Buscar
<Button variant="search" onClick={handleBuscar} icon={<FaSearch />}>
  Buscar
</Button>

// Botón tamaño pequeño
<Button variant="save" size="sm" icon={<FaSave />}>
  Guardar
</Button>

// Botón ancho completo
<Button variant="save" fullWidth>
  Guardar Cambios
</Button>

// Variante personalizada con colores propios
<Button variant="custom" className="bg-linear-to-r from-[#00adb5] to-[#00fff5] hover:from-[#008b91] hover:to-[#00ccbf] text-white">
  Acción Personalizada
</Button>

// Grupo de botones
<div className="flex gap-3">
  <Button variant="save" type="submit" icon={<FaSave />}>
    Guardar
  </Button>
  <Button variant="cancel" onClick={() => setShowModal(false)} icon={<FaTimes />}>
    Cancelar
  </Button>
  <Button variant="pdf" onClick={handleGenerarPDF} icon={<FaFilePdf />}>
    PDF
  </Button>
</div>
 */
