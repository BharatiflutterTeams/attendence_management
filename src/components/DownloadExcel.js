import React from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

const DownloadExcel = ({ bookings }) => {

  const handleDownload = () => {
    const formattedData = bookings.map(booking => ({
      bookingId: booking?._id,
      bookingDate: booking?.bookingDate,
      bookingViaPerson: booking?.bookingViaPerson,
      totalAmount: booking?.totalAmount,
      paymentMethod: booking?.paymentMethod,
      adult_Count: booking?.adult,
      adultPrice: booking?.adultPrice,
      children_Count: booking?.children,
      childrenPrice: booking?.childrenPrice,
      planTitle: booking?.planId?.title,
      planDescription: booking?.planId?.description,
      userId: booking?.userId?._id,
      userName: booking?.userId?.name,
      userEmail: booking?.userId?.email,
      userPhone: booking?.userId?.phone,
      userAddress: booking?.userId?.address,
      userGST: booking?.userId?.gstNumber,
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bookings');

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
