"use client";
import { ReactNode, useEffect, useState } from "react";
import { AppBar, Toolbar, Button } from "@mui/material";
import DashboardDrawer from "./components/DashboardDrawer";
import { useAuth } from "@/context/AuthContext";
import { getLatestFinancialPeriod } from "@/lib/finanzasService";
import AgregarGastos from "./components/AgregarGastos";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [periodoActual, setPeriodoActual] = useState("");

  useEffect(() => {
    if (user) {
      getLatestFinancialPeriod(user.uid).then((periodo) => {
        setPeriodoActual(periodo);
      });
    }
  }, [user]);

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
            boxShadow: "none",
            color: "#1f2937",
            backgroundColor: "#f3f4f6",
          }}
        >
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: "space-between",
              minHeight: "80px",
            }}
          >
            <div className="flex items-center">
              <h1 className="ml-6 text-xl md:text-3xl font-medium">
                Dashboard
              </h1>
            </div>
            <div className="col-span-1 justify-start md:col-span-2 flex md:justify-end">
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={() => setModalOpen(true)}
                sx={{
                  marginRight: "50px",
                  borderRadius: "24px",
                  padding: "10px 20px",
                  color: "#171717",
                  border: "1px solid #171717",
                  backgroundColor: "transparent",
                }}
              >
                + Nuevo gasto
              </Button>
            </div>
          </Toolbar>
        </AppBar>

        <main className="flex-1 p-6 bg-gray-100">{children}</main>
        <AgregarGastos
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onGastoAgregado={() => setModalOpen(false)}
          periodo={periodoActual}
        />
      </div>
    </div>
  );
}
