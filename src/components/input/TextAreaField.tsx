import clsx from "clsx";

export interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  label?: string;
  labelClassName?: string;
  rows?: number;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  className,
  label,
  labelClassName,
  id,
  rows = 3,
  ...props
}) => {
  const textareaElement = (
    <textarea
      id={id}
      rows={rows}
      {...props}
      className={clsx(
        "w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder:text-slate-300 transition-all duration-200 focus:outline-none focus:border-[#18529d] focus:ring-2 focus:ring-[#18529d]/10 hover:border-slate-300 resize-y",
        className,
      )}
    />
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
        {textareaElement}
      </div>
    );
  }

  return textareaElement;
};

/*
<TextArea
  label="Observaciones"
  placeholder="Escriba sus observaciones aquí..."
  rows={4}
  value={observaciones}
  onChange={(e) => setObservaciones(e.target.value)}
/>

<TextArea
  label="Descripción"
  placeholder="Descripción detallada..."
  rows={6}
  required
/>
 */
