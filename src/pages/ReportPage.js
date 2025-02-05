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
  Tooltip,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import * as XLSX from "xlsx";
import axios from "axios";
import { ClearIcon } from "@mui/x-date-pickers";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";

const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

export default function ReportPage() {
  const today = new Date();
  const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
  const currentYear = String(today.getFullYear());
  const currentDay = today.getDate();

  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [candidateName, setCandidateName] = useState("");
  const [debouncedName, setDebouncedName] = useState(candidateName);
  const [daysInData, setDaysInData] = useState([]);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
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
          return false;
        }
        return true;
      });

      const totalDaysInMonth =
        selectedYear === currentYear && selectedMonth === currentMonth
          ? currentDay 
          : new Date(selectedYear, selectedMonth, 0).getDate();

      const employeeMap = {};
      filteredAttendanceData.forEach((entry) => {
        const day = new Date(entry.date).getDate();

        if (Array.isArray(entry.students)) {
          entry.students.forEach((student) => {
            const studentName = student.studentName;
            if (!employeeMap[studentName]) {
              employeeMap[studentName] = {
                attendance: Array(totalDaysInMonth).fill(0),
                totalTokens: 0,
                redeemedTokens: 0,
              };
            }

            employeeMap[studentName].attendance[day - 1] = 1;

            employeeMap[studentName].totalTokens = student.totalTokens || 0;
            employeeMap[studentName].redeemedTokens =
              student.redeemedTokens || 0;
          });
        } else {
          console.warn(
            `Expected students to be an array, but got ${typeof entry.students}`
          );
        }
      });
      const employeeList = Object.keys(employeeMap).map((name) => ({
        name,
        attendance: employeeMap[name].attendance,
        totalTokens: employeeMap[name].totalTokens,
        redeemedTokens: employeeMap[name].redeemedTokens,
      }));

      setEmployees(employeeList);
      setAttendance(filteredAttendanceData);
      setHasSearched(true);

      const uniqueDays = [
        ...new Set(
          filteredAttendanceData.map((entry) => new Date(entry.date).getDate())
        ),
      ];

      setDaysInData(uniqueDays);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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
    setPage(0);
  };

  const paginatedEmployees = filteredEmployees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

const formatDate = (month, day) => {
  const date = new Date(year, month - 1, day);
  const options = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

const downloadExcel = () => {
  const excelData = employees.map((employee) => {
    const attendanceData = {};

    daysInData.forEach((day) => {
      const formattedDate = formatDate(month, day);
      attendanceData[formattedDate] = 
        employee.attendance[day - 1] === 1 ? "P" : "A";
    });

    return {
      Name: employee.name,
      ...attendanceData,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(excelData);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");

  XLSX.writeFile(workbook, `Attendance_Report_${month}_${year}.xlsx`);
};


  return (
    <>
      <Navbar />
      <Box sx={{ display: "flex", mt: 8 }}>
        <Sidenav />
        <Box
          sx={{
            flexGrow: 1,
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
                // mb: 0.5,
                marginTop: "3px",
              }}
            >
              <Typography variant="h5" sx={{ mb: 0, whiteSpace: "nowrap" }}>
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
                <Tooltip title="Download Attendance Report" arrow>
                  <IconButton
                    onClick={downloadExcel}
                    sx={{
                      bgcolor: "rgb(134, 122, 233)",
                      "&:hover": { bgcolor: "rgb(95, 85, 190)" },
                      color: "white",
                    }}
                    size="small"
                  >
                    <FileDownloadIcon />
                  </IconButton>
                </Tooltip>

                <TextField
                  label="Candidate Name"
                  placeholder="Enter Name"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  size="small"
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

                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Select Month</InputLabel>
                  <Select
                    value={month}
                    label="Select Month"
                    onChange={(e) => setMonth(e.target.value)}
                    size="small"
                  >
                    {monthNames.map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        {m.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Select Year</InputLabel>
                  <Select
                    value={year}
                    label="Select Year"
                    onChange={(e) => setYear(e.target.value)}
                    size="small"
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
                  size="small"
                  sx={{
                    bgcolor: "rgb(134, 122, 233)",
                    "&:hover": { bgcolor: "rgb(95, 85, 190)" },
                    minWidth: 100,
                    height: 38,
                  }}
                >
                  Search
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Table Section */}
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "calc(100vh - 230px)",
              }}
            >
              <CircularProgress />
            </Box>
          ) : hasSearched && filteredEmployees.length === 0 && candidateName ? (
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
                sx={{
                  overflowX: "auto",
                  maxHeight: "calc(100vh - 200px)",
                  minHeight: "300px",
                  borderBottom: "1px solid rgba(224, 224, 224, 1)",
                }}
              >
                <Table stickyHeader sx={{ minWidth: 650 }} size="small">
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
                      <TableCell
                        sx={{
                          position: "sticky",
                          left: "150px",
                          zIndex: 3,
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          backgroundColor: "white",
                          textAlign: "center",
                          width: "150px",
                        }}
                      >
                         Redeemed / Total Tokens
                      </TableCell>
                      {/* <TableCell
                        sx={{
                          position: "sticky",
                          left: "200px",
                          zIndex: 3,
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          backgroundColor: "white",
                        }}
                      >
                        Redeemed Tokens
                      </TableCell> */}

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
                    {paginatedEmployees.map((employee) => {
                      return (
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
                              textWrap: "nowrap",
                            }}
                          >
                            {employee.name
                              .split(" ")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join(" ")}
                          </TableCell>

                          <TableCell
                            sx={{
                              position: "sticky",
                              left: "120px", // Adjust for the width of the Candidate Name column
                              backgroundColor: "white",
                              zIndex: 1,
                            }}
                            align="center"
                          >
                            {/* Display total tokens */}
                            {employee.redeemedTokens} / {employee.totalTokens}
                          </TableCell>

                          {/* <TableCell
                            sx={{
                              position: "sticky",
                              left: "200px", // Adjust for the width of the Total Tokens column
                              backgroundColor: "white",
                              zIndex: 1.2,
                            }}
                            align="center"
                          >
                            {employee.redeemedTokens}
                          </TableCell> */}

                          {daysInData.map((day) => {
                            const status = employee.attendance[day - 1] || 0;
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
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Custom Pagination with integrated design */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "end",
                  alignItems: "center",
                  borderTop: "1px solid rgba(224, 224, 224, 1)",
                  px: 2,
                  py: 1,
                  backgroundColor: "#ffffff",
                  flexShrink: 0,
                }}
              >
                {/* Pagination Controls */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                    Rows per page:
                  </Typography>
                  <Select
                    value={rowsPerPage}
                    onChange={handleRowsPerPageChange}
                    size="small"
                    sx={{ width: 70 }}
                  >
                    {[5, 10, 25].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Button
                    onClick={handlePrevPage}
                    disabled={page === 0}
                    sx={{ mr: 1, minWidth: 35 }}
                  >
                    <ArrowBackIos />
                  </Button>
                  <Typography variant="body2" component="span" sx={{ mx: 1 }}>
                    Page {page + 1} of {totalPages}
                  </Typography>
                  <Button
                    onClick={handleNextPage}
                    disabled={page >= totalPages - 1}
                    sx={{ ml: 1, minWidth: 35 }}
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
