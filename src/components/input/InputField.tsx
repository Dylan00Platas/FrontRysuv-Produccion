import clsx from "clsx";
import { FaSearch } from "react-icons/fa";

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  label?: string;
  labelClassName?: string;
  ref?: React.RefObject<HTMLInputElement | null>; // Para manejo de archivos
  // Props para searchbox
  showSearchButton?: boolean;
  onSearch?: () => void;
  searchButtonTitle?: string;
  searchButtonClassName?: string;
  type?:
    | "text"
    | "number"
    | "email"
    | "password"
    | "tel"
    | "url"
    | "date"
    | "datetime-local"
    | "time"
    | "month"
    | "week"
    | string;
}

export const InputField: React.FC<InputFieldProps> = ({
  className,
  label,
  labelClassName,
  id,
  // Props para searchbox
  showSearchButton = false,
  onSearch,
  searchButtonTitle = "Buscar",
  searchButtonClassName,
  type = "text",
  ...props
}) => {
  const inputElement = (
    <div className="relative">
      <input
        id={id}
        type={type}
        {...props}
        className={clsx(
          "w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder:text-slate-300 transition-all duration-200 focus:outline-none focus:border-[#18529d] focus:ring-2 focus:ring-[#18529d]/10 hover:border-slate-300",
          showSearchButton && "pr-12",
          className,
        )}
      />
      {showSearchButton && onSearch && (
        <button
          type="button"
          onClick={onSearch}
          title={searchButtonTitle}
          className={clsx(
            "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-[#18529d] text-white hover:bg-[#199532] transition-colors duration-200",
            searchButtonClassName,
          )}
        >
          <FaSearch className="text-base" />
        </button>
      )}
    </div>
  );

  if (label) {
    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={id}
          className={clsx("text-sm font-medium text-slate-700", labelClassName)}
        >
          {label}
        </label>
        {inputElement}
      </div>
    );
  }

  return inputElement;
};
