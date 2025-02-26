"use client";
import { ReactNode, useState } from "react";
import AppBar from "@mui/material/AppBar";

import DashboardDrawer from "./components/DashboardDrawer";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}

      <DashboardDrawer open={drawerOpen} toggleDrawer={toggleDrawer} />

      <div className="flex-1 flex flex-col">
        <AppBar
          position="sticky"
          sx={{
            height: "64px",
            boxShadow: "none",
            color: "#1f2937",
            backgroundColor: "#f3f4f6",
            borderBottom: { xs: "1px solid #e5e7eb", md: "none" },
          }}
        ></AppBar>

        <main className="flex-1 p-6 bg-gray-100">{children}</main>
      </div>
    </div>
  );
}
