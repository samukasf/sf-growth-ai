import type { Metadata, Viewport } from "next";

import { APP_DESCRIPTION, APP_NAME } from "@/constants";

import "@/styles/globals.css";
import "@/styles/samuel-hologram-v3.css";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  applicationName: "Samuel AI",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Samuel AI",
  },
  icons: {
    icon: [
      { url: "/icons/samuel-app-icon.svg", type: "image/svg+xml" },
      { url: "/icons/samuel-app-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/samuel-app-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f4f7fc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
