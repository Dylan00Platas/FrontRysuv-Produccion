import { InputFieldProps } from "./InputFieldProps";

export const InputField = ({ className = "", ...props }: InputFieldProps) => (
  <input
    {...props}
    className={[
      "w-full bg-transparent",
      "border border-white/20 hover:border-white/40",
      "focus:border-[#199532] focus:shadow-[0_0_0_3px_rgba(25,149,50,0.15)]",
      "px-4 py-3 rounded-lg text-sm text-white",
      "placeholder:text-white/35 outline-none",
      "transition-all duration-300",
      className,
    ].join(" ")}
  />
);
