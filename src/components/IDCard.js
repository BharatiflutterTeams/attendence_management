import React, { useEffect, useRef, useState } from "react";
import htmlToCanvas from "html2canvas";
import {
  Box,
  Typography,
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
} from "@mui/icons-material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import bharti from "../assets/Books.png";

const IDCard = ({
  candidate,
  students,
  invokeExport,
  onExportComplete,
  handleCloseModal,
}) => {
  const cardRef = useRef();
  const [loading, setLoading] = useState(false);

  const {
    name: studentNameFromStudents,
    email: studentEmail,
    mobile: studentMobile,
    enrollmentDate: studentEnrollmentDate,
    endDate: studentEndDate,
    id: studentId,
    branch: studentBranch,
    courseName: studentCourseName,
  } = students || {};

  const {
    studentName: studentNameFromCandidate,
    enrollmentDate: candidateEnrollmentDate,
    endDate: candidateEndDate,
    id: candidateId,
    branch: candidateBranch,
    courseName: candidateCourseName,
  } = candidate || {};

  console.log("candidate", candidate);

  const name = studentNameFromCandidate || studentNameFromStudents;
  const email = studentEmail || "";
  const mobile = studentMobile || "";
  const enrollment = candidateEnrollmentDate || studentEnrollmentDate;
  const end = candidateEndDate || studentEndDate;
  const id = candidateId || studentId;
  const branch = candidate?.Branch || studentBranch || "";
  const courseName = candidate?.course || studentCourseName || "";
  const supportContact = "08071680908";
  const supportEmail = "Support@bhartisharemarket.com";

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
      <Box sx={{ position: "relative", mt: 1 }}>
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
              height: 180,
              background: "linear-gradient(45deg, #FF6B2B, #FF8C42)",
              borderRadius: "0% 0% 97% 0% / 56% 10% 86% 47%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 10,
                left: 10,
                backgroundColor: "white",
                borderRadius: "12px",
                // boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                // p: 0.5,
              }}
            >
              <img
                src={bharti}
                alt="Company Logo"
                style={{ width: 55, height: 55 }}
              />
            </Box>

            {!candidate ? (
              <Box
                sx={{
                  backgroundColor: "white",
                  p: "6px",
                  borderRadius: 2,
                  mt: 4,
                  transform: "translateY(20px)",
                  border: "1px solid #ccc",
                }}
              >
                <QRCode
                  value={JSON.stringify({
                    id,
                    studentName: name,
                    mobileNumber: mobile,
                    enrollmentDate: enrollment,
                    endDate: end,
                    Branch: branch,
                    course: courseName,
                  })}
                  size={100}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  backgroundColor: "white",
                  p: 1,
                  borderRadius: 2,
                  mt: 9,
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  transform: "translateY(20px)",
                }}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/256/5610/5610944.png"
                  alt="Verified"
                  style={{ width: 70, height: 70 }}
                />
              </Box>
            )}
          </Box>

          <Box sx={{ p: 3, pt: 3 }}>
            <Typography
              variant="h5"
              sx={{
                mb: 0.5,
                pb: 1,
                borderBottom: "1px solid rgba(0,0,0,0.2)",
                fontWeight: 700,
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "1.3rem",
                color: "#000",
                letterSpacing: "0.5px",
                lineHeight: 1.2,
                // ml: 5,
                textAlign: "center",
              }}
            >
              {name}
            </Typography>

            {!candidate && email && (
              <Typography
                variant="body2"
                sx={{
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  mt: 1,
                  fontWeight: 500,
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: "0.85rem",
                  color: "#444",
                }}
              >
                <Email sx={{ mr: 1, color: "black", fontSize: "1rem" }} />
                {email}
              </Typography>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1.5,
                gap: 1,
              }}
            >
              {mobile && (
                <Typography
                  variant="body2"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 500,
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: "0.85rem",
                    color: "#444",
                    flex: 1,
                  }}
                >
                  <Phone sx={{ mr: 1, color: "black", fontSize: "1rem" }} />
                  {mobile}
                </Typography>
              )}

              {
                <Typography
                  variant="body2"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: candidate ? "0.95rem" : "0.85rem",
                    color: "#444",
                    justifyContent: "flex-start",
                    flex: 1,
                    paddingRight: "5px",
                    whiteSpace: "nowrap",
                    gap: "5px",
                  }}
                >
                  <b style={{ marginLeft: candidate ? "8px" : "2px" }}>
                    Branch:{" "}
                  </b>
                  {branch}
                </Typography>
              }
            </Box>

            <Typography
              variant="body2"
              sx={{
                textAlign: "start",
                width: "100%",
                fontSize: "0.9rem",
                color: "#333",
                mb: 2,
                ml: candidate ? "10px" : "0px",
                display: "flex",
                alignItems: "start",
                gap: "6px",
              }}
            >
              <b>Course:</b>
              {courseName}
            </Typography>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1px solid rgba(0,0,0,0.2)",
                borderBottom: "1px solid rgba(0,0,0,0.2)",
                py: 1,
                px: 2,
                mb: 2,
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, fontSize: "0.85rem" }}
                >
                  {formatDate(enrollment)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "0.70rem", color: "#666" }}
                >
                  Valid From
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, fontSize: "0.85rem" }}
                >
                  {formatDate(end)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "0.70rem", color: "#666" }}
                >
                  Valid Until
                </Typography>
              </Box>
            </Box>

            <Typography
              variant="body2"
              sx={{
                display: "flex",
                alignItems: "start",
                justifyContent: "start",
                fontWeight: 600,
                fontSize: "0.85rem",
                color: "#333",
                mt: 2,
              }}
            >
              <SupportAgent sx={{ mr: 1, ml: 1, fontSize: "1rem" }} />
              {supportContact}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: "0.85rem",
                color: "#333",
                mt: 0.5,
              }}
            >
              <Email sx={{ mr: 1, fontSize: "1rem" }} />
              {supportEmail}
            </Typography>
          </Box>
        </Box>

        {!candidate && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
              mt: 1.5,
            }}
          >
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
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
                  Download
                </Typography>
              </IconButton>
            </Tooltip>

            {!candidate && (
              <Tooltip title="Share via WhatsApp">
                <IconButton
                  onClick={() => handlewp("9807631010")}
                  disabled={loading}
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
                  }}
                >
                  {loading ? (
                    <CircularProgress
                      size={20}
                      // sx={{ color: "white", mr: 1 }}
                    />
                  ) : (
                    <WhatsAppIcon sx={{ mr: 1 }} />
                  )}
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
                    {loading ? "Sharing..." : "Share"}
                  </Typography>
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default IDCard;
