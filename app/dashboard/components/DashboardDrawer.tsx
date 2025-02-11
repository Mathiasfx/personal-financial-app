import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  AccountCircle,
  ExitToApp,
  Category,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const drawerWidth = 240;

interface DashboardDrawerProps {
  open: boolean;
  toggleDrawer: () => void;
}

const DashboardDrawer: React.FC<DashboardDrawerProps> = ({
  open,
  toggleDrawer,
}) => {
  const router = useRouter();
  const { logout } = useAuth();

  //Detectar pantalla Movil
  const isMobile = useMediaQuery("(max-width:600px)");

  const navigateTo = (path: string) => {
    router.push(path);
  };


  const handleLogout = () => {
    try {
      logout();

      toggleDrawer();
      router.push("/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {isMobile && (
        <IconButton
          onClick={toggleDrawer}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 1300,
            color: "white",
          }}
        >
          <MenuIcon fontSize="small" />
        </IconButton>
      )}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        anchor="left"
        open={open}
        onClose={toggleDrawer}
        className="transition-transform duration-300"
        sx={{
          width: open ? drawerWidth : isMobile ? 0 : 80,
          display: isMobile && !open ? "none" : "block",
          "& .MuiDrawer-paper": {
            width: open ? drawerWidth : isMobile ? 0 : 80,
            transition: "width 0.3s",
            overflowX: "hidden",
          },
        }}
      >
        <div className="flex  justify-start items-center">
          <IconButton size="large" onClick={toggleDrawer} className="m-4">
            <MenuIcon fontSize="small" />
          </IconButton>
        </div>


      <div className="p-4">
        <List>
          <ListItem disablePadding>
            <Tooltip title="Dashboard" placement="right">
              <ListItemButton onClick={() => navigateTo("/dashboard")}>
                <Dashboard />
                {open && <ListItemText primary="Dashboard" className="ml-2" />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
          <ListItem disablePadding>
            <Tooltip title="Categorias" placement="right">
              <ListItemButton
                onClick={() => navigateTo("/dashboard/categorias")}
              >
                <Category />
                {open && <ListItemText primary="Categorias" className="ml-2" />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
          <ListItem disablePadding>
            <Tooltip title="Perfil" placement="right">
              <ListItemButton onClick={() => navigateTo("/dashboard/perfil")}>
                <AccountCircle />
                {open && <ListItemText primary="Perfil" className="ml-2" />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem disablePadding>
            <Tooltip title="Cerrar Sesión" placement="right">
              <ListItemButton onClick={handleLogout}>
                <ExitToApp />
                {open && (
                  <ListItemText primary="Cerrar Sesión" className="ml-2" />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        </List>
      </div>
    </Drawer>

  );
};

export default DashboardDrawer;
