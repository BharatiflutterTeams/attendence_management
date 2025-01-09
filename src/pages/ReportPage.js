"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidenav from "../components/Sidenav";
import {
  TextField,
  Select,
  MenuItem,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { ClearIcon } from "@mui/x-date-pickers";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";

const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

export default function ReportPage() {
  const today = new Date();
  const currentMonth = String(today.getMonth() + 1).padStart(2, "0"); // Get current month (01-based)
  const currentYear = String(today.getFullYear()); // Get current year
  const currentDay = today.getDate(); // Get today's date

  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [candidateName, setCandidateName] = useState("");
  const [debouncedName, setDebouncedName] = useState(candidateName);
  const [daysInData, setDaysInData] = useState([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const monthNames = [
    { name: "January", value: "01" },
    { name: "February", value: "02" },
    { name: "March", value: "03" },
    { name: "April", value: "04" },
    { name: "May", value: "05" },
    { name: "June", value: "06" },
    { name: "July", value: "07" },
    { name: "August", value: "08" },
    { name: "September", value: "09" },
    { name: "October", value: "10" },
    { name: "November", value: "11" },
    { name: "December", value: "12" },
  ];

  const fetchAttendance = async (
    selectedMonth = month,
    selectedYear = year
  ) => {
    try {
      const response = await axios.get(
        `http://localhost:5001/api/scan/attendance`,
        {
          params: { month: selectedMonth, year: selectedYear },
        }
      );

      const attendanceData = response.data.data;

      // Filter attendance data to exclude future dates
      const filteredAttendanceData = attendanceData.filter((entry) => {
        const [entryYear, entryMonth, entryDay] = entry.date
          .split("-")
          .map(Number);

        if (
          entryYear > Number(currentYear) ||
          (entryYear === Number(currentYear) &&
            entryMonth > Number(currentMonth)) ||
          (entryYear === Number(currentYear) &&
            entryMonth === Number(currentMonth) &&
            entryDay > currentDay)
        ) {
          return false; // Exclude future dates
        }
        return true;
      });

      const totalDaysInMonth =
        selectedYear === currentYear && selectedMonth === currentMonth
          ? currentDay // Limit to today's date if it's the current month
          : new Date(selectedYear, selectedMonth, 0).getDate(); // Total days in the selected month

      const employeeMap = {};
      filteredAttendanceData.forEach((entry) => {
        const [, , day] = entry.date.split("-").map(Number); // Extract day
        entry.studentNames.forEach((name) => {
          if (!employeeMap[name]) {
            employeeMap[name] = Array(totalDaysInMonth).fill(0); // Initialize only up to totalDaysInMonth
          }
          employeeMap[name][day - 1] = 1; // Mark attendance
        });
      });

      const employeeList = Object.keys(employeeMap).map((name) => ({
        name,
        attendance: employeeMap[name],
      }));

      setEmployees(employeeList);
      setAttendance(filteredAttendanceData);
      setHasSearched(true);

      // Store the unique days in the data
      const uniqueDays = [
        ...new Set(
          filteredAttendanceData.map((entry) => {
            const [entryYear, entryMonth, entryDay] = entry.date
              .split("-")
              .map(Number);
            return entryDay;
          })
        ),
      ];

      setDaysInData(uniqueDays); // Update state with days
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const debouncedSearch = debounce(() => {
      setDebouncedName(candidateName);
    }, 1000);

    debouncedSearch();

    return () => clearTimeout(debouncedSearch);
  }, [candidateName]);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(debouncedName.toLowerCase())
  );

  const clearInput = () => {
    setCandidateName("");
  };

  const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage);

  const handlePrevPage = () => {
    setPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page
  };

  const paginatedEmployees = filteredEmployees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <>
      <Navbar />
      <Box sx={{ display: "flex", mt: 8 }}>
        <Sidenav />
        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            maxWidth: 1420,
            margin: "0 auto",
            overflowX: "auto",
            transition: "margin-left 0.3s ease",
            height: "calc(100vh - 68px)",
          }}
        >
          {/* Search Section */}
          <Box sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
                mb: 2,
              }}
            >
              <Typography variant="h4" sx={{ mb: 0, whiteSpace: "nowrap" }}>
                Attendance Report
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <TextField
                  label="Candidate Name"
                  placeholder="Enter Name"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  sx={{ minWidth: 200 }}
                  InputProps={{
                    endAdornment: candidateName && (
                      <IconButton
                        onClick={clearInput}
                        sx={{ padding: 0 }}
                        aria-label="clear"
                      >
                        <ClearIcon />
                      </IconButton>
                    ),
                  }}
                />

                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Select Month</InputLabel>
                  <Select
                    value={month}
                    label="Select Month"
                    onChange={(e) => setMonth(e.target.value)}
                  >
                    {monthNames.map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        {m.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Select Year</InputLabel>
                  <Select
                    value={year}
                    label="Select Year"
                    onChange={(e) => setYear(e.target.value)}
                  >
                    {[2023, 2024, 2025].map((yr) => (
                      <MenuItem key={yr} value={yr}>
                        {yr}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  onClick={() => fetchAttendance(month, year)}
                  sx={{
                    bgcolor: "rgb(134, 122, 233)",
                    "&:hover": { bgcolor: "rgb(95, 85, 190)" },
                    minWidth: 200,
                    height: 56,
                  }}
                >
                  Search
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Table Section */}
          {hasSearched && filteredEmployees.length === 0 && candidateName ? (
            <Typography
              variant="h6"
              sx={{ mt: 4, textAlign: "center", color: "gray" }}
            >
              No matching candidates found for "{candidateName}".
            </Typography>
          ) : hasSearched && filteredEmployees.length === 0 ? (
            <Typography variant="h6" sx={{ mt: 4, textAlign: "center" }}>
              No attendance data found for the selected month and year.
            </Typography>
          ) : (
            <>
              <TableContainer
                component={Paper}
                sx={{ overflowX: "auto", maxHeight: "calc(100vh - 200px)" }}
              >
                <Table stickyHeader sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          position: "sticky",
                          left: 0,
                          zIndex: 3,
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Candidate Name
                      </TableCell>
                      {daysInData.map((day, index) => (
                        <TableCell
                          key={index}
                          align="center"
                          sx={{ fontWeight: "bold" }}
                        >
                          {day}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedEmployees.map((employee) => (
                      <TableRow
                        key={employee.name}
                        sx={{
                          "&:nth-of-type(odd)": {
                            bgcolor: "rgba(0, 0, 0, 0.02)",
                          },
                        }}
                      >
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{
                            position: "sticky",
                            left: 0,
                            backgroundColor: "white",
                            zIndex: 1,
                          }}
                        >
                          {employee.name}
                        </TableCell>
                        {daysInData.map((day) => {
                          const attendanceIndex = employee.attendance.findIndex(
                            (status, index) => index + 1 === day
                          );
                          const status =
                            attendanceIndex !== -1
                              ? employee.attendance[attendanceIndex]
                              : 0;
                          return (
                            <TableCell key={day} align="center">
                              {status === 1 ? (
                                <CheckIcon sx={{ color: "green" }} />
                              ) : (
                                <CloseIcon sx={{ color: "red" }} />
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Custom Pagination */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "end",
                  alignItems: "center",
                  mt: 2,
                  px: 2,
                }}
              >
                {/* Pagination Controls */}
                <Box>
                  <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                    Rows per page:
                  </Typography>
                  <Select
                    value={rowsPerPage}
                    onChange={handleRowsPerPageChange}
                    sx={{ width: 60 }}
                  >
                    {[5, 10, 25].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                  <Button
                    onClick={handlePrevPage}
                    disabled={page === 0}
                    sx={{ mr: 1 }}
                  >
                    <ArrowBackIos />
                  </Button>
                  <Typography variant="body2" component="span" sx={{ mx: 1 }}>
                    Page {page + 1} of {totalPages}
                  </Typography>
                  <Button
                    onClick={handleNextPage}
                    disabled={page >= totalPages - 1}
                    sx={{ ml: 1 }}
                  >
                    <ArrowForwardIos />
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </>
  );
}
