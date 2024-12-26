import React, { useEffect, useState } from "react";
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

import {  Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import {useDebounce } from "use-debounce"


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


  const [editingToken, setEditingToken] = useState(null); // Track which student is being edited
  const [newTokenValue, setNewTokenValue] = useState(""); // Store the new token value

 
  const handleEditToken = (student) => {
    setEditingToken(student._id); // Track the student being edited
    setNewTokenValue(student.totalTokens); // Set current token value in the text field
  };

  const handleSaveToken = async () => {
    if (newTokenValue !== "") {
      try {
        const response = await axios.post(`${endpoints.serverBaseURL}/api/std/change-token`, {
          studentId: editingToken,
          totalTokens: newTokenValue,
        });

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
      const response = await axios.post(`${endpoints.serverBaseURL}/api/std/fetch-from-zoho`);
      const { newAdmissions } = response.data;

      if (newAdmissions > 0) {
        toast.success(`${newAdmissions} new admission${newAdmissions > 1 ? "s" : ""} added successfully!`);
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
      const sortedStudents = students.sort((a, b) => new Date(b.Enrollment_Date) - new Date(a.Enrollment_Date));

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

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
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

  const [filterData,setFilterData]=useState({
    searchKeys : ["name","mobile","email"],
    searchOnKey : "name",
    searchValue : ""
  })
  const [debouncedSearchTerm] = useDebounce(filterData.searchValue, 1500)

  // Update search text in Redux (immediate)
  const handleSearchChange = (e) => {
    setFilterData({ ...filterData,searchValue: e.target.value });
  };
 
  const handleSearchKeyChange = (e) => {
    setFilterData({ ...filterData,searchOnKey: e.target.value });
  };


  async function fetchStudent() {
    try {
      let searchKey = "";
      if (filterData.searchOnKey === "name") {
       searchKey= `${filterData.searchOnKey}`.replace("name","Student_Name"); 
      }else if (filterData.searchOnKey === "mobile") {
        searchKey=`${filterData.searchOnKey}`.replace("mobile","Mobile");
        
      }else if (filterData.searchOnKey === "email") {
        searchKey=`${filterData.searchOnKey}`.replace("email","Email");
      }
      const res=await axios.get(`${endpoints.serverBaseURL}/api/std/search-students`,{
        params: { searchKey: searchKey, searchValue: filterData.searchValue }
      });
      setFilteredStudents(res.data.data);
    } catch (e) {
      
    }
  }
  useEffect(() => {
    if(debouncedSearchTerm){
      fetchStudent();
    }
  }, [debouncedSearchTerm]) 


  return (
    <Box sx={{mt:'65px', display: "flex", flexDirection: "column"}} id='tableBox'>
      <Navbar />
<Box sx={{ display: "flex", flexGrow: 1 }}>
  <Sidenav />

  <Container sx={{ flexGrow: 1, padding: 2 }} maxWidth="none"> 
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center", // Align items vertically
        mb: 2,
        gap: 2, // Add spacing between items
      }}
    >
      <Box sx={{display : "flex", alignItems:'center', width:'600px'}}>
        
      <Typography variant="h4" gutterBottom sx={{wordBreak: 'no-break', minWidth: '250px'}}>
        Students Data
      </Typography>

      {/* <TextField
          label="Search by Name, Email, or Mobile"
          value={searchTerm}
          onChange={handleSearch}
          fullWidth
          sx={{ flexGrow: 0 }} // Make search field responsive
        /> */}


<div className="col-sm-6">
      <div className="input-group">
        <FormControl fullWidth>
          <InputLabel id="search-key-label">Search By</InputLabel>
          <Select
            labelId="search-key-label"
            value={filterData.searchOnKey || filterData.searchKeys[0]} // Ensure a default value is selected
            onChange={handleSearchKeyChange}
            label="Search By"
            fullWidth
          >
            {filterData.searchKeys.map((key) => (
              <MenuItem key={key} value={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          type="text"
          label="Search for ..."
          variant="outlined"
          fullWidth
          value={filterData.searchValue}
          onChange={handleSearchChange}
        />
      </div>
    </div>

      </Box>
     

      <Box
        sx={{
          display: "flex",
          alignItems: "center", // Align search bar and button vertically
          flexGrow: 0, // Allow the search bar to grow
          gap: 1, // Add spacing between search bar and button
        }}
      >
       

        <IconButton
          size="large"
          onClick={fetchZohoStudents}
          disabled={loading}
          sx={{
            backgroundColor: loading ? "grey.300" : "primary.main",
            color: "white",
            "&:hover": { backgroundColor: "primary.dark" },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : <RefreshOutlinedIcon />}
        </IconButton>
      </Box>
    </Box>



          <Paper id='containerPaper' sx={{maxWidth: open ? '80vw' : '100vw'}}>
            <TableContainer sx={{ maxHeight: 500}}>
             

<Table stickyHeader id='tablevoid'>
  <TableHead>
    <TableRow>
      <TableCell>Name</TableCell>
      <TableCell>Email</TableCell>
      <TableCell>Mobile</TableCell>
      <TableCell sx={{minWidth: '200px'}}>Product List</TableCell>
      <TableCell sx={{minWidth: '120px'}}>Student Type</TableCell>
      
      <TableCell>Enrollment Date</TableCell>
      <TableCell>End Date</TableCell>
      <TableCell>QR Code</TableCell>
      
      <TableCell>Available Tokens</TableCell>
      <TableCell>Redeemed Tokens</TableCell>
      <TableCell sx={{minWidth: '100px'}}>Total Tokens</TableCell>
      {/* <TableCell>Action</TableCell>  */}

    </TableRow>
  </TableHead>
  <TableBody>              
    {filteredStudents.map((student) => (
      <TableRow key={student._id} hover>
        <TableCell>{student.Student_Name}</TableCell>
       <TableCell>{student.Email}</TableCell>
        <TableCell>{student.Mobile}</TableCell>
        {/* <TableCell>{student.Course_Name1 || "-"}</TableCell> */}
        <TableCell>
          {student.Product_List?.length > 0 ? (
            <ul style={{ margin: 0, padding: 0 }}>
              {student.Product_List.map((product, index) => (
                <li key={index} style={{listStyle: 'none'}}>{product}</li>
              ))}
            </ul>
          ) : (
            "-"
          )}
        </TableCell>
        <TableCell>{student.Student_Type || "-"}</TableCell>
        
        <TableCell>{formatDate(student.Enrollment_Date)}</TableCell>
        <TableCell>{formatDate(calculateEndDate(student.Enrollment_Date))}</TableCell>
        <TableCell>
          <Button variant="outlined" onClick={() => handleOpenModal(student)}>
            Show QR
          </Button>

        </TableCell>
        
        <TableCell>{student.availableTokens}</TableCell>
        <TableCell>{student.redeemedTokens}</TableCell>
        <TableCell>{student.totalTokens}
        
  {editingToken === student._id ? (
    <>
      <TextField
        value={newTokenValue}
        onChange={(e) => setNewTokenValue(e.target.value)}
        size="small"
        sx={{ width: "80px" }}
      />
      <Button variant="contained" onClick={handleSaveToken}>
        Save
      </Button>
    </>
  ) : (
    <>
      {/* {student.totalTokens} */}
      <IconButton onClick={() => handleEditToken(student)}>
        <EditIcon/>
      </IconButton>
    </>
  )}
</TableCell>

      </TableRow>
    ))}
  </TableBody>
</Table>

            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
            />
          </Paper>

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
                  student={{
                    Student_Name: selectedStudent.Student_Name,
                    Email: selectedStudent.Email,
                    Mobile: selectedStudent.Mobile,
                    Enrollment_Date: selectedStudent.Enrollment_Date,
                    End_Date: calculateEndDate(selectedStudent.Enrollment_Date),
                    _id: selectedStudent._id,
                  }}
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






               
