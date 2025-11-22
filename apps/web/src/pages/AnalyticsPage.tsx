import { useEffect, useState } from 'react';
import { Grid, Typography, Box, Paper } from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import DataCard from '../components/DataCard';
import LoadingSpinner from '../components/LoadingSpinner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Simulate loading analytics data
    setTimeout(() => {
      setData({
        registrationTrend: [
          { month: 'Jan', leagues: 12, camps: 8, users: 145 },
          { month: 'Feb', leagues: 15, camps: 10, users: 189 },
          { month: 'Mar', leagues: 18, camps: 12, users: 234 },
          { month: 'Apr', leagues: 22, camps: 15, users: 298 },
          { month: 'May', leagues: 25, camps: 18, users: 356 },
          { month: 'Jun', leagues: 28, camps: 20, users: 412 },
        ],
        sportDistribution: [
          { name: 'Basketball', value: 35 },
          { name: 'Soccer', value: 28 },
          { name: 'Tennis', value: 18 },
          { name: 'Volleyball', value: 12 },
          { name: 'Other', value: 7 },
        ],
        revenueByMonth: [
          { month: 'Jan', revenue: 12500 },
          { month: 'Feb', revenue: 15800 },
          { month: 'Mar', revenue: 18200 },
          { month: 'Apr', revenue: 22100 },
          { month: 'May', revenue: 25600 },
          { month: 'Jun', revenue: 29300 },
        ],
        campAttendance: [
          { camp: 'Youth Basketball', attendance: 28, capacity: 30 },
          { camp: 'Soccer Skills', attendance: 25, capacity: 30 },
          { camp: 'Tennis Clinic', attendance: 18, capacity: 20 },
          { camp: 'Volleyball Camp', attendance: 22, capacity: 25 },
        ],
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading analytics..." />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Comprehensive insights and statistics
      </Typography>

      <Grid container spacing={3}>
        {/* Registration Trend */}
        <Grid item xs={12} lg={8}>
          <DataCard>
            <Typography variant="h6" gutterBottom>
              Registration Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.registrationTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="leagues" stroke="#1976d2" strokeWidth={2} />
                <Line type="monotone" dataKey="camps" stroke="#00C49F" strokeWidth={2} />
                <Line type="monotone" dataKey="users" stroke="#FF8042" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </DataCard>
        </Grid>

        {/* Sport Distribution */}
        <Grid item xs={12} lg={4}>
          <DataCard>
            <Typography variant="h6" gutterBottom>
              Sport Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.sportDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.sportDistribution.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </DataCard>
        </Grid>

        {/* Revenue Trend */}
        <Grid item xs={12} lg={6}>
          <DataCard>
            <Typography variant="h6" gutterBottom>
              Revenue Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="revenue" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </DataCard>
        </Grid>

        {/* Camp Attendance */}
        <Grid item xs={12} lg={6}>
          <DataCard>
            <Typography variant="h6" gutterBottom>
              Camp Attendance vs Capacity
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.campAttendance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="camp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="attendance" fill="#00C49F" />
                <Bar dataKey="capacity" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </DataCard>
        </Grid>

        {/* Key Metrics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Key Performance Indicators
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h3" color="primary">
                    412
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    +15% from last month
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h3" color="primary">
                    28
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Leagues
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    +12% from last month
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h3" color="primary">
                    20
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Camps
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    +11% from last month
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h3" color="primary">
                    $29.3K
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Revenue
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    +14% from last month
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AnalyticsPage;
