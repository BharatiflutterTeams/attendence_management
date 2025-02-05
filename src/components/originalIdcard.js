const IDCard = ({
    candidate,
    students,
    invokeExport,
    onExportComplete,
    handleCloseModal,
    newAdmissions,
  }) => {
    const [isCardVisible, setIsCardVisible] = React.useState(true);
    const cardRef = useRef();
    const {
      name: studentNameFromStudents,
      email: studentEmail,
      mobile: studentMobile,
      enrollmentDate: studentEnrollmentDate,
      endDate: studentEndDate,
      id: studentId,
    } = students || {};
  
    console.log("Students:", students);
  
    const {
      studentName: studentNameFromCandidate,
      enrollmentDate: candidateEnrollmentDate,
      endDate: candidateEndDate,
      id: candidateId,
    } = candidate || {};
  
    // Use data from candidate or fallback to students
    const name = studentNameFromCandidate || studentNameFromStudents;
    const email = studentEmail || "";
    const mobile = studentMobile || "";
    const enrollment = candidateEnrollmentDate || studentEnrollmentDate;
    const end = candidateEndDate || studentEndDate;
    const id = candidateId || studentId;
  
    // const { name, email, mobile, enrollmentDate, endDate, id } = students || {};
    // console.log(students)
    // const { student, Email, Mobile, enrollmentdate, enddate, Id } = candidate || {};
    // console.log(candidate)
    const formatDate = (date) => {
      if (!date) return "";
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Date(date).toLocaleDateString(undefined, options);
    };
  
    const downloadImage = async (cardRef) => {
      try {
        const canvas = await htmlToCanvas(cardRef.current); // Capture the content inside `cardRef`
        const imageBlob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );
  
        // Create a download link and simulate a click to download the image
        const link = document.createElement("a");
        link.href = URL.createObjectURL(imageBlob);
        link.download = "id-card.png"; // Name of the file to be downloaded
        link.click(); // Trigger the download
  
        alert("ID card downloaded successfully!");
      } catch (error) {
        console.error("Error generating or downloading the image:", error);
        alert("An error occurred while downloading the ID card.");
      }
    };
  
    const handleExport = async (mobileNumber) => {
      try {
        // const canvas = await htmlToCanvas(cardRef.current);
        // const imageBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  
        // // Create a download link and simulate a click to download the image
        // const link = document.createElement("a");
        // link.href = URL.createObjectURL(imageBlob);
        // link.download = "id-card.png";
        // link.click();
  
        await downloadImage(cardRef);
  
        // Use FormData to send the image and mobile number to the backend
        const canvas = await htmlToCanvas(cardRef.current);
        const imageBlob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );
  
        const formData = new FormData();
        formData.append("image", imageBlob, "id-card.png");
        formData.append("mobile", mobileNumber);
  
        // Send to backend using axios
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
          alert("Image sent successfully!");
        } else {
          alert("Failed to send image.");
        }
      } catch (error) {
        console.error("Error generating or sending image:", error);
        alert("An error occurred. Please try again.");
      }
    };
  
    const handleClose = () => {
      setIsCardVisible(false);
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
      <>
        {!candidate && (
          <IconButton
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              color: "grey",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.9)",
              },
            }}
            onClick={handleCloseModal}
          >
            <Close />
          </IconButton>
        )}
        <Box>
          <Box
            ref={cardRef}
            sx={{
              border: "1px solid #ddd",
              borderRadius: 2,
              padding: 2,
              width: 300,
              textAlign: "center",
              // boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              backgroundColor: "white",
            }}
          >
            <Typography variant="h6" gutterBottom>
              {name}
            </Typography>
            <Divider sx={{ my: 1 }} />
            {email && (
              <Typography variant="body2" color="textSecondary">
                Email: {email}
              </Typography>
            )}
            {mobile && (
              <Typography variant="body2" color="textSecondary">
                Mobile: {mobile}
              </Typography>
            )}
            <Typography variant="body2" color="textSecondary">
              Enrollment Date: {formatDate(enrollment)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              End Date: {formatDate(end)}
            </Typography>
            {!candidate && (
              <Box sx={{ mt: 2 }}>
                <QRCode
                  value={JSON.stringify({
                    id: id,
                    studentName: name,
                    mobileNumber: mobile,
                    enrollmentDate: enrollment,
                    endDate: end,
                  })}
                  size={128}
                />
              </Box>
            )}
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            {/* Other card content here */}
            {!candidate && (
              <Tooltip title="Download ID Card" placement="top">
                <IconButton
                  onClick={() => downloadImage(cardRef)}
                  sx={{
                    "&:focus": {
                      outline: "none",
                      border: "none",
                    },
                    "&:hover": {
                      boxShadow: "none",
                    },
                  }}
                >
                  <DownloadIcon
                    sx={{ fontSize: "2rem", color: "primary.main", marginTop: 2 }}
                  />
                </IconButton>
              </Tooltip>
            )}
  
            {!candidate && (
              <Tooltip title="Share with WhatsApp" placement="top">
                <IconButton
                  variant="contained"
                  sx={{
                    mt: 2,
                    backgroundColor: "#25D366",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#128C7E",
                      transform: "scale(1.1)",
                      boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                    },
                    borderRadius: "50px",
                    padding: "8px 16px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    transition:
                      "transform 0.2s ease-in-out, background-color 0.2s, box-shadow 0.2s",
                    fontSize: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                  onClick={() => handleExport("9807631010")}
                >
                  <WhatsAppIcon sx={{ fontSize: "1.5rem" }} />
                  <Typography sx={{ fontSize: "1rem", fontWeight: "bold" }}>
                    Share
                  </Typography>
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </>
    );
  };
  
  export default IDCard;