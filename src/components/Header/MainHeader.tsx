type MainHeaderProps = {
  title: string;
  subtitle: string;
};

export default function MainHeader({ title, subtitle }: MainHeaderProps) {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
          {subtitle}
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#18529d]">
          {title}
        </h1>
        <div className="mt-2 h-1 w-16 rounded-full bg-linear-to-r from-[#18529d] to-[#199532]" />
      </div>
    </>
  );
}
