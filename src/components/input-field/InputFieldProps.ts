import { RefObject } from "react";

/*export interface InputFieldProps {
  type: string;
  name: string;
  autoComplete: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // Required
  id?: string;
  required?: boolean;
  className?: string;
  checked?: boolean;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
}*/
export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  label?: string; // opcional
  labelClassName?: string; // estilos para el label
  ref?: RefObject<HTMLInputElement | null>;
  // Props para el search box
  showSearchButton?: boolean;
  onSearch?: () => void;
  searchButtonTitle?: string;
  searchButtonClassName?: string;
  type?:
    | "text"
    | "checkbox"
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
