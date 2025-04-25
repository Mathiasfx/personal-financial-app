import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import localFont from "next/font/local";
import "./globals.css";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material";
import { lightTheme } from "./theme/theme";

const lufga = localFont({
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
  title: "Finanzas",
  description:
    "Ayuda a los usuarios a gestionar sus finanzas personales al recopilar información sobre ingresos, egresos, gastos hormiga, ahorros e inversiones  - Mathias Pereira ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={lufga.className} suppressHydrationWarning={true}>
        <AuthProvider>
          <CssBaseline />
          <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
