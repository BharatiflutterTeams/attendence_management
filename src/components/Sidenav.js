import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import { useState, useEffect } from "react";

import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import { Tooltip, Typography } from "@mui/material";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { useLocation, useNavigate } from "react-router-dom";
import useAppStore from "../appStore";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";

//Add agent role

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
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
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function Sidenav() {
  const companyData = useAppStore((state) => state.companyData);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const open = useAppStore((state) => state.dopen);

  const [roles, setRoles] = useState({
    isSuperAdmin: false,
    isAgent: false,
  });

  useEffect(() => {
    const roleCheck = () => {
      const token = sessionStorage.getItem("jwtToken");
      if (token) {
        const { role } = jwtDecode(token);
        setRoles({
          isSuperAdmin: role === "superadmin",
          isAgent: role === "agent",
        });
      }
    };
    roleCheck();
  }, []);

  const menuItems = [
    {
      label: "Dashboard",
      icon: <DashboardIcon style={{ fill: "#867AE9" }} />,
      path: "/dashboard",
      visible: true,
    },
    {
      label: "Candidates",
      icon: <EventAvailableIcon style={{ fill: "#867AE9" }} />,
      path: "/",
      visible: true,
    },
    {
      label: "Reports",
      icon: <AssessmentIcon style={{ fill: "#867AE9" }} />,
      path: "/reportpage",
      visible: roles.isSuperAdmin,
    },
    {
      label: "Company Profile",
      icon: <CorporateFareIcon style={{ fill: "#867AE9" }} />,
      path: "/companyprofile",
      visible: roles.isSuperAdmin,
    },
    {
      label: "Manage Roles",
      icon: <SupervisorAccountIcon style={{ fill: "#867AE9" }} />,
      path: "/addadminchecker",
      visible: roles.isSuperAdmin,
    },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        open={open}
        PaperProps={{
          sx: { backgroundColor: "#ffffff", color: "black" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1,
          }}
        >
          <IconButton>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </Box>
        <Divider />

        {open && companyData && (
          <Box sx={{ px: 2, py: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <img
                src={companyData.logo}
                alt="Company Logo"
                width="50"
                height="50"
                style={{
                  borderRadius: "50%",
                  marginRight: "12px",
                  boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Box>
                <Typography
                  variant="h7"
                  sx={{ fontWeight: "bold", color: "#333" }}
                >
                  {companyData.name}
                </Typography>
                <Link
                  to="/companyprofile"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <Typography
                    variant="body2"
                    color="primary"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    Profile
                    <ChevronRightIcon
                      style={{ fontSize: "1rem", marginLeft: "4px" }}
                    />
                  </Typography>
                </Link>
              </Box>
            </Box>
            <Divider />
          </Box>
        )}

        <List>
          {menuItems.map(
            ({ label, icon, path, visible }) =>
              visible && (
                <ListItem
                  key={label}
                  disablePadding
                  sx={{ display: "block" }}
                  onClick={() => navigate(path)}
                >
                  <Tooltip title={!open ? label : ""} placement="right">
                    <ListItemButton
                      selected={location.pathname === path}
                      tabIndex={0}
                      aria-selected={location.pathname === path}
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? "initial" : "center",
                        px: 2.5,
                        backgroundColor:
                          location.pathname === path
                            ? "#F0F0F0"
                            : "transparent",
                        "&:hover": {
                          backgroundColor: "#eef1ff",
                          transition: "background-color 0.3s ease",
                        },
                        borderLeft:
                          location.pathname === path
                            ? "4px solid #867AE9"
                            : "none",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : "auto",
                          justifyContent: "center",
                          color:
                            location.pathname === path ? "#867AE9" : "#808080",
                        }}
                      >
                        {icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={label}
                        sx={{
                          opacity: open ? 1 : 0,
                          color:
                            location.pathname === path ? "#333" : "#333",
                        }}
                      />
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              )
          )}
        </List>
      </Drawer>
    </Box>
  );
}
