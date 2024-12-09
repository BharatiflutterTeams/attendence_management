import React from 'react';
import QRCode from 'qrcode.react';
import useAppStore from '../appStore';

const PrintComponent = React.forwardRef((_, ref) => {
  const rowData = useAppStore((state) => state.rowData);


  if (!rowData) {
    return null;
  }

  const bookingId = rowData._id;

  return (
    <div ref={ref} style={styles.container}>
      {bookingId && (
        <div style={styles.qrCodeContainer}>
          <h3>Booking ID QR Code</h3>
          <QRCode value={bookingId} />
        </div>
      )}
      <h2 style={styles.heading}>Booking Details</h2>
      <table style={styles.table}>
        <tbody>
          <tr>
            <td style={styles.tableCell}>Name:</td>
            <td style={styles.tableCell}>{rowData.userId?.name || 'N/A'}</td>
          </tr>
          <tr>
            <td style={styles.tableCell}>Booking Date:</td>
            <td style={styles.tableCell}>{new Date(rowData.bookingDate).toLocaleDateString("en-GB") || 'N/A'}</td>
          </tr>
          <tr>
            <td style={styles.tableCell}>Booking ID:</td>
            <td style={styles.tableCell}>{rowData._id}</td>
          </tr>
          <tr>
            <td style={styles.tableCell}>Plan Name:</td>
            <td style={styles.tableCell}>{rowData.planId?.title || 'N/A'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
});

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  qrCodeContainer: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px',
  },
  tableCell: {
    border: '1px solid #ccc',
    padding: '10px',
    textAlign: 'left',
  },
};

export default PrintComponent;
