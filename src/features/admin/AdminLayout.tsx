import React from "react";
import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import AdminSidebar from "./SideBar";

export default function AdminLayout(): React.ReactElement {
  return (
    <Box sx={{ display: "flex" }}>
      {/* الشريط الجانبي */}
      <AdminSidebar />

      {/* المحتوى الرئيسي */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "#f4efe8",
          p: 3,
          minHeight: "100vh",
        }}
      >
        {/* عشان المحتوى ما يدخلش تحت الـ AppBar */}
        <Toolbar />
      

        {/* هنا بيتحمل كل صفحات الـ admin حسب الراوت */}
        <Outlet />
      </Box>
    </Box>
  );
}
