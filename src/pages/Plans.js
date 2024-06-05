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
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";
import Sidenav from "../components/Sidenav";
import Navbar from "../components/Navbar";
import AddIcon from "@mui/icons-material/Add";
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
    highlights: [],
    addOn: "",
    imageLinks: [],
    adult_gold_package : [],
    child_gold_package : [],
    coupons: [],
  });
  const [selectedPlan, setSelectedPlan] = React.useState(null);
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
        highlights: [],
        //addOn: "",
        imageLinks: [],
        adult_gold_package:[],
        child_gold_package:[],
        coupons: [],
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
    try {
      await axios.delete(`http://localhost:8000/api/plan/${planId}`);
      fetchPlans();
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

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
    if (newLink && newPlan.imageLinks.length < 5) {
      setNewPlan({ ...newPlan, imageLinks: [...newPlan.imageLinks, newLink] });
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
    const updatedLinks = newPlan.imageLinks.filter((_, i) => i !== index);
    setNewPlan({ ...newPlan, imageLinks: updatedLinks });
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
    setNewPlan({ ...newPlan, highlights: value });
  };

  const handleCouponsChange = (event, value) => {
    setNewPlan({ ...newPlan, coupons: value });
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
              value={search}
              onChange={handleSearchChange}
            />
            <Button
              variant="contained"
              style={{ background: "#263238", textTransform: "none" }}
              onClick={handleOpen}
              startIcon={<AddIcon />}
            >
              Add Plan
            </Button>
          </Box>

          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{selectedPlan ? "Edit Plan" : "Add Plan"}</DialogTitle>
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
                value={newPlan.highlights}
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
                  disabled={newPlan.imageLinks.length >= 5}
                >
                  Add Link
                </Button>
              </Box>
              <Box>
                {newPlan.imageLinks?.map((link, index) => (
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
                    <Button onClick={() => handleRemoveLink(index)}>
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
                    <Button onClick={() => handleRemoveAdultPoint(index)}>
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
                    <Button onClick={() => handleRemoveChildPoint(index)}>
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
                value={newPlan.coupons}
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
              <Button onClick={handleClose} color="primary">
                Cancel
              </Button>
              <Button onClick={handleSave} color="primary">
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

          <Box sx={{ marginTop: 2 }}>
            {filteredPlans.map((plan, index) => (
              <Card
                key={index}
                variant="outlined"
                sx={{
                  width: "100%",
                  m: 2,
                  borderRadius: "8px",
                  display: "flex",
                  background: "#EEF7FF",
                }}
              >
                <CardMedia
                  component="img"
                  sx={{ width: 200 }}
                  image={
                    "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?cs=srgb&dl=pexels-thorsten-technoman-109353-338504.jpg&fm=jpg"
                  }
                  alt="Card image"
                />
                <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  <CardContent>
                    <Typography variant="h5" component="div">
                      {plan.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Description: {plan.description}
                      <br />
                      Adult Price: ${plan.adult_price}
                      <br />
                      Child Price: ${plan.child_price}
                      <br />
                      Highlights: {plan.highlights.join(", ")}
                      <br />
                      {/* Add-On: {plan.addOn}<br /> */}
                      Image Links: {plan.imageLinks.join(", ")}
                      <br />
                      Coupons:{" "}
                      {plan.coupons
                        .map((coupon) => coupon.coupon_code)
                        .join(", ")}
                      <br />
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => handleEdit(plan)}>
                      Edit
                    </Button>
                    <Button
                      size="small"
                      onClick={() => {
                        handleDelete(plan._id);
                      }}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Box>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
}
