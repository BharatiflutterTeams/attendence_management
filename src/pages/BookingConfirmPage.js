import React, { useEffect, useState } from "react";
import useAppStore from "../appStore";
import axios from "axios";
import styled from "styled-components";
import endpoints from "../Endpoints/endpoint";
import {
  Box,
  Button,
  Card,
  IconButton,
  Typography,
  CardContent,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { AlignHorizontalCenter, FormatAlignJustify } from "@mui/icons-material";
import moment from "moment";

const Container = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: white;
  text-align: center;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #dff0d8;
  padding: 10px;
  border-radius: 10px;
`;

const Title = styled.h1`
  font-size: 1.5em;
  margin: 0;
`;

const MovieInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
`;

const MovieTitle = styled.h2`
  margin: 10px 0;
`;

const Details = styled.div`
  text-align: left;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  max-width: 300px;
  background-color: #eee;
  padding: 1rem 2rem;
  border-radius: 10px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 5px 0;
  padding: 5px;
  border-bottom: 1px solid #ddd;
`;

const QRCode = styled.div`
  margin: 20px 0;
`;

const Book = styled.div`
  background-color: #eee;
  padding: 10px;
  margin-top: 15px;
  border-radius: 10px;
`;

const ActivitiesList = styled.ul`
  margin: 10px 0;
  padding: 0;
  list-style-type: none;
  & li::before {
    content: "•";
    color: #000;
    display: inline-block;
    width: 1em;
    margin-left: -1em;
  }
`;

export default function BookingConfirmPage() {
  const [bookingDetails, setBookingDetails] = useState();
  const bookingId = useAppStore((state) => state.bookingId);
  const companyData = useAppStore((state) => state.companyData);
  const [userDetails, setUserDetails] = useState();
  const [planDetails, setplanDetails] = useState();
  const [success, setSuccess] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    if (bookingId) {
      checkIfExpired();
      fetchBookingDetails();
    } else {
      setIsInvalid(true);
    }
  }, [bookingId]);

  const checkAuth = () => {
    const token = sessionStorage.getItem("jwtToken");

    if (token && token !== "" && token !== null) {
      const decoded = jwtDecode(token);
      const role = decoded.role;
      if (role !== "checker") {
        navigate("/login");
        console.log("access denied");

        if (!bookingId || bookingId == null || bookingId == "") {
          navigate("/scanner");
        }
      }
    } else {
      console.log("Token not Found");
      navigate("/login");
    }
  };

  const checkIfExpired = () => {
    const expiredCodes = JSON.parse(localStorage.getItem("expiredCodes")) || [];
    if (expiredCodes.includes(bookingId)) {
      setIsExpired(true);
    } else {
      // Mark the QR code as expired
      expiredCodes.push(bookingId);
      localStorage.setItem("expiredCodes", JSON.stringify(expiredCodes));
    }
  };

  const fetchBookingDetails = async () => {
    try {
      const response = await axios.get(
        `${endpoints.serverBaseURL}/api/admin/${bookingId}`
      );

      setUserDetails(response.data.ticketData.userDetails);
      setSuccess(response.data.success);
      setplanDetails(response.data.ticketData.plan);
      setBookingDetails(response.data.ticketData.booking);

      const bookingDate = moment(response.data.ticketData.booking.bookingDate);
      const today = moment();

      if (bookingDate.isBefore(today, "day")) {
        setIsExpired(true);
      } else if (bookingDate.isAfter(today, "day")) {
        setSuccess("future");
        setIsExpired(false);
      } else {
        setSuccess(true);
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
      setSuccess(false);
      setIsInvalid(true);
    }
  };

  const selectedSubPackage =
    planDetails?.subpackages[bookingDetails?.selectedSubPackage];
  console.log("selectedSubPackage", selectedSubPackage);
  const adultActivities = selectedSubPackage?.adult_activities || [];
  const childActivities = selectedSubPackage?.child_activities || [];

  return (
    <>
      <Box
        style={{
          backgroundColor: "#EEF1FF",
          padding: "5rem 1rem",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        {isExpired ? (
          <Card
            sx={{
              maxWidth: "400px",
              width: "100%",
              padding: 2,
              borderRadius: 2,
              boxShadow: 3,
              position: "relative",
              textAlign: "center",
              backgroundColor: "background.paper",
            }}
          >
            <CardContent>
              <Typography
                variant="h5"
                sx={{ marginBottom: 2, fontWeight: "bold", color: "red" }}
              >
                QR Code Expired
              </Typography>
              <img
                src="https://img.icons8.com/color/48/000000/cancel--v1.png"
                alt="Expired"
                style={{ marginBottom: "1rem" }}
              />
              <Typography variant="body1">
                This QR code has already been used and is now expired.
              </Typography>
            </CardContent>
          </Card>
        ) : isInvalid ? (
          <Card
            sx={{
              maxWidth: "400px",
              width: "100%",
              padding: 2,
              borderRadius: 2,
              boxShadow: 3,
              position: "relative",
              textAlign: "center",
              backgroundColor: "background.paper",
            }}
          >
            <CardContent>
              <Typography
                variant="h5"
                sx={{ marginBottom: 2, fontWeight: "bold", color: "red" }}
              >
                Invalid QR Code
              </Typography>
              <img
                src="https://img.icons8.com/color/48/000000/cancel--v1.png"
                alt="Invalid"
                style={{ marginBottom: "1rem" }}
              />
              <Typography variant="body1">
                The QR code you scanned is invalid.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          success && (
            <Container>
              {success === "future" ? (
                <Header>
                  <img
                    src="https://img.icons8.com/color/48/000000/checked--v1.png"
                    alt="Confirmed"
                  />
                  <Title>Booking Confirmed</Title>
                  <br/>
                  <h6>We are happy to welcome you on {new Date(bookingDetails.bookingDate).toLocaleDateString("en-GB")}</h6>
                </Header>
              ) : (
                <>
                  <Header>
                    <Title>Booking Confirmed</Title>
                    <img
                      src="https://img.icons8.com/color/48/000000/checked--v1.png"
                      alt="Confirmed"
                    />
                  </Header>
                  <MovieInfo>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                      }}
                    >
                      <img
                        src={companyData?.logo}
                        alt="Movie Poster"
                        style={{
                          borderRadius: "10px",
                          height: "80px",
                          width: "80px",
                        }}
                      />
                      <MovieTitle>{companyData?.name}</MovieTitle>
                    </div>
                  </MovieInfo>
                  <Details>
                    <DetailRow>
                      <span>
                        <b>Plan Name :</b>
                      </span>
                      <span style={{ marginLeft: "40px" }}>
                        <b>{planDetails?.title}</b>
                      </span>
                    </DetailRow>
                    <DetailRow>
                      <span>
                        <b>Name:</b>
                      </span>
                      <span>
                        <b>{userDetails?.name}</b>
                      </span>
                    </DetailRow>
                    <DetailRow>
                      <span>
                        <b>Email:</b>
                      </span>
                      <span>
                        <b>{userDetails?.email}</b>
                      </span>
                    </DetailRow>
                    <DetailRow>
                      <span>
                        <b>Contact:</b>
                      </span>
                      <span>
                        <b>{userDetails?.phone}</b>
                      </span>
                    </DetailRow>
                    <DetailRow>
                      <span>
                        <b>Adults:</b>
                      </span>
                      <span>
                        <b>
                          {bookingDetails?.adult} x ₹
                          {bookingDetails?.adultPrice}
                        </b>
                      </span>
                    </DetailRow>
                    <DetailRow>
                      <span>
                        <b>Children:</b>
                      </span>
                      <span>
                        <b>
                          {bookingDetails?.children} x ₹
                          {bookingDetails?.childrenPrice}
                        </b>
                      </span>
                    </DetailRow>
                    <DetailRow>
                      <span>
                        <b>Total:</b>
                      </span>
                      <span>
                        <b>
                          ₹
                          {bookingDetails?.adult * bookingDetails?.adultPrice +
                            bookingDetails?.children *
                              bookingDetails?.childrenPrice}
                        </b>
                      </span>
                    </DetailRow>

                    <Typography variant="h6" sx={{ marginTop: 2 }}>
                      Adult Activities:
                    </Typography>
                    <ActivitiesList>
                      {adultActivities.map((activity, index) => (
                        <li key={index}>{activity}</li>
                      ))}
                    </ActivitiesList>

                    <Typography variant="h6" sx={{ marginTop: 2 }}>
                      Child Activities:
                    </Typography>
                    <ActivitiesList>
                      {childActivities.map((activity, index) => (
                        <li key={index}>{activity}</li>
                      ))}
                    </ActivitiesList>
                  </Details>

                  <Book>
                    <p>Booking ID: {bookingDetails?._id}</p>
                  </Book>
                </>
              )}
            </Container>
          )
        )}

        <Box
          sx={{
            mt: "15px",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              navigate("/scanner");
            }}
          >
            New Scan
          </Button>
        </Box>
      </Box>
    </>
  );
}
