"use client";
import { ReactNode, useState } from "react";
import { AppBar, Toolbar, Button } from "@mui/material";
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
          className=" shadow-none text-gray-800 bg-gray-100"
        >
          <Toolbar className="flex justify-between  min-h-[80px]">
            <div className="flex items-center">
              <h1 className="ml-6 text-3xl font-medium">Dashboard</h1>
            </div>
            <div className="col-span-1 md:col-span-2 flex justify-end">
              <Button
                variant="contained"
                color="primary"
                onClick={() => console.log("agregar")}
                sx={{
                  borderRadius: "16px",
                  padding: "10px 20px",
                  backgroundColor: "#F9BD24",
                }}
              >
                Agragar Gasto
              </Button>
            </div>
          </Toolbar>
        </AppBar>

        <main className="flex-1 p-6 bg-gray-100">{children}</main>
      </div>
    </div>
  );
}
