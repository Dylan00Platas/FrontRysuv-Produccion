import { useState, useCallback } from "react";

type ToastTipo = "exito" | "error" | "advertencia" | "";

interface Toast {
  texto: string;
  tipo: ToastTipo;
}

interface UseToastReturn {
  toast: Toast;
  mostrarToast: (texto: string, tipo: ToastTipo, duracion?: number) => void;
  limpiarToast: () => void;
}

const TOAST_VACIO: Toast = { texto: "", tipo: "" };

export function useToast(): UseToastReturn {
  const [toast, setToast] = useState<Toast>(TOAST_VACIO);

  const limpiarToast = useCallback(() => setToast(TOAST_VACIO), []);

  const mostrarToast = useCallback(
    (texto: string, tipo: ToastTipo, duracion = 3000) => {
      setToast({ texto, tipo });
      setTimeout(limpiarToast, duracion);
    },
    [limpiarToast],
  );

  return { toast, mostrarToast, limpiarToast };
}
