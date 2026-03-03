import { AlertBannerProps } from "./AlertBannerProps";

export const AlertBanner = ({ type, message }: AlertBannerProps) => {
  const styles =
    type === "success"
      ? "bg-[#199532]/10 border-[#199532]/50 text-[#7cfc9a]"
      : "bg-[#dc143c]/10 border-[#dc143c]/50 text-[#ff7b7b]";
  const icon = type === "success" ? "✓" : "✕";

  return (
    <div
      className={`
        flex items-center gap-3 w-full px-4 py-3 mt-3
        rounded-lg text-sm font-medium border
        animate-[fadeIn_0.35s_ease-in-out]
        ${styles}
      `}
    >
      <span className="text-base leading-none">{icon}</span>
      <span>{message}</span>
    </div>
  );
};