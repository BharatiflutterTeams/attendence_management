import React, { useState } from "react";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogContent,
  Button,
  DialogTitle,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import axios from "axios";
import styles from "./PlanStatusSelect.module.css";
import endpoints from "../Endpoints/endpoint";

export default function PlanStatusSelect({
  planId,
  initialStatus,
  onStatusChange,
}) {
  const [status, setStatus] = useState(initialStatus);
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
    
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedStatus(status);
  };

  const handleConfirm = async (event) => {
    setStatus(selectedStatus);
    console.log('status from select', selectedStatus)
    setOpen(false);

    try {
      await axios.patch(`${endpoints.serverBaseURL}/api/plan/${planId}`, {
        status: selectedStatus,
      });
      onStatusChange(selectedStatus);
    } catch (error) {
      console.log("Failed to update the plan", error);
      setStatus(initialStatus);
    }
  };
  return (
    <>
      <FormControl variant="outlined" className={styles.statusSelect}>
        <InputLabel>Status</InputLabel>
        <Select value={status} onChange={handleStatusChange} label="Status" size="small">
          <MenuItem value="on">Open</MenuItem>
          <MenuItem value="temporary closed">Temporary Close</MenuItem>
          <MenuItem value="closed">Closed</MenuItem>
        </Select>
      </FormControl>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Change Status</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to change the status to {selectedStatus}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            No
          </Button>
          <Button onClick={handleConfirm} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
