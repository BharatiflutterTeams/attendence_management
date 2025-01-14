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

const StudentCard = ({ student }) => {
  const { Student_Name, Email, Mobile, Enrollment_Date, End_Date, _id } =
    student;
  console.log("Student:", student);

  return (
    <Box
      sx={{
        border: "1px solid #ddd",
        borderRadius: 2,
        padding: 2,
        width: 300,
        textAlign: "center",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        backgroundColor: "white",
      }}
    >
      <Typography variant="h6" gutterBottom>
        {Student_Name}
      </Typography>
      <Divider sx={{ my: 1 }} />
      <Typography variant="body2" color="textSecondary">
        Email: {Email}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Mobile: {Mobile}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Enrollment Date: {Enrollment_Date}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        End Date: {End_Date}
      </Typography>
      <Box sx={{ mt: 2 }}>
        <QRCode
          value={JSON.stringify({
            Id: _id,
            student: Student_Name,
            Email: Email,
            MobileNumber: Mobile,
            enrollment_date: Enrollment_Date,
            end_date: End_Date,
          })}
          size={128}
        />
      </Box>
    </Box>
  );
};

const StudentsTable = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [allStudents, setAllStudents] = useState([]);

  const [editingToken, setEditingToken] = useState(null);
  const [newTokenValue, setNewTokenValue] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [invokeExport, setInvokeExport] = useState(null);
  const [newAdmissions, setNewAdmissions] = useState([]);

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
    if (newTokenValue !== "") {
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
          fetchData(); // Refresh data after update
          setEditingToken(null); // Reset editing state
          setNewTokenValue(""); // Reset token value
        }
      } catch (error) {
        toast.error("Failed to update token value.");
      }
    } else {
      toast.error("Please enter a valid token value.");
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

      fetchData();
    } catch (error) {
      console.error("Error fetching students from Zoho:", error);
      toast.error("Failed to fetch students from Zoho.");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${endpoints.serverBaseURL}/api/std/get-students`,
        { params: { page: page + 1, limit: rowsPerPage } }
      );

      const { students, totalCount } = response.data;
      const sortedStudents = students.sort(
        (a, b) => new Date(b.Enrollment_Date) - new Date(a.Enrollment_Date)
      );

      setStudents(sortedStudents);
      setFilteredStudents(sortedStudents);
      setTotalCount(totalCount);
      if (page === 0) setAllStudents(students);
    } catch (error) {
      console.error("Error fetching students data:", error);
    } finally {
      setLoading(false);
    }
  };
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
  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage]);

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
    setFilterData({ ...filterData, searchValue: e.target.value });
  };

  const handleClearSearch = () => {
    setFilterData({ ...filterData, searchValue: defaultSearchValue });
    setFilteredStudents(allStudents);
  };

  const handleSearchKeyChange = (e) => {
    setFilterData({ ...filterData, searchOnKey: e.target.value });
  };

  async function fetchStudent() {
    try {
      let searchKey = "";
      if (filterData.searchOnKey === "name") {
        searchKey = `${filterData.searchOnKey}`.replace("name", "Student_Name");
      } else if (filterData.searchOnKey === "mobile") {
        searchKey = `${filterData.searchOnKey}`.replace("mobile", "Mobile");
      } else if (filterData.searchOnKey === "email") {
        searchKey = `${filterData.searchOnKey}`.replace("email", "Email");
      }
      const res = await axios.get(
        `${endpoints.serverBaseURL}/api/std/search-students`,
        {
          params: { searchKey: searchKey, searchValue: filterData.searchValue },
        }
      );
      setFilteredStudents(res.data.data);
    } catch (e) {}
  }
  useEffect(() => {
    if (debouncedSearchTerm) {
      fetchStudent();
    }
    setFilteredStudents(allStudents);
  }, [debouncedSearchTerm, allStudents]);

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
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
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
      field: "enrollmentDate",
      headerName: "Enrollment Date",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "endDate",
      headerName: "End Date",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "tokens",
      headerName: "Tokens",
      flex: 2,
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
                paddingLeft: "8px",
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
              paddingTop: "10px",
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
              }}
            >
              {params.row.attendedTokens}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                width: "43%",
                justifyContent: "center",
                // paddingLeft: "15px",
              }}
            >
              <Typography
                sx={{
                  fontSize: "13px",
                  // paddingLeft: "15px",
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

  const rows = filteredStudents.map((student, index) => ({
    id: student._id,
    index: index + 1,
    name: student.Student_Name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" "),
    email: student.Email,
    mobile: student.Mobile,
    courseName: student.Product_List?.join(", ") || "-",
    courseMode: student.Student_Type || "-",
    enrollmentDate: formatDate(student.Enrollment_Date),
    endDate: formatDate(calculateEndDate(student.Enrollment_Date)),
    remainingTokens: student.totalTokens - student.redeemedTokens,
    attendedTokens: student.redeemedTokens,
    totalTokens: student.totalTokens,
  }));

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
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            marginBottom: 2,
          }}
          maxWidth="none"
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: "100%",
              marginBottom: 2,
              marginTop: 3,
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
            {rows.length > 0 ? (
              <>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  // columns={[
                  //   {
                  //     field: "index",
                  //     headerName: "#",
                  //     width: 50,
                  //     sortable: false, // Optional: Disable sorting for the index column
                  //     valueGetter: (params) => params.api.getRowIndexRelativeToVisibleRows(params.row.id) + 1,
                  //   },
                  //   ...columns, // Spread your existing columns
                  // ]}
                  getRowId={(row) => row.id}
                  page={page}
                  pageSize={rowsPerPage}
                  loading={loading}
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
                  {/* Rows per page selector */}
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography>Rows per page:</Typography>
                    <Select
                      value={rowsPerPage}
                      onChange={(event) => handleRowsPerPageChange(event)}
                      sx={{ marginLeft: "10px", width: "70px", marginRight: "10px" }}
                      size="small"
                    >
                      {[5, 10, 15, 25, 50].map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>

                  {/* Pagination controls */}
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 0}
                    >
                     <ArrowBackIos />
                    </IconButton>
                    <Typography sx={{ margin: "0 10px" }}>
                      Page {page + 1} of {Math.ceil(totalCount / rowsPerPage)}
                    </Typography>
                    <IconButton
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= Math.ceil(totalCount / rowsPerPage) - 1}
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
