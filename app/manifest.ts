import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Samuel AI — SF Growth AI",
    short_name: "Samuel AI",
    description: "Seu Conselho Executivo Digital.",
    start_url: "/samuel-ai",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f4f7fc",
    theme_color: "#f4f7fc",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/icons/samuel-app-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/samuel-app-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/samuel-app-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
