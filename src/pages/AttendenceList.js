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
  
    try {
      const response = await axios.post(
        `${endpoints.serverBaseURL}/api/std/change-token`,
        {
          studentId: editingToken,
          totalTokens: newTokenValue,
        }
      );
  
      if (response.status === 200) {
        toast.success("Token value updated successfully.");
  
        // Retrieve the current page's data from sessionStorage
        const storedData = JSON.parse(sessionStorage.getItem(`page-${page}`));
  
        if (storedData) {
          // Update the student data locally
          const updatedStudents = storedData.students.map((student) =>
            student.zoho_id === editingToken
              ? { ...student, totalTokens: newTokenValue }
              : student
          );
  
          // Update sessionStorage with the new data
          sessionStorage.setItem(
            `page-${page}`,
            JSON.stringify({ ...storedData, students: updatedStudents })
          );
  
          // Update React state with the new data
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
              mobile: student.Mobile,
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
        }
  
        // Reset the editing state
        setEditingToken(null);
        setNewTokenValue("");
      }
    } catch (error) {
      console.error("Failed to update token value:", error);
      toast.error(error.response.data.message || "Failed to update token value.");
    }
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Check if data for the current page is already in sessionStorage
      const storedData = sessionStorage.getItem(`page-${page}`);
      let data;
      if (storedData) {
        // If data is found in sessionStorage, load it into state
        const parsedData = JSON.parse(storedData);
        setStudents(parsedData.students);
        setFilteredStudents(parsedData.students);
        setTotalCount(parsedData.totalCount);
        data = parsedData.students;
        console.log("Data from sessionStorage:", data);
        setRows(
          data.map((student, index) => ({
            id: student.zoho_id,
            index: index + 1,
            name: student.Student_Name.split(" ")
              .map(
                (word) =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              )
              .join(" "),
            email: student.Email,
            mobile: student.Mobile,
            branch: student.Branch || "-",  
            courseName: student.Course_Name1 || "-",
            courseMode: student.Student_Type || "-",
            enrollmentDate: formatDate(student.Enrollment_Date),
            endDate: student.End_Date
              ? new Date(student.End_Date).toISOString().split("T")[0] // Raw ISO date for input
              : "",
            formattedEndDate: student.End_Date
              ? formatDate(student.End_Date) // User-friendly date for display
              : "N/A",
            remainingTokens: student.totalTokens - student.redeemedTokens,
            attendedTokens: student.redeemedTokens,
            totalTokens: student.totalTokens,
          }))
        );
      } else {
        // If data is not in sessionStorage, fetch it
        try {
          const response = await axios.get(
            `${endpoints.serverBaseURL}/api/std/get-students`,
            { params: { page: page + 1, limit: rowsPerPage } }
          );
          console.log(response.data);

          const { students, totalCount } = response.data;

          // Sort students by Enrollment_Date
          const sortedStudents = students.sort(
            (a, b) => new Date(b.Enrollment_Date) - new Date(a.Enrollment_Date)
          );

          console.log("Sorted Students:", sortedStudents);

          setStudents(sortedStudents);
          setFilteredStudents(sortedStudents);
          setTotalCount(totalCount);
          setRows(
            sortedStudents.map((student, index) => ({
              id: student.zoho_id,
              index: index + 1,
              name: student.Student_Name.split(" ")
                .map(
                  (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )
                .join(" "),
              email: student.Email,
              mobile: student.Mobile,
              branch: student.Branch || "-",
              courseName: student.Course_Name1 || "-",
              courseMode: student.Student_Type || "-",
              enrollmentDate: formatDate(student.Enrollment_Date),
              endDate: student.End_Date
                ? new Date(student.End_Date).toISOString().split("T")[0] // Raw ISO date for input
                : "",
              formattedEndDate: student.End_Date
                ? formatDate(student.End_Date) // User-friendly date for display
                : "N/A",
              remainingTokens: student.totalTokens - student.redeemedTokens,
              attendedTokens: student.redeemedTokens,
              totalTokens: student.totalTokens,
            }))
          );
          data = sortedStudents;
          // Store the fetched data in sessionStorage for future use
          sessionStorage.setItem(
            `page-${page}`,
            JSON.stringify({ students: sortedStudents, totalCount })
          );

          // Store data for the first page
          if (page === 0) setAllStudents(students);
        } catch (error) {
          console.error("Error fetching students data:", error);
        } finally {
          console.log("came in finally iwht data", data);
        }
      }

      setLoading(false);
    };

    loadData();
  }, [page]);

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

  const calculateEndDate = (dateString) => {
    if (!dateString) return "";
    const enrollmentDate = new Date(dateString);
    enrollmentDate.setMonth(enrollmentDate.getMonth() + 3);
    return enrollmentDate;
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
    searchKeys: ["name", "mobile", "email"],
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
    const allPagesData = [];
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("page-")) {
        const pageData = JSON.parse(sessionStorage.getItem(key));
        if (pageData && pageData.students) {
          allPagesData.push(...pageData.students);
        }
      }
    });
  
    // Map the search key to the appropriate field name in the data
    const searchKeyMap = {
      name: "Student_Name",
      mobile: "Mobile",
      email: "Email",
    };
    const searchKey = searchKeyMap[filterData.searchOnKey];
  
    // Filter the students based on the search value
    const filteredStudents = searchValue
      ? allPagesData.filter((student) => {
          const fieldValue = student[searchKey]?.toLowerCase() || "";
          return fieldValue.includes(searchValue);
        })
      : allPagesData; // Show all students when search field is cleared
  
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
        mobile: student.Mobile,
        courseName: student.Course_Name1 || "-",
        courseMode: student.Student_Type || "-",
        enrollmentDate: formatDate(student.Enrollment_Date),
        endDate: student.End_Date
          ? new Date(student.End_Date).toISOString().split("T")[0] // Raw ISO date for input
          : "",
        formattedEndDate: student.End_Date
          ? formatDate(student.End_Date) // User-friendly date for display
          : "N/A",
        remainingTokens: student.totalTokens - student.redeemedTokens,
        attendedTokens: student.redeemedTokens,
        totalTokens: student.totalTokens,
      }))
    );
  };
  

  const handleClearSearch = () => {
    // Reset search value
    setFilterData({ ...filterData, searchValue: defaultSearchValue });

    // Retrieve all data from sessionStorage
    const allPagesData = [];
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("page-")) {
        const pageData = JSON.parse(sessionStorage.getItem(key));
        if (pageData && pageData.students) {
          allPagesData.push(...pageData.students);
        }
      }
    });

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
        mobile: student.Mobile,
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
  };

  const handleSearchKeyChange = (e) => {
    setFilterData({ ...filterData, searchOnKey: e.target.value });
  };

  // async function fetchStudent() {
  //   try {
  //     let searchKey = "";
  //     if (filterData.searchOnKey === "name") {
  //       searchKey = `${filterData.searchOnKey}`.replace("name", "Student_Name");
  //     } else if (filterData.searchOnKey === "mobile") {
  //       searchKey = `${filterData.searchOnKey}`.replace("mobile", "Mobile");
  //     } else if (filterData.searchOnKey === "email") {
  //       searchKey = `${filterData.searchOnKey}`.replace("email", "Email");
  //     }
  //     const res = await axios.get(
  //       `${endpoints.serverBaseURL}/api/std/search-students`,
  //       {
  //         params: { searchKey: searchKey, searchValue: filterData.searchValue },
  //       }
  //     );
  //     setFilteredStudents(res.data.data);
  //   } catch (e) {}
  // }
  // useEffect(() => {
  //   if (debouncedSearchTerm) {
  //     fetchStudent();
  //   }
  //   setFilteredStudents(allStudents);
  // }, [debouncedSearchTerm, allStudents]);

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

    const maxTokens = 9999;
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
      // Validate newEndDate
      if (!newEndDate) {
        toast.error("Please provide a valid end date.");
        return;
      }

      // Send API request to update the end date
      const response = await axios.post(
        `${endpoints.serverBaseURL}/api/std/change-endDate`,
        {
          studentId: rowId,
          endDate: newEndDate,
        }
      );

      if (response.status === 200) {
        toast.success("End date updated successfully.");

        // Retrieve current page's data from sessionStorage
        const storedData = JSON.parse(sessionStorage.getItem(`page-${page}`));

        if (storedData) {
          // Update the student's end date locally
          const updatedStudents = storedData.students.map((student) =>
            student.zoho_id === rowId
              ? { ...student, End_Date: newEndDate }
              : student
          );

          // Update sessionStorage with the modified data
          sessionStorage.setItem(
            `page-${page}`,
            JSON.stringify({ ...storedData, students: updatedStudents })
          );

          // Update React state with the modified data
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
              mobile: student.Mobile,
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
        }

        // Reset any editing states (if applicable)
        setEditingEndDate(null);
        setNewEndDateValue("");
      }
    } catch (error) {
      console.error("Failed to update end date:", error);
      toast.error("Failed to update end date.");
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
      headerAlign: "center",
      align: "center",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.3,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "mobile",
      headerName: "Mobile",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "courseName",
      headerName: "Course Name",
      flex: 2,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "courseMode",
      headerName: "Course Mode",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "branch",
      headerName: "Branch",
      flex: 1,
      headerAlign: "center",
      align: "center",
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
                width: "200px",
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
              // fontWeight: 'bold',
              fontSize: "14px",
              mb: 1,
              textTransform: "uppercase",
            }}
          >
            Tokens
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1,
            }}
          >
            {/* Tokens Display Heading */}
            <Typography
              sx={{
                width: "33%",
                textAlign: "center",
                // fontWeight: 'bold',
                fontSize: "13px",
              }}
            >
              Available
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
                // fontWeight: 'bold',
                fontSize: "13px",
              }}
            >
              Redeemed
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
                textAlign: "end",
                // fontWeight: 'bold',
                fontSize: "13px",
                paddingLeft: "1px",
              }}
            >
              Total
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
              alignItems: "center", // Adjusted to align content in the middle
              paddingTop: "12px",
            }}
          >
            {/* Tokens Display */}
            <Typography
              sx={{
                width: "33%",
                textAlign: "center",
                fontSize: "13px",
              }}
            >
              {params.row.remainingTokens}
            </Typography>
            <Typography
              sx={{
                width: "23%",
                textAlign: "center",
                fontSize: "13px",
                paddingLeft: "6px",
              }}
            >
              {params.row.attendedTokens}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.3,
                width: "43%",
                justifyContent: "center",
                position: "relative", // Ensure positioning context for children
                ":hover .edit-icon": {
                  visibility: "visible", // Show the icon only on hover
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: "13px",
                  paddingLeft: "45px",
                }}
              >
                {params.row.totalTokens}
              </Typography>
              {/* Edit Icon for Super Admin */}
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
              Candidate Data
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
                  onClick={fetchZohoStudents}
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
