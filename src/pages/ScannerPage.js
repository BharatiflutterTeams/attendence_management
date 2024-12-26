import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TablePagination,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import useAppStore from "../appStore";
import axios from "axios";
import endpoints from "../Endpoints/endpoint";
import { toast } from "react-toastify";

export default function ScannerPage() {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const [students, setStudents] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [markedStudents, setMarkedStudents] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const companyData = useAppStore((state) => state.companyData);

  useEffect(() => {
    fetchStudentList();
  }, []);

  const fetchStudentList = async () => {
    try {
      const response = await axios.get(`${endpoints.serverBaseURL}/api/std/get-students`);
      setStudents(response.data.students || []);
    } catch (error) {
      console.error("Error fetching student list:", error);
      toast.error("Error fetching student list");
    }
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
    const successCallback = async (decodedText) => {
      scanner.clear();
      handleScanSuccess(decodedText);
      setScanError(null);
    };

    const errorCallback = () => {
      setScanError("QR Not Found");
    };

    scanner.render(successCallback, errorCallback);
    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error("Failed to clear scanner:", error);
        });
      }
    };
  }, []);

  const handleScanSuccess = async (decodedText) => {
    try {
      if (scanResult || scanError) return; // Prevent multiple scans
  
      const qrData = JSON.parse(decodedText); // Parse JSON stringified QR data
      const today = new Date().toDateString();
  
      // Check if the student is already marked
      if (markedStudents[qrData.student]) {
        setScanError(`Already scanned today for ${qrData.student}`);
        toast.error(`Already scanned today for ${qrData.student}`);
        return;
      }
  
      // Check if the scan time is within the valid range
      const currentTime = new Date();
      const scanTokenTime = new Date(qrData.scanTokenTime); // assuming this is the time from the backend
  
      if (currentTime > scanTokenTime) {
        setScanError(`Scan token has expired. Cannot mark attendance.`);
        toast.error(`Scan token has expired. Cannot mark attendance.`);
        return;
      }
  
      const response = await axios.post(`${endpoints.serverBaseURL}/api/scan/validate-qr`, {
        qrData,
        companyId: companyData?.id,
      });
  
      if (response.status === 200) {
        setMarkedStudents((prev) => ({
          ...prev,
          [qrData.student]: today,
        }));
        setScanResult(`${qrData.student} marked Present`);
        setScanError(null);
        toast.success(`${qrData.student} marked Present`);
        // scannerRef.current.start(); // Restart the scanner
      } else {
        const message = response.data.message;
        if (message === "ATTENDANCE_ALREADY_MARKED") {
          setScanError("Attendance already marked for today.");
          toast.error("Attendance already marked for today.");
        } else if (message === "USER_EXPIRED_ATTENDANCE_NOT_ALLOWED") {
          setScanError("Student's enrollment has expired.");
          toast.error("Student's enrollment has expired.");
        } else {
          setScanError(message || "Error validating QR Code.");
          toast.error(message || "Error validating QR Code.");
        }
      }
    } catch (error) {
      console.error("Error scanning QR Code:", error,error?.response?.data?.message);
      setScanError(error?.response?.data?.message || "Error validating QR Code.");
      toast.error(error?.response?.data?.message || "Error validating QR Code.");
    }
  };
  

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#EEF1FF",
        padding: 1,
        position: "relative",
      }}
    >
      <Box sx={{ position: "absolute", top: 16, right: 16 }}>
        <Button variant="outlined" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      <Container>
        <Grid container spacing={2} justifyContent="center" alignItems="center">
          <Grid item xs={12}>
            <Typography
              variant="h5"
              sx={{ textAlign: "center", fontWeight: "bold", color: "primary.main" }}
            >
              {companyData?.name}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Card
              sx={{
                maxWidth: "400px",
                margin: "auto",
                padding: 2,
                backgroundColor: "#DFCCFB",
              }}
            >
              <Box id="reader" ref={scannerRef} sx={{ width: "100%" }} />
            </Card>
          </Grid>
          {scanResult && (
            <Grid item xs={12}>
              <Typography
                variant="h6"
                color="green"
                sx={{ textAlign: "center", marginTop: 2 }}
              >
                {scanResult}
              </Typography>
            </Grid>
          )}
          {Boolean(scanError) && (
            <Grid item xs={12}>
              <Typography
                variant="h6"
                color="red"
                sx={{ textAlign: "center", marginTop: 2 }}
              >
                {scanError}
              </Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
              Student Attendance
            </Typography>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Attendance Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((student) => (
                      <TableRow key={student.Student_Name}>
                        <TableCell>{student.Student_Name}</TableCell>
                        <TableCell>
                          {markedStudents[student.Student_Name] ? (
                            <Chip label={`Present`} color="success" />
                          ) : (
                            <Chip label="Absent" color="default" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={students.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}




//Running Code


// import React, { useEffect, useRef, useState } from "react";
// import { Html5QrcodeScanner } from "html5-qrcode";
// import {
//   Container,
//   Grid,
//   Typography,
//   Box,
//   Card,
//   Button,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Chip,
//   TablePagination,
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import useAppStore from "../appStore";
// import axios from "axios";
// import endpoints from "../Endpoints/endpoint";
// import { toast } from "react-toastify";

// export default function ScannerPage() {
//   const navigate = useNavigate();
//   const scannerRef = useRef(null);
//   const [students, setStudents] = useState([]);
//   const [scanResult, setScanResult] = useState(null);
//   const [scanError, setScanError] = useState(null);
//   const [markedStudents, setMarkedStudents] = useState({});
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);

//   const companyData = useAppStore((state) => state.companyData);

//   useEffect(() => {
//     fetchStudentList();
//   }, []);

//   const fetchStudentList = async () => {
//     try {
//       const response = await axios.get(`${endpoints.serverBaseURL}/api/std/get-students`);
//       setStudents(response.data.students || []);
//     } catch (error) {
//       console.error("Error fetching student list:", error);
//       toast.error("Error fetching student list");
//     }
//   };

//   useEffect(() => {
//     const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
//     const successCallback = async (decodedText) => {
//       scanner.clear();
//       handleScanSuccess(decodedText);
//       setScanError(null);
//     };

//     const errorCallback = () => {
//       setScanError("QR Not Found");
//     };

//     scanner.render(successCallback, errorCallback);
//     scannerRef.current = scanner;

//     return () => {
//       if (scannerRef.current) {
//         scannerRef.current.clear().catch((error) => {
//           console.error("Failed to clear scanner:", error);
//         });
//       }
//     };
//   }, []);

//   const handleScanSuccess = async (decodedText) => {
//     try {
//       if (scanResult || scanError) return; // Prevent multiple scans

//       const qrData = JSON.parse(decodedText); // Parse JSON stringified QR data
//       const today = new Date().toDateString();

//       // Check if the student is already marked
//       if (markedStudents[qrData.student]) {
//         setScanError(`Already scanned today for ${qrData.student}`);
//         toast.error(`Already scanned today for ${qrData.student}`);
//         return;
//       }

//       const response = await axios.post(`${endpoints.serverBaseURL}/api/scan/validate-qr`, {
//         qrData,
//         companyId: companyData?.id,
//       });

//       if (response.status === 200) {
//         setMarkedStudents((prev) => ({
//           ...prev,
//           [qrData.student]: today,
//         }));
//         setScanResult(`${qrData.student} marked Present`);
//         toast.success(`${qrData.student} marked Present`);
//         scannerRef.current.start(); // Restart the scanner
//       } else {
//         const message = response.data.message;
//         if (message === "ATTENDANCE_ALREADY_MARKED") {
//           setScanError("Attendance already marked for today.");
//           toast.error("Attendance already marked for today.");
//         } else if (message === "USER_EXPIRED_ATTENDANCE_NOT_ALLOWED") {
//           setScanError("Student's enrollment has expired.");
//           toast.error("Student's enrollment has expired.");
//         } else {
//           setScanError(message || "Error validating QR Code.");
//           toast.error(message || "Error validating QR Code.");
//         }
//       }
//     } catch (error) {
//       console.error("Error scanning QR Code:", error?.response?.data?.message);
//       setScanError(error?.response?.data?.message || "Error validating QR Code.");
//       toast.error(error?.response?.data?.message || "Error validating QR Code.");
//     }
//   };

//   const handleLogout = () => {
//     sessionStorage.clear();
//     navigate("/login");
//   };

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "center",
//         alignItems: "center",
//         backgroundColor: "#EEF1FF",
//         padding: 1,
//         position: "relative",
//       }}
//     >
//       <Box sx={{ position: "absolute", top: 16, right: 16 }}>
//         <Button variant="outlined" color="secondary" onClick={handleLogout}>
//           Logout
//         </Button>
//       </Box>

//       <Container>
//         <Grid container spacing={2} justifyContent="center" alignItems="center">
//           <Grid item xs={12}>
//             <Typography
//               variant="h5"
//               sx={{ textAlign: "center", fontWeight: "bold", color: "primary.main" }}
//             >
//               {companyData?.name}
//             </Typography>
//           </Grid>
//           <Grid item xs={12}>
//             <Card
//               sx={{
//                 maxWidth: "400px",
//                 margin: "auto",
//                 padding: 2,
//                 backgroundColor: "#DFCCFB",
//               }}
//             >
//               <Box id="reader" ref={scannerRef} sx={{ width: "100%" }} />
//             </Card>
//           </Grid>
//           {scanResult && (
//             <Grid item xs={12}>
//               <Typography
//                 variant="h6"
//                 color="green"
//                 sx={{ textAlign: "center", marginTop: 2 }}
//               >
//                 {scanResult}
//               </Typography>
//             </Grid>
//           )}
//           {scanError && (
//             <Grid item xs={12}>
//               <Typography
//                 variant="h6"
//                 color="red"
//                 sx={{ textAlign: "center", marginTop: 2 }}
//               >
//                 {scanError}
//               </Typography>
//             </Grid>
//           )}
//           <Grid item xs={12}>
//             <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
//               Student Attendance
//             </Typography>
//             <TableContainer sx={{ maxHeight: 400 }}>
//               <Table stickyHeader>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell>Student Name</TableCell>
//                     <TableCell>Attendance Status</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {students
//                     .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//                     .map((student) => (
//                       <TableRow key={student.Student_Name}>
//                         <TableCell>{student.Student_Name}</TableCell>
//                         <TableCell>
//                           {markedStudents[student.Student_Name] ? (
//                             <Chip label={`Present`} color="success" />
//                           ) : (
//                             <Chip label="Absent" color="default" />
//                           )}
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//             <TablePagination
//               rowsPerPageOptions={[10, 25, 50]}
//               component="div"
//               count={students.length}
//               rowsPerPage={rowsPerPage}
//               page={page}
//               onPageChange={handleChangePage}
//               onRowsPerPageChange={handleChangeRowsPerPage}
//             />
//           </Grid>
//         </Grid>
//       </Container>
//     </Box>
//   );
// }
