import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Select,
  FormControl,
  Box,
  Typography,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { Tooltip } from "@mui/material";
import endpoints from "../Endpoints/endpoint";

const formatMobile = (mobile) => {
  return mobile === "Not Available" ? mobile : `+${mobile}`;
};

// Styled components with iOS-inspired design
const StyledContainer = styled(Box)(({ theme }) => ({
  maxWidth: "50%",
  // margin: "auto",
  marginRight: "40px",
  // marginLeft: "10px",
  padding: theme.spacing(3),
  borderRadius: "16px",
  backgroundColor: "#ffffff",
  boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: "16px",
  backgroundColor: "#ffffff",
  boxShadow: "none",
  "& .MuiTable-root": {
    borderCollapse: "separate",
    borderSpacing: "0 8px",
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontFamily: "Roboto, Helvetica, Arial, sans-serif",
  fontSize: "15px",
  fontWeight: 400,
  color: theme.palette.grey[800],
  padding: theme.spacing(2),
  border: "none",
  "&:first-of-type": {
    paddingLeft: theme.spacing(3),
    borderTopLeftRadius: "12px",
    borderBottomLeftRadius: "12px",
  },
  "&:last-of-type": {
    paddingRight: theme.spacing(3),
    borderTopRightRadius: "12px",
    borderBottomRightRadius: "12px",
  },
}));

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  fontFamily: "Roboto, Helvetica, Arial, sans-serif",
  fontSize: "14px",
  fontWeight: 700,
  color: theme.palette.grey[900],
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(1.5),
  border: "none",
  // backgroundColor: "#f8f9fa",
  borderBottom: "2px solid #e0e0e0",
  "&:first-of-type": {
    paddingLeft: theme.spacing(3),
    borderTopLeftRadius: "8px",
  },
  "&:last-of-type": {
    paddingRight: theme.spacing(3),
    borderTopRightRadius: "8px",
  },
}));

const StyledRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: "#f5f5f7",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "#eef0f2",
    transform: "translateY(-1px)",
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  fontFamily: "Roboto, Helvetica, Arial, sans-serif",
  fontSize: "15px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  "& .MuiSelect-select": {
    padding: "12px 16px",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    border: "1.5px solid #e1e1e1",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
  },
}));

const StatusChip = styled(Box)(({ status, theme }) => ({
  display: "inline-block",
  padding: "6px 12px",
  borderRadius: "20px",
  fontSize: "13px",
  fontWeight: 500,
  backgroundColor: status === "Present" ? "#e3f2fd" : "#ffebee",
  color: status === "Present" ? "#1976d2" : "#d32f2f",
}));

export default function AttendanceTable() {
  const [students, setStudents] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const theme = useTheme();

  const fetchBranchStudent = async () => {
    try {
      const response = await axios.get(
        `${endpoints.serverBaseURL}/api/std/dashboard-student`
      );
      setStudents(response.data.students);
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchBranchStudent();
  }, []);

  const handleBranchChange = (event) => {
    setSelectedBranch(event.target.value);
  };

  const filteredStudents = students.filter(
    (student) =>
      student.attendanceStatus === "Present" &&
      (selectedBranch === "" || student.branch === selectedBranch)
  );

  const uniqueBranches = [...new Set(students.map((student) => student.branch))];

  return (
    <StyledContainer sx={{ marginTop: "20px" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: "Roboto, Helvetica, Arial, sans-serif",
            fontWeight: 600,
            color: theme.palette.grey[900],
          }}
        >
          Student Attendance
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <StyledSelect
            value={selectedBranch}
            onChange={handleBranchChange}
            displayEmpty
            variant="outlined"
          >
            <MenuItem value="">All Branches</MenuItem>
            {uniqueBranches.map((branch, index) => (
              <MenuItem key={index} value={branch}>
                {branch}
              </MenuItem>
            ))}
          </StyledSelect>
        </FormControl>
      </Box>

      <StyledTableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledHeaderCell>Student Name</StyledHeaderCell>
              <StyledHeaderCell>Branch</StyledHeaderCell>
              <StyledHeaderCell>Mobile</StyledHeaderCell>
              <StyledHeaderCell>Status</StyledHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.map((student, index) => (
              <StyledRow key={index}>
                <StyledTableCell>
                  <Tooltip title={student.studentName} arrow>
                    <Typography
                      noWrap
                      sx={{
                        maxWidth: 200,
                        fontWeight: 500,
                      }}
                    >
                      {student.studentName}
                    </Typography>
                  </Tooltip>
                </StyledTableCell>
                <StyledTableCell>
                  <Typography sx={{ color: theme.palette.grey[700] }}>
                    {student.branch}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell>
                  <Typography sx={{ color: theme.palette.grey[700] }}>
                    {formatMobile(student.mobile)}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell>
                  <StatusChip status={student.attendanceStatus}>
                    {student.attendanceStatus}
                  </StatusChip>
                </StyledTableCell>
              </StyledRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </StyledContainer>
  );
}