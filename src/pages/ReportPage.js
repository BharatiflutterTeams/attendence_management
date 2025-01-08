'use client'

import { useState } from 'react'
import Navbar from '../components/Navbar'
import Sidenav from '../components/Sidenav'
import {
  TextField,
  Select,
  MenuItem,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Box,
  Typography,
} from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'

// Mock data for demonstration
const employees = [
  { id: 1, name: 'Suresh Kumar' },
  { id: 2, name: 'Prasad Parik' },
  { id: 3, name: 'Sagar Bhosale' },
  { id: 4, name: 'Chandan Bhagat' },
  { id: 5, name: 'Payal Hamad' },
  { id: 6, name: 'Abhijit Khabale' },
  { id: 7, name: 'Akshay Pawar' },
]

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const years = Array.from({ length: 12 }, (_, i) => new Date().getFullYear() - 7 + i)

// Mock attendance data
const mockAttendance = {
  'Suresh Kumar': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  ],
  'Prasad Parik': [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  ],
  'Sagar Bhosale': [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, ],
  'Chandan Bhagat': [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, ],
  'Payal Hamad': [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, ],
  'Abhijit Khabale': [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1  ],
  'Akshay Pawar': [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1,  ],
}

export default function ReportPage() {
  const [employeeId, setEmployeeId] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')

  return (
    <>
      <Navbar />
      <Box sx={{ display: "flex", mt: 6 }}>
        <Sidenav />
        <Box sx={{ p: 3, maxWidth: 1200, margin: "0 auto" }}>
          {/* Sticky Combined Section */}
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 3,
              backgroundColor: "white",
              p: 2,
            }}
          >
            {/* Attendance Heading */}
            <Typography
              variant="h4"
              sx={{
                mb: 2,
              }}
            >
             Attendance Report
            </Typography>

            {/* Filters */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: -1,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <TextField
                label="Candidate Name"
                defaultValue="Enter Name"
                sx={{ minWidth: 200 }}
              />

              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Select Month</InputLabel>
                <Select
                  value={month}
                  label="Select Month"
                  onChange={(e) => setMonth(e.target.value)}
                >
                  {months.map((month) => (
                    <MenuItem key={month} value={month}>
                      {month}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Select Year</InputLabel>
                <Select
                  value={year}
                  label="Select Year"
                  onChange={(e) => setYear(e.target.value)}
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                sx={{
                  bgcolor: "rgb(134, 122, 233)",
                  "&:hover": { bgcolor: "rgb(95, 85, 190)" },
                  minWidth: 200,
                  height: 56,
                }}
              >
                Search
              </Button>
            </Box>
          </Box>

          {/* Attendance Table */}
          <TableContainer
            component={Paper}
            sx={{
              overflowX: "auto",
              maxHeight: "calc(100vh - 200px)",
            }}
          >
            <Table stickyHeader sx={{ minWidth: 650 }}>
              {/* Sticky Table Header */}
              <TableHead>
                <TableRow>
                  {/* Sticky First Column Header */}
                  <TableCell
                    sx={{
                      position: "sticky",
                      left: 0,
                      // backgroundColor: "white",
                      zIndex: 3,
                      fontWeight: "bold",
                    }}
                  >
                    Candidate Name
                  </TableCell>
                  {Array.from({ length: 31 }, (_, i) => (
                    <TableCell key={i + 1} align="center" sx={{ fontWeight: "bold" }}>
                      {i + 1}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              {/* Table Body */}
              <TableBody>
                {employees.map((employee) => (
                  <TableRow
                    key={employee.id}
                    sx={{
                      "&:nth-of-type(odd)": { bgcolor: "rgba(0, 0, 0, 0.02)" },
                    }}
                  >
                    {/* Sticky First Column */}
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        position: "sticky",
                        left: 0,
                        backgroundColor: "white",
                        zIndex: 1,
                      }}
                    >
                      {employee.name}
                    </TableCell>
                    {mockAttendance[employee.name].map((status, index) => (
                      <TableCell key={index} align="center">
                        {status === 1 ? (
                          <CheckIcon sx={{ color: "green" }} />
                        ) : (
                          <CloseIcon sx={{ color: "red" }} />
                        )}
                      </TableCell>
                    ))}
                    {/* Empty Cell for Vertical Separation */}
                    <TableCell align="center" sx={{ width: '20px', backgroundColor: "lightwhite" }}></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </>
  )
}

