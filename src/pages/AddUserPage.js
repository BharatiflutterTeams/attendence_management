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
  MenuItem,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";
import Sidenav from "../components/Sidenav";
import Navbar from "../components/Navbar";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import endpoints from "../Endpoints/endpoint";
import Preloader from "../components/Preloader";

const drawerWidth = 240;

export default function UsersPage() {
  const Navigate = useNavigate();
  const [users, setUsers] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [newUser, setNewUser] = React.useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [deleteUserId, setDeleteUserId] = React.useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [loading ,setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchUsers();
    checkAuth();
  }, []);

  const checkAuth = ()=>{
    const token = sessionStorage.getItem('jwtToken')

    if( token  && token !== '' && token !== null){
    const decoded = jwtDecode(token);
    const role = decoded.role
    
    if( role !== 'superadmin'){
        Navigate('/');
    }
    
   }
   else{
      console.log('Token not Found');
      Navigate('/login');
   }
}

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${endpoints.serverBaseURL}/api/admin/userprofile/users`);
      setUsers(response.data.users);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      loading(true);
    }
  };

  if(loading){
    return <Preloader/>
  }

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const handleSave = async () => {
    try {
      if (selectedUser) {
        await axios.put(
          `${endpoints.serverBaseURL}/api/admin/userprofile/${selectedUser._id}`,
          newUser
        );
      } else {
        await axios.post(`${endpoints.serverBaseURL}/api/admin/signup`, newUser);
      }
      fetchUsers();
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "",
      });
      handleClose();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setNewUser(user);
    setOpen(true);
  };

  const handleDelete = async (userId) => {
    setDeleteUserId(userId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${endpoints.serverBaseURL}/api/admin/userprofile/${deleteUserId}`);
      fetchUsers();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.log("Error deleting user", error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeleteUserId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setSnackbarMessage("");
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
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
              label="Search Users"
              variant="outlined"
              size="small"
              value={search}
              sx={{ width: "35%", background: "white" }}
              onChange={handleSearchChange}
              fullWidth
              InputProps={{
                endAdornment: (
                  <Box sx={{ position: "absolute", right: 10, top: 8 }}>
                    <SearchIcon sx={{ color: "#867AE9" }} />
                  </Box>
                ),
              }}
            />

            <Button
              variant="contained"
              style={{
                background: "#ffffff",
                color: "#867AE9",
                textTransform: "none",
                fontWeight: "bold",
              }}
              onClick={handleOpen}
              startIcon={<AddIcon />}
            >
              Add User
            </Button>
          </Box>

          <Dialog open={open} onClose={handleClose}>
            <DialogTitle sx={{ background: "#615EFC", color: "white" }}>
              {selectedUser ? "Edit User" : "Add User"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Fill in the details of the user.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                label="Name"
                fullWidth
                variant="outlined"
                name="name"
                value={newUser.name}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                label="Email"
                fullWidth
                variant="outlined"
                name="email"
                value={newUser.email}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                label="Password"
                fullWidth
                variant="outlined"
                name="password"
                type="password"
                value={newUser.password}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                label="Role"
                fullWidth
                variant="outlined"
                name="role"
                select
                value={newUser.role}
                onChange={handleChange}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="checker">Checker</MenuItem>
              </TextField>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleClose}
                variant="contained"
                style={{ background: "#686D76", textTransform: "none" }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                variant="contained"
                style={{ background: "#615EFC", textTransform: "none" }}
              >
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
                Are you sure you want to delete this user?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelDelete}>Cancel</Button>
              <Button onClick={confirmDelete} color="error">
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          <Box sx={{ marginTop: 2 }}>
            {filteredUsers.map((user, index) => (
              <Card
                key={user._id}
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
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    p: 2,
                  }}
                >
                  <CardContent sx={{ p: 0, flex: 1 }}>
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{ mb: 2, fontWeight: "bold", color: "#37474F" }}
                    >
                      {user.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1, fontSize: "14px" }}
                    >
                       <b>Email:-</b> {user.email}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "14px" }}
                    >
                      <b>Role:-</b>{user.role}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 0, justifyContent: "flex-end" }}>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleEdit(user)}
                      sx={{
                        textTransform: "none",
                        color: "#867AE9",
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDelete(user._id)}
                      sx={{
                        textTransform: "none",
                        color: "#EF5350",
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
