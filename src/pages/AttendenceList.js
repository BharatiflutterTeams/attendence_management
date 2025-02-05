import React, { Component, useEffect, useRef, useState } from "react";

import { toPng } from "html-to-image";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Modal,
  Menu,
  Tooltip,
  InputAdornment,
  Divider,
} from "@mui/material";
import axios from "axios";
import Navbar from "../components/Navbar";
import Sidenav from "../components/Sidenav";
import endpoints from "../Endpoints/endpoint";
import { ToastContainer, toast } from "react-toastify";
import IconButton from "@mui/material/IconButton"; // Add this line
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import IDCard from "../components/IDCard";
import QRCode from "qrcode.react";
import EditIcon from "@mui/icons-material/Edit";
import useAppStore from "../appStore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { useDebounce } from "use-debounce";
import { jwtDecode } from "jwt-decode";
import { DataGrid, GridSearchIcon } from "@mui/x-data-grid";
import { ClearIcon } from "@mui/x-date-pickers";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";

const StudentsTable = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [allStudents, setAllStudents] = useState([]);

  const [editingToken, setEditingToken] = useState(null);
  const [newTokenValue, setNewTokenValue] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [invokeExport, setInvokeExport] = useState(null);
  const [newAdmissions, setNewAdmissions] = useState([]);
  const [editingEndDate, setEditingEndDate] = useState(null);
  const [newEndDateValue, setNewEndDateValue] = useState("");
  let [rows, setRows] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const pages = 0;

  const idCardRef = useRef();

  const mobileNumber = "9807631010";

  const handleExport = () => {
    if (selectedStudent) {
      setInvokeExport({ mobile: "9807631010" });
    } else {
      alert("Please select a student first.");
    }
  };

  const handleEditToken = (row) => {
    console.log("Editing Token for:", row);
    console.log("row id:", row.id);
    setEditingToken(row.id);
    setNewTokenValue(row.totalTokens);
  };

  const handleSaveToken = async () => {
    if (newTokenValue === "") {
      toast.error("Please enter a valid token value.");
      return;
    }

    // Parse newTokenValue to a number
    const updatedTotalTokens = Number(newTokenValue);
    if (isNaN(updatedTotalTokens)) {
      toast.error("Invalid token value. Please enter a number.");
      return;
    }

    // Retrieve student data from sessionStorage
    const storedData = JSON.parse(sessionStorage.getItem("all-students"));

    if (!storedData) {
      toast.error("Student data not found.");
      return;
    }

    const currentStudent = storedData.students.find(
      (student) => student.zoho_id === editingToken
    );

    if (!currentStudent) {
      toast.error("Student not found.");
      return;
    }

    // Validate: Total Tokens should NOT be less than Redeemed Tokens
    if (updatedTotalTokens < currentStudent.redeemedTokens) {
      toast.error("Total tokens cannot be less than redeemed tokens.");
      return;
    }

    try {
      const response = await axios.post(
        `${endpoints.serverBaseURL}/api/std/change-token`,
        {
          studentId: editingToken,
          totalTokens: updatedTotalTokens,
        }
      );

      if (response.status === 200) {
        toast.success("Token value updated successfully.");

        // Update student data locally
        const updatedStudents = storedData.students.map((student) =>
          student.zoho_id === editingToken
            ? { ...student, totalTokens: updatedTotalTokens }
            : student
        );

        // Update sessionStorage with new data
        sessionStorage.setItem(
          "all-students",
          JSON.stringify({ ...storedData, students: updatedStudents })
        );

        // Update React state
        setStudents(updatedStudents);
        setFilteredStudents(updatedStudents);

        setRows(
          updatedStudents.map((student, index) => ({
            id: student.zoho_id,
            index: index + 1,
            name: student.Student_Name.split(" ")
              .map(
                (word) =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              )
              .join(" "),
            email: student.Email,
            mobile: student.Mobile
              ? student.Mobile.startsWith("+91")
                ? student.Mobile
                : `+91${student.Mobile}`
              : "-",
            branch: student.Branch || "-",
            courseName: student.Course_Name1 || "-",
            courseMode: student.Student_Type || "-",
            enrollmentDate: formatDate(student.Enrollment_Date),
            endDate: student.End_Date
              ? new Date(student.End_Date).toISOString().split("T")[0]
              : "",
            formattedEndDate: student.End_Date
              ? formatDate(student.End_Date)
              : "N/A",
            remainingTokens: student.totalTokens - student.redeemedTokens,
            attendedTokens: student.redeemedTokens,
            totalTokens: student.totalTokens,
          }))
        );

        // Reset editing state
        setEditingToken(null);
        setNewTokenValue("");
      }
    } catch (error) {
      console.error("Failed to update token value:", error);
      toast.error(
        error.response?.data?.message || "Failed to update token value."
      );
    }
  };

  const handleRefresh = () => {
    sessionStorage.removeItem("all-students");
    setRefreshTrigger((prev) => prev + 1);
  };

  const fetchZohoStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${endpoints.serverBaseURL}/api/std/fetch-from-zoho`
      );
      console.log("Response from Zoho:", response.data);
      const { newAdmissions, newAdmissionsData } = response.data;
      console.log("newAdmissions:", newAdmissionsData);

      if (newAdmissions > 0) {
        toast.success(
          `${newAdmissions} new admission${
            newAdmissions > 1 ? "s" : ""
          } added successfully!`
        );
        setNewAdmissions(newAdmissionsData);
      } else {
        toast.info("No new admissions found.");
      }

      // Only call fetchData if necessary
      await fetchData();
    } catch (error) {
      console.error("Error fetching students from Zoho:", error);
      toast.error("Failed to fetch students from Zoho.");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${endpoints.serverBaseURL}/api/std/get-students`,
        { params: { page: page + 1, limit: rowsPerPage } }
      );
      console.log(response.data);

      const { students, totalCount } = response.data;
      const sortedStudents = students.sort(
        (a, b) => new Date(b.Enrollment_Date) - new Date(a.Enrollment_Date)
      );

      console.log("Sorted Students:", sortedStudents);

      // Store the fetched data in sessionStorage for future use
      sessionStorage.setItem(
        `page-${page}`,
        JSON.stringify({ students: sortedStudents, totalCount })
      );

      setStudents(sortedStudents);
      setFilteredStudents(sortedStudents);
      setTotalCount(totalCount);

      if (page === 0) setAllStudents(students);
    } catch (error) {
      console.error("Error fetching students data:", error);
    }
  };

  // Function to load data from sessionStorage
  const loadData = () => {
    const storedData = sessionStorage.getItem(`page-${pages}`);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setStudents(parsedData.students);
    }
  };

  const formatMobileNumber = (mobile) => {
    if (!mobile) return "-"; // Handle missing numbers
  
    // Remove spaces and unwanted characters
    mobile = mobile.trim();
  
    // If the number starts with "91" but without "+", convert to "+91"
    if (/^91\d{10}$/.test(mobile)) {
      return `+91${mobile.slice(2)}`;
    }
  
    // If the number starts with "+91" and has 10 digits, return as is
    if (/^\+91\d{10}$/.test(mobile)) {
      return mobile;
    }
  
    // If the number has exactly 10 digits, prepend "+91"
    if (/^\d{10}$/.test(mobile)) {
      return `+91${mobile}`;
    }
  
    // Return the original value if it doesn't fit expected formats
    return mobile;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Check if data is already stored in sessionStorage
      const storedData = sessionStorage.getItem("all-students");
      let allData;

      if (storedData) {
        // Use the stored data if available
        const parsedData = JSON.parse(storedData);
        allData = parsedData.students;
        setTotalCount(parsedData.totalCount);
      } else {
        // Fetch all data from the server
        try {
          const response = await axios.get(
            `${endpoints.serverBaseURL}/api/std/get-students`,
            { params: { limit: "all" } }
          );
          console.log("Fetched all students:", response.data);

          const { students, totalCount } = response.data;

          // Sort students by Enrollment_Date
          const sortedStudents = students.sort(
            (a, b) => new Date(b.Enrollment_Date) - new Date(a.Enrollment_Date)
          );

          allData = sortedStudents;
          setTotalCount(totalCount);

          // Store the full dataset in sessionStorage
          sessionStorage.setItem(
            "all-students",
            JSON.stringify({ students: sortedStudents, totalCount })
          );
        } catch (error) {
          console.error("Error fetching students data:", error);
          setLoading(false);
          return;
        }
      }

      // Implement client-side pagination
      const startIndex = page * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      const paginatedData = allData.slice(startIndex, endIndex);

      setStudents(paginatedData);
      setFilteredStudents(paginatedData);
      setRows(
        paginatedData.map((student, index) => ({
          id: student.zoho_id,
          index: startIndex + index + 1,
          name: student.Student_Name.split(" ")
            .map(
              (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(" "),
          email: student.Email,
          mobile: formatMobileNumber(student.Mobile),
          branch: student.Branch || "-",
          courseName: student.Course_Name1 || "-",
          courseMode: student.Student_Type || "-",
          enrollmentDate: formatDate(student.Enrollment_Date),
          endDate: student.End_Date
            ? new Date(student.End_Date).toISOString().split("T")[0]
            : "",
          formattedEndDate: student.End_Date
            ? formatDate(student.End_Date)
            : "N/A",
          remainingTokens: student.availableTokens,
          attendedTokens: student.redeemedTokens,
          totalTokens: student.totalTokens,
        }))
      );

      setLoading(false);
    };

    loadData();
  }, [page, rowsPerPage, refreshTrigger]);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    // Search in allStudents instead of students
    const filtered = allStudents.filter((student) =>
      [student.Student_Name, student.Email, student.Mobile]
        .map((field) => field.toLowerCase())
        .some((field) => field.includes(value))
    );

    setFilteredStudents(filtered);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event) => {
    const value = event?.target?.value;
    if (value !== undefined) {
      setRowsPerPage(parseInt(value, 10));
      setPage(0);
    } else {
      console.error(
        "Dropdown value is undefined. Check the dropdown implementation."
      );
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleOpenModal = (student) => {
    setSelectedStudent(student);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedStudent(null);
    setModalOpen(false);
  };

  const open = useAppStore((state) => state.dopen);

  const defaultSearchValue = "";

  const [filterData, setFilterData] = useState({
    searchKeys: ["name", "mobile", "email", "branch"],
    searchOnKey: "name",
    searchValue: defaultSearchValue,
  });
  const [debouncedSearchTerm] = useDebounce(filterData.searchValue, 1500);
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

  const handleSearchChange = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setFilterData({ ...filterData, searchValue });

    // Retrieve all data from sessionStorage
    const storedData = JSON.parse(sessionStorage.getItem("all-students"));
    const allPagesData = storedData ? storedData.students : [];

    // Map the search key to the appropriate field name in the data
    const searchKeyMap = {
      name: "Student_Name",
      mobile: "Mobile",
      email: "Email",
      branch: "Branch",
    };
    const searchKey = searchKeyMap[filterData.searchOnKey];

    // Filter the students based on the search value
    const filteredStudents = searchValue
      ? allPagesData.filter((student) => {
          const fieldValue = student[searchKey]?.toLowerCase().trim() || "";
          return fieldValue.includes(searchValue);
        })
      : allPagesData;

    // Update the filtered students in the state
    setFilteredStudents(filteredStudents);
    setRows(
      filteredStudents.map((student, index) => ({
        id: student.zoho_id,
        index: index + 1,
        name: student.Student_Name.split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" "),
        email: student.Email,
        mobile: formatMobileNumber(student.Mobile),
        courseName: student.Course_Name1 || "-",
        courseMode: student.Student_Type || "-",
        branch: student.Branch || "-",
        enrollmentDate: formatDate(student.Enrollment_Date),
        endDate: student.End_Date
          ? new Date(student.End_Date).toISOString().split("T")[0]
          : "",
        formattedEndDate: student.End_Date
          ? formatDate(student.End_Date)
          : "N/A",
        remainingTokens: student.availableTokens,
        attendedTokens: student.redeemedTokens,
        totalTokens: student.totalTokens,
      }))
    );
  };

  const handleClearSearch = () => {
    // Reset search value
    setFilterData({ ...filterData, searchValue: defaultSearchValue });

    // Retrieve all data from sessionStorage
    const storedData = JSON.parse(sessionStorage.getItem("all-students"));
    const allPagesData = storedData ? storedData.students : [];

    // Reset the filtered students to the full data
    setFilteredStudents(allPagesData);

    // Update rows with the full data
    setRows(
      allPagesData.map((student, index) => ({
        id: student.zoho_id,
        index: index + 1,
        name: student.Student_Name.split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" "),
        email: student.Email,
        mobile: formatMobileNumber(student.Mobile),
        courseName: student.Course_Name1 || "-",
        courseMode: student.Student_Type || "-",
        branch: student.Branch || "-",
        enrollmentDate: formatDate(student.Enrollment_Date),
        endDate: student.End_Date
          ? new Date(student.End_Date).toISOString().split("T")[0]
          : "",
        formattedEndDate: student.End_Date
          ? formatDate(student.End_Date)
          : "N/A",
        remainingTokens: student.availableTokens,
        attendedTokens: student.redeemedTokens,
        totalTokens: student.totalTokens,
      }))
    );
  };

  const handleSearchKeyChange = (e) => {
    setFilterData({ ...filterData, searchOnKey: e.target.value });
  };

  const handleCancelEdit = () => {
    setEditingToken(null);
    setNewTokenValue("");
  };

  const handleClick = (event, student) => {
    setAnchorEl(event.currentTarget);
    setSelectedStudent(student);
  };

  const handleTokenValueChange = (event) => {
    const inputValue = event.target.value;

    const maxTokens = 99;
    if (/^\d*$/.test(inputValue) && Number(inputValue) <= maxTokens) {
      setNewTokenValue(inputValue);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (action, student) => {
    if (action === "showId") {
      console.log("Selected Student in handlemenu:", selectedStudent);
      setSelectedStudent(student);
      handleOpenModal(selectedStudent);
    }
    handleClose();
  };

  const handleEditEndDate = (row) => {
    setEditingEndDate(row.id);
    setNewEndDateValue(row.endDate || "");
  };

  const handleEndDateChange = (event) => {
    setNewEndDateValue(event.target.value);
  };

  const handleCancelEndDateEdit = () => {
    setEditingEndDate(null);
    setNewEndDateValue("");
  };

  const handleSaveEndDate = async (rowId, newEndDate) => {
    try {
      if (!newEndDate) {
        toast.error("Please provide a valid end date.");
        return;
      }

      const response = await axios.post(
        `${endpoints.serverBaseURL}/api/std/change-endDate`,
        {
          studentId: rowId,
          endDate: newEndDate,
        }
      );

      if (response.status === 200) {
        toast.success("End date updated successfully.");

        const updatedStudent = response.data.student;

        const storedData = JSON.parse(sessionStorage.getItem("all-students"));

        if (storedData) {
          const updatedStudents = storedData.students.map((student) =>
            student.zoho_id === rowId
              ? { ...student, End_Date: updatedStudent.endDate }
              : student
          );

          sessionStorage.setItem(
            "all-students",
            JSON.stringify({ ...storedData, students: updatedStudents })
          );

          setStudents(updatedStudents);
          setFilteredStudents(updatedStudents);
          setRows(
            updatedStudents.map((student, index) => ({
              id: student.zoho_id,
              index: index + 1,
              name: student.Student_Name.split(" ")
                .map(
                  (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )
                .join(" "),
              email: student.Email,
              mobile: formatMobileNumber(student.Mobile),
              courseName: student.Course_Name1 || "-",
              courseMode: student.Student_Type || "-",
              branch: student.Branch || "-",
              enrollmentDate: formatDate(student.Enrollment_Date),
              endDate: student.End_Date
                ? new Date(student.End_Date).toISOString().split("T")[0]
                : "",
              formattedEndDate: student.End_Date
                ? formatDate(student.End_Date)
                : "N/A",
              remainingTokens: student.availableTokens,
              attendedTokens: student.redeemedTokens,
              totalTokens: student.totalTokens,
            }))
          );
        }

        setEditingEndDate(null);
        setNewEndDateValue("");
      }
    } catch (error) {
      console.error("Failed to update end date:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update end date.";
      toast.error(errorMessage);
    }
  };

  const columns = [
    // {
    //   field: "index",
    //   headerName: "No",
    //   flex: 0.5,
    //   headerAlign: "center",
    //   align: "center",
    //   valueGetter: (params) => params.row.index,
    //   sortable: false,
    // },
    {
      field: "name",
      headerName: "Name",
      flex: 1.5,
      headerAlign: "start",
      align: "start",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.3,
      headerAlign: "start",
      align: "start",
    },
    {
      field: "mobile",
      headerName: "Mobile",
      flex: 1,
      headerAlign: "center",
      align: "right",
    },
    {
      field: "courseName",
      headerName: "Course Name",
      flex: 2,
      headerAlign: "center",
      align: "start",
    },
    {
      field: "courseMode",
      headerName: "Course Mode",
      flex: 1,
      headerAlign: "center",
      align: "start",
    },
    {
      field: "branch",
      headerName: "Branch",
      flex: 1,
      headerAlign: "start",
      align: "start",
    },
    {
      field: "enrollmentDate",
      headerName: "Enrollment Date",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "endDate",
      headerName: "End Date",
      flex: 1.6,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const isEditing = editingEndDate === params.row.id;

        return isEditing ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            {/* Editable End Date Input */}
            <TextField
              value={newEndDateValue || params.row.formattedEndDate || ""}
              onChange={handleEndDateChange}
              size="small"
              type="date"
              sx={{
                width: "195px",
                ".MuiInputBase-input": { textAlign: "center" },
              }}
              inputProps={{
                max: "9999-12-31",
              }}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                color="primary"
                size="small"
                onClick={() =>
                  handleSaveEndDate(params.row.id, newEndDateValue)
                }
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                color="secondary"
                size="small"
                onClick={handleCancelEndDateEdit}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              paddingTop: "10px",
              "&:hover": {
                "& button": {
                  visibility: "visible",
                },
              },
            }}
          >
            <Typography
              sx={{
                fontSize: "13px",
                textAlign: "center",
              }}
            >
              {params.row.formattedEndDate}
            </Typography>
            {roles.isSuperAdmin && (
              <Tooltip title="Edit End Date">
                <IconButton
                  size="small"
                  onClick={() => handleEditEndDate(params.row)}
                  sx={{
                    visibility: "hidden",
                    position: "absolute",
                    right: 1,
                    // paddingRight: "14px",
                  }}
                >
                  <EditIcon sx={{ fontSize: "16px" }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
    {
      field: "tokens",
      headerName: "Tokens",
      flex: 2.3,
      renderHeader: () => (
        <Box>
          <Typography
            sx={{
              textAlign: "center",
              fontSize: "14px",
              mb: 1,
              textTransform: "uppercase",
            }}
          >
            Access Days
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1,
            }}
          >
            {/* Updated Tokens Display Heading */}
            <Typography
              sx={{
                width: "33%",
                textAlign: "center",
                fontSize: "13px",
              }}
            >
              Total
            </Typography>
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                borderColor: "black",
                borderWidth: "1px",
              }}
            />
            <Typography
              sx={{
                width: "33%",
                textAlign: "center",
                fontSize: "13px",
              }}
            >
              Attended
            </Typography>
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                borderColor: "black",
                borderWidth: "1px",
              }}
            />
            <Typography
              sx={{
                width: "33%",
                textAlign: "center",
                fontSize: "13px",
              }}
            >
              Available
            </Typography>
          </Box>
        </Box>
      ),
      renderCell: (params) => {
        const isEditing = editingToken === params.row.id;

        return isEditing ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              paddingLeft: 6,
            }}
          >
            {/* Editable Total Tokens Input */}
            <TextField
              value={newTokenValue}
              onChange={handleTokenValueChange}
              size="small"
              type="text"
              sx={{
                width: "50px",
                ".MuiInputBase-input": { textAlign: "center" },
              }}
              placeholder="Enter tokens (max: 9999)"
              inputProps={{
                inputMode: "numeric",
                maxLength: 4,
              }}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                color="primary"
                size="small"
                onClick={() => handleSaveToken(params.row.id, newTokenValue)}
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                color="secondary"
                size="small"
                onClick={handleCancelEdit}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "12px",
            }}
          >
            {/* Updated Tokens Display */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                width: "33%",
                justifyContent: "center",
                position: "relative",
                ":hover .edit-icon": {
                  visibility: "visible",
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: "13px",
                  textAlign: "center",
                }}
              >
                {params.row.totalTokens}
              </Typography>
              {/* Edit Icon for Super Admin next to Total */}
              {roles.isSuperAdmin && (
                <Tooltip title="Edit Token">
                  <IconButton
                    size="small"
                    onClick={() => handleEditToken(params.row)}
                    className="edit-icon"
                    sx={{
                      fontSize: "16px",
                      visibility: "hidden",
                    }}
                  >
                    <EditIcon sx={{ fontSize: "16px" }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <Typography
              sx={{
                width: "33%",
                textAlign: "start",
                fontSize: "13px",
              }}
            >
              {params.row.attendedTokens}
            </Typography>
            <Typography
              sx={{
                width: "33%",
                textAlign: "start",
                fontSize: "13px",
                marginRight: "3px",
              }}
            >
              {params.row.remainingTokens}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <IconButton onClick={(e) => handleClick(e, params.row)}>
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box
      sx={{ mt: "65px", display: "flex", flexDirection: "column" }}
      id="tableBox"
    >
      <Navbar />
      <Box sx={{ display: "flex", flexGrow: 1 }}>
        <Sidenav />

        <Container
          sx={{
            flexGrow: 1,
            padding: 1,
            maxWidth: "none",
            overflowY: "auto",
            overflowX: "hidden",
            display: "flex",
            // overflow: "hidden",
            flexDirection: "column",
            // marginBottom: 1,
            height: "calc(100vh - 65px)",
          }}
          maxWidth="none"
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: "100%",
              marginBottom: 1,
              marginTop: 1,
              justifyContent: "flex-end",
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                wordBreak: "break-word",
                minWidth: "250px",
                marginBottom: 1,
                flexGrow: 1,
              }}
            >
              Candidate List
            </Typography>

            {/* Dropdown */}
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel id="search-key-label">Search By</InputLabel>
              <Select
                labelId="search-key-label"
                value={filterData.searchOnKey || filterData.searchKeys[0]}
                onChange={handleSearchKeyChange}
                label="Search By"
                size="small"
                sx={{ fontSize: "1rem" }}
              >
                {filterData.searchKeys.map((key) => (
                  <MenuItem key={key} value={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Search Box with Search Icon */}
            <TextField
              type="text"
              placeholder="Search"
              variant="outlined"
              value={filterData.searchValue}
              onChange={handleSearchChange}
              size="small"
              sx={{ fontSize: "1rem" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <GridSearchIcon />
                  </InputAdornment>
                ),
                endAdornment: filterData.searchValue && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClearSearch}
                      size="small"
                      sx={{ padding: 0 }}
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Refresh Button */}
            <Box sx={{ marginLeft: "auto" }}>
              <Tooltip title="Refresh Data">
                <IconButton
                  size="medium"
                  onClick={handleRefresh}
                  disabled={loading}
                  sx={{
                    backgroundColor: loading ? "grey.300" : "#867ae9",
                    color: "white",
                    "&:hover": { backgroundColor: "#867ae9" },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <RefreshOutlinedIcon />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            sx={{
              "& .MuiPaper-root": {
                boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.15)",
              },
            }}
          >
            <MenuItem onClick={() => handleMenuItemClick("showId")}>
              Access Card
            </MenuItem>
          </Menu>

          <Box sx={{ height: 570, width: "100%", position: "relative" }}>
            {loading ? (
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress />
              </Box>
            ) : rows.length > 0 ? (
              <>
                <DataGrid
                  autoHeight
                  rows={rows}
                  columns={columns}
                  getRowId={(row) => row.id}
                  page={page}
                  pageSize={rowsPerPage}
                  // density="compact"
                  disableSelectionOnClick
                  sx={{
                    "& .MuiDataGrid-cell": {
                      fontSize: "0.9rem",
                      backgroundColor: "#ffffff",
                    },
                    "& .MuiDataGrid-row": {
                      backgroundColor: "#ffffff",
                    },
                    "& .MuiDataGrid-columnHeaders": {
                      backgroundColor: "#f5f5f5",
                      fontWeight: "bold",
                    },
                    // "& .MuiDataGrid-virtualScroller": { overflow: "hidden !important" },
                  }}
                  hideFooter
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "end",
                    alignItems: "center",
                    backgroundColor: "#ffffff",
                    padding: "10px",
                  }}
                >
                  {/* Pagination controls */}
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 0}
                      size="small"
                      sx={{
                        color: page === 0 ? "gray" : "#867ae9",
                      }}
                    >
                      <ArrowBackIos />
                    </IconButton>
                    <Typography sx={{ margin: "0 10px" }}>
                      Page {page + 1} of {Math.ceil(totalCount / rowsPerPage)}
                    </Typography>
                    <IconButton
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= Math.ceil(totalCount / rowsPerPage) - 1}
                      size="small"
                      sx={{
                        color:
                          page >= Math.ceil(totalCount / rowsPerPage) - 1
                            ? "gray"
                            : "#867ae9",
                      }}
                    >
                      <ArrowForwardIos />
                    </IconButton>
                  </Box>
                </Box>
              </>
            ) : (
              <Typography
                variant="h6"
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: "gray",
                }}
              >
                No results found for "{filterData.searchValue}"
              </Typography>
            )}
          </Box>

          <Modal open={modalOpen} onClose={handleCloseModal}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                p: 4,
                bgcolor: "white",
                boxShadow: 24,
                borderRadius: 2,
              }}
            >
              {selectedStudent && (
                <IDCard
                  newAdmissions={newAdmissions}
                  handleCloseModal={handleCloseModal}
                  invokeExport={invokeExport}
                  onExportComplete={() => setInvokeExport(null)}
                  students={selectedStudent}
                />
              )}
            </Box>
          </Modal>
        </Container>
      </Box>
      <ToastContainer />
    </Box>
  );
};

export default StudentsTable;
