import React from 'react';
import { Card, Typography, Box, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components
const StatsCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.white,
  boxShadow: theme.shadows[2],
  borderRadius: theme.shape.borderRadius * 2,
  width: '100%',
  height: '150px',
  position: 'relative',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[6],
  },
}));

const StatItem = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(1),
}));

const TitleBadge = styled(Typography)(({ theme, position }) => ({
  position: 'absolute',
  top: '-3px',
  [position]: '0px',
  backgroundColor: '#867ae9',
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(0.5, 1.3),
  borderRadius: '4px',
  fontSize: '0.95rem',
  fontWeight: 'bold',
  width: '260px',
  textAlign: 'center',
}));

// Main component
export default function RevenueCard() {
  // Utility function to format revenue
  const formatRevenue = (value) => {
    if (value === undefined || value === null) return '0';
    if (value === 0) return '0';
    return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Sample static data for PCMC and Deccan
  const branches = {
    PCMC: [
      { label: 'Today', value: 30 },
      { label: 'Yesterday', value: 25 },
      { label: 'Current Month', value: 80 },
      { label: 'Last Month', value: 95 },
    ],
    Deccan: [
      { label: 'Today', value: 20 },
      { label: 'Yesterday', value: 20 },
      { label: 'Current Month', value: 60 },
      { label: 'Last Month', value: 85 },
    ],
  };

  return (
    <Box
      width="100%"
      display="flex"
      justifyContent="space-between"
      columnGap={2}
      alignItems="center"
      sx={{ backgroundColor: '#eef1ff', padding: 2, borderRadius: 3 }}
    >
      <Grid container spacing={3}>
        {/* PCMC Branch Stats */}
        <Grid item xs={12} sm={6} md={5}>
          <StatsCard>
            <TitleBadge position="left" sx={{ whiteSpace: "nowrap" }}>
              PCMC - No. of Students Present
            </TitleBadge>
            <Box display="flex" justifyContent="space-between" alignItems="center" height="100%">
              {branches.PCMC.map((stat) => (
                <StatItem key={stat.label}>
                  <Typography variant="h6" fontWeight="bold" paddingTop={2}>
                    {formatRevenue(stat.value)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </StatItem>
              ))}
            </Box>
          </StatsCard>
        </Grid>

        {/* Deccan Branch Stats */}
        <Grid item xs={12} sm={6} md={5}>
          <StatsCard>
            <TitleBadge position="left" sx={{ whiteSpace: "nowrap" }}>
              Deccan - No. of Students Present
            </TitleBadge>
            <Box display="flex" justifyContent="space-between" alignItems="center" height="100%">
              {branches.Deccan.map((stat) => (
                <StatItem key={stat.label}>
                  <Typography variant="h6" fontWeight="bold" paddingTop={2}>
                    {formatRevenue(stat.value)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </StatItem>
              ))}
            </Box>
          </StatsCard>
        </Grid>
      </Grid>
    </Box>
  );
}
