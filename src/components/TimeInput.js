import React, { useState } from 'react';
import { TextField, Grid, MenuItem, Select, InputLabel, FormControl, Box } from '@mui/material';

const TimeInput = ({ label, fromTime, toTime, onFromTimeChange, onToTimeChange }) => {
  const [fromPeriod, setFromPeriod] = useState('AM');
  const [toPeriod, setToPeriod] = useState('AM');

  const handleFromPeriodChange = (event) => {
    setFromPeriod(event.target.value);
    onFromTimeChange({ ...fromTime, period: event.target.value });
  };

  const handleToPeriodChange = (event) => {
    setToPeriod(event.target.value);
    onToTimeChange({ ...toTime, period: event.target.value });
  };

  return (
    <Box sx={{ mt: 2, mb:2 }}>
      <Grid container spacing={2}>
        <Grid item xs={6} sm={6}>
          <TextField
            label={`From ${label}`}
            type="time"
            value={fromTime.time}
            sx={{mb:1.5}}
            onChange={(e) => onFromTimeChange({ time: e.target.value, period: fromPeriod })}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              step: 300, // 5 min
            }}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel id="from-period-label">Period</InputLabel>
            <Select
              labelId="from-period-label"
              value={fromPeriod}
              onChange={handleFromPeriodChange}
              label="Period"
            >
              <MenuItem value="AM">AM</MenuItem>
              <MenuItem value="PM">PM</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} sm={6}>
          <TextField
            label={`To ${label}`}
            type="time"
            value={toTime.time}
            sx={{mb:1.5}}
            onChange={(e) => onToTimeChange({ time: e.target.value, period: toPeriod })}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              step: 300, // 5 min
            }}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel id="to-period-label">Period</InputLabel>
            <Select
              labelId="to-period-label"
              value={toPeriod}
              onChange={handleToPeriodChange}
              label="Period"
            >
              <MenuItem value="AM">AM</MenuItem>
              <MenuItem value="PM">PM</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TimeInput;
