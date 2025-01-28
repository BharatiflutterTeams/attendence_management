// import React from "react";
// import { Box, Typography, Button } from "@mui/material";
// import QRCode from "qrcode.react";

// const IDCard = ({ student, onPrint }) => {
//     const formatDate = (dateString) => {
//         const options = { year: "numeric", month: "short", day: "numeric" };
//         return new Date(dateString).toLocaleDateString(undefined, options);
//       };

//       const calculateEndDate = (dateString) => {
//         const enrollmentDate = new Date(dateString);
//         enrollmentDate.setMonth(enrollmentDate.getMonth() + 3);
//         return enrollmentDate.toISOString().split("T")[0];
//       };

//       const qrValue = `Student: ${student.Student_Name} | Enrollment: ${formatDate(student.Enrollment_Date)} | Valid Until: ${formatDate(calculateEndDate(student.Enrollment_Date))}`;

//       console.log("QR Code Value:", qrValue);

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         textAlign: "center",
//         padding: 2,
//         border: "1px solid #ccc",
//         borderRadius: 2,
//         boxShadow: 3,
//         width: 300,
//         bgcolor: "background.paper",
//       }}
//     >
//       <Typography variant="h6" sx={{ mb: 1 }}>
//         Student ID Card
//       </Typography>
//       <Typography variant="body1">
//         <strong>Name:</strong> {student.Student_Name}
//       </Typography>
//       <Typography variant="body1">
//         <strong>Email:</strong> {student.Email}
//       </Typography>
//       <Typography variant="body1">
//         <strong>Mobile:</strong> {student.Mobile}
//       </Typography>
//       <Typography variant="body1">
//         <strong>Enrollment Date:</strong> {formatDate(student.Enrollment_Date)}
//       </Typography>
//       <Typography variant="body1">
//         <strong>Valid Until:</strong> {formatDate(calculateEndDate(student.Enrollment_Date))}
//       </Typography>
//       <Box sx={{ my: 2 }}>
//         {/* <QRCode
//           value={`Student: ${student.Student_Name}\nEnrollment: ${student.Enrollment_Date}\nValid Until: ${calculateEndDate(student.Enrollment_Date)}`}
//         /> */}

// <QRCode value={qrValue} />

//       </Box>
//       <Button variant="contained" onClick={onPrint}>
//         Print ID Card
//       </Button>
//     </Box>
//   );
// };

// export default IDCard;

// import React from "react";
// import { Box, Typography, Button } from "@mui/material";
// import QRCode from "qrcode.react";

// const IDCard = ({ student, onPrint }) => {
//   // Format date as MM/DD/YYYY
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const month = ("0" + (date.getMonth() + 1)).slice(-2);
//     const day = ("0" + date.getDate()).slice(-2);
//     const year = date.getFullYear();
//     return `${month}/${day}/${year}`;
//   };

//   // Calculate the end date (3 months after enrollment)
//   const calculateEndDate = (dateString) => {
//     const enrollmentDate = new Date(dateString);
//     enrollmentDate.setMonth(enrollmentDate.getMonth() + 3);
//     return enrollmentDate.toISOString().split("T")[0];
//   };

//   // Create a safe QR code value
//   const qrValue = encodeURIComponent(`Student: ${student.Student_Name} | Enrollment: ${formatDate(student.Enrollment_Date)} | Valid Until: ${formatDate(calculateEndDate(student.Enrollment_Date))}`);

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         textAlign: "center",
//         padding: 2,
//         border: "1px solid #ccc",
//         borderRadius: 2,
//         boxShadow: 3,
//         width: 300,
//         bgcolor: "background.paper",
//       }}
//     >
//       <Typography variant="h6" sx={{ mb: 1 }}>
//         Student ID Card
//       </Typography>
//       <Typography variant="body1">
//         <strong>Name:</strong> {student.Student_Name}
//       </Typography>
//       <Typography variant="body1">
//         <strong>Email:</strong> {student.Email}
//       </Typography>
//       <Typography variant="body1">
//         <strong>Mobile:</strong> {student.Mobile}
//       </Typography>
//       <Typography variant="body1">
//         <strong>Enrollment Date:</strong> {formatDate(student.Enrollment_Date)}
//       </Typography>
//       <Typography variant="body1">
//         <strong>Valid Until:</strong> {formatDate(calculateEndDate(student.Enrollment_Date))}
//       </Typography>
//       <Box sx={{ my: 2 }}>
//         <QRCode value={qrValue} />
//       </Box>
//       <Button variant="contained" onClick={onPrint}>
//         Print ID Card
//       </Button>
//     </Box>
//   );
// };

// export default IDCard;

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import htmlToCanvas from "html2canvas";
import {
  Box,
  Typography,
  Divider,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import QRCode from "qrcode.react";
import axios from "axios";
import endpoints from "../Endpoints/endpoint";
import {
  Close,
  Download,
  Email,
  Phone,
  SupportAgent,
  WhatsApp,
} from "@mui/icons-material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import DownloadIcon from "@mui/icons-material/Download";

const IDCard = ({
  candidate,
  students,
  invokeExport,
  onExportComplete,
  handleCloseModal,
}) => {
  const cardRef = useRef();

  const {
    name: studentNameFromStudents,
    email: studentEmail,
    mobile: studentMobile,
    enrollmentDate: studentEnrollmentDate,
    endDate: studentEndDate,
    id: studentId,
  } = students || {};

  const {
    studentName: studentNameFromCandidate,
    enrollmentDate: candidateEnrollmentDate,
    endDate: candidateEndDate,
    id: candidateId,
  } = candidate || {};

  const name = studentNameFromCandidate || studentNameFromStudents;
  const email = studentEmail || "";
  const mobile = studentMobile || "";
  const enrollment = candidateEnrollmentDate || studentEnrollmentDate;
  const end = candidateEndDate || studentEndDate;
  const id = candidateId || studentId;
  const supportContact = "+1 800 123 4567"; // Example support contact
  const [loading, setLoading] = useState(false);

  const formatDate = (date) => {
    if (!date) return "";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const handleExport = async (mobileNumber) => {
    try {
      const canvas = await htmlToCanvas(cardRef.current);
      const imageBlob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      const link = document.createElement("a");
      link.href = URL.createObjectURL(imageBlob);
      link.download = "id-card.png";
      link.click();

      if (mobileNumber) {
        const formData = new FormData();
        formData.append("image", imageBlob, "id-card.png");
        formData.append("mobile", mobileNumber);

        const response = await axios.post(
          `${endpoints.serverBaseURL}/api/receive-image`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.status === 200) {
          alert("Image shared successfully on WhatsApp!");
        } else {
          alert("Failed to share image on WhatsApp.");
        }
      }
    } catch (error) {
      console.error("Error generating or sending image:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handlewp = async (mobileNumber) => {
    try {
      setLoading(true);
      const canvas = await htmlToCanvas(cardRef.current);
      const imageBlob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      const link = document.createElement("a");
      link.href = URL.createObjectURL(imageBlob);
      link.download = "id-card.png";
      link.click();

      if (mobileNumber) {
        const formData = new FormData();
        formData.append("image", imageBlob, "id-card.png");
        formData.append("mobile", mobileNumber);

        const response = await axios.post(
          `${endpoints.serverBaseURL}/api/receive-image`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.status === 200) {
          alert("Image shared successfully on WhatsApp!");
        } else {
          alert("Failed to share image on WhatsApp.");
        }
      }
    } catch (error) {
      console.error("Error generating or sending image:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (invokeExport) {
      const { mobile } = invokeExport;
      handleExport(mobile).then(() => {
        if (onExportComplete) onExportComplete();
      });
    }
  }, [invokeExport, onExportComplete]);

  return (
    <Box sx={{ p: 1 }}>
      {!candidate && (
        <IconButton
          sx={{
            position: "absolute",
            top: -8,
            right: -8,
            color: "#666",
            backgroundColor: "white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            zIndex: 1,
            "&:hover": {
              backgroundColor: "#f5f5f5",
            },
            width: 32,
            height: 32,
          }}
          onClick={handleCloseModal}
        >
          <Close sx={{ fontSize: 20 }} />
        </IconButton>
      )}
      <Box sx={{ position: "relative" }}>
        <Box
          ref={cardRef}
          sx={{
            width: 310,
            borderRadius: "16px",
            overflow: "hidden",
            backgroundColor: "white",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
            borderBottom: "5px solid orange",

            pb: 0,
            boxSizing: "border-box",
          }}
        >
          <Box
            sx={{
              position: "relative",
              height: 200,
              background: "linear-gradient(45deg, #FF6B2B, #FF8C42)",
              borderRadius: "0% 0% 97% 0% / 56% 10% 86% 47%  ",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* Company Logo */}
            <Box
              sx={{
                position: "absolute",
                top: 10,
                left: 10,
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "6px 5px 40px 1.5px rgb(114, 112, 112)",
              }}
            >
              <img
                src="https://res.cloudinary.com/dcjnwh1ll/image/upload/v1735376110/Books_nxd7wo.png" // Replace with the actual logo path
                alt="Company Logo"
                style={{ width: 65, height: 65 }}
              />
            </Box>

            <Box
              sx={{
                backgroundColor: "white",
                p: 1,
                borderRadius: 2,
                mt: 11,
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                transform: "translateY(20px)",
              }}
            >
              <QRCode
                value={JSON.stringify({
                  id: id,
                  studentName: name,
                  mobileNumber: mobile,
                  enrollmentDate: enrollment,
                  endDate: end,
                })}
                size={110}
              />
            </Box>
          </Box>

          <Box sx={{ p: 4, pt: 6 }}>
            <Box sx={{}}>
              <Typography
                variant="h5" // Slightly larger and more impactful
                sx={{
                  mb: 0.5,
                  pb: 1,
                  borderBottom: "1px solid rgba(0,0,0,0.2)", // Slightly darker and solid border for stronger emphasis
                  fontWeight: 700, // Bold weight for strong emphasis
                  fontFamily: "'Montserrat', sans-serif", // Professional, clean, and modern
                  fontSize: "1.5rem", // Larger font size for better visibility (~24px)
                  color: "#000", // Strong black for a sharp look
                  // textTransform: "", // Optional: Makes the name appear more official
                  letterSpacing: "0.5px", // Slight spacing for a polished look
                  lineHeight: 1.2, // Compact yet readable
                }}
              >
                {name}
              </Typography>
            </Box>

            {email && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  mt: 1,
                  fontWeight: 500, // Slightly bold for better visibility
                  fontFamily: "'Roboto', sans-serif", // Clean and modern font
                  fontSize: "0.93rem", // Slightly larger for clarity
                  color: "#444", // Darker text color for better contrast
                }}
              >
                <Email sx={{ mr: 1, color: "black" }} />{" "}
                {/* Orange icon for vibrancy */}
                {email}
              </Typography>
            )}

            {mobile && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  fontWeight: 500,
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: "0.95rem",
                  color: "#444",
                }}
              >
                <Phone sx={{ mr: 1, color: "black" }} />{" "}
                {/* Green icon for phone */}
                {mobile}
              </Typography>
            )}

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 7,
                borderBottom: "1px dashed black",
                ml: 2,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontWeight: 500,
                  flexDirection: "column",
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: "0.95rem",
                  color: "#444",
                  mb: 2,
                }}
              >
                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                  {formatDate(enrollment)}
                </span>
                <span style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                  Valid From
                </span>
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  fontWeight: 500,
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: "0.95rem",
                  color: "#444",
                  textAlign: "center",
                  mb: 2,
                }}
              >
                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                  {formatDate(end)}
                </span>
                <span style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                  Valid Until
                </span>
              </Typography>
            </Box>
            <Box sx={{ bottom: -10, position: "relative" }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 2,

                  fontWeight: 600, // Slightly bolder to highlight support contact
                  display: "flex",
                  alignItems: "center",
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: "1rem", // Slightly larger for emphasis
                  color: "#333", // Stronger dark text
                  pb: 0,
                }}
              >
                <SupportAgent sx={{ mr: 1, color: "black", ml: 4 }} />:{" "}
                {supportContact}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            mt: 3,
          }}
        >
          {!candidate && (
            <Tooltip title="Download ID Card">
              <IconButton
                onClick={() => handleExport()}
                sx={{
                  backgroundColor: "#f5f5f5",
                  color: "#666",
                  "&:hover": {
                    backgroundColor: "#e0e0e0",
                    transform: "scale(1.05)",
                  },
                  borderRadius: "50px",
                  padding: "8px 16px",
                  transition: "all 0.2s ease",
                }}
              >
                <Download sx={{ mr: 1 }} />
                <Typography sx={{ fontSize: "0.9rem", fontWeight: 500 }}>
                  Download
                </Typography>
              </IconButton>
            </Tooltip>
          )}

          {!candidate && (
            <Tooltip title="Share via WhatsApp">
              <IconButton
                onClick={() => handlewp("9807631010")}
                sx={{
                  backgroundColor: "#25D366",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#128C7E",
                    transform: "scale(1.05)",
                  },
                  borderRadius: "50px",
                  padding: "8px 16px",
                  transition: "all 0.2s ease",
                  disabled: { loading },
                }}
              >
                {loading ? (
                  <CircularProgress size={20} sx={{ color: "white", mr: 1 }} />
                ) : (
                  <WhatsAppIcon sx={{ mr: 1 }} />
                )}
                <Typography sx={{ fontSize: "0.9rem", fontWeight: 500 }}>
                  {loading ? "Sharing..." : "Share"}
                </Typography>
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default IDCard;
