import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Container, Grid, Typography, Box, Avatar , Card ,Button} from "@mui/material";
import { useNavigate } from "react-router-dom";
import useAppStore from "../appStore";
import { jwtDecode } from "jwt-decode";


export default function ScannerPage() {
  const setBookingId = useAppStore((state) => state.setBookingId);
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  
  const companyData = useAppStore(state => state.companyData)

  useEffect(() => {
   
     const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      
    );
  

    
    const successCallback = (decodedText, decodedResult) => {
      console.log(`scan result : ${decodedText}`);
      scanner.clear();
      setScanResult(decodedText);
      setBookingId(decodedText);
      setScanError(null);
      navigate('/bookingconfirm');
      
      // window.location.href = decodedText;
    };
    
    const errorCallback = (errorMessage) => {
      //console.warn(`Scan error : ${errorMessage}`);
      setScanError("QR Not Found");
       setScanResult(null);
    };
    scanner.render(successCallback, errorCallback);
    scannerRef.current = scanner;

      return()=>{
        if(scannerRef.current){
          scannerRef.current.clear().catch(error => {
            console.error('Failed to clear scanner: ', error);
          })
        }
      }
    
  }, [setBookingId,navigate]);

  useEffect(()=>{checkAuth()},[])

  const checkAuth = () => {
    const token = sessionStorage.getItem("jwtToken");

    if (token && token !== "" && token !== null) {
      const decoded = jwtDecode(token);
      const role = decoded.role;
       if(role !== 'checker'){
         navigate('/login')
         console.log("access denied");
         
       }

    } else {
      console.log("Token not Found");
      navigate("/login");
    }
  };

  const handleLogout=()=>{
    sessionStorage.clear();
   // clearToken();
    navigate('/login');
}

  return (
    <>
         
        <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EEF1FF',
        padding:'1',
        position:'relative',
      }}
    >
        <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
        }}
      >
        <Button variant="outlined" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      
      <Container>
        <Grid container spacing={2} justifyContent="center" alignItems="center">
           

          <Grid item xs={12}>
            <Avatar
              alt="Company Logo"
              src={companyData?.logo} // use the logo from the store
              sx={{
                width: 120,
                height: 120,
                margin: 'auto',
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography
              variant="h5"
              sx={{
                textAlign: 'center',
                fontWeight: 'bold',
                color: 'primary.main',
              }}
            >
              {companyData?.name} {/* use the company name from the store */}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography
              variant="h6"
              sx={{
                textAlign: 'center',
                margin: (theme) => theme.spacing(2, 0),
                color: 'text.primary',
              }}
            >
              Scan QR to Verify
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Card
              sx={{
                width: '100%',
                maxWidth: '400px',
                margin: 'auto',
                padding: 2,
               
                backgroundColor: '#DFCCFB',
                borderRadius: 1,
                boxShadow: 3,
              }}
            >
              <Box
                id="reader"
                ref={scannerRef}
                sx={{
                  width: '100%',
                  height: 'auto',
                }}
              />
            </Card>
          </Grid>
          {scanResult && (
            <Grid item xs={12}>
              <Typography
                variant="h6"
                color="green"
                sx={{
                  textAlign: 'center',
                  marginTop: 2,
                }}
              >
                QR Code Detected: {scanResult}
              </Typography>
            </Grid>
          )}
          {scanError && (
            <Grid item xs={12}>
              <Typography
                variant="h6"
                color="red"
                sx={{
                  textAlign: 'center',
                  marginTop: 2,
                }}
              >
                {scanError}
              </Typography>
            </Grid>

          )}
          
             
        </Grid>
      </Container>
    </Box>
    </>
  );
}
