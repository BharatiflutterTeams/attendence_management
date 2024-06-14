import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import BookingList from "./pages/BookingList";
import NotFound from "./pages/PageNotFound";
import Grid from "@mui/material/Grid";
import Plans from "./pages/Plans";
import CouponsPage from "./pages/CouponPage";
import ProfilePage from "./pages/ProfilePage";
import { Box } from "@mui/material";
import "./App.css";
import CompanyProfile from "./pages/CompanyProfile";
import ApprovalPage from "./pages/ApprovalPage";
import AdminLogin from "./pages/AdminLogin";
//import RequireAuth from './auth.js/RequireAuth';
//import {ROLES} from './config/roles'
import axios from "axios";
import useAppStore from "./appStore";
import { useEffect } from "react";
import endpoints from "./Endpoints/endpoint";
import PlansPage from "./pages/dumyPage";

const App = () => {
  const setCompanyData = useAppStore((state) => state.setCompanyData);

  useEffect(() => {
    fetchDetails();
  }, [setCompanyData]);

  const fetchDetails = async () => {
    try {
      const response = await axios.get(
        `${endpoints.serverBaseURL}/api/admin/adminprofile`
      );

      setCompanyData(response.data?.adminprofile[0]);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  return (
    <Box sx={{ background: "#EEF1FF" }}>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />

        <Route path="/" element={<Home />} />

        <Route path="/bookings" element={<BookingList />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/coupons" element={<CouponsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/companyprofile" element={<CompanyProfile />} />

        <Route path="/approval" element={<ApprovalPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Box>
  );
};

export default App;
