import React from "react";
import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import AdminSidebar from "./SideBar";

export default function AdminLayout(): React.ReactElement {
  return (
    <Box sx={{ display: "flex" }}>

      <AdminSidebar />

  
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "#f4efe8",
          p: 3,
          minHeight: "100vh",
          overflowY: "auto",
        }}
      >
    
        <Toolbar />
      

        
        <Outlet />
      </Box>
    </Box>
  );
}
