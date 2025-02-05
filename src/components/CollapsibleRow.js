import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Collapse,
    IconButton,
    Paper,
    Box,
  } from "@mui/material";
  import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { useEffect, useState } from "react";
import axios from "axios";
import endpoints from "../Endpoints/endpoint";
  
  const data = [
    {
      branch: "PCMC",
      total: 50,
      present: 45,
      absent: 5,
      students: [
        { name: "John Doe", status: "Present" },
        { name: "Jane Smith", status: "Absent" },
      ],
    },
    {
      branch: "Deccan",
      total: 40,
      present: 38,
      absent: 2,
      students: [
        { name: "Alice Brown", status: "Present" },
        { name: "Bob White", status: "Absent" },
      ],
    },
  ];

  const fetchBranchStudent = async () => {
    try {
      const response = await axios.get(`${endpoints.serverBaseURL}/api/std/dashboard-student`);
      console.log(response.data.students);
    } catch (error) {
      console.log(error.response.data.message)
    }
  }
  
  
  const CollapsibleRow = ({ row }) => {
    const [open, setOpen] = useState(false);
    
  
    return (
      <>
        <TableRow>
          <TableCell align="center">
            <IconButton size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </TableCell>
          <TableCell>{row.branch}</TableCell>
          <TableCell sx={{ paddingLeft: '35px'}}>{row.total}</TableCell>
          <TableCell sx={{ paddingLeft: '30px'}}>{row.present}</TableCell>
          <TableCell sx={{ paddingLeft: '30px'}}>{row.absent}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box margin={2}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.students.map((student, index) => (
                      <TableRow key={index}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  };
  
  const CollapsibleTable = () => {

    useEffect(() => {
      fetchBranchStudent();
    }, [])
    return (
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Branch</TableCell>
              <TableCell >Total Students</TableCell>
              <TableCell>Present</TableCell>
              <TableCell>Absent</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <CollapsibleRow key={index} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  export default CollapsibleTable;
  