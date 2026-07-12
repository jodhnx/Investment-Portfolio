import { APP_NAME, APP_LOGO } from "@/config/brand";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}

const sizes = {
  sm: { box: 32, text: "text-base" },
  md: { box: 40, text: "text-lg" },
  lg: { box: 56, text: "text-2xl" },
};

export function AppLogo({ size = "md", showName = true, className }: AppLogoProps) {
  const s = sizes[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={APP_LOGO}
        alt={APP_NAME}
        width={s.box}
        height={s.box}
        className="shrink-0"
        style={{ width: s.box, height: s.box }}
      />
      {showName && (
        <span className={cn("font-semibold tracking-tight", s.text)}>{APP_NAME}</span>
      )}
    </div>
  );
}
