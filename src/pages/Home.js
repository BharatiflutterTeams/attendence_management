import React, { useEffect, useState } from "react";
import Sidenav from "../components/Sidenav";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Navbar from "../components/Navbar";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import endpoints from "../Endpoints/endpoint";
import { jwtDecode } from "jwt-decode";
import RevenueCard from "./RevenueCard";
import CollapsibleTable from "../components/CollapsibleRow";
import BranchStudentTables from "../components/BranchStudentsTable";

const drawerWidth = 240;

function Home() {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [roles, setRoles] = useState({
    isSuperAdmin: false,
    isAdmin: false,
  });

  useEffect(() => {
    const roleCheck = () => {
      const token = sessionStorage.getItem("jwtToken");
      if (token) {
        const { role } = jwtDecode(token);
        setRoles({
          isSuperAdmin: role === "superadmin",
          isAdmin: role === "admin",
        });
      }
    };
    roleCheck();
  }, []);

  const fetchBranchStudent = async () => {
    try {
      const response = await axios.get(
        `${endpoints.serverBaseURL}/api/std/dashboard-student`
      );
      setStudents(response.data.students);
      setAttendanceStats(response.data.attendanceStats);
      console.log("stats:",response.data.attendanceStats);
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchBranchStudent();
  }, []);

  return (
    <>
      <Navbar />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 8,

            width: { sm: `calc(100% - ${drawerWidth}px)` },
            height: "100vh",
          }}
        >
          <Toolbar />

          {/* <RevenueCard attendanceStats={attendanceStats}/> */}
          {/* <CollapsibleTable/> */}
          {/* <BranchStudentTables /> */}
        </Box>
      </Box>
    </>
  );
}

export default Home;
