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
            id: _id,
            student: Student_Name,
            enrollmentDate: Enrollment_Date,
            endDate: End_Date,
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

  const [editingToken, setEditingToken] = useState(null); // Track which student is being edited
  const [newTokenValue, setNewTokenValue] = useState(""); // Store the new token value
  const [anchorEl, setAnchorEl] = useState(null);
  const [invokeExport, setInvokeExport] = useState(null);
  const [newAdmissions, setNewAdmissions] = useState([]);

  const idCardRef = useRef();

  const mobileNumber = "9807631010";

  const handleExport = () => {
    if (selectedStudent) {
      setInvokeExport({ mobile: "9807631010" }); // Pass mobile to IDCard
    } else {
      alert("Please select a student first.");
    }
  };

  // React.useEffect(() => {
  //   if (studentToExport) {
  //     handleExport(studentToExport);
  //   }
  // }, [studentToExport]);

  const handleEditToken = (row) => {
    console.log("Editing Token for:", row);
    console.log("row id:", row.id);
    setEditingToken(row.id); // Set the row ID to indicate it's in editing mode
    setNewTokenValue(row.totalTokens); // Pre-fill the field with the current total tokens
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
      const { newAdmissions } = response.data;

      if (newAdmissions > 0) {
        toast.success(
          `${newAdmissions} new admission${
            newAdmissions > 1 ? "s" : ""
          } added successfully!`
        );
        setNewAdmissions(students);
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
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page changes
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

  // Update search text in Redux (immediate)
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
    console.log("clicked", student)
  };

  const handleTokenValueChange = (event) => {
    const inputValue = event.target.value;

    // Allow only numbers and limit the maximum value
    const maxTokens = 9999; // Set your desired maximum value
    if (/^\d*$/.test(inputValue) && Number(inputValue) <= maxTokens) {
      setNewTokenValue(inputValue); // Update state only if valid
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

  const rows = filteredStudents.map((student) => ({
    id: student._id,
    name: student.Student_Name,
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

  // const handleExport = async (student) => {
  //   try {
  //     // Dynamically create a div to hold the component for rendering
  //     const tempDiv = document.createElement("div");
  //     tempDiv.style.position = "absolute";
  //     tempDiv.style.visibility = "hidden";
  //     document.body.appendChild(tempDiv);

  //     // Render the JSX element to the temporary div
  //     import("react-dom").then(({ createRoot }) => {
  //       const root = createRoot(tempDiv);
  //       root.render(<StudentCard student={student} />);

  //       // Add a slight delay to ensure rendering is complete
  //       setTimeout(() => {
  //         // Convert the rendered JSX to an image
  //         toPng(tempDiv).then((imageUrl) => {
  //           // Check if the image URL is valid
  //           if (!imageUrl || !imageUrl.startsWith("data:image/png;base64,")) {
  //             throw new Error("Invalid or empty Base64 image data.");
  //           }

  //           // Log the imageUrl to debug
  //           console.log("Generated Image URL:", imageUrl);

  //           // Create a FormData object
  //           const formData = new FormData();

  //           // Convert the Base64 image to a Blob (PNG format)
  //           const byteCharacters = atob(imageUrl.split(',')[1]);
  //           const byteArrays = [];

  //           for (let offset = 0; offset < byteCharacters.length; offset += 512) {
  //             const slice = byteCharacters.slice(offset, offset + 512);
  //             const byteNumbers = new Array(slice.length);
  //             for (let i = 0; i < slice.length; i++) {
  //               byteNumbers[i] = slice.charCodeAt(i);
  //             }
  //             byteArrays.push(new Uint8Array(byteNumbers));
  //           }

  //           // Create a Blob from the byte arrays
  //           const imageBlob = new Blob(byteArrays, { type: 'image/png' });

  //           // Append the image Blob to FormData
  //           formData.append("image", imageBlob, "student-image.png");
  //           formData.append("mobile", "9807631010"); // Add other fields if needed

  //           // Send FormData to backend using axios
  //           axios
  //             .post(`${endpoints.serverBaseURL}/api/receive-image`, formData, {
  //               headers: {
  //                 "Content-Type": "multipart/form-data",
  //               },
  //             })
  //             .then(() => {
  //               alert("Image sent to backend successfully!");
  //               document.body.removeChild(tempDiv); // Clean up the DOM after sending the image
  //             })
  //             .catch((error) => {
  //               console.error("Error sending image to backend:", error);
  //               alert("Failed to send image to backend.");
  //             });
  //         }).catch((error) => {
  //           console.error("Error generating image from JSX:", error);
  //           alert("Failed to capture image.");
  //         });
  //       }, 200); // Give some time for rendering (200ms delay, adjust as necessary)
  //     });
  //   } catch (error) {
  //     console.error("Error capturing or rendering image:", error);
  //   }
  // };

  //  const handleShareIdCard = () => {
  //   if (idCardRef.current) {
  //     idCardRef.current.handleExport("9807631010"); // Trigger handleExport with static mobile number
  //   } else {
  //     console.error("IDCard ref is not set.");
  //   }
  // };

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
            overflow: "auto", // Ensure content is scrollable
            display: "flex",
            flexDirection: "column",
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
              justifyContent: "flex-end", // Align elements to the right
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                wordBreak: "break-word",
                minWidth: "250px",
                marginBottom: 1,
                flexGrow: 1, // Allow the title to take space on the left
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

          {/* <Divider sx={{ marginTop: 2, marginBottom: 2 }} /> */}

          <Box sx={{ height: 570, width: "100%", position: "relative" }}>
            {rows.length > 0 ? (
              <>
                <DataGrid
                  rows={rows}
                  columns={columns}
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
                  }}
                >
                  <IconButton
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                  >
                    &lt;
                  </IconButton>
                  <Typography sx={{ margin: "0 10px" }}>
                    Page {page + 1} of {Math.ceil(totalCount / rowsPerPage)}
                  </Typography>
                  <IconButton
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= Math.ceil(totalCount / rowsPerPage) - 1}
                  >
                    &gt;
                  </IconButton>
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
                  student={selectedStudent}
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
