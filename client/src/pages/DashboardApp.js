import { useEffect, useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography,FormControl,InputLabel,Select,MenuItem } from '@mui/material';
// components
import axios from 'axios';
import Page from '../components/Page';
import Iconify from '../components/Iconify';
// sections
import {
  AppCurrentVisits,
  AppWebsiteVisits,
  AppWidgetSummary,
  AppCurrentSubject,
  AppConversionRates,
  AppDonutChart,
} from '../sections/@dashboard/app';


// ----------------------------------------------------------------------

export default function DashboardApp() {
  const theme = useTheme();
  const [stats, setStats] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('religionDistribution');

  const categoryOptions = [
    { key: 'religionDistribution', label: 'Religion' },
    { key: 'communityDistribution', label: 'Community' },
    { key: 'minorityStatusDistribution', label: 'Minority Status' },
    { key: 'admissionQuotaDistribution', label: 'Admission Quota' },
    { key: 'residentialStatusDistribution', label: 'Residential Status' },
    { key: 'countryDistribution', label: 'Country' },
  ];



  // Fetch statistics from the backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:7070/api/stats/stats'); // Adjust URL as needed
        setStats(response.data.stats || {});
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchStats();
  }, []);

  const selectedData = stats[selectedCategory] || {}
  const chartLabels = Object.keys(selectedData);
  const chartValues = Object.values(selectedData);

  return (
    <Page title="Dashboard">
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Dashboard
        </Typography>

        <Grid container spacing={3}>

        {/* Religion Distribution */}
        <Grid item xs={12} sm={6} md={6}>
            <AppWidgetSummary
              title="Religion Distribution"
              total={Object.keys(stats.religionDistribution || {}).length}
              color="info"
              icon={'ic:outline-diversity-3'}
            />
          </Grid>

          {/* Community Distribution */}
          <Grid item xs={12} sm={6} md={6}>
            <AppWidgetSummary
              title="Community Distribution"
              total={Object.keys(stats.communityDistribution || {}).length}
              color="success"
              icon={'mdi:account-group-outline'}
            />
          </Grid>

          {/* Minority Status Distribution */}
          <Grid item xs={12} sm={6} md={6}>
            <AppWidgetSummary
              title="Minority Status"
              total={Object.keys(stats.minorityStatusDistribution || {}).length}
              color="error"
              icon={'fluent:people-community-24-regular'}
            />
          </Grid>

          {/* Admission Quota Distribution */}
          <Grid item xs={12} sm={6} md={6}>
            <AppWidgetSummary
              title="Admission Quota"
              total={Object.keys(stats.admissionQuotaDistribution || {}).length}
              color="warning"
              icon={'mdi:clipboard-list-outline'}
            />
          </Grid>

          {/* Residential Status Distribution */}
          <Grid item xs={12} sm={6} md={6}>
            <AppWidgetSummary
              title="Residential Status"
              total={Object.keys(stats.residentialStatusDistribution || {}).length}
              color="secondary"
              icon={'mdi:home-city-outline'}
            />
          </Grid>

          {/* Country-wise Distribution */}
          <Grid item xs={12} sm={6} md={6}>
            <AppWidgetSummary
              title="Country Distribution"
              total={Object.keys(stats.countryDistribution || {}).length}
              color="primary"
              icon={'mdi:earth'}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={12}>
            <FormControl fullWidth>
              <InputLabel>Select Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categoryOptions.map((option) => (
                  <MenuItem key={option.key} value={option.key}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Dynamic Chart for Selected Category */}
          <Grid item xs={12} md={6} lg={12}>
            <AppWebsiteVisits
              title="Student Statistics"
              subheader={`Distribution of ${categoryOptions.find((c) => c.key === selectedCategory)?.label}`}
              chartLabels={chartLabels}
              chartData={[
                {
                  name: categoryOptions.find((c) => c.key === selectedCategory)?.label || 'Category',
                  type: 'bar',
                  fill: 'solid',
                  data: chartValues,
                },
              ]}
            />
          </Grid>

          {/* Pie Chart: AppCurrentVisits */}
          <Grid item xs={12} md={6} lg={12}>
            <AppCurrentVisits
               title="Student Statistics"
              subheader={`Distribution of ${categoryOptions.find((c) => c.key === selectedCategory)?.label}`}
              chartData={chartLabels.map((label, index) => ({
                label,
                value: chartValues[index] || 0,
              }))}
              chartColors={[
                theme.palette.primary.main,
                theme.palette.chart.red[0],
                theme.palette.chart.violet[0],
                theme.palette.chart.yellow[0],
                theme.palette.chart.green[0],
              ]}
            />
          </Grid>

          {/* Donut Chart: AppDonutChart */}
          <Grid item xs={12} md={6} lg={12}>
            <AppDonutChart
              title="Student Statistics"
              subheader={`Distribution of ${categoryOptions.find((c) => c.key === selectedCategory)?.label}`}
              chartData={chartLabels.map((label, index) => ({
                label,
                value: chartValues[index] || 0,
              }))}
              chartColors={[
                theme.palette.primary.main,
                theme.palette.success.main,
                theme.palette.error.main,
                theme.palette.warning.main,
                theme.palette.chart.blue[0],
              ]}
            />
          </Grid>

          {/* Conversion Rate Chart: AppConversionRates */}
          <Grid item xs={12} md={6} lg={12}>
            <AppConversionRates
              title="Student Statistics"
              subheader={`Distribution of ${categoryOptions.find((c) => c.key === selectedCategory)?.label}`}
              
              chartData={chartLabels.map((label, index) => ({
                label,
                value: chartValues[index] || 0,
              }))}
            />
          </Grid>

        </Grid>
      </Container>
    </Page>
  );
}
