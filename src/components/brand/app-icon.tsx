import { APP_NAME, APP_LOGO, APP_ICON_512 } from "@/config/brand";
import { cn } from "@/lib/utils";

interface AppIconProps {
  size?: number;
  className?: string;
  /** UI: transparentes Logo · App-Icon: quadratisches PNG mit Hintergrund */
  variant?: "logo" | "app";
  alt?: string;
}

/** Quadratisches App-Icon / Logo – immer proportional, nie verzerrt */
export function AppIcon({
  size = 40,
  className,
  variant = "logo",
  alt = APP_NAME,
}: AppIconProps) {
  const src = variant === "app" ? APP_ICON_512 : APP_LOGO;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("aspect-square object-contain", className)}
      style={{ width: size, height: size }}
      decoding="async"
      data-brand-icon
    />
  );
}
