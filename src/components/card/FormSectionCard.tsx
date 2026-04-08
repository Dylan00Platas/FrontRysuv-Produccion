import clsx from "clsx";

type FormSectionCardProps = {
  title: string;
  className?: string;
};

export default function FormSectionCard({
  title,
  className,
  children,
}: React.PropsWithChildren<FormSectionCardProps>) {
  return (
    <div
      className={clsx(
        "bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible",
        className,
      )}
    >
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <div className="w-1 h-5 rounded-full bg-[#18529d]" />
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          {title || "Sin título"} {/* Fallback para debugging */}
        </h2>
      </div>
      <div className="px-6 py-5 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5 w-full">
        {children}
      </div>
    </div>
  );
}
