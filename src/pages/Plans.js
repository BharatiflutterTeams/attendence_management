import * as React from "react";
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
  TextField,
  CardMedia,
  Typography,
  Snackbar,
  Alert,
   Collapse,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";
import Sidenav from "../components/Sidenav";
import Navbar from "../components/Navbar";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const drawerWidth = 240;

export default function PlansPage() {
  const Navigate = useNavigate();
  const [plans, setPlans] = React.useState([]);
  const [coupons, setCoupons] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [newPlan, setNewPlan] = React.useState({
    title: "",
    description: "",
    adult_price: "",
    child_price: "",
    activities: [],
    addOn: [],
    image_list: [],
    adult_gold_package : [],
    child_gold_package : [],
    plan_coupon: [],
  });
  const [selectedPlan, setSelectedPlan] = React.useState(null);
  const [deletePlanId , setDeletePlanId] = React.useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [newLink, setNewLink] = React.useState("");
  const [adultPoint , setAdultPoint] = React.useState("");
  const [childPoint , setChildPoint] = React.useState("");
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  
  

  const highlightsOptions = ["Hiking", "Sightseeing", "Boating"]; // List of activities options

  React.useEffect(() => {
    fetchPlans();
    fetchCoupons();
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("jwtToken");

    if (token && token !== "" && token !== null) {
      const decoded = jwtDecode(token);
      const role = decoded.role;
    } else {
      console.log("Token not Found");
      Navigate("/login");
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/plan");
      setPlans(response.data.plan);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const fetchCoupons = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/coupons");
      setCoupons(response.data.coupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
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
        await axios.put(
          `http://localhost:8000/api/plan/${selectedPlan._id}`,
          newPlan
        );
      } else {
        await axios.post("http://localhost:8000/api/plan", newPlan);
      }
      fetchPlans();
      setNewPlan({
        title: "",
        description: "",
        adult_price: "",
        child_price: "",
        activities: [],
        addOn: [],
        image_list: [],
        adult_gold_package:[],
        child_gold_package:[],
        plan_coupon: [],
      });
      handleClose();
    } catch (error) {
      console.error("Error saving plan:", error);
    }
  };

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setNewPlan(plan);
    setOpen(true);
  };

  const handleDelete = async (planId) => {
     setDeletePlanId(planId);
     setDeleteDialogOpen(true);
  };

   const confirmDelete =async()=>{
    try {
        await axios.delete(`http://localhost:8000/api/plan/${deletePlanId}`);
        fetchPlans();
        setDeleteDialogOpen(false);
    } catch (error) {
      console.log("Error deleting plan" , error);
    }
   }

   const handleCancelDelete =()=>{
    setDeleteDialogOpen(false);
    setDeletePlanId(null);
   }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewPlan({ ...newPlan, [name]: value });
  };

  const handleImageLinksChange = (event) => {
    setNewLink(event.target.value);
  };

  const handleAdultGoldChange = (event)=>{
     setAdultPoint(event.target.value);
  }

  const handleChildGoldChange = (event)=>{
    setChildPoint(event.target.value);
 }

  const handleAddLink = () => {
    if (newLink && newPlan.image_list.length < 5) {
      setNewPlan({ ...newPlan, image_list: [...newPlan.image_list, newLink] });
      setNewLink("");
    } else {
      setSnackbarMessage("Only 5 image links are allowed");
      setSnackbarOpen(true);
    }
  };

  const handleAddAdultPoint = ()=>{
    if (adultPoint && newPlan.adult_gold_package.length < 5) {
      setNewPlan({ ...newPlan, adult_gold_package: [...newPlan.adult_gold_package, adultPoint] });
      setAdultPoint("");
    } else {
      setSnackbarMessage("Only 5 points are allowed");
      setSnackbarOpen(true);
    }
  }

  const handleAddChildPoint = ()=>{
    if (childPoint && newPlan.child_gold_package.length < 5) {
      setNewPlan({ ...newPlan, child_gold_package: [...newPlan.child_gold_package, childPoint] });
      setAdultPoint("");
    } else {
      setSnackbarMessage("Only 5 points are allowed");
      setSnackbarOpen(true);
    }
  }



  const handleRemoveLink = (index) => {
    const updatedLinks = newPlan.image_list.filter((_, i) => i !== index);
    setNewPlan({ ...newPlan, image_list: updatedLinks });
  };
  
  const handleRemoveAdultPoint = (index) => {
    const updatedPoints = newPlan.adult_gold_package.filter((_, i) => i !== index);
    setNewPlan({ ...newPlan, adult_gold_package: updatedPoints });
  };
  const handleRemoveChildPoint = (index) => {
    const updatedPoints = newPlan.child_gold_package.filter((_, i) => i !== index);
    setNewPlan({ ...newPlan, child_gold_package: updatedPoints });
  };

  const handleHighlightsChange = (event, value) => {
    setNewPlan({ ...newPlan, activities: value });
  };

  const handleCouponsChange = (event, value) => {
    setNewPlan({ ...newPlan, plan_coupon: value });
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setSnackbarMessage("");
  };

 
  const filteredPlans = plans.filter(
    (plan) =>
      plan.title.toLowerCase().includes(search.toLowerCase()) ||
      plan.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <Box sx={{ padding: 2, display: "flex" }}>
        <Sidenav />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: 5,
            p: 4,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            
              <TextField
                label="Search Plans"
                variant="outlined"
                size="small"
                value={search}
                sx={{width:'35%' , background:'white' }}
                onChange={handleSearchChange}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <Box sx={{ position: "absolute", right: 10, top: 8  }}>
                      <SearchIcon sx={{color:'#867AE9'}} />
                    </Box>
                  ),
                }}
               
                 
              />
            
            <Button
              variant="contained"
              style={{ background: "#ffffff",color: '#867AE9', textTransform: "none", fontWeight:'bold' }}
              onClick={handleOpen}
              startIcon={<AddIcon />}
            >
              Add Plan
            </Button>
          </Box>

          <Dialog open={open} onClose={handleClose}>
            <DialogTitle sx={{background:'#615EFC', color:"white"}}>{selectedPlan ? "Edit Plan" : "Add Plan"}</DialogTitle>
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
                id="highlights"
                options={highlightsOptions}
                value={newPlan.activities}
                onChange={handleHighlightsChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    margin="dense"
                    label="Highlights"
                    fullWidth
                    variant="outlined"
                  />
                )}
              />
              {/* <TextField
                margin="dense"
                label="Add-On"
                fullWidth
                variant="outlined"
                name="addOn"
                value={newPlan.addOn}
                onChange={handleChange}
              /> */}
              <Box
                sx={{ display: "flex", alignItems: "center", marginBottom: 1 }}
              >
                <TextField
                  margin="dense"
                  label="Image Link"
                  fullWidth
                  variant="outlined"
                  value={newLink}
                  onChange={handleImageLinksChange}
                />
                <Button
                  onClick={handleAddLink}
                  disabled={newPlan.image_list.length >= 5}
                  variant="outlined"
                   size="small"
                   sx={{ml:'10px' , mt:'5px'}}
                >
                  Add Link
                </Button>
              </Box>
              <Box>
                {newPlan.image_list?.map((link, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {index + 1}) {link}
                    </Typography>
                    <Button onClick={() => handleRemoveLink(index)}  variant="outlined"
                       size="small">
                      Remove
                    </Button>
                  </Box>
                ))}
              </Box>

              <Box
                sx={{ display: "flex", alignItems: "center", marginBottom: 1 }}
              >
                <TextField
                  margin="dense"
                  label="Adult Gold Package"
                  fullWidth
                  variant="outlined"
                  value={adultPoint}
                  onChange={handleAdultGoldChange}
                />
                <Button
                  onClick={handleAddAdultPoint}
                  disabled={newPlan.adult_gold_package.length >= 5}
                  variant="outlined"
                   size="small"
                   sx={{ml:'10px' , mt:'5px'}}
                >
                  Add Point
                </Button>
              </Box>
              <Box>
                {newPlan.adult_gold_package?.map((Point, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {index + 1}) {Point}
                    </Typography>
                    <Button onClick={() => handleRemoveAdultPoint(index)}  variant="outlined"
                      size="small">
                      Remove
                    </Button>
                  </Box>
                ))}
                </Box>
                 
                 
              <Box
                sx={{ display: "flex", alignItems: "center", marginBottom: 1 }}
              >
                <TextField
                  margin="dense"
                  label="Child Gold Package"
                  fullWidth
                  variant="outlined"
                  value={childPoint}
                  onChange={handleChildGoldChange}
                />
                <Button
                  onClick={handleAddChildPoint}
                  disabled={newPlan.child_gold_package.length >= 5}
                  variant="outlined"
                   size="small"
                   sx={{ml:'10px' , mt:'5px'}}
                >
                  Add Point
                </Button>
              </Box>
              <Box>
                {newPlan.child_gold_package?.map((Point, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {index + 1}) {Point}
                    </Typography>
                    <Button onClick={() => handleRemoveChildPoint(index)}  variant="outlined"
                       size="small">
                      Remove
                    </Button>
                  </Box>
                ))}
                </Box>

              <Autocomplete
                multiple
                id="coupons"
                options={coupons}
                getOptionLabel={(option) => option.coupon_code}
                value={newPlan.plan_coupon}
                onChange={handleCouponsChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    margin="dense"
                    label="Coupons"
                    fullWidth
                    variant="outlined"
                  />
                )}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} variant="contained"
              style={{ background: "#686D76", textTransform: "none" }}>
                Cancel
              </Button>
              <Button onClick={handleSave} variant="contained"
              style={{ background: "#615EFC", textTransform: "none" }}>
                Save
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
          >
            <Alert
              onClose={handleSnackbarClose}
              severity="warning"
              sx={{ width: "100%" }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>

          {/* Delete confirmation Dialog */}
           <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogContent>
                 <DialogContentText>
                    Are you sure you want to delete this plan?
                 </DialogContentText>
              </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error">Delete</Button>
                </DialogActions>
           </Dialog>

          <Box sx={{ marginTop: 2 }}>
            {filteredPlans.map((plan, index) => (
                <Card
                key={plan._id}
                variant="outlined"
                sx={{
                  width: "100%",
                  m: 2,
                  borderRadius: "8px",
                  display: "flex",
                  background: "#FFFFFF",
                  boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.16)",
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", width: 200 }}>
                  <CardMedia
                    component="img"
                    sx={{ width: "100%", height: "100%", borderRadius: "8px 0 0 8px", objectFit: 'cover' }}
                    image={
                      plan.image_list[0]
                        ? plan.image_list[0]
                        : "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?cs=srgb&dl=pexels-thorsten-technoman-109353-338504.jpg&fm=jpg"
                    }
                    alt="Card image"
                  />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", flex: 1, p: 2 }}>
                  <CardContent sx={{ p: 0, flex: 1 }}>
                    <Typography variant="h5" component="div" sx={{ mb: 2, fontWeight: 'bold', color: "#37474F" }}>
                      {plan.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {plan.description}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Adult Price:</strong> ₹{plan.adult_price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Child Price:</strong> ₹{plan.child_price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Highlights:</strong> {plan.activities.join(", ")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Image Links:</strong> {plan.image_list.join(", ")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Coupons:</strong> {plan.plan_coupon.map((coupon) => coupon.coupon_code).join(", ")}
                      </Typography>
                    </Box>
                  </CardContent>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                    <Button
                      size="small"
                      onClick={() => handleEdit(plan)}
                      sx={{ mr: 1 }}
                      variant="text"
                      color="primary"
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleDelete(plan._id)}
                      variant="text"
                      color="secondary"
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
}
