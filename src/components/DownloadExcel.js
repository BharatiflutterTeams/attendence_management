import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

const DownloadExcel = ({ bookings }) => {
  //console.log("bookings", bookings);
  const finalBookings = bookings.map((booking) => ({
    ...booking,
    subpackage: booking?.selectedSubPackage?.name,
  }));

  const handleDownload = () => {
    const formattedData = finalBookings.map((booking) => ({
      Booking_Date: booking.createdAt
        ? new Date(booking?.createdAt).toISOString().split("T")[0]
        : "Not Available",
      Reservation_Date: new Date(booking?.bookingDate)
        .toISOString()
        .split("T")[0],
      userName: booking?.userId?.name,
      adult_Count: booking?.adult,
      children_Count: booking?.children,
      adultPrice: booking?.adultPrice,
      childrenPrice: booking?.childrenPrice,
      totalAmount: booking?.totalAmount,
      planTitle: booking?.planId?.title,
      Sub_Package: booking?.subpackage,
      Ref_Code: booking?.franchiseCode,
      userEmail: booking?.userId?.email,
      userPhone: booking?.userId?.phone,
      bookingId: booking?._id,
      userId: booking?.userId?._id,
      PaymentId: booking?.paymentId,
      Remarks : booking?.remark,
      bookingViaPerson: booking?.bookingViaPerson,
      paymentMethod: booking?.paymentMethod,
      UPI_ID: booking?.upiId,
      RRN_Number: booking?.creditCardNumber,
      planDescription: booking?.planId?.description,
      userAddress: booking?.userId?.address,
      userGST: booking?.userId?.gstNumber,
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");

    const date = new Date().toISOString().slice(0, 10);
    const filename = `bookings_Bharti_Resort.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  return (
    <Button
      variant="contained"
      style={{
        background: "#ffffff",
        color: "#867AE9",
        textTransform: "none",
        fontWeight: "bold",
      }}
      onClick={handleDownload}
      startIcon={<DownloadIcon />}
    >
      Download Bookings
    </Button>
  );
};

export default DownloadExcel;
