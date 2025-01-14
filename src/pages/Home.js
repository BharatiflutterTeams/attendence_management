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

const drawerWidth = 240;

function Home() {
  const [greeting, setGreeting] = useState("");
  const [date, setDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const fetchAttendanceData = async (year, month) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${endpoints.serverBaseURL}/api/scan/attendance`,
        {
          params: { year, month },
        }
      );
  
      const rawData = response.data.data;
  
      // Generate all days for the given month
      const daysInMonth = new Date(year, month, 0).getDate();
      const adjustedData = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1; // Days start from 1
        const date = new Date(year, month - 1, day)
          .toISOString()
          .split("T")[0];
  
        // Find the corresponding entry in the raw data
        const dayData = rawData.find((entry) => entry.date === date);
  
        // If no data exists for this date, exclude it
        if (!dayData || dayData.presentCount === 0) return null;
  
        return {
          date,
          presentCount: dayData.presentCount, // Use the actual present count
        };
      }).filter(Boolean); // Remove null values for days without data
  
      console.log("Adjusted Attendance data:", adjustedData);
      setAttendanceData(adjustedData);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };
  
  

  useEffect(() => {
    const currentMonth = date.getMonth() + 1; // Months are 0-based
    const currentYear = date.getFullYear();
    fetchAttendanceData(currentYear, currentMonth);
  }, [date]);

  const handleDateChange = (newDate) => {
    const newMonth = newDate.getMonth() + 1; // Extract the correct month
    const newYear = newDate.getFullYear(); // Extract the correct year

    // Check if the month actually changed before making the API call
    if (newMonth !== date.getMonth() + 1 || newYear !== date.getFullYear()) {
      setDate(newDate); // Update the state with the new date
      fetchAttendanceData(newYear, newMonth); // Fetch data only if the month/year changed
    }
  };

  const handleMonthChange = ({ activeStartDate }) => {
    const newMonth = activeStartDate.getMonth() + 1; // Extract the correct month
    const newYear = activeStartDate.getFullYear(); // Extract the correct year

    // Check if the month actually changed before making the API call
    if (newMonth !== date.getMonth() + 1 || newYear !== date.getFullYear()) {
      setDate(new Date(newYear, newMonth - 1, 1)); // Update state to trigger UI change
      fetchAttendanceData(newYear, newMonth); // Fetch data only if the month/year changed
    }
  };

  const tileContent = ({ date }) => {
    const today = new Date();
    const formattedDate = date.toISOString().split("T")[0];
  
    // Find attendance data for the given date
    const attendanceForDate = attendanceData.find(
      (entry) => entry.date === formattedDate
    );
  
    if (date > today || !attendanceForDate) {
      return null; // Do not display anything for future dates or missing data
    }
  
    return (
      <span
        style={{
          display: "inline-block",
          padding: "2px 5px",
          backgroundColor:
            attendanceForDate.presentCount > 0 ? "#1976d2" : "#d3d3d3", // Blue for present, grey for absent
          color: attendanceForDate.presentCount > 0 ? "#fff" : "#000",
          borderRadius: "8px",
          fontSize: "12px",
          marginTop: "5px",
        }}
      >
        {attendanceForDate.presentCount}
      </span>
    );
  };
  
  

  return (
    <>
      <Navbar />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            height: "100vh",
          }}
        >
          <Toolbar />
          <h1>
            {" "}
            {"👋"} {greeting}{" "}
          </h1>
          <h4>To access the dashboard get premium subscription</h4>

          {/* Calendar Component */}

          {/* <Box sx={{ marginTop: 3 }}>
            {loading ? (
              <p>Loading...</p>
            ) : (
              (roles.isSuperAdmin || roles.isAdmin) && (
                <Calendar
                  onChange={handleDateChange}
                  value={date}
                  tileContent={tileContent}
                  onActiveStartDateChange={handleMonthChange}
                />
              )
            )}
          </Box> */}
        </Box>
      </Box>
    </>
  );
}

export default Home;
