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


import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import QRCode from "qrcode.react";

const IDCard = ({ student }) => {
  const { Student_Name, Email, Mobile, Enrollment_Date, End_Date, _id } = student;

  const formatDate = (date) => {
    if (!date) return "";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(date).toLocaleDateString(undefined, options);
  };

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
        Enrollment Date: {formatDate(Enrollment_Date)}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        End Date: {formatDate(End_Date)}
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

export default IDCard;
