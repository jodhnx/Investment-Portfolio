import type { MetadataRoute } from "next";
import {
  APP_APPLE_TOUCH,
  APP_DESCRIPTION,
  APP_ICON,
  APP_ICON_192,
  APP_ICON_512,
  APP_ICON_MASKABLE,
  APP_NAME,
  APP_TAGLINE,
} from "@/config/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_NAME} – ${APP_TAGLINE}`,
    short_name: APP_NAME,
    description: APP_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    lang: "de",
    categories: ["finance", "productivity"],
    icons: [
      {
        src: APP_ICON_192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: APP_ICON_512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: APP_ICON_MASKABLE,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: APP_APPLE_TOUCH,
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: APP_ICON,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
