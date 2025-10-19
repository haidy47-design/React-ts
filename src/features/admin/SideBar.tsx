import * as React from "react";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import CloseIcon from '@mui/icons-material/Close';
import { showLogout } from "../../components/common/CustomSwal";
import { useAppDispatch } from "../hooks";
import useMediaQuery from '@mui/material/useMediaQuery';

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: "#79253D",
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  [theme.breakpoints.up("md")]: {
    ...(open && {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  },
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    ...(open && {
      ...openedMixin(theme),
      "& .MuiDrawer-paper": {
        ...openedMixin(theme),
        backgroundColor: "#79253D",
        color: "white",
      },
    }),
    ...(!open && {
      ...closedMixin(theme),
      "& .MuiDrawer-paper": {
        ...closedMixin(theme),
        backgroundColor: "#79253D",
        color: "white",
      },
    }),
  })
);

export default function AdminSidebar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => setOpen(!open);
  const handleDrawerClose = () => setOpen(false);

  const dispatch = useAppDispatch();
  const handleLogout = () => {
    showLogout(navigate, dispatch);
    if (isMobile) handleDrawerClose();
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/admin" },
    { text: "Products", icon: <InventoryIcon />, path: "/admin/products" },
    { text: "Orders", icon: <ShoppingCartIcon />, path: "/admin/orders" },
    { text: "Users", icon: <PeopleIcon />, path: "/admin/users" },
    { text: "Reports", icon: <OutlinedFlagIcon />, path: "/admin/reports" },
  ];

  const drawerContent = (
    <>
      <DrawerHeader>
        <Link
          to="/"
          style={{
            flexGrow: 1,
            textDecoration: "none",
            color: "white",
            fontSize: "1.1rem",
            paddingLeft: "16px",
            display: "flex",
            alignItems: "center",
          }}
          onClick={isMobile ? handleDrawerClose : undefined}
        >
          <img
            src="/Images/wlogo.png"
            alt="Roséa Logo"
            height={50}
            style={{ marginRight: "8px" }}
            className="mx-0"
          />
          <Typography variant="h4" className="mt-2" sx={{ fontWeight: "bold", color: "#ebe5dbff" }}>
            oséa
          </Typography>
        </Link>
        <IconButton onClick={handleDrawerClose} sx={{ color: "white" }}>
          {isMobile ? <CloseIcon /> : theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </DrawerHeader>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.3)" }} />

      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              component={NavLink}
              to={item.path}
              end={item.path === "/admin"}
              onClick={isMobile ? handleDrawerClose : undefined}
              sx={{
                minHeight: 48,
                px: 2.5,
                color: "#ebe5dbff",
                "&.active": {
                  backgroundColor: " #f3f0e6",
                  color: "#722f37",
                  fontWeight: "bold",
                },
                "&:hover": {
                  backgroundColor: "#a33b528a",
                },
                justifyContent: open || isMobile ? "initial" : "center",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open || isMobile ? 3 : "auto",
                  justifyContent: "center",
                  color: "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} sx={{ opacity: open || isMobile ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        ))}

        <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", my: 1 }} />

        <ListItem disablePadding sx={{ display: "block" }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              minHeight: 48,
              px: 2.5,
              color: "white",
              "&:hover": {
                backgroundColor: "#a33b52",
              },
              justifyContent: open || isMobile ? "initial" : "center",
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open || isMobile ? 3 : "auto",
                justifyContent: "center",
                color: "inherit",
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" sx={{ opacity: open || isMobile ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <Box sx={{ display: "flex", fontFamily: "'Montserrat', sans-serif" }}>
      <CssBaseline />
      <AppBar position="fixed" open={!isMobile && open}>
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ 
              marginRight: 2,
              ...((!isMobile && open) && { display: "none" })
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ color: "#ebe5dbff" }}>
            Admin Panel
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer - Temporary, slides from top */}
      {isMobile ? (
        <MuiDrawer
          anchor="top"
          open={open}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            "& .MuiDrawer-paper": {
              backgroundColor: "#79253D",
              color: "white",
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
            },
          }}
        >
          {drawerContent}
        </MuiDrawer>
      ) : (
        <Drawer variant="permanent" open={open}>
          {drawerContent}
        </Drawer>
      )}
    </Box>
  );
}
