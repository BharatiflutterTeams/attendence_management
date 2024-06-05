import * as React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import axios from 'axios';

export default function PlansPage() {
  const [plans, setPlans] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [newPlan, setNewPlan] = React.useState({
    title: '',
    description: '',
    adult_price: '',
    child_price: '',
    activities: [],
    addOn: '',
  });
  const [selectedPlan, setSelectedPlan] = React.useState(null);
  const activitiesOptions = ['Hiking', 'Sightseeing', 'Boating']; // List of activities options

  React.useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get('/api/plans');
      setPlans(response.data.plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPlan(null);
  };

  const handleSave = async () => {
    try {
      if (selectedPlan) {
        await axios.put(`/api/plans/${selectedPlan._id}`, newPlan);
      } else {
        await axios.post('/api/plans', newPlan);
      }
      fetchPlans();
      setNewPlan({
        title: '',
        description: '',
        adult_price: '',
        child_price: '',
        activities: [],
        addOn: '',
      });
      handleClose();
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setNewPlan(plan);
    setOpen(true);
  };

  const handleDelete = async (planId) => {
    try {
      await axios.delete(`/api/plans/${planId}`);
      fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const handleChange = (event, value) => {
    const { name } = event.target;
    setNewPlan({ ...newPlan, [name]: value });
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Add Plan
      </Button>
      
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{selectedPlan ? 'Edit Plan' : 'Add Plan'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Fill in the details of the plan.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            name="title"
            value={newPlan.title}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            name="description"
            value={newPlan.description}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Adult Price"
            fullWidth
            variant="outlined"
            name="adult_price"
            value={newPlan.adult_price}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Child Price"
            fullWidth
            variant="outlined"
            name="child_price"
            value={newPlan.child_price}
            onChange={handleChange}
          />
          <Autocomplete
            multiple
            id="activities"
            options={activitiesOptions}
            value={newPlan.activities}
            onChange={(event, value) => handleChange({ target: { name: 'activities' }}, value)}
            renderInput={(params) => (
              <TextField {...params} margin="dense" label="Activities" fullWidth variant="outlined" />
            )}
          />
          <TextField
            margin="dense"
            label="Add-On"
            fullWidth
            variant="outlined"
            name="addOn"
            value={newPlan.addOn}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ marginTop: 2 }}>
        {plans.map((plan, index) => (
          <Card key={index} sx={{ width: '100%' }}>
            <CardContent>
              <Typography variant="h5" component="div">
                {plan.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Description: {plan.description}<br />
                Adult Price: ${plan.adult_price}<br />
                Child Price: ${plan.child_price}<br />
                Activities: {plan.activities.join(', ')}<br />
                Add-On: {plan.addOn}<br />
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => handleEdit(plan)}>Edit</Button>
              <Button size="small" onClick={() => handleDelete(plan._id)}>Delete</Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
