import type { Metadata } from "next";

import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CssBaseline } from "@mui/material";

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
      <CssBaseline />

      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
