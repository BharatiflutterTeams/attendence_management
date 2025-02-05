import React from 'react';
import { Card, Typography, Box, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { TrendingUp } from '@mui/icons-material';

const StatsCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#ffffff',
  boxShadow: '0 4px 12px rgba(134, 122, 233, 0.1)',
  borderRadius: '16px',
  width: '100%',
  height: '140px',
  position: 'relative',
  transition: 'all 0.3s ease',
  border: '1px solid rgba(134, 122, 233, 0.1)',
  overflow: 'visible',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 20px rgba(134, 122, 233, 0.15)',
  },
}));

const StatItem = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(0.5),
  // paddingLeft: isFirst ? theme.spacing(0.5) : 0,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    right: '-4px',
    top: '50%',
    transform: 'translateY(-50%)',
    height: '60%',
    width: '1px',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  '&:last-child::after': {
    display: 'none',
  },
}));

const TitleBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '-14px',
  left: '16px',
  backgroundColor: '#867ae9',
  color: '#ffffff',
  padding: '6px 16px',
  borderRadius: '10px',
  fontSize: '0.85rem',
  fontWeight: '600',
  boxShadow: '0 4px 12px rgba(134, 122, 233, 0.3)',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
}));

const ValueTypography = styled(Typography)(({ theme, positive }) => ({
  fontSize: '1.25rem',
  fontWeight: '700',
  color: '#2d3748',
  marginBottom: '2px',
  background:  'linear-gradient(45deg, #867ae9, #6c63ff)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

const LabelTypography = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: '#718096',
  fontWeight: '500',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}));

export default function RevenueCard({ attendanceStats }) {
  console.log("attendanceStats:", attendanceStats);

  const formatRevenue = (value) => {
    if (value === undefined || value === null) return "0";
    return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  if (!attendanceStats) {
    return <Typography>Loading attendance data...</Typography>;
  }

  return (
    <Box width="100%" display="flex" justifyContent="space-between" gap={2}>
      <Grid container spacing={2}>
        {Object.entries(attendanceStats).map(([branch, stats]) => (
          <Grid item xs={12} sm={6} key={branch}>
            <StatsCard>
              <TitleBadge>
                <TrendingUp sx={{ fontSize: 16 }} />
                <Typography sx={{ fontWeight: "600" }}>
                  {branch} - Students Present
                </Typography>
              </TitleBadge>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                height="100%"
                sx={{ mt: 0.3 }}
              >
                {[
                  { label: "Yesterday", value: stats.yesterday },
                  { label: "Today", value: stats.today },
                  { label: "Last Month", value: stats.lastMonth },
                  { label: "Current Month", value: stats.currentMonth },
                ].map((stat, index) => (
                  <StatItem key={stat.label} isFirst={index === 0}>
                    <ValueTypography positive={stat.value > 0} alignItems="center">
                      {formatRevenue(stat.value)}
                    </ValueTypography>
                    <LabelTypography>{stat.label}</LabelTypography>
                  </StatItem>
                ))}
              </Box>
            </StatsCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
