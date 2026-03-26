import React from "react";
import { FiHelpCircle } from "react-icons/fi";

interface ModalHelpProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  showWarning?: boolean;
  warningText?: string;
  confirmText?: string;
}

export const ModalHelp: React.FC<ModalHelpProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showWarning,
  warningText,
  confirmText = "Aceptar",
}: ModalHelpProps) => {
  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={onClose}
    >
      <div
        role="presentation"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Header del modal */}
        <div className="bg-linear-to-r from-[#18529d] to-[#1a6abf] px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <FiHelpCircle className="text-white text-lg" />
          </div>
          <h2 className="text-white font-bold text-lg">{title}</h2>
        </div>

        {/* Body del modal */}
        <div className="px-6 py-5 flex flex-col gap-3">
          {children}
          {showWarning && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <p className="text-xs text-amber-700 font-semibold leading-relaxed">
                {warningText}
              </p>
            </div>
          )}
        </div>

        {/* Footer del modal */}
        <div className="px-6 pb-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-[#18529d] rounded-lg hover:bg-[#1a6abf] transition-colors duration-200"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ButtonShowModalHelpProps {
  onClick: () => void;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  offset?: {
    x?: number;
    y?: number;
  };
  size?: "sm" | "md" | "lg";
  tooltip?: string;
  className?: string;
  iconClassName?: string;
  showPulse?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-11 h-11",
  lg: "w-14 h-14",
};

const iconSizeClasses = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
};

const positionClasses = {
  "bottom-right": "bottom-6 right-6",
  "bottom-left": "bottom-6 left-6",
  "top-right": "top-6 right-6",
  "top-left": "top-6 left-6",
};

export const ButtonShowModalHelp: React.FC<ButtonShowModalHelpProps> = ({
  onClick,
  position = "bottom-right",
  offset = { x: 0, y: 0 },
  size = "md",
  tooltip = "Ayuda",
  className = "",
  iconClassName = "",
  showPulse = false,
}) => {
  const getPositionStyles = () => {
    const basePosition = positionClasses[position];
    let customPosition = basePosition;

    if (offset.x || offset.y) {
      // Si hay offset, reemplaza los valores por defecto
      if (position === "bottom-right") {
        customPosition = `bottom-[calc(1.5rem+${offset.y || 0}px)] right-[calc(1.5rem+${offset.x || 0}px)]`;
      } else if (position === "bottom-left") {
        customPosition = `bottom-[calc(1.5rem+${offset.y || 0}px)] left-[calc(1.5rem+${offset.x || 0}px)]`;
      } else if (position === "top-right") {
        customPosition = `top-[calc(1.5rem+${offset.y || 0}px)] right-[calc(1.5rem+${offset.x || 0}px)]`;
      } else if (position === "top-left") {
        customPosition = `top-[calc(1.5rem+${offset.y || 0}px)] left-[calc(1.5rem+${offset.x || 0}px)]`;
      }
    }

    return customPosition;
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        fixed
        z-50
        ${sizeClasses[size]}
        ${getPositionStyles()}
        flex items-center justify-center rounded-full
        bg-[#18529d] text-white shadow-lg
        hover:bg-[#1a6abf] hover:scale-110
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-[#18529d]/50 focus:ring-offset-2
        active:scale-95
        ${showPulse && "animate-pulse"}
        ${className}
      `}
      title={tooltip}
      aria-label={tooltip}
    >
      <FiHelpCircle className={`${iconSizeClasses[size]} ${iconClassName}`} />
    </button>
  );
};
