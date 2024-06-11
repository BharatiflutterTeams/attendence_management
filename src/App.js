import React from 'react';
import {  Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import BookingList from './pages/BookingList';
import NotFound from './pages/PageNotFound';
import Grid from '@mui/material/Grid';
import Plans from './pages/Plans';
import CouponsPage from './pages/CouponPage';
import ProfilePage from './pages/ProfilePage';
import { Box } from '@mui/material';
import './App.css';
import CompanyProfile from './pages/CompanyProfile';
import ApprovalPage from './pages/ApprovalPage';
import AdminLogin from './pages/AdminLogin';
import RequireAuth from './auth.js/RequireAuth';
import {ROLES} from './config/roles'
//import PlansPage from './pages/dumyPage';


const App = () => {
  return (

     <Box sx={{}}>
      <Routes>
        
       
        <Route path="/login" element={<AdminLogin/>}/>

         <Route path="/" element={<Home />} />
         
            <Route path="/bookings" element={<BookingList />} />
            <Route path="/plans" element={<Plans/>} />
            <Route path="/coupons" element={<CouponsPage/>}/>
            <Route path="/profile" element={<ProfilePage/>}/>
            <Route path="/companyprofile" element={<CompanyProfile/>}/>

        <Route path='/approval' element={<ApprovalPage/>}/>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    
      </Box>
    



 
  );
};

export default App;
