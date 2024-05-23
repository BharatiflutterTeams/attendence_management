import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import BookingList from './pages/BookingList';
import NotFound from './pages/PageNotFound';
import Grid from '@mui/material/Grid';
import Plans from './pages/Plans';



const App = () => {
  return (
    <Grid container spacing={2} style={{height:"100vh"}}>
  
    <Grid item md={2} style={{background:"#2D3250"}}
    >
 <Sidebar />
    </Grid>
    <Grid item md={10} p={5}  style={{background:"#EEF5FF"}}>
 
      <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bookings" element={<BookingList />} />
        <Route path="/plans" element={<Plans/>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>

    </Grid>
    
  </Grid>



 
  );
};

export default App;
