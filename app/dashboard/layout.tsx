"use client";
import { ReactNode, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AppBar, Toolbar, Typography, CssBaseline } from "@mui/material";

import DashboardDrawer from "./components/DashboardDrawer";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(true);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <div className="flex min-h-screen">
      <CssBaseline />
      {/* Sidebar */}
      <DashboardDrawer open={drawerOpen} toggleDrawer={toggleDrawer} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <AppBar position="sticky" className="bg-gray-900">
          <Toolbar className="flex justify-between">
            <div className="flex items-center">
              <Typography variant="h6" className="ml-2">
                Dashboard
              </Typography>
            </div>
            <div className="flex items-center gap-4">
              <Typography variant="body1">{user?.email}</Typography>
            </div>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-gray-100">{children}</main>
      </div>
    </div>
  );
}
