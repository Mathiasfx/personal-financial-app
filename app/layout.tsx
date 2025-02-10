import type { Metadata } from "next";

import { AuthProvider } from "@/context/AuthContext";
import { CssBaseline } from "@mui/material";
import localFont from "next/font/local";
import "./globals.css";

const fontPrincipal = localFont({
  src: [
    {
      path: "/fonts/LufgaRegular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "/fonts/LufgaMedium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "/fonts/LufgaBold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-principal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Finanzas webapp",
  description: "Mathias Pereira DEV",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={fontPrincipal.className}>
        <CssBaseline />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
