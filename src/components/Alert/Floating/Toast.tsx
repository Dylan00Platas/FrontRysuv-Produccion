import type { FC } from "react";

interface ToastProps {
  texto: string;
  tipo: "exito" | "error" | "";
}

const ESTILOS: Record<string, string> = {
  exito: "bg-linear-to-r from-emerald-500 to-emerald-600",
  error: "bg-linear-to-r from-red-500 to-rose-600",
};

export const Toast: FC<ToastProps> = ({ texto, tipo }) => {
  if (!texto) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5
        py-3.5 rounded-xl shadow-2xl text-sm font-semibold text-white
        transition-all duration-300 ${ESTILOS[tipo] ?? ""}`}
    >
      <span className="text-base">{texto}</span>
    </div>
  );
};
