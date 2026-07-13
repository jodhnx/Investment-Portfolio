import { APP_NAME, APP_LOGO } from "@/config/brand";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}

const sizes = {
  sm: 32,
  md: 40,
  lg: 56,
};

export function AppLogo({ size = "md", showName = true, className }: AppLogoProps) {
  const box = sizes[size];
  const textSize = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={APP_LOGO}
        alt={APP_NAME}
        width={box}
        height={box}
        className="aspect-square shrink-0 object-contain"
        style={{ width: box, height: box }}
        decoding="async"
        data-brand-icon
      />
      {showName && (
        <span className={cn("font-semibold tracking-tight", textSize)}>{APP_NAME}</span>
      )}
    </div>
  );
}
