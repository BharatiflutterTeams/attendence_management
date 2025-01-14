import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, CardMedia, Button } from '@mui/material';
import PlanStatusSelect from './PlanStatusSelect';
import styles from './PlanCard.module.css';

const PlanCard = ({ plan, adminRole, handleEdit, handleDelete }) => {
  const [status, setStatus] = useState(plan.status);

  const handleStatusChange = (newStatus) => {
    
      setStatus(newStatus);
      //console.log('new Status' , newStatus);
    
  };

  useEffect(() => {
    setStatus(plan.status);
  }, [plan.status]);

  return (
    <Card
      variant="outlined"
      className={`${styles.card} ${
        status === 'temporary closed' ? styles.temporaryClosed : status === 'closed' ? styles.closed : ''
      }`}
      sx={{
        width: "100%",
        m: 2,
        borderRadius: "8px",
        display: "flex",
        background: "#FFFFFF",
        boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.16)",
       
      }}
      
    >
      
      <Box sx={{ display: 'flex', flexDirection: 'column', width: 200 }}>
        <CardMedia
          component="img"
          sx={{
            width: '100%',
            height: '100%',
            borderRadius: '8px 0 0 8px',
            objectFit: 'cover',
          }}
          image={
            plan.image_list[0]
              ? plan.image_list[0]
              : 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?cs=srgb&dl=pexels-thorsten-technoman-109353-338504.jpg&fm=jpg'
          }
          alt="Card image"
        />
      </Box>
         
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, p: 2 }}>
      <Box sx={{display:'flex' , justifyContent:'flex-end'}}>
         <PlanStatusSelect
        planId={plan._id}
        initialStatus={plan.status}
        onStatusChange={handleStatusChange}
      />
         </Box>
        <CardContent sx={{ p: 0, flex: 1 }}>
          <Typography variant="h5" component="div" sx={{ mb: 2, fontWeight: 'bold', color: '#37474F' }}>
            {plan.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {plan.description}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Sub-Packages: </strong>
              {plan.subpackages.map((subpackage) => subpackage.name).join(', ')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Timing: </strong>
              {plan.timing?.fromtime} {plan.timing?.fromperiod} to {plan.timing?.totime} {plan.timing?.toperiod}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Coupons: </strong>
              {plan.plan_coupon.map((coupon) => coupon.coupon_code).join(', ')}
            </Typography>
          </Box>
            
        </CardContent>
        
        {adminRole === 'superadmin' && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button size="small" onClick={() => handleEdit(plan)} sx={{ mr: 1 }} variant="text" color="primary">
              Edit
            </Button>
            {/* <Button size="small" onClick={() => handleDelete(plan._id)} variant="text" color="secondary">
              Delete
            </Button> */}
          </Box>
        )}
         
      </Box>
      
    </Card>
  );
};

export default PlanCard;
